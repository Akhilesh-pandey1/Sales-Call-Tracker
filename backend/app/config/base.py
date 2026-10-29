import os

MAX_CALL_AGE_DAYS: int = 3
MAX_LEAD_ATTEMPTS: int = 3
RETRY_LOCK_HOURS: int = 2
CLAIM_MINUTES: int = 10
SCHEDULE_EXPIRE_HOURS: int = 24
LEAD_EXPIRY_INTERVAL_HOURS: int = 1
MAX_SCHEDULE_AHEAD_DAYS: int = 30
NOTE_MAX_LENGTH: int = 200
MAX_LEAD_UPLOAD_MB: int = 2
LOCKOUT_ATTEMPTS: int = 10
LOCKOUT_MINUTES: int = 5
PASSWORD_MIN_LENGTH: int = 8
ALLOWED_COUNTRIES: tuple[str, ...] = ("IN", "AE", "US")
TIMEZONE_NAME: str = "Asia/Kolkata"


class BaseConfig:
    SECRET_KEY: str = os.getenv("SECRET_KEY", "sales-call-tracker-dev-secret")
    SQLALCHEMY_TRACK_MODIFICATIONS: bool = False
    
    raw_database_url: str = os.getenv("DATABASE_URL", "sqlite:///sales_call_tracker.db")
    if raw_database_url.startswith("postgres://"):
        raw_database_url = raw_database_url.replace("postgres://", "postgresql://", 1)
    
    SQLALCHEMY_DATABASE_URI: str = raw_database_url
    MAX_CONTENT_LENGTH: int = MAX_LEAD_UPLOAD_MB * 1024 * 1024
    DIST_DIR: str = os.getenv("DIST_DIR", os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", "web", "dist")))
