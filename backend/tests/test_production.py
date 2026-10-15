import os
from pathlib import Path
from flask import Flask
from flask.testing import FlaskClient
import pytest
from backend.wsgi import app as backend_wsgi_app


def test_serve_index_html_on_root(app: Flask, client: FlaskClient, tmp_path: Path) -> None:
    dist_dir: Path = tmp_path / "dist"
    dist_dir.mkdir()
    index_file: Path = dist_dir / "index.html"
    index_content: str = "<html><body>Root App Content</body></html>"
    index_file.write_text(index_content, encoding="utf-8")

    app.config["DIST_DIR"] = str(dist_dir)

    response = client.get("/")
    ok_status_code: int = 200
    assert response.status_code == ok_status_code
    assert response.data.decode("utf-8") == index_content


def test_serve_static_asset(app: Flask, client: FlaskClient, tmp_path: Path) -> None:
    dist_dir: Path = tmp_path / "dist"
    assets_dir: Path = dist_dir / "assets"
    assets_dir.mkdir(parents=True)
    asset_file: Path = assets_dir / "main.js"
    asset_content: str = "console.log('main');"
    asset_file.write_text(asset_content, encoding="utf-8")

    app.config["DIST_DIR"] = str(dist_dir)

    response = client.get("/assets/main.js")
    ok_status_code: int = 200
    assert response.status_code == ok_status_code
    assert response.data.decode("utf-8") == asset_content


def test_missing_static_asset_returns_404(app: Flask, client: FlaskClient, tmp_path: Path) -> None:
    dist_dir: Path = tmp_path / "dist"
    dist_dir.mkdir()
    index_file: Path = dist_dir / "index.html"
    index_file.write_text("<html><body>SPA</body></html>", encoding="utf-8")

    app.config["DIST_DIR"] = str(dist_dir)

    response = client.get("/assets/missing.js")
    not_found_status_code: int = 404
    assert response.status_code == not_found_status_code


def test_serve_spa_client_route(app: Flask, client: FlaskClient, tmp_path: Path) -> None:
    dist_dir: Path = tmp_path / "dist"
    dist_dir.mkdir()
    index_file: Path = dist_dir / "index.html"
    index_content: str = "<html><body>SPA App Content</body></html>"
    index_file.write_text(index_content, encoding="utf-8")

    app.config["DIST_DIR"] = str(dist_dir)

    response = client.get("/dashboard/team")
    ok_status_code: int = 200
    assert response.status_code == ok_status_code
    assert response.data.decode("utf-8") == index_content


def test_api_route_not_found_returns_json(app: Flask, client: FlaskClient, tmp_path: Path) -> None:
    dist_dir: Path = tmp_path / "dist"
    dist_dir.mkdir()
    index_file: Path = dist_dir / "index.html"
    index_file.write_text("<html>SPA</html>", encoding="utf-8")

    app.config["DIST_DIR"] = str(dist_dir)

    response = client.get("/api/nonexistent-endpoint")
    not_found_status_code: int = 404
    assert response.status_code == not_found_status_code
    json_data = response.get_json()
    assert json_data is not None
    assert "message" in json_data


def test_missing_dist_returns_404(app: Flask, client: FlaskClient, tmp_path: Path) -> None:
    non_existent_dist: Path = tmp_path / "non_existent_dist"
    app.config["DIST_DIR"] = str(non_existent_dist)

    response = client.get("/")
    not_found_status_code: int = 404
    assert response.status_code == not_found_status_code


def test_wsgi_entrypoint() -> None:
    assert isinstance(backend_wsgi_app, Flask)
