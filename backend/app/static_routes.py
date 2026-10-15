import os
from flask import Flask, Response, abort, send_from_directory
from backend.app.config.base import BaseConfig


def register_static_routes(app: Flask) -> None:
    @app.route("/", defaults={"path": ""})
    @app.route("/<path:path>")
    def serve_spa(path: str) -> Response:
        not_found_status_code: int = 404

        if path.startswith("api/") or path == "api":
            abort(not_found_status_code)

        dist_directory: str = str(
            app.config.get("DIST_DIR", BaseConfig.DIST_DIR)
        )

        target_file_path: str = os.path.join(dist_directory, path)
        if path != "" and os.path.isfile(target_file_path):
            asset_response: Response = send_from_directory(dist_directory, path)
            return asset_response

        path_basename: str = os.path.basename(path)
        has_file_extension: bool = "." in path_basename
        if path != "" and has_file_extension:
            abort(not_found_status_code)

        index_file_path: str = os.path.join(dist_directory, "index.html")
        if os.path.isfile(index_file_path):
            index_response: Response = send_from_directory(dist_directory, "index.html")
            return index_response

        abort(not_found_status_code)
