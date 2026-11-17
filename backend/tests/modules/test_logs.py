import csv
import io
from datetime import datetime, timedelta, timezone
from typing import Any

from flask import Flask, Response
from flask.testing import FlaskClient

from backend.app.core.utils import now_ist
from backend.app.extensions import db
from backend.app.modules.calls import Call
from backend.app.modules.users import User
from backend.tests.modules.dashboard_test_helpers import create_user_fixture

BOM_BYTES: bytes = b"\xef\xbb\xbf"
TEN_COLUMN_HEADERS: list[str] = [
    "Salesperson",
    "Phone Number",
    "Date",
    "Time",
    "Direction",
    "Connected",
    "Duration (minutes)",
    "Interested",
    "Do Not Call",
    "Notes",
]


def create_log_call(
    call_id: str,
    user_id: int,
    phone_number: str,
    dialed_at: datetime,
    duration_seconds: int = 0,
    direction: str = "outgoing",
    interested: bool = False,
    do_not_call: bool = False,
    notes: str | None = None,
) -> Call:
    call: Call = Call(
        call_id=call_id,
        user_id=user_id,
        phone_number=phone_number,
        dialed_at=dialed_at,
        duration_seconds=duration_seconds,
        direction=direction,
        interested=interested,
        do_not_call=do_not_call,
        notes=notes,
    )
    db.session.add(call)
    db.session.commit()
    return call


def create_utc_time_at_ist(
    days_ago: int, hour: int, minute: int, second: int = 0
) -> datetime:
    ist_today_midnight: datetime = now_ist().replace(
        hour=0, minute=0, second=0, microsecond=0
    )
    ist_call_time: datetime = ist_today_midnight - timedelta(
        days=days_ago
    ) + timedelta(hours=hour, minutes=minute, seconds=second)
    utc_call_time: datetime = ist_call_time.astimezone(timezone.utc)
    return utc_call_time


def fetch_team_log_download(
    client: FlaskClient, token: str | None, day: str | None = None
) -> Response:
    headers: dict[str, str] = {}
    if token is not None:
        headers["Authorization"] = f"Bearer {token}"
    query_params: dict[str, str] = {}
    if day is not None:
        query_params["day"] = day
    response: Response = client.get(
        "/api/logs/team", query_string=query_params, headers=headers
    )
    return response


def parse_csv_rows(response: Response) -> list[list[str]]:
    csv_text: str = response.data.decode("utf-8-sig")
    csv_rows: list[list[str]] = list(csv.reader(io.StringIO(csv_text)))
    return csv_rows


def get_data_rows(response: Response) -> list[list[str]]:
    csv_rows: list[list[str]] = parse_csv_rows(response)
    data_rows: list[list[str]] = csv_rows[1:]
    return data_rows


def test_team_log_download_unauthenticated_rejected(client: FlaskClient) -> None:
    response: Response = fetch_team_log_download(client, None, "today")
    expected_status: int = 401
    assert response.status_code == expected_status
    response_json: dict[str, Any] = response.get_json()
    assert response_json.get("message") == "Invalid or expired token."


def test_team_log_download_invalid_token_rejected(client: FlaskClient) -> None:
    response: Response = fetch_team_log_download(client, "bad-token", "today")
    expected_status: int = 401
    assert response.status_code == expected_status


def test_team_log_download_salesperson_rejected(
    app: Flask, client: FlaskClient
) -> None:
    with app.app_context():
        create_user_fixture(
            name="logs_salesperson", role="salesperson", token="logs-sales-token"
        )
        response: Response = fetch_team_log_download(
            client, "logs-sales-token", "today"
        )
        expected_status: int = 403
        assert response.status_code == expected_status
        response_json: dict[str, Any] = response.get_json()
        assert response_json.get("message") == "This dashboard is for managers."


def test_team_log_download_missing_day_rejected(
    app: Flask, client: FlaskClient
) -> None:
    with app.app_context():
        create_user_fixture(name="logs_mgr_missing", role="manager", token="mgr-miss")
        response: Response = fetch_team_log_download(client, "mgr-miss", None)
        expected_status: int = 400
        assert response.status_code == expected_status
        response_json: dict[str, Any] = response.get_json()
        assert response_json.get("message") == "day must be today or yesterday."


def test_team_log_download_unknown_day_rejected(
    app: Flask, client: FlaskClient
) -> None:
    with app.app_context():
        create_user_fixture(name="logs_mgr_unknown", role="manager", token="mgr-unk")
        response: Response = fetch_team_log_download(client, "mgr-unk", "tomorrow")
        expected_status: int = 400
        assert response.status_code == expected_status
        response_json: dict[str, Any] = response.get_json()
        assert response_json.get("message") == "day must be today or yesterday."


