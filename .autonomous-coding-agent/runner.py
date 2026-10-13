import json
import subprocess
import time
from utils import write_log_line


def parse_stream_event(line):
    stripped = line.strip()
    if not stripped.startswith("{"):
        return None
    try:
        parsed_event = json.loads(stripped)
    except Exception:
        return None
    return parsed_event


def extract_session_id(parsed_event):
    if parsed_event.get("type") == "system" and parsed_event.get("subtype") == "init":
        return parsed_event.get("session_id")
    if parsed_event.get("type") == "result":
        return parsed_event.get("sessionId") or parsed_event.get("session_id")
    return None


def extract_final_output_text(parsed_event):
    if parsed_event.get("type") != "result":
        missing_output_text = None
        return missing_output_text
    final_output_text = parsed_event.get("result")
    return final_output_text


def summarize_content_text(raw_content):
    max_summary_length = 150
    if isinstance(raw_content, str):
        summarized_text = raw_content
    else:
        summarized_text = json.dumps(raw_content)
    single_line_text = summarized_text.replace("\n", " ")
    return single_line_text[:max_summary_length]


def describe_assistant_message(parsed_event):
    message_content = parsed_event.get("message", {}).get("content", [])
    if not isinstance(message_content, list):
        message_content = []
    description_lines = []
    for content_block in message_content:
        block_type = content_block.get("type")
        if block_type == "text":
            description_lines.append(f"[AGENT] {content_block.get('text', '')}")
        if block_type == "tool_use":
            tool_input_summary = summarize_content_text(content_block.get("input", {}))
            description_lines.append(f"[TOOL] {content_block.get('name')} {tool_input_summary}")
    return description_lines


def describe_user_message(parsed_event):
    message_content = parsed_event.get("message", {}).get("content", [])
    if not isinstance(message_content, list):
        message_content = []
    description_lines = []
    for content_block in message_content:
        if content_block.get("type") == "tool_result":
            result_summary = summarize_content_text(content_block.get("content", ""))
            description_lines.append(f"[TOOL RESULT] {result_summary}")
    return description_lines


def describe_stream_event(parsed_event):
    event_type = parsed_event.get("type")
    if event_type == "system" and parsed_event.get("subtype") == "init":
        return [f"[SESSION] {parsed_event.get('session_id')}"]
    if event_type == "assistant":
        return describe_assistant_message(parsed_event)
    if event_type == "user":
        return describe_user_message(parsed_event)
    if event_type == "result":
        total_cost = parsed_event.get("total_cost_usd", 0)
        return [f"[RESULT] {parsed_event.get('subtype')} cost=${total_cost}"]
    return []


def record_stream_event(parsed_event, verbose_output, log_file_path):
    description_lines = describe_stream_event(parsed_event)
    for description_line in description_lines:
        write_log_line(log_file_path, description_line)
    if verbose_output:
        for description_line in description_lines:
            print(description_line, flush=True)


def execute_claude_process(model, effort, dangerously_skip_permissions, prompt_text, timeout_seconds, resume_session_id=None, verbose_output=False, log_file_path="app.txt"):
    command = ["claude", "--print", "--verbose", "--output-format", "stream-json", "--model", model]
    if dangerously_skip_permissions:
        command.append("--dangerously-skip-permissions")
    if effort:
        command.extend(["--effort", effort])
    if resume_session_id:
        command.extend(["--resume", resume_session_id])
    command.extend(["-p", "-"])

    write_log_line(log_file_path, f"CLAUDE CMD: {' '.join(command)}")

    process = subprocess.Popen(command, stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, encoding="utf-8", bufsize=1)
    if process.stdin:
        process.stdin.write(prompt_text)
        process.stdin.close()

    session_id = None
    final_output_text = None
    start_time = time.time()
    while True:
        line = process.stdout.readline()
        if not line and process.poll() is not None:
            break
        if line:
            parsed_event = parse_stream_event(line)
            if parsed_event is None:
                write_log_line(log_file_path, f"RAW OUTPUT: {line.strip()}")
                if verbose_output:
                    print(line, end="", flush=True)
            else:
                record_stream_event(parsed_event, verbose_output, log_file_path)
                detected_id = extract_session_id(parsed_event)
                if detected_id and not session_id:
                    session_id = detected_id
                event_output_text = extract_final_output_text(parsed_event)
                if event_output_text is not None:
                    final_output_text = event_output_text
        if time.time() - start_time > timeout_seconds:
            process.kill()
            timeout_error = f"Timed out after {timeout_seconds}s"
            write_log_line(log_file_path, f"CLAUDE ERROR: {timeout_error}")
            return {"success": False, "session_id": session_id, "final_output": final_output_text, "error": timeout_error}

    exit_code = process.wait()
    success = exit_code == 0
    stderr = process.stderr.read() if process.stderr else ""
    error = None if success else stderr.strip() or f"Process exited with code {exit_code}"
    write_log_line(log_file_path, f"CLAUDE RESULT: success={success} session_id={session_id} error={error}")
    return {"success": success, "session_id": session_id, "final_output": final_output_text, "error": error}


def execute_agy_process(model, effort, dangerously_skip_permissions, prompt_text, timeout_seconds, resume_session_id=None, verbose_output=False, log_file_path="app.txt"):
    command = ["agy", "--print", "--output-format", "stream-json", "--model", model]
    if dangerously_skip_permissions:
        command.append("--dangerously-skip-permissions")
    if resume_session_id:
        command.extend(["--conversation", resume_session_id])

    process = subprocess.Popen(command, stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, encoding="utf-8", bufsize=1)
    if process.stdin:
        process.stdin.write(prompt_text)
        process.stdin.close()

    session_id = None
    final_output_text = None
    start_time = time.time()
    while True:
        line = process.stdout.readline()
        if not line and process.poll() is not None:
            break
        if line:
            print(f"[AGY STDOUT] {line}", end="", flush=True)
            parsed_event = parse_stream_event(line) or {}
            detected_id = extract_session_id(parsed_event)
            if detected_id and not session_id:
                session_id = detected_id
            event_output_text = extract_final_output_text(parsed_event)
            if event_output_text is not None:
                final_output_text = event_output_text
        if time.time() - start_time > timeout_seconds:
            process.kill()
            return {"success": False, "session_id": session_id, "final_output": final_output_text, "error": f"Timed out after {timeout_seconds}s"}

    exit_code = process.wait()
    success = exit_code == 0
    stderr_output = process.stderr.read() if process.stderr else ""
    for line in stderr_output.splitlines():
        print(f"[AGY STDERR] {line}", flush=True)
    error = None if success else stderr_output.strip() or f"Process exited with code {exit_code}"
    return {"success": success, "session_id": session_id, "final_output": final_output_text, "error": error}
