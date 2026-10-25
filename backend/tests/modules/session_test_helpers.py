from backend.app.extensions import db
from backend.app.modules.auth import Session


def create_session_record(user_id: int, token: str) -> Session:
    session_record: Session = Session(user_id=user_id, token=token)
    db.session.add(session_record)
    db.session.commit()
    return session_record


def fetch_user_session_token(user_id: int) -> str:
    session_record: Session | None = Session.query.filter_by(
        user_id=user_id
    ).first()
    assert session_record is not None
    return session_record.token
