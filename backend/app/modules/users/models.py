from datetime import datetime, timezone
from backend.app.extensions import db


class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(100), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(20), nullable=False, default="salesperson")
    is_active = db.Column(db.Boolean, nullable=False, default=True)
    country = db.Column(db.String(5), nullable=False, default="IN")
    auth_token = db.Column(db.String(255), nullable=True, index=True)
    created_at = db.Column(
        db.DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )

    def to_dict(self) -> dict[str, object]:
        record_data: dict[str, object] = {
            "id": self.id,
            "name": self.name,
            "role": self.role,
            "is_active": self.is_active,
            "country": self.country,
        }
        return record_data
