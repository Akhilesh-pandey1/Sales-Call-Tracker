from backend.app.extensions import db


class Call(db.Model):
    __tablename__ = "calls"

    call_id = db.Column(db.String(64), primary_key=True)
    user_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
    )
    phone_number = db.Column(db.String(30), nullable=False)
    dialed_at = db.Column(db.DateTime(timezone=True), nullable=False)
    duration_seconds = db.Column(
        db.Integer, nullable=False, default=0, server_default="0"
    )
    direction = db.Column(
        db.String(10), nullable=False, default="outgoing", server_default="outgoing"
    )
    outcome = db.Column(db.String(20), nullable=True)

    __table_args__ = (
        db.Index("idx_calls_call_id", "call_id", unique=True),
        db.Index("idx_calls_user_dialed", "user_id", "dialed_at"),
    )
