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


def fetch_person_logs(
    client: FlaskClient, token: str | None, user_id: int
) -> Response:
    headers: dict[str, str] = {}
    if token is not None:
        headers["Authorization"] = f"Bearer {token}"
    response: Response = client.get(f"/api/logs/person/{user_id}", headers=headers)
    return response


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


PERSON_LOG_ROW_FIELDS: set[str] = {
    "phone_number",
    "date",
    "time",
    "direction",
    "connected",
    "minutes",
}


def test_person_logs_unauthenticated_rejected(client: FlaskClient) -> None:
    response: Response = fetch_person_logs(client, None, 1)
    expected_status: int = 401
    assert response.status_code == expected_status
    response_json: dict[str, Any] = response.get_json()
    assert response_json.get("message") == "Invalid or expired token."


def test_person_logs_invalid_token_rejected(client: FlaskClient) -> None:
    response: Response = fetch_person_logs(client, "bad-token", 1)
    expected_status: int = 401
    assert response.status_code == expected_status


def test_person_logs_salesperson_rejected(app: Flask, client: FlaskClient) -> None:
    with app.app_context():
        salesperson: User = create_user_fixture(
            name="person_logs_sales", role="salesperson", token="person-logs-sales"
        )
        response: Response = fetch_person_logs(
            client, "person-logs-sales", salesperson.id
        )
        expected_status: int = 403
        assert response.status_code == expected_status
        response_json: dict[str, Any] = response.get_json()
        assert response_json.get("message") == "This dashboard is for managers."


def test_person_logs_unknown_person_rejected(
    app: Flask, client: FlaskClient
) -> None:
    with app.app_context():
        create_user_fixture(
            name="person_logs_mgr_missing", role="manager", token="person-logs-mgr-miss"
        )
        unknown_user_id: int = 99999
        response: Response = fetch_person_logs(
            client, "person-logs-mgr-miss", unknown_user_id
        )
        expected_status: int = 404
        assert response.status_code == expected_status
        response_json: dict[str, Any] = response.get_json()
        assert response_json.get("message") == "User not found."


def test_person_logs_returns_every_call_newest_first(
    app: Flask, client: FlaskClient
) -> None:
    with app.app_context():
        create_user_fixture(
            name="person_logs_mgr_rows", role="manager", token="person-logs-mgr-rows"
        )
        rep: User = create_user_fixture(
            name="Ramesh", role="salesperson", token="person-logs-ramesh"
        )
        create_log_call(
            "person-old-outgoing",
            rep.id,
            "+919876543201",
            create_utc_time_at_ist(1, 9, 15, 0),
            duration_seconds=210,
        )
        create_log_call(
            "person-new-incoming",
            rep.id,
            "+919876543202",
            create_utc_time_at_ist(0, 16, 3, 22),
            duration_seconds=0,
            direction="incoming",
        )
        response: Response = fetch_person_logs(
            client, "person-logs-mgr-rows", rep.id
        )
        expected_status: int = 200
        assert response.status_code == expected_status
        response_json: list[dict[str, Any]] = response.get_json()
        assert len(response_json) == 2
        assert set(response_json[0].keys()) == PERSON_LOG_ROW_FIELDS
        assert response_json[0]["phone_number"] == "+919876543202"
        assert response_json[0]["direction"] == "incoming"
        assert response_json[0]["connected"] is False
        assert response_json[0]["minutes"] == 0
        assert response_json[1]["phone_number"] == "+919876543201"
        assert response_json[1]["direction"] == "outgoing"
        assert response_json[1]["connected"] is True
        assert response_json[1]["minutes"] == 3.5