def test_team_log_download_today_filename_and_csv_content_type(
    app: Flask, client: FlaskClient
) -> None:
    with app.app_context():
        create_user_fixture(name="logs_mgr_file", role="manager", token="mgr-file")
        response: Response = fetch_team_log_download(client, "mgr-file", "today")
        expected_status: int = 200
        assert response.status_code == expected_status
        assert response.mimetype == "text/csv"
        today_date: str = now_ist().date().isoformat()
        expected_filename: str = f"call-logs-{today_date}.csv"
        content_disposition: str = response.headers["Content-Disposition"]
        assert content_disposition == f'attachment; filename="{expected_filename}"'


def test_team_log_download_yesterday_filename(
    app: Flask, client: FlaskClient
) -> None:
    with app.app_context():
        create_user_fixture(name="logs_mgr_yf", role="manager", token="mgr-yf")
        response: Response = fetch_team_log_download(client, "mgr-yf", "yesterday")
        expected_status: int = 200
        assert response.status_code == expected_status
        yesterday_date: str = (now_ist().date() - timedelta(days=1)).isoformat()
        expected_filename: str = f"call-logs-{yesterday_date}.csv"
        content_disposition: str = response.headers["Content-Disposition"]
        assert content_disposition == f'attachment; filename="{expected_filename}"'


def test_team_log_download_ten_columns_in_order_with_bom(
    app: Flask, client: FlaskClient
) -> None:
    with app.app_context():
        create_user_fixture(name="logs_mgr_cols", role="manager", token="mgr-cols")
        response: Response = fetch_team_log_download(client, "mgr-cols", "today")
        assert response.data.startswith(BOM_BYTES)
        csv_rows: list[list[str]] = parse_csv_rows(response)
        assert csv_rows[0] == TEN_COLUMN_HEADERS


def test_team_log_download_one_call_row_values(
    app: Flask, client: FlaskClient
) -> None:
    with app.app_context():
        create_user_fixture(name="logs_mgr_row", role="manager", token="mgr-row")
        ramesh: User = create_user_fixture(
            name="Ramesh", role="salesperson", token="ramesh-token"
        )
        call_time: datetime = create_utc_time_at_ist(0, 11, 24, 5)
        create_log_call(
            call_id="log-row-1",
            user_id=ramesh.id,
            phone_number="+919876543210",
            dialed_at=call_time,
            duration_seconds=210,
            direction="outgoing",
            interested=True,
            do_not_call=False,
            notes="wants a demo on Tuesday",
        )
        response: Response = fetch_team_log_download(client, "mgr-row", "today")
        data_rows: list[list[str]] = get_data_rows(response)
        assert len(data_rows) == 1
        today_date: str = now_ist().date().isoformat()
        assert data_rows[0] == [
            "Ramesh",
            "+919876543210",
            today_date,
            "11:24:05",
            "Outgoing",
            "Yes",
            "3.50",
            "Yes",
            "No",
            "wants a demo on Tuesday",
        ]


def test_team_log_download_incoming_call_and_zero_duration(
    app: Flask, client: FlaskClient
) -> None:
    with app.app_context():
        create_user_fixture(name="logs_mgr_in", role="manager", token="mgr-in")
        suresh: User = create_user_fixture(
            name="Suresh", role="salesperson", token="suresh-token"
        )
        call_time: datetime = create_utc_time_at_ist(0, 11, 40, 15)
        create_log_call(
            call_id="log-in-1",
            user_id=suresh.id,
            phone_number="+919812345678",
            dialed_at=call_time,
            duration_seconds=0,
            direction="incoming",
        )
        response: Response = fetch_team_log_download(client, "mgr-in", "today")
        data_rows: list[list[str]] = get_data_rows(response)
        assert len(data_rows) == 1
        assert data_rows[0][4] == "Incoming"
        assert data_rows[0][5] == "No"
        assert data_rows[0][6] == "0.00"
        assert data_rows[0][9] == ""


