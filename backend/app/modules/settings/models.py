from backend.app.extensions import db

DEFAULT_WINDOW_ID: int = 1
DEFAULT_START_MINUTE: int = 600
DEFAULT_END_MINUTE: int = 1140


class OfficeHours(db.Model):
    __tablename__ = "office_hours"

    id = db.Column(
        db.Integer,
        primary_key=True,
        default=DEFAULT_WINDOW_ID,
        server_default=str(DEFAULT_WINDOW_ID),
    )
    start_minute = db.Column(
        db.Integer,
        nullable=False,
        default=DEFAULT_START_MINUTE,
        server_default=str(DEFAULT_START_MINUTE),
    )
    end_minute = db.Column(
        db.Integer,
        nullable=False,
        default=DEFAULT_END_MINUTE,
        server_default=str(DEFAULT_END_MINUTE),
    )