def test_person_logs_row_uses_ist_date_and_time(
    app: Flask, client: FlaskClient
) -> None:
    with app.app_context():
        create_user_fixture(
            name="person_logs_mgr_ist", role="manager", token="person-logs-mgr-ist"
        )
        rep: User = create_user_fixture(
            name="Priya", role="salesperson", token="person-logs-priya"
        )
        create_log_call(
            "person-ist-1",
            rep.id,
            "+919876543203",
            create_utc_time_at_ist(0, 11, 24, 5),
            duration_seconds=20,
        )
        response: Response = fetch_person_logs(
            client, "person-logs-mgr-ist", rep.id
        )
        response_json: list[dict[str, Any]] = response.get_json()
        today_date: str = now_ist().date().isoformat()
        assert response_json[0]["date"] == today_date
        assert response_json[0]["time"] == "11:24:05"
        assert response_json[0]["minutes"] == 0.33
        assert response_json[0]["connected"] is True


def test_person_logs_window_holds_the_last_thirty_ist_days(
    app: Flask, client: FlaskClient
) -> None:
    with app.app_context():
        create_user_fixture(
            name="person_logs_mgr_window",
            role="manager",
            token="person-logs-mgr-window",
        )
        rep: User = create_user_fixture(
            name="Ananya", role="salesperson", token="person-logs-ananya"
        )
        create_log_call(
            "person-window-today",
            rep.id,
            "+919876543401",
            create_utc_time_at_ist(0, 10, 0),
        )
        create_log_call(
            "person-window-day-29",
            rep.id,
            "+919876543402",
            create_utc_time_at_ist(29, 0, 5),
        )
        create_log_call(
            "person-window-day-30",
            rep.id,
            "+919876543403",
            create_utc_time_at_ist(30, 23, 55),
        )
        response: Response = fetch_person_logs(
            client, "person-logs-mgr-window", rep.id
        )
        response_json: list[dict[str, Any]] = response.get_json()
        listed_numbers: list[str] = [
            row["phone_number"] for row in response_json
        ]
        assert listed_numbers == ["+919876543401", "+919876543402"]


def test_person_logs_holds_only_that_persons_calls(
    app: Flask, client: FlaskClient
) -> None:
    with app.app_context():
        create_user_fixture(
            name="person_logs_mgr_owner",
            role="manager",
            token="person-logs-mgr-owner",
        )
        rep: User = create_user_fixture(
            name="Suresh", role="salesperson", token="person-logs-suresh"
        )
        other_rep: User = create_user_fixture(
            name="Zara", role="salesperson", token="person-logs-zara"
        )
        create_log_call(
            "person-owner-1",
            rep.id,
            "+919876543501",
            create_utc_time_at_ist(0, 10, 0),
        )
        create_log_call(
            "person-owner-other",
            other_rep.id,
            "+919876543502",
            create_utc_time_at_ist(0, 11, 0),
        )
        response: Response = fetch_person_logs(
            client, "person-logs-mgr-owner", rep.id
        )
        response_json: list[dict[str, Any]] = response.get_json()
        assert len(response_json) == 1
        assert response_json[0]["phone_number"] == "+919876543501"


def test_person_logs_empty_window_returns_empty_list(
    app: Flask, client: FlaskClient
) -> None:
    with app.app_context():
        create_user_fixture(
            name="person_logs_mgr_empty", role="manager", token="person-logs-mgr-empty"
        )
        rep: User = create_user_fixture(
            name="Vikram", role="salesperson", token="person-logs-vikram"
        )
        response: Response = fetch_person_logs(
            client, "person-logs-mgr-empty", rep.id
        )
        expected_status: int = 200
        assert response.status_code == expected_status
        assert response.get_json() == []


def fetch_person_log_download(
    client: FlaskClient,
    token: str | None,
    user_id: int,
    day: str | None = None,
) -> Response:
    headers: dict[str, str] = {}
    if token is not None:
        headers["Authorization"] = f"Bearer {token}"
    query_params: dict[str, str] = {}
    if day is not None:
        query_params["day"] = day
    response: Response = client.get(
        f"/api/logs/person/{user_id}/download",
        query_string=query_params,
        headers=headers,
    )
    return response


def build_today_person_filename(person_name_slug: str) -> str:
    today_date: str = now_ist().date().isoformat()
    filename: str = f"call-logs-{person_name_slug}-{today_date}.csv"
    return filename


