import datetime
import os
import re
import sys
from config import load_configuration
from runner import execute_claude_process, execute_agy_process
from utils import load_tickets_data, read_text_file, save_tickets_data, sound_emergency_alarm, write_log_line

PROMISE_PATTERN = re.compile(r"<promise>\s*(.*?)\s*</promise>", re.DOTALL)
PROMISE_DONE_VERDICT = "DONE"


def get_next_uncompleted_task(tickets_data):
    all_tasks = tickets_data.get("tasks", [])
    completed_task_ids = set()
    for task_item in all_tasks:
        task_status = task_item.get("status")
        task_done = task_item.get("done")
        if task_status == "completed" or (task_done is True and task_status != "failed"):
            completed_task_ids.add(task_item.get("id"))

    for task_item in all_tasks:
        task_status = task_item.get("status")
        task_done = task_item.get("done")
        is_finished = task_status == "completed" or (task_done is True and task_status != "failed")
        if is_finished:
            continue
        dependencies = task_item.get("blockedBy", [])
        dependencies_met = all(dependency_id in completed_task_ids for dependency_id in dependencies)
        if dependencies_met:
            selected_task = task_item
            return selected_task
    no_task_available = None
    return no_task_available


def build_execution_prompt(task, ui_design_path, additional_prompt):
    task_id = task.get("id")
    task_title = task.get("title", "Untitled Task")
    task_points = task.get("points", [])

    system_prompt_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "resources", "execute.md")
    system_prompt_content = read_text_file(system_prompt_path)

    points_text_lines = []

    for point in task_points:
        points_text_lines.append(f"- {point}")
    points_block = "\n".join(points_text_lines)

    prompt_sections = [
        system_prompt_content.strip(),
        f"Assigned Task: #{task_id} - {task_title}",
        "Acceptance Criteria:",
        points_block,
    ]
    
    ui_design_available = bool(ui_design_path) and os.path.exists(ui_design_path)
    optional_sections = [
        ("additional_prompt", additional_prompt),
        ("ui_design", ui_design_path if ui_design_available else None),
    ]

    for section_kind, section_value in optional_sections:
        if not section_value:
            continue

        match section_kind:
            case "additional_prompt":
                prompt_sections.append(f"Additional Instructions:\n{section_value.strip()}")
            case "ui_design":
                ui_design_introduction = "UI Designs:\nIf anything you build in this task is related to the UI, our UI design team has already sent us the designs. They are placed in this folder:"
                ui_design_instructions = "Look at the file names in that folder, for example login.png or signup.png. Whatever screen or component you are making, first find the matching design image, look at it properly, and then build exactly what the design shows. Do not imagine the UI on your own."
                prompt_sections.append(f"{ui_design_introduction}\n{section_value}\n\n{ui_design_instructions}")

    prompt_sections.append("Implement all the acceptance criteria for this task now. Follow test-driven development if required. Do not ask questions.")
    assembled_prompt = "\n\n".join(prompt_sections)
    return assembled_prompt


def get_agent_runner(agent_name):
    if agent_name == "agy":
        return execute_agy_process
    return execute_claude_process


def extract_promise_verdict(final_output_text):
    if not final_output_text:
        missing_verdict = None
        return missing_verdict
    promise_match = PROMISE_PATTERN.search(final_output_text)
    if promise_match is None:
        missing_verdict = None
        return missing_verdict
    promise_verdict = promise_match.group(1).strip()
    return promise_verdict


