import os
import shutil
import subprocess
import sys
import threading
import time


def windows_new_process_group_flag() -> int:
    if sys.platform != "win32":
        return 0
    return subprocess.CREATE_NEW_PROCESS_GROUP


def find_backend_python(project_root: str) -> str:
    if sys.platform == "win32":
        backend_python = os.path.join(project_root, "backend", "venv", "Scripts", "python.exe")
    else:
        backend_python = os.path.join(project_root, "backend", "venv", "bin", "python")
    if not os.path.isfile(backend_python):
        print("Backend virtual environment not found. Create it first: python -m venv backend/venv")
        sys.exit(1)
    return backend_python


def find_npm_command() -> str:
    npm_command = shutil.which("npm")
    if npm_command is None:
        print("npm not found on PATH. Install Node.js first.")
        sys.exit(1)
    return npm_command


def ensure_web_dependencies(web_folder: str) -> None:
    node_modules_folder = os.path.join(web_folder, "node_modules")
    if not os.path.isdir(node_modules_folder):
        print("web/node_modules missing. Run: npm install (inside the web folder)")
        sys.exit(1)


def start_backend(project_root: str, backend_python: str) -> subprocess.Popen:
    backend_command = [backend_python, os.path.join("backend", "wsgi.py")]
    backend_environment = {**os.environ, "PYTHONUNBUFFERED": "1"}
    process = subprocess.Popen(
        backend_command,
        cwd=project_root,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        errors="replace",
        creationflags=windows_new_process_group_flag(),
        env=backend_environment,
    )
    return process


def start_web(npm_command: str, web_folder: str) -> subprocess.Popen:
    web_command = [npm_command, "run", "dev"]
    process = subprocess.Popen(
        web_command,
        cwd=web_folder,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        errors="replace",
        creationflags=windows_new_process_group_flag(),
    )
    return process


def forward_process_output(process: subprocess.Popen, label: str) -> None:
    stream = process.stdout
    while True:
        line = stream.readline()
        if not line:
            break
        print(f"{label} {line}", end="", flush=True)


def stop_process(process: subprocess.Popen) -> None:
    stop_wait_seconds = 5
    if process.poll() is not None:
        return
    if sys.platform == "win32":
        stop_command = ["taskkill", "/PID", str(process.pid), "/T", "/F"]
        subprocess.run(stop_command, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    else:
        process.terminate()
    try:
        process.wait(timeout=stop_wait_seconds)
    except subprocess.TimeoutExpired:
        process.kill()


def wait_for_first_exit(backend_process: subprocess.Popen, web_process: subprocess.Popen) -> str:
    poll_interval_seconds = 0.5
    while True:
        backend_has_exited = backend_process.poll() is not None
        web_has_exited = web_process.poll() is not None
        if backend_has_exited:
            return "backend"
        if web_has_exited:
            return "web"
        time.sleep(poll_interval_seconds)


def main() -> None:
    project_root = os.path.dirname(os.path.abspath(__file__))
    backend_python = find_backend_python(project_root)
    npm_command = find_npm_command()
    web_folder = os.path.join(project_root, "web")
    ensure_web_dependencies(web_folder)

    backend_url = "http://127.0.0.1:5000"
    web_url = "http://localhost:3000"
    print(f"Backend on {backend_url} | Web on {web_url} | Press Ctrl+C to stop both", flush=True)

    backend_process = start_backend(project_root, backend_python)
    web_process = start_web(npm_command, web_folder)

    backend_output_thread = threading.Thread(
        target=forward_process_output, args=(backend_process, "[backend] "), daemon=True
    )
    web_output_thread = threading.Thread(
        target=forward_process_output, args=(web_process, "[web] "), daemon=True
    )
    backend_output_thread.start()
    web_output_thread.start()

    exited_server = None
    try:
        exited_server = wait_for_first_exit(backend_process, web_process)
    except KeyboardInterrupt:
        print("\nStopping both servers...", flush=True)

    if exited_server is not None:
        print(f"The {exited_server} server stopped on its own. Stopping the other one...", flush=True)
    stop_process(backend_process)
    stop_process(web_process)

    if exited_server is not None:
        sys.exit(1)


if __name__ == "__main__":
    main()