def test_person_log_download_unauthenticated_rejected(
    client: FlaskClient,
) -> None:
    response: Response = fetch_person_log_download(client, None, 1)
    expected_status: int = 401
    assert response.status_code == expected_status
    response_json: dict[str, Any] = response.get_json()
    assert response_json.get("message") == "Invalid or expired token."


def test_person_log_download_invalid_token_rejected(client: FlaskClient) -> None:
    response: Response = fetch_person_log_download(client, "bad-token", 1)
    expected_status: int = 401
    assert response.status_code == expected_status


def test_person_log_download_salesperson_rejected(
    app: Flask, client: FlaskClient
) -> None:
    with app.app_context():
        salesperson: User = create_user_fixture(
            name="person_download_sales", role="salesperson", token="download-sales"
        )
        response: Response = fetch_person_log_download(
            client, "download-sales", salesperson.id
        )
        expected_status: int = 403
        assert response.status_code == expected_status
        response_json: dict[str, Any] = response.get_json()
        assert response_json.get("message") == "This dashboard is for managers."


def test_person_log_download_unknown_person_rejected(
    app: Flask, client: FlaskClient
) -> None:
    with app.app_context():
        create_user_fixture(
            name="person_download_mgr_missing",
            role="manager",
            token="download-mgr-miss",
        )
        unknown_user_id: int = 99999
        response: Response = fetch_person_log_download(
            client, "download-mgr-miss", unknown_user_id
        )
        expected_status: int = 404
        assert response.status_code == expected_status
        response_json: dict[str, Any] = response.get_json()
        assert response_json.get("message") == "User not found."


def test_person_log_download_filename_and_csv_content_type(
    app: Flask, client: FlaskClient
) -> None:
    with app.app_context():
        create_user_fixture(
            name="person_download_mgr_file", role="manager", token="download-mgr-file"
        )
        rep: User = create_user_fixture(
            name="Ramesh", role="salesperson", token="download-ramesh"
        )
        response: Response = fetch_person_log_download(
            client, "download-mgr-file", rep.id
        )
        expected_status: int = 200
        assert response.status_code == expected_status
        assert response.mimetype == "text/csv"
        expected_filename: str = build_today_person_filename("ramesh")
        content_disposition: str = response.headers["Content-Disposition"]
        assert content_disposition == f'attachment; filename="{expected_filename}"'


def test_person_log_download_lowercases_name_and_replaces_spaces(
    app: Flask, client: FlaskClient
) -> None:
    with app.app_context():
        create_user_fixture(
            name="person_download_mgr_slug", role="manager", token="download-mgr-slug"
        )
        rep: User = create_user_fixture(
            name="Ramesh Kumar", role="salesperson", token="download-ramesh-kumar"
        )
        response: Response = fetch_person_log_download(
            client, "download-mgr-slug", rep.id
        )
        expected_filename: str = build_today_person_filename("ramesh-kumar")
        content_disposition: str = response.headers["Content-Disposition"]
        assert content_disposition == f'attachment; filename="{expected_filename}"'


def test_person_log_download_sanitizes_awkward_name_into_valid_filename(
    app: Flask, client: FlaskClient
) -> None:
    with app.app_context():
        create_user_fixture(
            name="person_download_mgr_awkward_slug",
            role="manager",
            token="download-mgr-awkward-slug",
        )
        rep: User = create_user_fixture(
            name='Ra/ma "esh"',
            role="salesperson",
            token="download-awkward-slug",
        )
        response: Response = fetch_person_log_download(
            client, "download-mgr-awkward-slug", rep.id
        )
        expected_status: int = 200
        assert response.status_code == expected_status
        expected_filename: str = build_today_person_filename("ra-ma-esh")
        content_disposition: str = response.headers["Content-Disposition"]
        assert content_disposition == f'attachment; filename="{expected_filename}"'


