from flask import Blueprint

api_blueprint: Blueprint = Blueprint("api", __name__, url_prefix="/api")
