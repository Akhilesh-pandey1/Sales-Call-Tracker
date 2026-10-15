import os
import sys

from flask import Flask

project_root: str = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if project_root not in sys.path:
    sys.path.insert(0, project_root)

from backend.app import create_app

app: Flask = create_app()

if __name__ == "__main__":
    app.run()