def test_person_log_download_ten_columns_in_order_with_bom(
    app: Flask, client: FlaskClient
) -> None:
    with app.app_context():
        create_user_fixture(
            name="person_download_mgr_cols", role="manager", token="download-mgr-cols"
        )
        rep: User = create_user_fixture(
            name="Priya", role="salesperson", token="download-priya"
        )
        response: Response = fetch_person_log_download(
            client, "download-mgr-cols", rep.id
        )
        assert response.data.startswith(BOM_BYTES)
        csv_rows: list[list[str]] = parse_csv_rows(response)
        assert csv_rows[0] == TEN_COLUMN_HEADERS


def test_person_log_download_one_call_row_values(
    app: Flask, client: FlaskClient
) -> None:
    with app.app_context():
        create_user_fixture(
            name="person_download_mgr_row", role="manager", token="download-mgr-row"
        )
        rep: User = create_user_fixture(
            name="Ramesh", role="salesperson", token="download-row-ramesh"
        )
        create_log_call(
            call_id="person-download-row-1",
            user_id=rep.id,
            phone_number="+919876543210",
            dialed_at=create_utc_time_at_ist(0, 11, 24, 5),
            duration_seconds=210,
            direction="outgoing",
            interested=True,
            do_not_call=False,
            notes="wants a demo on Tuesday",
        )
        response: Response = fetch_person_log_download(
            client, "download-mgr-row", rep.id
        )
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


def test_person_log_download_covers_the_last_thirty_ist_days(
    app: Flask, client: FlaskClient
) -> None:
    with app.app_context():
        create_user_fixture(
            name="person_download_mgr_window",
            role="manager",
            token="download-mgr-window",
        )
        rep: User = create_user_fixture(
            name="Ananya", role="salesperson", token="download-ananya"
        )
        create_log_call(
            "person-download-window-today",
            rep.id,
            "+919876543701",
            create_utc_time_at_ist(0, 10, 0),
        )
        create_log_call(
            "person-download-window-start",
            rep.id,
            "+919876543702",
            create_utc_time_at_ist(29, 0, 0),
        )
        create_log_call(
            "person-download-window-before-start",
            rep.id,
            "+919876543703",
            create_utc_time_at_ist(30, 23, 59, 59),
        )
        create_log_call(
            "person-download-window-tomorrow",
            rep.id,
            "+919876543704",
            create_utc_time_at_ist(-1, 10, 0),
        )
        response: Response = fetch_person_log_download(
            client, "download-mgr-window", rep.id
        )
        listed_numbers: list[str] = [
            row[1] for row in get_data_rows(response)
        ]
        assert listed_numbers == ["+919876543702", "+919876543701"]


def test_person_log_download_sorts_oldest_call_first_both_directions(
    app: Flask, client: FlaskClient
) -> None:
    with app.app_context():
        create_user_fixture(
            name="person_download_mgr_order", role="manager", token="download-mgr-order"
        )
        rep: User = create_user_fixture(
            name="Suresh", role="salesperson", token="download-suresh"
        )
        create_log_call(
            "person-download-order-new-incoming",
            rep.id,
            "+919876543801",
            create_utc_time_at_ist(0, 16, 3, 22),
            direction="incoming",
        )
        create_log_call(
            "person-download-order-old-outgoing",
            rep.id,
            "+919876543802",
            create_utc_time_at_ist(1, 9, 15),
            duration_seconds=120,
        )
        create_log_call(
            "person-download-order-middle-outgoing",
            rep.id,
            "+919876543803",
            create_utc_time_at_ist(0, 10, 0),
        )
        response: Response = fetch_person_log_download(
            client, "download-mgr-order", rep.id
        )
        data_rows: list[list[str]] = get_data_rows(response)
        listed_numbers: list[str] = [row[1] for row in data_rows]
        listed_directions: list[str] = [row[4] for row in data_rows]
        assert listed_numbers == [
            "+919876543802",
            "+919876543803",
            "+919876543801",
        ]
        assert listed_directions == ["Outgoing", "Outgoing", "Incoming"]


