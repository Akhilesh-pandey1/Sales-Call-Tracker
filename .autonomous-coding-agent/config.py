import argparse
import json
import os


def get_default_settings(config_file_path):
    if not os.path.exists(config_file_path):
        empty_defaults = {}
        return empty_defaults
    with open(config_file_path, "r", encoding="utf-8") as file_handle:
        loaded_settings = json.load(file_handle)
    return loaded_settings


def create_argument_parser(default_settings):
    parser = argparse.ArgumentParser(description="Autonomous Version 1 Orchestrator")
    parser.add_argument("--agent", default=default_settings.get("agent", "claude-code"), help="Agent to use for running tasks. Supported: claude-code, agy")
    parser.add_argument("--model", default=default_settings.get("model", "claude-3-7-sonnet-latest"), help="Model name to pass to the agent (e.g. claude-3-7-sonnet-latest)")
    parser.add_argument("--timeout", type=int, default=default_settings.get("timeoutSeconds", 600), help="Max time to wait for a single agent run, in seconds (default: 600)")
    parser.add_argument("--tickets", default=default_settings.get("ticketsPath", "agent-doc/tickets.json"), help="Path to the tickets JSON file (default: agent-doc/tickets.json)")
    parser.add_argument("--effort", default=default_settings.get("effort", "high"), help="Reasoning effort level for the agent. Options: low, medium, high (default: high)")
    parser.add_argument("--sound-alarm", action="store_true", default=default_settings.get("soundAlarm", True), help="Sound an emergency alarm if a task fails (default: on)")
    parser.add_argument("--alarm-duration", type=int, default=default_settings.get("alarmDurationMinutes", 5), help="How long to sound the alarm in minutes before auto-stopping (default: 5)")
    parser.add_argument("--dangerously-skip-permissions", action="store_true", default=default_settings.get("dangerouslySkipPermissions", False), help="Auto-approve all tool permission requests without prompting")
    parser.add_argument("--verbose-output", action="store_true", default=default_settings.get("verboseOutput", False), help="Print one summary line per agent event on the console (default: off, console shows only task and phase progress)")
    parser.add_argument("--log-file", default=default_settings.get("logFilePath", "app.txt"), help="Path to the orchestrator log file. Must be a .txt file (default: app.txt)")
    return parser


def load_configuration():
    script_directory = os.path.dirname(os.path.abspath(__file__))
    config_file_path = os.path.join(script_directory, "config.json")
    default_settings = get_default_settings(config_file_path)
    argument_parser = create_argument_parser(default_settings)
    parsed_arguments = argument_parser.parse_args()

    selected_model = parsed_arguments.model
    if not selected_model:
        selected_model = input("Enter Claude model name (default: claude-3-7-sonnet-latest): ").strip()
        if not selected_model:
            selected_model = "claude-3-7-sonnet-latest"

    tickets_file_path = parsed_arguments.tickets
    if not tickets_file_path:
        tickets_file_path = input("Enter tickets JSON file path (default: agent-doc/tickets.json): ").strip()
        if not tickets_file_path:
            tickets_file_path = "agent-doc/tickets.json"

    log_file_path = parsed_arguments.log_file
    if not log_file_path.endswith(".txt"):
        invalid_log_file_error = ValueError(f"Log file must be a .txt file, got: {log_file_path}")
        raise invalid_log_file_error

    resolved_configuration = {
        "agent": parsed_arguments.agent,
        "model": selected_model,
        "timeout_seconds": parsed_arguments.timeout,
        "tickets_path": tickets_file_path,
        "dangerously_skip_permissions": parsed_arguments.dangerously_skip_permissions,
        "effort": parsed_arguments.effort,
        "sound_alarm": parsed_arguments.sound_alarm,
        "alarm_duration_minutes": parsed_arguments.alarm_duration,
        "verbose_output": parsed_arguments.verbose_output,
        "log_file_path": log_file_path,
    }
    return resolved_configuration

