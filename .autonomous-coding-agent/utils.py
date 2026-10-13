import datetime
import json
import os
import sys
import threading
import time
import winsound


def read_text_file(file_path):
    if not file_path:
        empty_content = ""
        return empty_content
    if not os.path.exists(file_path):
        empty_content = ""
        return empty_content
    with open(file_path, "r", encoding="utf-8") as source_file:
        file_content = source_file.read()
    return file_content


def load_tickets_data(tickets_file_path):
    if not os.path.exists(tickets_file_path):
        raise FileNotFoundError(f"Tickets file not found at: {tickets_file_path}")
    with open(tickets_file_path, "r", encoding="utf-8") as tickets_file:
        tickets_data = json.load(tickets_file)
    return tickets_data


def save_tickets_data(tickets_file_path, tickets_data):
    parent_directory = os.path.dirname(os.path.abspath(tickets_file_path))
    temporary_file_path = os.path.join(parent_directory, f"temp_tickets_{int(time.time())}.json")
    with open(temporary_file_path, "w", encoding="utf-8") as temporary_file:
        json.dump(tickets_data, temporary_file, indent=2)
    os.replace(temporary_file_path, tickets_file_path)
    save_status = True
    return save_status


def write_log_line(log_file_path, log_text):
    timestamp = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    with open(log_file_path, "a", encoding="utf-8") as log_file:
        log_file.write(f"[{timestamp}] {log_text}\n")


def alarm_sound_loop(stop_event, max_duration_seconds):
    worker_start_time = time.time()
    while not stop_event.is_set():
        if time.time() - worker_start_time > max_duration_seconds:
            break
        if winsound:
            winsound.Beep(1000, 300)
            winsound.Beep(750, 300)
        else:
            sys.stdout.write("\a")
            sys.stdout.flush()
            time.sleep(0.6)


def sound_emergency_alarm(duration_minutes):
    stop_event = threading.Event()
    max_duration_seconds = duration_minutes * 60
    alarm_thread = threading.Thread(
        target=alarm_sound_loop,
        args=(stop_event, max_duration_seconds),
        daemon=True,
    )
    alarm_thread.start()
    print("\n🚨 [EMERGENCY ALARM ACTIVE] A critical task error occurred.")
    try:
        input("Press Enter to acknowledge the error and stop the alarm...\n")
    except Exception:
        time.sleep(3)
    stop_event.set()
    alarm_thread.join(timeout=1.0)
    alarm_finished = True
    return alarm_finished