def test_person_log_download_escapes_notes_with_comma_quote_and_line_break(
    app: Flask, client: FlaskClient
) -> None:
    with app.app_context():
        create_user_fixture(
            name="person_download_mgr_escape",
            role="manager",
            token="download-mgr-escape",
        )
        rep: User = create_user_fixture(
            name="Zara", role="salesperson", token="download-zara"
        )
        tricky_note: str = 'wants a demo, "Tuesday"\nand a callback'
        create_log_call(
            "person-download-escape-1",
            rep.id,
            "+919876543901",
            create_utc_time_at_ist(0, 13, 0),
            notes=tricky_note,
        )
        response: Response = fetch_person_log_download(
            client, "download-mgr-escape", rep.id
        )
        data_rows: list[list[str]] = get_data_rows(response)
        assert len(data_rows) == 1
        assert len(data_rows[0]) == 10
        assert data_rows[0][9] == tricky_note


def test_person_log_download_empty_window_returns_header_row_only(
    app: Flask, client: FlaskClient
) -> None:
    with app.app_context():
        create_user_fixture(
            name="person_download_mgr_empty",
            role="manager",
            token="download-mgr-empty",
        )
        rep: User = create_user_fixture(
            name="Vikram", role="salesperson", token="download-vikram"
        )
        response: Response = fetch_person_log_download(
            client, "download-mgr-empty", rep.id
        )
        expected_status: int = 200
        assert response.status_code == expected_status
        assert response.data.startswith(BOM_BYTES)
        csv_rows: list[list[str]] = parse_csv_rows(response)
        assert csv_rows == [TEN_COLUMN_HEADERS]


def test_person_log_download_holds_only_that_persons_calls(
    app: Flask, client: FlaskClient
) -> None:
    with app.app_context():
        create_user_fixture(
            name="person_download_mgr_owner",
            role="manager",
            token="download-mgr-owner",
        )
        rep: User = create_user_fixture(
            name="Amit", role="salesperson", token="download-amit"
        )
        other_rep: User = create_user_fixture(
            name="Bhavna", role="salesperson", token="download-bhavna"
        )
        create_log_call(
            "person-download-owner-1",
            rep.id,
            "+919876544001",
            create_utc_time_at_ist(0, 10, 0),
        )
        create_log_call(
            "person-download-owner-other",
            other_rep.id,
            "+919876544002",
            create_utc_time_at_ist(0, 11, 0),
        )
        response: Response = fetch_person_log_download(
            client, "download-mgr-owner", rep.id
        )
        data_rows: list[list[str]] = get_data_rows(response)
        assert len(data_rows) == 1
        assert data_rows[0][0] == "Amit"
        assert data_rows[0][1] == "+919876544001"


def test_person_log_download_today_holds_only_that_ist_day(
    app: Flask, client: FlaskClient
) -> None:
    with app.app_context():
        create_user_fixture(
            name="person_day_mgr_today",
            role="manager",
            token="day-mgr-today",
        )
        rep: User = create_user_fixture(
            name="Ramesh", role="salesperson", token="day-ramesh"
        )
        create_log_call(
            "person-day-today",
            rep.id,
            "+919876545001",
            create_utc_time_at_ist(0, 10, 0),
        )
        create_log_call(
            "person-day-yesterday",
            rep.id,
            "+919876545002",
            create_utc_time_at_ist(1, 10, 0),
        )
        create_log_call(
            "person-day-two-days-ago",
            rep.id,
            "+919876545003",
            create_utc_time_at_ist(2, 10, 0),
        )
        response: Response = fetch_person_log_download(
            client, "day-mgr-today", rep.id, "today"
        )
        expected_status: int = 200
        assert response.status_code == expected_status
        listed_numbers: list[str] = [row[1] for row in get_data_rows(response)]
        assert listed_numbers == ["+919876545001"]
        today_date: str = now_ist().date().isoformat()
        expected_filename: str = f"call-logs-ramesh-{today_date}.csv"
        content_disposition: str = response.headers["Content-Disposition"]
        assert content_disposition == f'attachment; filename="{expected_filename}"'


