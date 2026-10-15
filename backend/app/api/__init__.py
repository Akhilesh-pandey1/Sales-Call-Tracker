from flask import Blueprint
from backend.app.modules.auth import auth_blueprint
from backend.app.modules.calls import calls_blueprint
from backend.app.modules.dashboard import dashboard_blueprint
from backend.app.modules.leads import leads_blueprint
from backend.app.modules.users import users_blueprint

api_blueprint: Blueprint = Blueprint("api", __name__, url_prefix="/api")
api_blueprint.register_blueprint(auth_blueprint)
api_blueprint.register_blueprint(users_blueprint)
api_blueprint.register_blueprint(calls_blueprint)
api_blueprint.register_blueprint(dashboard_blueprint)
api_blueprint.register_blueprint(leads_blueprint)