def execute_task_run(task, configuration, tickets_data, tickets_file_path):
    task_id = task.get("id")
    ui_design_path = tickets_data.get("uiDesign")
    additional_prompt = tickets_data.get("additionalPrompt")
    log_file_path = configuration["log_file_path"]

    task["status"] = "in_progress"
    save_tickets_data(tickets_file_path, tickets_data)

    write_log_line(log_file_path, f"TASK #{task_id} RUN START")
    execution_prompt = build_execution_prompt(task, ui_design_path, additional_prompt)
    run_agent = get_agent_runner(configuration["agent"])
    task_result = run_agent(
        model=configuration["model"],
        effort=configuration["effort"],
        dangerously_skip_permissions=configuration["dangerously_skip_permissions"],
        prompt_text=execution_prompt,
        timeout_seconds=configuration["timeout_seconds"],
        resume_session_id=None,
        verbose_output=configuration["verbose_output"],
        log_file_path=log_file_path,
    )

    session_id = task_result.get("session_id")
    if session_id:
        task["sessionId"] = session_id
        save_tickets_data(tickets_file_path, tickets_data)

    final_output_text = task_result.get("final_output") or ""
    promise_verdict = extract_promise_verdict(final_output_text)
    write_log_line(log_file_path, f"TASK #{task_id} PROMISE VERDICT: {promise_verdict or 'MISSING'}")

    task_completed = task_result.get("success") and promise_verdict == PROMISE_DONE_VERDICT
    if task_completed:
        task["status"] = "completed"
        task["completedAt"] = datetime.datetime.now(datetime.timezone.utc).isoformat()
        save_tickets_data(tickets_file_path, tickets_data)
        write_log_line(log_file_path, f"TASK #{task_id} COMPLETED session_id={session_id}")
        run_summary = {"completed": True, "error": None}
        return run_summary

    if promise_verdict is None:
        failure_reason = task_result.get("error") or "Agent finished without a promise verdict"
    else:
        failure_reason = f"Agent verdict: {promise_verdict}"
    task["status"] = "failed"
    save_tickets_data(tickets_file_path, tickets_data)
    write_log_line(log_file_path, f"TASK #{task_id} FAILED: {failure_reason}")
    run_summary = {"completed": False, "error": failure_reason}
    return run_summary



def process_single_task(task, configuration, tickets_data):
    task_id = task.get("id")
    task_title = task.get("title", "Untitled Task")
    tickets_file_path = configuration["tickets_path"]

    print(f"\n========================================================")
    print(f" PROCESSING TASK #{task_id}: {task_title}")
    print(f"========================================================\n")

    task_result = execute_task_run(task, configuration, tickets_data, tickets_file_path)
    if not task_result.get("completed"):
        error_message = task_result.get("error", "Task run failed")
        print(f"\n❌ [TASK #{task_id} FAILED] {error_message}\n")
        if configuration.get("sound_alarm"):
            sound_emergency_alarm(configuration.get("alarm_duration_minutes", 5))
        return False

    print(f"\n✅ [TASK #{task_id} COMPLETE] Implemented, reviewed, fixed, and committed!\n")
    return True


def print_execution_summary(tickets_data, log_file_path):
    all_tasks = tickets_data.get("tasks", [])
    print("\n" + "=" * 78)
    print("                     ORCHESTRATOR EXECUTION SUMMARY")
    print("=" * 78)
    print(f"{'ID':<4} | {'Title':<26} | {'Status':<14} | {'Session ID'}")
    print("-" * 78)
    for task_item in all_tasks:
        task_id = str(task_item.get("id", "-"))
        task_title = (task_item.get("title") or "Untitled")[:25]
        task_status = task_item.get("status") or "pending"
        status_label = "✅ COMPLETED" if task_status == "completed" else "❌ FAILED" if task_status == "failed" else "⏳ " + task_status.upper()
        session_id = (task_item.get("sessionId") or "-")[:12]
        print(f"{task_id:<4} | {task_title:<26} | {status_label:<14} | {session_id}")
        write_log_line(log_file_path, f"SUMMARY | task #{task_id} | {task_title} | {task_status} | session={session_id}")
    print("=" * 78 + "\n")
    summary_printed = True
    return summary_printed


def run_orchestrator_loop():
    configuration = load_configuration()
    tickets_file_path = configuration["tickets_path"]
    log_file_path = configuration["log_file_path"]
    tickets_data = load_tickets_data(tickets_file_path)

    write_log_line(log_file_path, "===== ORCHESTRATOR RUN STARTED =====")
    all_tasks_successful = True
    while True:
        next_task = get_next_uncompleted_task(tickets_data)
        if next_task is None:
            all_completed = all(task.get("status") == "completed" for task in tickets_data.get("tasks", []))
            if all_completed:
                print("\n🎉 ALL TICKETS HAVE BEEN COMPLETED SUCCESSFULLY! 🎉\n")
                write_log_line(log_file_path, "ALL TICKETS COMPLETED SUCCESSFULLY")
            else:
                print("\n⚠️ No remaining unblocked tasks could be executed.\n")
                write_log_line(log_file_path, "NO REMAINING UNBLOCKED TASKS")
                all_tasks_successful = False
            break

        task_success = process_single_task(next_task, configuration, tickets_data)
        if not task_success:
            all_tasks_successful = False
            break

    print_execution_summary(tickets_data, log_file_path)
    loop_result = all_tasks_successful
    return loop_result


def main():
    orchestration_success = run_orchestrator_loop()
    exit_code = 0 if orchestration_success else 1
    sys.exit(exit_code)


if __name__ == "__main__":
    main()