def test_person_log_download_yesterday_holds_only_that_ist_day_and_names_its_date(
    app: Flask, client: FlaskClient
) -> None:
    with app.app_context():
        create_user_fixture(
            name="person_day_mgr_yesterday",
            role="manager",
            token="day-mgr-yesterday",
        )
        rep: User = create_user_fixture(
            name="Ramesh Kumar", role="salesperson", token="day-ramesh-kumar"
        )
        create_log_call(
            "person-day-yesterday-early",
            rep.id,
            "+919876545101",
            create_utc_time_at_ist(1, 0, 10),
        )
        create_log_call(
            "person-day-yesterday-late",
            rep.id,
            "+919876545102",
            create_utc_time_at_ist(1, 23, 50),
        )
        create_log_call(
            "person-day-today-early",
            rep.id,
            "+919876545103",
            create_utc_time_at_ist(0, 0, 10),
        )
        response: Response = fetch_person_log_download(
            client, "day-mgr-yesterday", rep.id, "yesterday"
        )
        expected_status: int = 200
        assert response.status_code == expected_status
        data_rows: list[list[str]] = get_data_rows(response)
        listed_numbers: list[str] = [row[1] for row in data_rows]
        assert listed_numbers == ["+919876545101", "+919876545102"]
        yesterday_date: str = (now_ist().date() - timedelta(days=1)).isoformat()
        assert [row[2] for row in data_rows] == [yesterday_date, yesterday_date]
        expected_filename: str = f"call-logs-ramesh-kumar-{yesterday_date}.csv"
        content_disposition: str = response.headers["Content-Disposition"]
        assert content_disposition == f'attachment; filename="{expected_filename}"'


def test_person_log_download_unknown_day_rejected(
    app: Flask, client: FlaskClient
) -> None:
    with app.app_context():
        create_user_fixture(
            name="person_day_mgr_invalid",
            role="manager",
            token="day-mgr-invalid",
        )
        rep: User = create_user_fixture(
            name="Ramesh", role="salesperson", token="day-invalid-ramesh"
        )
        response: Response = fetch_person_log_download(
            client, "day-mgr-invalid", rep.id, "tomorrow"
        )
        expected_status: int = 400
        assert response.status_code == expected_status
        response_json: dict[str, Any] = response.get_json()
        assert response_json.get("message") == "day must be today or yesterday."


def test_person_log_download_empty_day_rejected(
    app: Flask, client: FlaskClient
) -> None:
    with app.app_context():
        create_user_fixture(
            name="person_day_mgr_empty_day",
            role="manager",
            token="day-mgr-empty-day",
        )
        rep: User = create_user_fixture(
            name="Ramesh", role="salesperson", token="day-empty-ramesh"
        )
        response: Response = fetch_person_log_download(
            client, "day-mgr-empty-day", rep.id, ""
        )
        expected_status: int = 400
        assert response.status_code == expected_status
        response_json: dict[str, Any] = response.get_json()
        assert response_json.get("message") == "day must be today or yesterday."


def test_person_log_download_day_salesperson_rejected(
    app: Flask, client: FlaskClient
) -> None:
    with app.app_context():
        salesperson: User = create_user_fixture(
            name="person_day_sales", role="salesperson", token="day-sales"
        )
        response: Response = fetch_person_log_download(
            client, "day-sales", salesperson.id, "today"
        )
        expected_status: int = 403
        assert response.status_code == expected_status
        response_json: dict[str, Any] = response.get_json()
        assert response_json.get("message") == "This dashboard is for managers."


def test_person_log_download_day_unknown_person_rejected(
    app: Flask, client: FlaskClient
) -> None:
    with app.app_context():
        create_user_fixture(
            name="person_day_mgr_missing",
            role="manager",
            token="day-mgr-missing",
        )
        unknown_user_id: int = 99999
        response: Response = fetch_person_log_download(
            client, "day-mgr-missing", unknown_user_id, "yesterday"
        )
        expected_status: int = 404
        assert response.status_code == expected_status
        response_json: dict[str, Any] = response.get_json()
        assert response_json.get("message") == "User not found."


