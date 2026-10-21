from datetime import datetime, timedelta, timezone
import io
from typing import Any
from flask import Flask
from flask.testing import FlaskClient
from backend.app.config.base import MAX_SCHEDULE_AHEAD_DAYS, SCHEDULE_EXPIRE_HOURS
from backend.app.core.security import hash_password
from backend.app.core.utils import now_ist, now_utc
from backend.app.extensions import db
from backend.app.modules.calls import Call
from backend.app.modules.leads.models import Lead
from backend.app.modules.users import User


def create_user_fixture(
    name: str = "testuser",
    role: str = "salesperson",
    is_active: bool = True,
    token: str = "test-token",
) -> User:
    password_hash: str = hash_password("Password123")
    user: User = User(
        name=name,
        password_hash=password_hash,
        role=role,
        country="IN",
        is_active=is_active,
        auth_token=token,
    )
    db.session.add(user)
    db.session.commit()
    return user


def create_lead_fixture(
    phone_number: str = "+919876543210",
    status: str = "waiting",
    attempt_count: int = 0,
    claimed_by: int | None = None,
    claimed_until: datetime | None = None,
    scheduled_by: int | None = None,
    scheduled_at: datetime | None = None,
    retry_locked_until: datetime | None = None,
    created_at: datetime | None = None,
) -> Lead:
    lead: Lead = Lead(
        phone_number=phone_number,
        status=status,
        attempt_count=attempt_count,
        claimed_by=claimed_by,
        claimed_until=claimed_until,
        scheduled_by=scheduled_by,
        scheduled_at=scheduled_at,
        retry_locked_until=retry_locked_until,
    )
    if created_at is not None:
        lead.created_at = created_at
    db.session.add(lead)
    db.session.commit()
    return lead


def test_upload_leads_successful(app: Flask, client: FlaskClient) -> None:
    manager_token: str = "manager-token-1"
    create_user_fixture(name="Manager1", role="manager", token=manager_token)

    csv_data: bytes = b"9876543210\n9876543211\n9876543212\n"
    data: dict[str, tuple[io.BytesIO, str] | str] = {
        "file": (io.BytesIO(csv_data), "leads.csv"),
        "country": "IN",
    }
    headers: dict[str, str] = {"Authorization": f"Bearer {manager_token}"}

    response = client.post(
        "/api/leads/upload",
        data=data,
        headers=headers,
        content_type="multipart/form-data",
    )

    expected_status_code: int = 200
    assert response.status_code == expected_status_code

    json_data = response.get_json()
    assert json_data["status"] is True
    assert json_data["added"] == 3
    assert json_data["duplicates"] == 0
    assert json_data["invalid"] == 0

    lead_records: list[Lead] = Lead.query.all()
    assert len(lead_records) == 3


