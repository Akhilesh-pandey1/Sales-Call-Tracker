from sqlalchemy import inspect, text
from backend.app.config.base import ALLOWED_COUNTRIES
from backend.app.core.errors import AppException
from backend.app.core.security import (
    generate_auth_token,
    hash_password,
    validate_password_strength,
)
from backend.app.extensions import db
from backend.app.modules.users.models import User
from backend.app.modules.users.schemas import (
    CreateUserRequest,
    UpdateUserRequest,
    UserResponse,
)


def list_all_users() -> list[UserResponse]:
    query_result = User.query.with_entities(
        User.id, User.name, User.role, User.country, User.is_active
    ).order_by(User.id.asc()).all()

    user_list: list[UserResponse] = []
    for row in query_result:
        user_item: UserResponse = UserResponse(
            id=row.id,
            name=row.name,
            role=row.role,
            country=row.country,
            is_active=row.is_active,
        )
        user_list.append(user_item)

    return user_list


def create_new_user(create_request: CreateUserRequest) -> None:
    bad_request_code: int = 400

    existing_user_id: int | None = (
        User.query.with_entities(User.id)
        .filter_by(name=create_request.name)
        .scalar()
    )
    if existing_user_id is not None:
        raise AppException("That name is already taken.", bad_request_code)

    if not validate_password_strength(create_request.password):
        raise AppException(
            "Password needs 8+ characters with an uppercase and a lowercase letter.",
            bad_request_code,
        )

    if create_request.country not in ALLOWED_COUNTRIES:
        raise AppException("Country must be one of: IN, AE, US.", bad_request_code)

    hashed_password_value: str = hash_password(create_request.password)
    salesperson_role: str = "salesperson"
    new_user: User = User(
        name=create_request.name,
        password_hash=hashed_password_value,
        role=salesperson_role,
        country=create_request.country,
        is_active=True,
    )
    db.session.add(new_user)
    db.session.commit()


def update_user_account(user_id: int, update_request: UpdateUserRequest) -> None:
    not_found_code: int = 404
    bad_request_code: int = 400

    target_user: User | None = db.session.get(User, user_id)
    if target_user is None:
        raise AppException("User not found.", not_found_code)

    if update_request.name is not None:
        trimmed_name: str = update_request.name.strip()
        if not trimmed_name:
            raise AppException("Name cannot be blank.", bad_request_code)

        conflicting_user_id: int | None = (
            User.query.with_entities(User.id)
            .filter(User.name == trimmed_name, User.id != user_id)
            .scalar()
        )
        if conflicting_user_id is not None:
            raise AppException("That name is already taken.", bad_request_code)

        target_user.name = trimmed_name

    if update_request.password is not None:
        if not validate_password_strength(update_request.password):
            raise AppException(
                "Password needs 8+ characters with an uppercase and a lowercase letter.",
                bad_request_code,
            )

        target_user.password_hash = hash_password(update_request.password)
        target_user.auth_token = generate_auth_token()

    if update_request.country is not None:
        trimmed_country: str = update_request.country.strip()
        if trimmed_country not in ALLOWED_COUNTRIES:
            raise AppException("Country must be one of: IN, AE, US.", bad_request_code)

        target_user.country = trimmed_country

    db.session.commit()


def deactivate_user_account(user_id: int, current_user_id: int) -> None:
    not_found_code: int = 404
    bad_request_code: int = 400

    if user_id == current_user_id:
        raise AppException("You cannot do this to your own account.", bad_request_code)

    target_user: User | None = db.session.get(User, user_id)
    if target_user is None:
        raise AppException("User not found.", not_found_code)

    target_user.is_active = False
    target_user.auth_token = None
    db.session.commit()


def activate_user_account(user_id: int) -> None:
    not_found_code: int = 404

    target_user: User | None = db.session.get(User, user_id)
    if target_user is None:
        raise AppException("User not found.", not_found_code)

    target_user.is_active = True
    db.session.commit()


def delete_user_account(user_id: int, current_user_id: int) -> None:
    not_found_code: int = 404
    bad_request_code: int = 400

    if user_id == current_user_id:
        raise AppException("You cannot do this to your own account.", bad_request_code)

    target_user: User | None = db.session.get(User, user_id)
    if target_user is None:
        raise AppException("User not found.", not_found_code)

    inspector = inspect(db.engine)
    existing_tables: list[str] = inspector.get_table_names()

    calls_table_name: str = "calls"
    leads_table_name: str = "leads"

    if calls_table_name in existing_tables:
        delete_calls_sql: str = "DELETE FROM calls WHERE user_id = :user_id"
        db.session.execute(text(delete_calls_sql), {"user_id": user_id})

    if leads_table_name in existing_tables:
        release_leads_sql: str = (
            "UPDATE leads SET claimed_by = NULL, claimed_until = NULL WHERE claimed_by = :user_id"
        )
        db.session.execute(text(release_leads_sql), {"user_id": user_id})

    db.session.delete(target_user)
    db.session.commit()