def test_person_log_download_day_sorts_oldest_first_both_directions(
    app: Flask, client: FlaskClient
) -> None:
    with app.app_context():
        create_user_fixture(
            name="person_day_mgr_order",
            role="manager",
            token="day-mgr-order",
        )
        rep: User = create_user_fixture(
            name="Suresh", role="salesperson", token="day-order-suresh"
        )
        create_log_call(
            "person-day-order-new-incoming",
            rep.id,
            "+919876545201",
            create_utc_time_at_ist(0, 16, 3, 22),
            direction="incoming",
        )
        create_log_call(
            "person-day-order-old-outgoing",
            rep.id,
            "+919876545202",
            create_utc_time_at_ist(0, 10, 0),
            duration_seconds=120,
        )
        create_log_call(
            "person-day-order-middle-outgoing",
            rep.id,
            "+919876545203",
            create_utc_time_at_ist(0, 12, 30),
        )
        response: Response = fetch_person_log_download(
            client, "day-mgr-order", rep.id, "today"
        )
        data_rows: list[list[str]] = get_data_rows(response)
        listed_numbers: list[str] = [row[1] for row in data_rows]
        listed_directions: list[str] = [row[4] for row in data_rows]
        assert listed_numbers == [
            "+919876545202",
            "+919876545203",
            "+919876545201",
        ]
        assert listed_directions == ["Outgoing", "Outgoing", "Incoming"]
        assert all(len(row) == 10 for row in data_rows)


def test_person_log_download_day_holds_only_that_persons_calls(
    app: Flask, client: FlaskClient
) -> None:
    with app.app_context():
        create_user_fixture(
            name="person_day_mgr_owner",
            role="manager",
            token="day-mgr-owner",
        )
        rep: User = create_user_fixture(
            name="Amit", role="salesperson", token="day-owner-amit"
        )
        other_rep: User = create_user_fixture(
            name="Bhavna", role="salesperson", token="day-owner-bhavna"
        )
        create_log_call(
            "person-day-owner",
            rep.id,
            "+919876545301",
            create_utc_time_at_ist(0, 10, 0),
        )
        create_log_call(
            "person-day-owner-other",
            other_rep.id,
            "+919876545302",
            create_utc_time_at_ist(0, 11, 0),
        )
        response: Response = fetch_person_log_download(
            client, "day-mgr-owner", rep.id, "today"
        )
        data_rows: list[list[str]] = get_data_rows(response)
        assert len(data_rows) == 1
        assert data_rows[0][0] == "Amit"
        assert data_rows[0][1] == "+919876545301"


def test_person_log_download_empty_day_returns_header_row_only(
    app: Flask, client: FlaskClient
) -> None:
    with app.app_context():
        create_user_fixture(
            name="person_day_mgr_empty_file",
            role="manager",
            token="day-mgr-empty-file",
        )
        rep: User = create_user_fixture(
            name="Vikram", role="salesperson", token="day-empty-file-vikram"
        )
        create_log_call(
            "person-day-empty-yesterday",
            rep.id,
            "+919876545401",
            create_utc_time_at_ist(1, 12, 0),
        )
        response: Response = fetch_person_log_download(
            client, "day-mgr-empty-file", rep.id, "today"
        )
        expected_status: int = 200
        assert response.status_code == expected_status
        assert response.data.startswith(BOM_BYTES)
        csv_rows: list[list[str]] = parse_csv_rows(response)
        assert csv_rows == [TEN_COLUMN_HEADERS]
        today_date: str = now_ist().date().isoformat()
        expected_filename: str = f"call-logs-vikram-{today_date}.csv"
        content_disposition: str = response.headers["Content-Disposition"]
        assert content_disposition == f'attachment; filename="{expected_filename}"'
