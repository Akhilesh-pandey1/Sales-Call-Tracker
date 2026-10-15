# Sales Call Tracker — Backend

## One-time setup

From the `backend` folder:

```
python -m venv venv
venv\Scripts\python.exe -m pip install -r requirements.txt
copy .env.example .env
```

Then open `backend\.env` and fill in real values:

- `SECRET_KEY` — a long random string. It signs the login tokens.
- `DATABASE_URL` — leave empty for local development. The app then uses a local SQLite file.
- `MANAGER_NAME` and `MANAGER_PASSWORD` — the first manager account. The server creates it automatically on start. If either value is missing, the server refuses to start and prints one clear message.

Never commit `.env`. It is already git-ignored.

## Start the server (local, Windows)

From the `backend` folder with the venv active:

```
python wsgi.py
```

The server runs at `http://127.0.0.1:5000`. On first start it creates the manager account from `MANAGER_NAME` and `MANAGER_PASSWORD` in `backend\.env`. On later starts it skips if that manager already exists.

## Start the server (production, Render)

`render.yaml` already does it: `gunicorn wsgi:app`. There is no `.env` file on Render — env vars come from the Render dashboard. Set `MANAGER_NAME` and `MANAGER_PASSWORD` there once, like `DATABASE_URL`.

## Run tests

From the `backend` folder with the venv active:

```
python -m pytest tests
```

Tests use an in-memory database and skip the manager bootstrap, so no env values are needed for testing.
