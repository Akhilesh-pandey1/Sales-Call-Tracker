from datetime import datetime, timezone
from backend.app.extensions import db


class Lead(db.Model):
    __tablename__ = "leads"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    phone_number = db.Column(db.String(30), unique=True, nullable=False)
    status = db.Column(
        db.String(20), nullable=False, default="waiting", server_default="waiting"
    )
    attempt_count = db.Column(
        db.Integer, nullable=False, default=0, server_default="0"
    )
    last_attempted_at = db.Column(db.DateTime(timezone=True), nullable=True)
    retry_locked_until = db.Column(db.DateTime(timezone=True), nullable=True)
    claimed_by = db.Column(
        db.Integer,
        db.ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
    )
    claimed_until = db.Column(db.DateTime(timezone=True), nullable=True)
    scheduled_by = db.Column(
        db.Integer,
        db.ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
    )
    scheduled_at = db.Column(db.DateTime(timezone=True), nullable=True)
    created_at = db.Column(
        db.DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
        server_default=db.func.now(),
    )

    __table_args__ = (
        db.Index("idx_leads_phone_number", "phone_number", unique=True),
        db.Index("idx_leads_status_created", "status", db.desc("created_at")),
        db.Index("idx_leads_scheduled", "scheduled_by", "scheduled_at"),
    )