def test_upload_leads_file_too_large(app: Flask, client: FlaskClient) -> None:
    manager_token: str = "manager-token-2"
    create_user_fixture(name="Manager2", role="manager", token=manager_token)

    two_megabytes: int = 2 * 1024 * 1024
    extra_byte: int = 100
    oversized_data: bytes = b"9876543210\n" * ((two_megabytes + extra_byte) // 11)

    data: dict[str, tuple[io.BytesIO, str] | str] = {
        "file": (io.BytesIO(oversized_data), "leads.csv"),
        "country": "IN",
    }
    headers: dict[str, str] = {"Authorization": f"Bearer {manager_token}"}

    response = client.post(
        "/api/leads/upload",
        data=data,
        headers=headers,
        content_type="multipart/form-data",
    )

    expected_status_code: int = 400
    assert response.status_code == expected_status_code
    json_data = response.get_json()
    assert json_data["message"] == "File is too large."


def test_upload_leads_duplicates_in_file_skipped(
    app: Flask, client: FlaskClient
) -> None:
    manager_token: str = "manager-token-3"
    create_user_fixture(name="Manager3", role="manager", token=manager_token)

    csv_data: bytes = b"9876543210\n9876543210\n9876543211\n9876543210\n"
    data: dict[str, tuple[io.BytesIO, str] | str] = {
        "file": (io.BytesIO(csv_data), "leads.csv"),
        "country": "IN",
    }
    headers: dict[str, str] = {"Authorization": f"Bearer {manager_token}"}

    response = client.post(
        "/api/leads/upload",
        data=data,
        headers=headers,
        content_type="multipart/form-data",
    )

    assert response.status_code == 200
    json_data = response.get_json()
    assert json_data["added"] == 2
    assert json_data["duplicates"] == 2
    assert json_data["invalid"] == 0


def test_upload_leads_existing_number_in_pool_skipped(
    app: Flask, client: FlaskClient
) -> None:
    manager_token: str = "manager-token-4"
    create_user_fixture(name="Manager4", role="manager", token=manager_token)

    create_lead_fixture(phone_number="+919876543210", status="waiting")
    create_lead_fixture(phone_number="+919876543211", status="done")
    create_lead_fixture(phone_number="+919876543212", status="stopped")

    csv_data: bytes = b"9876543210\n9876543211\n9876543212\n9876543213\n"
    data: dict[str, tuple[io.BytesIO, str] | str] = {
        "file": (io.BytesIO(csv_data), "leads.csv"),
        "country": "IN",
    }
    headers: dict[str, str] = {"Authorization": f"Bearer {manager_token}"}

    response = client.post(
        "/api/leads/upload",
        data=data,
        headers=headers,
        content_type="multipart/form-data",
    )

    assert response.status_code == 200
    json_data = response.get_json()
    assert json_data["added"] == 1
    assert json_data["duplicates"] == 3
    assert json_data["invalid"] == 0


def test_upload_leads_unparseable_number_skipped(
    app: Flask, client: FlaskClient
) -> None:
    manager_token: str = "manager-token-5"
    create_user_fixture(name="Manager5", role="manager", token=manager_token)

    csv_data: bytes = b"9876543210\ninvalid-phone\n12345\n9876543211\n"
    data: dict[str, tuple[io.BytesIO, str] | str] = {
        "file": (io.BytesIO(csv_data), "leads.csv"),
        "country": "IN",
    }
    headers: dict[str, str] = {"Authorization": f"Bearer {manager_token}"}

    response = client.post(
        "/api/leads/upload",
        data=data,
        headers=headers,
        content_type="multipart/form-data",
    )

    assert response.status_code == 200
    json_data = response.get_json()
    assert json_data["added"] == 2
    assert json_data["duplicates"] == 0
    assert json_data["invalid"] == 2


def test_upload_leads_multi_column_rejected(
    app: Flask, client: FlaskClient
) -> None:
    manager_token: str = "manager-token-multi"
    create_user_fixture(name="ManagerMulti", role="manager", token=manager_token)

    csv_data: bytes = b"9876543210,Alice\n9876543211,Bob\n"
    data: dict[str, tuple[io.BytesIO, str] | str] = {
        "file": (io.BytesIO(csv_data), "leads.csv"),
        "country": "IN",
    }
    headers: dict[str, str] = {"Authorization": f"Bearer {manager_token}"}

    response = client.post(
        "/api/leads/upload",
        data=data,
        headers=headers,
        content_type="multipart/form-data",
    )

    assert response.status_code == 400
    assert response.get_json()["message"] == "Please select a valid CSV file."


def test_upload_leads_missing_file_or_invalid_country(
    app: Flask, client: FlaskClient
) -> None:
    manager_token: str = "manager-token-6"
    create_user_fixture(name="Manager6", role="manager", token=manager_token)
    headers: dict[str, str] = {"Authorization": f"Bearer {manager_token}"}

    empty_response = client.post(
        "/api/leads/upload",
        data={"country": "IN"},
        headers=headers,
        content_type="multipart/form-data",
    )
    assert empty_response.status_code == 400
    assert empty_response.get_json()["message"] == "Please select a valid CSV file."

    not_csv_data: dict[str, tuple[io.BytesIO, str] | str] = {
        "file": (io.BytesIO(b"test"), "leads.txt"),
        "country": "IN",
    }
    txt_response = client.post(
        "/api/leads/upload",
        data=not_csv_data,
        headers=headers,
        content_type="multipart/form-data",
    )
    assert txt_response.status_code == 400
    assert txt_response.get_json()["message"] == "Please select a valid CSV file."

    bad_country_data: dict[str, tuple[io.BytesIO, str] | str] = {
        "file": (io.BytesIO(b"9876543210"), "leads.csv"),
        "country": "UK",
    }
    country_response = client.post(
        "/api/leads/upload",
        data=bad_country_data,
        headers=headers,
        content_type="multipart/form-data",
    )
    assert country_response.status_code == 400
    assert "Country must be one of" in country_response.get_json()["message"]


def test_upload_leads_non_manager_forbidden(
    app: Flask, client: FlaskClient
) -> None:
    sales_token: str = "sales-token-1"
    create_user_fixture(name="SalesUser1", role="salesperson", token=sales_token)

    data: dict[str, tuple[io.BytesIO, str] | str] = {
        "file": (io.BytesIO(b"9876543210"), "leads.csv"),
        "country": "IN",
    }
    headers: dict[str, str] = {"Authorization": f"Bearer {sales_token}"}

    response = client.post(
        "/api/leads/upload",
        data=data,
        headers=headers,
        content_type="multipart/form-data",
    )
    assert response.status_code == 403


def test_summary_pool_bucket_counts(app: Flask, client: FlaskClient) -> None:
    manager_token: str = "manager-summary-token"
    manager = create_user_fixture(name="ManagerSum", role="manager", token=manager_token)

    current_time: datetime = now_utc()
    create_lead_fixture(phone_number="+919876543201", status="waiting")
    create_lead_fixture(phone_number="+919876543202", status="waiting")
    create_lead_fixture(
        phone_number="+919876543203",
        status="waiting",
        scheduled_by=manager.id,
        scheduled_at=current_time + timedelta(days=1),
    )
    create_lead_fixture(phone_number="+919876543204", status="done")
    create_lead_fixture(phone_number="+919876543205", status="stopped")

    headers: dict[str, str] = {"Authorization": f"Bearer {manager_token}"}
    response = client.get("/api/leads/summary", headers=headers)

    assert response.status_code == 200
    json_data = response.get_json()
    assert json_data["status"] is True
    pool = json_data["pool"]
    assert pool["waiting"] == 2
    assert pool["scheduled"] == 1
    assert pool["connected"] == 1
    assert pool["stopped"] == 1
    assert "done" not in pool


def test_summary_waiting_split_by_attempts(app: Flask, client: FlaskClient) -> None:
    manager_token: str = "manager-split-token"
    manager = create_user_fixture(name="ManagerSplit", role="manager", token=manager_token)

    current_time: datetime = now_utc()
    create_lead_fixture(phone_number="+919870000001", status="waiting", attempt_count=0)
    create_lead_fixture(phone_number="+919870000002", status="waiting", attempt_count=1)
    create_lead_fixture(phone_number="+919870000003", status="waiting", attempt_count=2)
    create_lead_fixture(
        phone_number="+919870000004",
        status="waiting",
        attempt_count=1,
        scheduled_by=manager.id,
        scheduled_at=current_time + timedelta(days=1),
    )
    create_lead_fixture(phone_number="+919870000005", status="done", attempt_count=3)
    create_lead_fixture(phone_number="+919870000006", status="stopped", attempt_count=3)

    headers: dict[str, str] = {"Authorization": f"Bearer {manager_token}"}
    response = client.get("/api/leads/summary", headers=headers)

    assert response.status_code == 200
    json_data = response.get_json()
    pool = json_data["pool"]
    assert pool["waiting_by_attempts"] == {"0": 1, "1": 1, "2": 1}
    assert pool["waiting"] == 3
    assert pool["scheduled"] == 1
    assert pool["connected"] == 1
    assert pool["stopped"] == 1


def test_summary_uploaded_counts_by_ist_day(app: Flask, client: FlaskClient) -> None:
    manager_token: str = "manager-upload-day-token"
    create_user_fixture(name="ManagerUploadDay", role="manager", token=manager_token)

    current_ist: datetime = now_ist()
    midnight_today_ist: datetime = current_ist.replace(
        hour=0, minute=0, second=0, microsecond=0
    )
    one_hour: timedelta = timedelta(hours=1)
    half_day: timedelta = timedelta(hours=12)
    day_and_a_half: timedelta = timedelta(hours=36)
    utc_zone: timezone = timezone.utc
    today_creation_utc: datetime = (midnight_today_ist + one_hour).astimezone(utc_zone)
    yesterday_creation_utc: datetime = (midnight_today_ist - half_day).astimezone(
        utc_zone
    )
    older_creation_utc: datetime = (midnight_today_ist - day_and_a_half).astimezone(
        utc_zone
    )

    create_lead_fixture(
        phone_number="+919871000001", status="waiting", created_at=today_creation_utc
    )
    create_lead_fixture(
        phone_number="+919871000002",
        status="waiting",
        created_at=yesterday_creation_utc,
    )
    create_lead_fixture(
        phone_number="+919871000003", status="waiting", created_at=older_creation_utc
    )

    headers: dict[str, str] = {"Authorization": f"Bearer {manager_token}"}
    response = client.get("/api/leads/summary", headers=headers)

    assert response.status_code == 200
    json_data = response.get_json()
    uploaded = json_data["uploaded"]
    assert uploaded["today"] == 1
    assert uploaded["yesterday"] == 1


def test_summary_tackled_counts_distinct_leads(
    app: Flask, client: FlaskClient
) -> None:
    manager_token: str = "manager-tackle-token"
    create_user_fixture(name="ManagerTackle", role="manager", token=manager_token)
    salesperson = create_user_fixture(
        name="Tackler", role="salesperson", token="tackle-sales-token"
    )

    create_lead_fixture(phone_number="+919872000001", status="waiting", attempt_count=2)
    create_lead_fixture(phone_number="+919872000002", status="waiting", attempt_count=1)
    create_lead_fixture(phone_number="+919872000003", status="done")

    current_ist: datetime = now_ist()
    midnight_today_ist: datetime = current_ist.replace(
        hour=0, minute=0, second=0, microsecond=0
    )
    one_hour: timedelta = timedelta(hours=1)
    half_day: timedelta = timedelta(hours=12)
    utc_zone: timezone = timezone.utc
    today_dial_utc: datetime = (midnight_today_ist + one_hour).astimezone(utc_zone)
    yesterday_dial_utc: datetime = (midnight_today_ist - half_day).astimezone(utc_zone)

    repeat_lead_call_1 = Call(
        call_id="tackle-call-1",
        user_id=salesperson.id,
        phone_number="+919872000001",
        dialed_at=today_dial_utc,
        duration_seconds=0,
    )
    repeat_lead_call_2 = Call(
        call_id="tackle-call-2",
        user_id=salesperson.id,
        phone_number="+919872000001",
        dialed_at=today_dial_utc,
        duration_seconds=40,
    )
    second_lead_call = Call(
        call_id="tackle-call-3",
        user_id=salesperson.id,
        phone_number="+919872000002",
        dialed_at=today_dial_utc,
        duration_seconds=0,
    )
    yesterday_lead_call = Call(
        call_id="tackle-call-4",
        user_id=salesperson.id,
        phone_number="+919872000003",
        dialed_at=yesterday_dial_utc,
        duration_seconds=25,
    )
    non_lead_call = Call(
        call_id="tackle-call-5",
        user_id=salesperson.id,
        phone_number="+919999999999",
        dialed_at=today_dial_utc,
        duration_seconds=10,
    )
    db.session.add_all(
        [
            repeat_lead_call_1,
            repeat_lead_call_2,
            second_lead_call,
            yesterday_lead_call,
            non_lead_call,
        ]
    )
    db.session.commit()

    headers: dict[str, str] = {"Authorization": f"Bearer {manager_token}"}
    response = client.get("/api/leads/summary", headers=headers)

    assert response.status_code == 200
    json_data = response.get_json()
    tackled = json_data["tackled"]
    assert tackled["today"] == 2
    assert tackled["yesterday"] == 1


def test_next_lead_manager_forbidden(app: Flask, client: FlaskClient) -> None:
    manager_token: str = "manager-next-token"
    create_user_fixture(name="ManagerNext", role="manager", token=manager_token)

    headers: dict[str, str] = {"Authorization": f"Bearer {manager_token}"}
    response = client.post("/api/leads/next", json={}, headers=headers)

    assert response.status_code == 403
    assert response.get_json()["message"] == "Salesperson access required."


def test_next_lead_unexpired_claim_returned_first(
    app: Flask, client: FlaskClient
) -> None:
    sales_token: str = "sales-token-priority-1"
    salesperson = create_user_fixture(name="SalesPri1", role="salesperson", token=sales_token)

    current_time: datetime = now_utc()
    claimed_lead = create_lead_fixture(
        phone_number="+919876543210",
        status="waiting",
        claimed_by=salesperson.id,
        claimed_until=current_time + timedelta(minutes=5),
    )
    create_lead_fixture(
        phone_number="+919876543211",
        status="waiting",
        created_at=current_time + timedelta(minutes=2),
    )

    headers: dict[str, str] = {"Authorization": f"Bearer {sales_token}"}
    response = client.post("/api/leads/next", json={}, headers=headers)

    assert response.status_code == 200
    json_data = response.get_json()
    assert json_data["status"] is True
    assert json_data["lead"]["id"] == claimed_lead.id
    assert json_data["lead"]["phone_number"] == "+919876543210"
    assert json_data["lead"]["is_scheduled"] is False


def test_next_lead_due_scheduled_served_before_pool(
    app: Flask, client: FlaskClient
) -> None:
    sales_token: str = "sales-token-priority-2"
    salesperson = create_user_fixture(name="SalesPri2", role="salesperson", token=sales_token)

    current_time: datetime = now_utc()
    scheduled_lead = create_lead_fixture(
        phone_number="+919876543220",
        status="waiting",
        scheduled_by=salesperson.id,
        scheduled_at=current_time - timedelta(minutes=10),
    )
    create_lead_fixture(
        phone_number="+919876543221",
        status="waiting",
        created_at=current_time,
    )

    headers: dict[str, str] = {"Authorization": f"Bearer {sales_token}"}
    response = client.post("/api/leads/next", json={}, headers=headers)

    assert response.status_code == 200
    json_data = response.get_json()
    assert json_data["lead"]["id"] == scheduled_lead.id
    assert json_data["lead"]["phone_number"] == "+919876543220"
    assert json_data["lead"]["is_scheduled"] is True


def test_next_lead_newest_waiting_served(
    app: Flask, client: FlaskClient
) -> None:
    sales_token: str = "sales-token-priority-3"
    create_user_fixture(name="SalesPri3", role="salesperson", token=sales_token)

    current_time: datetime = now_utc()
    older_lead = create_lead_fixture(
        phone_number="+919876543230",
        status="waiting",
        created_at=current_time - timedelta(hours=2),
    )
    newer_lead = create_lead_fixture(
        phone_number="+919876543231",
        status="waiting",
        created_at=current_time - timedelta(hours=1),
    )

    headers: dict[str, str] = {"Authorization": f"Bearer {sales_token}"}
    response = client.post("/api/leads/next", json={}, headers=headers)

    assert response.status_code == 200
    json_data = response.get_json()
    assert json_data["lead"]["id"] == newer_lead.id
    assert json_data["lead"]["phone_number"] == "+919876543231"
    assert json_data["lead"]["is_scheduled"] is False


def test_next_lead_pool_empty(app: Flask, client: FlaskClient) -> None:
    sales_token: str = "sales-token-empty"
    create_user_fixture(name="SalesEmpty", role="salesperson", token=sales_token)

    headers: dict[str, str] = {"Authorization": f"Bearer {sales_token}"}
    response = client.post("/api/leads/next", json={}, headers=headers)

    assert response.status_code == 200
    json_data = response.get_json()
    assert json_data["status"] is True
    assert json_data["lead"] is None


def test_next_lead_claimed_on_serve_and_expires(
    app: Flask, client: FlaskClient
) -> None:
    sales_1 = create_user_fixture(name="UserClaim1", role="salesperson", token="claim-token-1")
    sales_2 = create_user_fixture(name="UserClaim2", role="salesperson", token="claim-token-2")

    lead = create_lead_fixture(phone_number="+919876543240", status="waiting")

    headers_1: dict[str, str] = {"Authorization": f"Bearer {sales_1.auth_token}"}
    headers_2: dict[str, str] = {"Authorization": f"Bearer {sales_2.auth_token}"}

    resp1 = client.post("/api/leads/next", json={}, headers=headers_1)
    assert resp1.status_code == 200
    assert resp1.get_json()["lead"]["id"] == lead.id

    db.session.refresh(lead)
    assert lead.claimed_by == sales_1.id
    assert lead.claimed_until is not None

    resp2 = client.post("/api/leads/next", json={}, headers=headers_2)
    assert resp2.status_code == 200
    assert resp2.get_json()["lead"] is None

    lead.claimed_until = now_utc() - timedelta(seconds=1)
    db.session.commit()

    resp3 = client.post("/api/leads/next", json={}, headers=headers_2)
    assert resp3.status_code == 200
    assert resp3.get_json()["lead"]["id"] == lead.id

    db.session.refresh(lead)
    assert lead.claimed_by == sales_2.id


def test_next_lead_schedule_accepted(app: Flask, client: FlaskClient) -> None:
    salesperson = create_user_fixture(name="SalesSchedule", role="salesperson", token="sched-token")
    lead_to_schedule = create_lead_fixture(phone_number="+919876543250", status="waiting")

    current_time: datetime = now_utc()
    scheduled_future: datetime = current_time + timedelta(days=5)

    headers: dict[str, str] = {"Authorization": f"Bearer {salesperson.auth_token}"}
    payload: dict[str, Any] = {
        "schedule": {
            "lead_id": lead_to_schedule.id,
            "scheduled_at": scheduled_future.isoformat(),
        }
    }

    response = client.post("/api/leads/next", json=payload, headers=headers)
    assert response.status_code == 200

    db.session.refresh(lead_to_schedule)
    assert lead_to_schedule.scheduled_by == salesperson.id
    assert lead_to_schedule.scheduled_at is not None
    assert lead_to_schedule.claimed_by is None
    assert lead_to_schedule.claimed_until is None


def test_next_lead_schedule_combined_with_next_fetch(
    app: Flask, client: FlaskClient
) -> None:
    salesperson = create_user_fixture(name="SalesCombo", role="salesperson", token="combo-token")
    lead_1 = create_lead_fixture(phone_number="+919876543261", status="waiting")
    lead_2 = create_lead_fixture(phone_number="+919876543262", status="waiting")

    scheduled_future: datetime = now_utc() + timedelta(days=3)
    headers: dict[str, str] = {"Authorization": f"Bearer {salesperson.auth_token}"}

    payload: dict[str, Any] = {
        "schedule": {
            "lead_id": lead_1.id,
            "scheduled_at": scheduled_future.isoformat(),
        }
    }

    response = client.post("/api/leads/next", json=payload, headers=headers)
    assert response.status_code == 200
    json_data = response.get_json()
    assert json_data["lead"]["id"] == lead_2.id
    assert json_data["lead"]["phone_number"] == "+919876543262"

    db.session.refresh(lead_1)
    assert lead_1.scheduled_by == salesperson.id


def test_next_lead_continue_calling_false_serves_no_lead(
    app: Flask, client: FlaskClient
) -> None:
    salesperson = create_user_fixture(name="SalesStop", role="salesperson", token="stop-token")

    current_time: datetime = now_utc()
    claimed_lead = create_lead_fixture(
        phone_number="+919876543290",
        status="waiting",
        claimed_by=salesperson.id,
        claimed_until=current_time + timedelta(minutes=5),
    )
    create_lead_fixture(phone_number="+919876543291", status="waiting")

    headers: dict[str, str] = {"Authorization": f"Bearer {salesperson.auth_token}"}
    payload: dict[str, Any] = {"continue_calling": False}

    response = client.post("/api/leads/next", json=payload, headers=headers)

    assert response.status_code == 200
    json_data = response.get_json()
    assert json_data["status"] is True
    assert json_data["lead"] is None

    db.session.refresh(claimed_lead)
    assert claimed_lead.claimed_by is None
    assert claimed_lead.claimed_until is None

    pool_lead: Lead | None = Lead.query.filter_by(phone_number="+919876543291").first()
    assert pool_lead is not None
    assert pool_lead.claimed_by is None


def test_next_lead_continue_calling_false_still_applies_schedule(
    app: Flask, client: FlaskClient
) -> None:
    salesperson = create_user_fixture(name="SalesStopSched", role="salesperson", token="stop-sched-token")

    current_time: datetime = now_utc()
    claimed_lead = create_lead_fixture(
        phone_number="+919876543292",
        status="waiting",
        claimed_by=salesperson.id,
        claimed_until=current_time + timedelta(minutes=5),
    )
    create_lead_fixture(phone_number="+919876543293", status="waiting")

    future_schedule: datetime = current_time + timedelta(days=2)
    headers: dict[str, str] = {"Authorization": f"Bearer {salesperson.auth_token}"}
    payload: dict[str, Any] = {
        "continue_calling": False,
        "schedule": {
            "lead_id": claimed_lead.id,
            "scheduled_at": future_schedule.isoformat(),
        },
    }

    response = client.post("/api/leads/next", json=payload, headers=headers)

    assert response.status_code == 200
    json_data = response.get_json()
    assert json_data["status"] is True
    assert json_data["lead"] is None

    db.session.refresh(claimed_lead)
    assert claimed_lead.scheduled_by == salesperson.id
    assert claimed_lead.scheduled_at is not None
    assert claimed_lead.claimed_by is None
    assert claimed_lead.claimed_until is None

    untouched_lead: Lead | None = Lead.query.filter_by(
        phone_number="+919876543293"
    ).first()
    assert untouched_lead is not None
    assert untouched_lead.claimed_by is None


def test_next_lead_continue_calling_true_serves_lead_as_before(
    app: Flask, client: FlaskClient
) -> None:
    salesperson = create_user_fixture(name="SalesContinue", role="salesperson", token="continue-token")
    pool_lead = create_lead_fixture(phone_number="+919876543294", status="waiting")

    headers: dict[str, str] = {"Authorization": f"Bearer {salesperson.auth_token}"}
    payload: dict[str, Any] = {"continue_calling": True}

    response = client.post("/api/leads/next", json=payload, headers=headers)

    assert response.status_code == 200
    json_data = response.get_json()
    assert json_data["lead"]["id"] == pool_lead.id
    assert json_data["lead"]["phone_number"] == "+919876543294"

    db.session.refresh(pool_lead)
    assert pool_lead.claimed_by == salesperson.id
    assert pool_lead.claimed_until is not None


def test_next_lead_newest_schedule_wins_ownership(
    app: Flask, client: FlaskClient
) -> None:
    first_salesperson = create_user_fixture(
        name="SalesFirst", role="salesperson", token="first-sched-token"
    )
    second_salesperson = create_user_fixture(
        name="SalesSecond", role="salesperson", token="second-sched-token"
    )
    lead = create_lead_fixture(phone_number="+919876543300", status="waiting")

    headers_first: dict[str, str] = {
        "Authorization": f"Bearer {first_salesperson.auth_token}"
    }
    headers_second: dict[str, str] = {
        "Authorization": f"Bearer {second_salesperson.auth_token}"
    }

    first_payload: dict[str, Any] = {
        "schedule": {
            "lead_id": lead.id,
            "scheduled_at": (now_utc() + timedelta(days=2)).isoformat(),
        }
    }
    first_response = client.post("/api/leads/next", json=first_payload, headers=headers_first)
    assert first_response.status_code == 200

    second_payload: dict[str, Any] = {
        "schedule": {
            "lead_id": lead.id,
            "scheduled_at": (now_utc() + timedelta(days=3)).isoformat(),
        }
    }
    second_response = client.post("/api/leads/next", json=second_payload, headers=headers_second)
    assert second_response.status_code == 200

    db.session.refresh(lead)
    assert lead.status == "waiting"
    assert lead.scheduled_by == second_salesperson.id
    assert lead.claimed_by is None


def test_next_lead_schedule_in_past_or_too_far_ahead_rejected(
    app: Flask, client: FlaskClient
) -> None:
    salesperson = create_user_fixture(name="SalesPast", role="salesperson", token="past-token")
    lead = create_lead_fixture(phone_number="+919876543270", status="waiting")

    current_time: datetime = now_utc()
    past_time: datetime = current_time - timedelta(hours=1)
    headers: dict[str, str] = {"Authorization": f"Bearer {salesperson.auth_token}"}

    past_payload: dict[str, Any] = {
        "schedule": {
            "lead_id": lead.id,
            "scheduled_at": past_time.isoformat(),
        }
    }
    response_past = client.post("/api/leads/next", json=past_payload, headers=headers)
    assert response_past.status_code == 400
    assert response_past.get_json()["message"] == "Scheduled time must be in the future within 30 days."

    too_far_time: datetime = current_time + timedelta(days=MAX_SCHEDULE_AHEAD_DAYS + 2)
    far_payload: dict[str, Any] = {
        "schedule": {
            "lead_id": lead.id,
            "scheduled_at": too_far_time.isoformat(),
        }
    }
    response_far = client.post("/api/leads/next", json=far_payload, headers=headers)
    assert response_far.status_code == 400
    assert response_far.get_json()["message"] == "Scheduled time must be in the future within 30 days."


def test_next_lead_schedule_books_done_or_stopped_lead(
    app: Flask, client: FlaskClient
) -> None:
    salesperson = create_user_fixture(name="SalesRevive", role="salesperson", token="revive-token")

    locked_time: datetime = now_utc() + timedelta(hours=1)
    done_lead = create_lead_fixture(
        phone_number="+919876543281",
        status="done",
        attempt_count=1,
        claimed_by=salesperson.id,
        retry_locked_until=locked_time,
    )
    stopped_lead = create_lead_fixture(
        phone_number="+919876543282",
        status="stopped",
        attempt_count=3,
        retry_locked_until=locked_time,
    )

    future_time: str = (now_utc() + timedelta(days=2)).isoformat()
    headers: dict[str, str] = {"Authorization": f"Bearer {salesperson.auth_token}"}

    done_payload: dict[str, Any] = {
        "schedule": {"lead_id": done_lead.id, "scheduled_at": future_time}
    }
    done_response = client.post("/api/leads/next", json=done_payload, headers=headers)
    assert done_response.status_code == 200

    stopped_payload: dict[str, Any] = {
        "schedule": {"lead_id": stopped_lead.id, "scheduled_at": future_time}
    }
    stopped_response = client.post("/api/leads/next", json=stopped_payload, headers=headers)
    assert stopped_response.status_code == 200

    db.session.refresh(done_lead)
    db.session.refresh(stopped_lead)
    for booked_lead in (done_lead, stopped_lead):
        assert booked_lead.status == "waiting"
        assert booked_lead.scheduled_by == salesperson.id
        assert booked_lead.scheduled_at is not None
        assert booked_lead.claimed_by is None
        assert booked_lead.claimed_until is None
        assert booked_lead.retry_locked_until is None


def test_next_lead_schedule_clears_claim_held_by_different_user(
    app: Flask, client: FlaskClient
) -> None:
    scheduler = create_user_fixture(
        name="SalesCross", role="salesperson", token="cross-sched-token"
    )
    claim_holder = create_user_fixture(
        name="SalesHolder", role="salesperson", token="holder-token"
    )

    locked_time = now_utc() + timedelta(hours=1)
    claimed_lead = create_lead_fixture(
        phone_number="+919876543295",
        status="waiting",
        claimed_by=claim_holder.id,
        claimed_until=locked_time,
    )

    future_time = (now_utc() + timedelta(days=2)).isoformat()
    headers = {"Authorization": f"Bearer {scheduler.auth_token}"}
    payload = {
        "schedule": {"lead_id": claimed_lead.id, "scheduled_at": future_time}
    }

    response = client.post("/api/leads/next", json=payload, headers=headers)
    assert response.status_code == 200

    db.session.refresh(claimed_lead)
    assert claimed_lead.scheduled_by == scheduler.id
    assert claimed_lead.scheduled_at is not None
    assert claimed_lead.claimed_by is None
    assert claimed_lead.claimed_until is None


def test_next_lead_frees_expired_booking_into_newest_first_pool(
    app: Flask, client: FlaskClient
) -> None:
    salesperson = create_user_fixture(
        name="SalesExpire", role="salesperson", token="expire-token"
    )

    current_time: datetime = now_utc()
    one_hour_past_expiry: timedelta = timedelta(hours=SCHEDULE_EXPIRE_HOURS + 1)
    expired_booking_time: datetime = current_time - one_hour_past_expiry
    two_hours_ago: timedelta = timedelta(hours=2)
    freed_lead = create_lead_fixture(
        phone_number="+919876543310",
        status="waiting",
        attempt_count=1,
        scheduled_by=salesperson.id,
        scheduled_at=expired_booking_time,
        created_at=current_time,
    )
    create_lead_fixture(
        phone_number="+919876543311",
        status="waiting",
        created_at=current_time - two_hours_ago,
    )

    headers: dict[str, str] = {"Authorization": f"Bearer {salesperson.auth_token}"}
    response = client.post("/api/leads/next", json={}, headers=headers)

    assert response.status_code == 200
    json_data = response.get_json()
    assert json_data["lead"]["id"] == freed_lead.id
    assert json_data["lead"]["is_scheduled"] is False

    db.session.refresh(freed_lead)
    assert freed_lead.status == "waiting"
    assert freed_lead.scheduled_by is None
    assert freed_lead.scheduled_at is None
    assert freed_lead.attempt_count == 1


def test_next_lead_booking_inside_window_keeps_lead_reserved(
    app: Flask, client: FlaskClient
) -> None:
    owner = create_user_fixture(name="SalesOwner", role="salesperson", token="owner-token")
    other = create_user_fixture(name="SalesOther", role="salesperson", token="other-token")

    current_time: datetime = now_utc()
    one_hour_ago: timedelta = timedelta(hours=1)
    due_booking_time: datetime = current_time - one_hour_ago
    booked_lead = create_lead_fixture(
        phone_number="+919876543312",
        status="waiting",
        attempt_count=1,
        scheduled_by=owner.id,
        scheduled_at=due_booking_time,
    )
    two_hours_ago: timedelta = timedelta(hours=2)
    pool_lead = create_lead_fixture(
        phone_number="+919876543313",
        status="waiting",
        created_at=current_time - two_hours_ago,
    )

    other_headers: dict[str, str] = {"Authorization": f"Bearer {other.auth_token}"}
    other_response = client.post("/api/leads/next", json={}, headers=other_headers)

    assert other_response.status_code == 200
    assert other_response.get_json()["lead"]["id"] == pool_lead.id

    db.session.refresh(booked_lead)
    assert booked_lead.status == "waiting"
    assert booked_lead.scheduled_by == owner.id
    assert booked_lead.scheduled_at is not None
    assert booked_lead.attempt_count == 1

    owner_headers: dict[str, str] = {"Authorization": f"Bearer {owner.auth_token}"}
    owner_response = client.post("/api/leads/next", json={}, headers=owner_headers)

    assert owner_response.status_code == 200
    owner_json_data = owner_response.get_json()
    assert owner_json_data["lead"]["id"] == booked_lead.id
    assert owner_json_data["lead"]["is_scheduled"] is True


def test_next_lead_frees_deactivated_owner_booking(
    app: Flask, client: FlaskClient
) -> None:
    deactivated_owner = create_user_fixture(
        name="SalesGone", role="salesperson", token="gone-token", is_active=False
    )
    active_salesperson = create_user_fixture(
        name="SalesActive", role="salesperson", token="active-token"
    )

    current_time: datetime = now_utc()
    two_hours_past_expiry: timedelta = timedelta(hours=SCHEDULE_EXPIRE_HOURS + 2)
    stuck_booking_time: datetime = current_time - two_hours_past_expiry
    three_hours_ago: timedelta = timedelta(hours=3)
    stuck_lead = create_lead_fixture(
        phone_number="+919876543314",
        status="waiting",
        attempt_count=2,
        scheduled_by=deactivated_owner.id,
        scheduled_at=stuck_booking_time,
        created_at=current_time,
    )
    create_lead_fixture(
        phone_number="+919876543315",
        status="waiting",
        created_at=current_time - three_hours_ago,
    )

    headers: dict[str, str] = {"Authorization": f"Bearer {active_salesperson.auth_token}"}
    response = client.post("/api/leads/next", json={}, headers=headers)

    assert response.status_code == 200
    json_data = response.get_json()
    assert json_data["lead"]["id"] == stuck_lead.id
    assert json_data["lead"]["is_scheduled"] is False

    db.session.refresh(stuck_lead)
    assert stuck_lead.scheduled_by is None
    assert stuck_lead.scheduled_at is None
    assert stuck_lead.attempt_count == 2
