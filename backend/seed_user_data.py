"""Add fake calls and leads for one existing user so their profile can be reviewed.

Touches only the chosen user. Every other user, lead, and call stays untouched.

Run from the project root:
    backend\\venv\\Scripts\\python.exe backend/seed_user_data.py --user Abhay --days 30
"""

import argparse
import os
import random
import sys
import uuid
from datetime import datetime, timedelta, timezone
from zoneinfo import ZoneInfo

from faker import Faker

project_root: str = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if project_root not in sys.path:
    sys.path.insert(0, project_root)

from backend.app import create_app
from backend.app.config.base import RETRY_LOCK_HOURS
from backend.app.extensions import db
from backend.app.modules.calls.models import Call
from backend.app.modules.leads.models import Lead
from backend.app.modules.users.models import User
from backend.seed_fake_data import (
    apply_schedule,
    build_attempt_times_ist,
    build_ist_datetime,
    decide_attempt_outcomes,
    decide_attempt_total,
    decide_lead_bucket,
    generate_unique_phone_number,
    pick_attempt_outcome,
    pick_call_duration_seconds,
)

def parse_user_seed_arguments() -> argparse.Namespace:
    argument_parser = argparse.ArgumentParser(
        description="Add fake data for one existing user, keeping all other data."
    )
    argument_parser.add_argument("--user", type=str, default="Abhay", help="Name of the existing user to seed.")
    argument_parser.add_argument("--days", type=int, default=30, help="How many past days to spread the data over.")
    argument_parser.add_argument("--leads", type=int, default=150, help="How many fake leads to create for the user.")
    argument_parser.add_argument("--calls", type=int, default=450, help="How many extra direct dials to create for the user.")
    argument_parser.add_argument("--seed", type=int, default=None, help="Optional random seed for repeatable data.")
    return argument_parser.parse_args()


def find_existing_user(user_name: str) -> User:
    chosen_user = User.query.filter_by(name=user_name).first()
    if chosen_user is None:
        raise SystemExit(f"No user named '{user_name}' exists. Check the name and try again.")
    return chosen_user


def collect_existing_lead_numbers() -> set[str]:
    number_rows = db.session.query(Lead.phone_number).all()
    existing_numbers = {number_row[0] for number_row in number_rows}
    return existing_numbers


def pick_dialed_at_utc(now_utc: datetime, days_back_total: int) -> datetime:
    ist_zone = ZoneInfo("Asia/Kolkata")
    now_ist = now_utc.astimezone(ist_zone)
    day_offset = random.choice(list(range(days_back_total)))
    window_start_hour = 10
    window_end_hour = 20
    window_hours = list(range(window_start_hour, window_end_hour))
    hour_weights = [3, 4, 5, 5, 4, 3, 3, 4, 3, 2]
    chosen_hour = random.choices(window_hours, weights=hour_weights, k=1)[0]
    dialed_day = now_ist.date() - timedelta(days=day_offset)
    dialed_ist = build_ist_datetime(dialed_day, chosen_hour, random.randint(0, 59))
    if dialed_ist > now_ist:
        dialed_ist = dialed_ist - timedelta(days=1)
    return dialed_ist.astimezone(timezone.utc)


def pick_created_at_ist(now_ist: datetime, days_back_total: int) -> datetime:
    day_offset = random.choice(list(range(days_back_total)))
    created_day = now_ist.date() - timedelta(days=day_offset)
    created_ist = build_ist_datetime(created_day, random.randint(0, 23), random.randint(0, 59))
    if created_ist > now_ist:
        created_ist = now_ist - timedelta(hours=random.randint(1, 5))
    return created_ist


def build_lead_with_calls_for_user(
    calling_user: User,
    used_numbers: set[str],
    now_ist: datetime,
    days_back_total: int,
    data_faker: Faker,
) -> tuple[Lead, list[Call]]:
    finished_statuses = {"done": "done", "stopped": "stopped"}
    bucket = decide_lead_bucket()
    phone_number = generate_unique_phone_number(used_numbers, data_faker)
    attempt_total = decide_attempt_total(bucket)
    created_at_ist = pick_created_at_ist(now_ist, days_back_total)
    lead = Lead(
        phone_number=phone_number,
        status=finished_statuses.get(bucket, "waiting"),
        attempt_count=attempt_total,
        created_at=created_at_ist.astimezone(timezone.utc),
    )
    attempt_times = build_attempt_times_ist(created_at_ist, attempt_total, now_ist)
    attempt_outcomes = decide_attempt_outcomes(bucket, attempt_total)
    lead_calls: list[Call] = []
    for attempt_time_ist, attempt_outcome in zip(attempt_times, attempt_outcomes):
        attempt_time_utc = attempt_time_ist.astimezone(timezone.utc)
        lead.last_attempted_at = attempt_time_utc
        lead.retry_locked_until = attempt_time_utc + timedelta(hours=RETRY_LOCK_HOURS)
        attempt_call = Call(
            call_id=uuid.uuid4().hex,
            user_id=calling_user.id,
            phone_number=lead.phone_number,
            dialed_at=attempt_time_utc,
            duration_seconds=pick_call_duration_seconds(attempt_outcome),
        )
        lead_calls.append(attempt_call)
    if bucket == "scheduled":
        apply_schedule(lead, [calling_user], now_ist)
    return lead, lead_calls


def build_extra_calls_for_user(
    calling_user: User,
    call_total: int,
    used_numbers: set[str],
    now_utc: datetime,
    days_back_total: int,
    data_faker: Faker,
) -> list[Call]:
    extra_calls: list[Call] = []
    for _ in range(call_total):
        phone_number = generate_unique_phone_number(used_numbers, data_faker)
        dial_outcome = pick_attempt_outcome()
        extra_call = Call(
            call_id=uuid.uuid4().hex,
            user_id=calling_user.id,
            phone_number=phone_number,
            dialed_at=pick_dialed_at_utc(now_utc, days_back_total),
            duration_seconds=pick_call_duration_seconds(dial_outcome),
        )
        extra_calls.append(extra_call)
    return extra_calls


def main() -> None:
    arguments = parse_user_seed_arguments()
    data_faker = Faker("en_IN")
    if arguments.seed is not None:
        random.seed(arguments.seed)
        data_faker.seed_instance(arguments.seed)
    flask_app = create_app()
    with flask_app.app_context():
        calling_user = find_existing_user(arguments.user)
        used_numbers = collect_existing_lead_numbers()
        now_utc = datetime.now(timezone.utc)
        now_ist = now_utc.astimezone(ZoneInfo("Asia/Kolkata"))
        all_leads: list[Lead] = []
        all_lead_calls: list[Call] = []
        for _ in range(arguments.leads):
            lead, lead_calls = build_lead_with_calls_for_user(
                calling_user, used_numbers, now_ist, arguments.days, data_faker
            )
            all_leads.append(lead)
            all_lead_calls.extend(lead_calls)
        extra_calls = build_extra_calls_for_user(
            calling_user, arguments.calls, used_numbers, now_utc, arguments.days, data_faker
        )
        db.session.add_all(all_leads)
        db.session.add_all(all_lead_calls)
        db.session.add_all(extra_calls)
        db.session.commit()
        call_total = len(all_lead_calls) + len(extra_calls)
        print(
            f"Added data for {calling_user.name}: "
            f"{len(all_leads)} leads, {call_total} calls over the last {arguments.days} days."
        )


if __name__ == "__main__":
    main()