def test_team_log_download_sorts_names_az_then_calls_oldest_first(
    app: Flask, client: FlaskClient
) -> None:
    with app.app_context():
        create_user_fixture(name="logs_mgr_sort", role="manager", token="mgr-sort")
        zara: User = create_user_fixture(
            name="Zara", role="salesperson", token="zara-token"
        )
        amit: User = create_user_fixture(
            name="Amit", role="salesperson", token="amit-token"
        )
        create_log_call(
            "sort-zara-old",
            zara.id,
            "+919876543301",
            create_utc_time_at_ist(0, 10, 0),
        )
        create_log_call(
            "sort-amit-new",
            amit.id,
            "+919876543302",
            create_utc_time_at_ist(0, 16, 0),
        )
        create_log_call(
            "sort-zara-new",
            zara.id,
            "+919876543303",
            create_utc_time_at_ist(0, 17, 0),
        )
        create_log_call(
            "sort-amit-old",
            amit.id,
            "+919876543304",
            create_utc_time_at_ist(0, 9, 0),
        )
        response: Response = fetch_team_log_download(client, "mgr-sort", "today")
        data_rows: list[list[str]] = get_data_rows(response)
        expected_rows: list[tuple[str, str]] = [
            ("Amit", "+919876543304"),
            ("Amit", "+919876543302"),
            ("Zara", "+919876543301"),
            ("Zara", "+919876543303"),
        ]
        actual_rows: list[tuple[str, str]] = [
            (row[0], row[1]) for row in data_rows
        ]
        assert actual_rows == expected_rows


def test_team_log_download_includes_deactivated_salesperson_calls(
    app: Flask, client: FlaskClient
) -> None:
    with app.app_context():
        create_user_fixture(name="logs_mgr_deact", role="manager", token="mgr-deact")
        deactivated_rep: User = create_user_fixture(
            name="Vikram",
            role="salesperson",
            is_active=False,
            token="vikram-token",
        )
        create_log_call(
            "deact-1",
            deactivated_rep.id,
            "+919876543401",
            create_utc_time_at_ist(0, 12, 0),
            duration_seconds=60,
        )
        response: Response = fetch_team_log_download(client, "mgr-deact", "today")
        data_rows: list[list[str]] = get_data_rows(response)
        assert len(data_rows) == 1
        assert data_rows[0][0] == "Vikram"


def test_team_log_download_escapes_notes_with_comma_quote_and_line_break(
    app: Flask, client: FlaskClient
) -> None:
    with app.app_context():
        create_user_fixture(name="logs_mgr_esc", role="manager", token="mgr-esc")
        priya: User = create_user_fixture(
            name="Priya", role="salesperson", token="priya-token"
        )
        tricky_note: str = 'wants a demo, "Tuesday"\nand a callback'
        create_log_call(
            "esc-1",
            priya.id,
            "+919876543501",
            create_utc_time_at_ist(0, 13, 0),
            notes=tricky_note,
        )
        response: Response = fetch_team_log_download(client, "mgr-esc", "today")
        data_rows: list[list[str]] = get_data_rows(response)
        assert len(data_rows) == 1
        assert len(data_rows[0]) == 10
        assert data_rows[0][9] == tricky_note


def test_team_log_download_empty_day_returns_header_row_only(
    app: Flask, client: FlaskClient
) -> None:
    with app.app_context():
        create_user_fixture(name="logs_mgr_empty", role="manager", token="mgr-emp")
        response: Response = fetch_team_log_download(client, "mgr-emp", "yesterday")
        expected_status: int = 200
        assert response.status_code == expected_status
        assert response.data.startswith(BOM_BYTES)
        csv_rows: list[list[str]] = parse_csv_rows(response)
        assert csv_rows == [TEN_COLUMN_HEADERS]


def test_team_log_download_uses_ist_day_boundary(
    app: Flask, client: FlaskClient
) -> None:
    with app.app_context():
        create_user_fixture(name="logs_mgr_ist", role="manager", token="mgr-ist")
        rep: User = create_user_fixture(
            name="Ananya", role="salesperson", token="ananya-token"
        )
        create_log_call(
            "ist-yesterday-early",
            rep.id,
            "+919876543601",
            create_utc_time_at_ist(1, 0, 10),
        )
        create_log_call(
            "ist-today-early",
            rep.id,
            "+919876543602",
            create_utc_time_at_ist(0, 0, 10),
        )
        today_response: Response = fetch_team_log_download(
            client, "mgr-ist", "today"
        )
        yesterday_response: Response = fetch_team_log_download(
            client, "mgr-ist", "yesterday"
        )
        today_numbers: list[str] = [row[1] for row in get_data_rows(today_response)]
        yesterday_numbers: list[str] = [
            row[1] for row in get_data_rows(yesterday_response)
        ]
        assert today_numbers == ["+919876543602"]
        assert yesterday_numbers == ["+919876543601"]
        today_date: str = now_ist().date().isoformat()
        yesterday_date: str = (now_ist().date() - timedelta(days=1)).isoformat()
        assert get_data_rows(today_response)[0][2] == today_date
        assert get_data_rows(yesterday_response)[0][2] == yesterday_date
