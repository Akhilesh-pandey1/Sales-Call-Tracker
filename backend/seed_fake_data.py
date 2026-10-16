"""Fill the database with fake data so the UI can be reviewed with realistic numbers.

Keeps every manager account. Removes all other users, leads, and calls first.

Run from the project root:
    backend\\venv\\Scripts\\python.exe backend/seed_fake_data.py
"""

import argparse
import os
import random
import sys
import uuid
from datetime import date, datetime, timedelta, timezone
from zoneinfo import ZoneInfo

from faker import Faker

project_root: str = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if project_root not in sys.path:
    sys.path.insert(0, project_root)

from backend.app import create_app
from backend.app.config.base import (
    CLAIM_MINUTES,
    MAX_LEAD_ATTEMPTS,
    MAX_SCHEDULE_AHEAD_DAYS,
    RETRY_LOCK_HOURS,
)
from backend.app.core.security import hash_password
from backend.app.extensions import db
from backend.app.modules.calls.models import Call
from backend.app.modules.leads.models import Lead
from backend.app.modules.leads.services import validate_and_format_e164
from backend.app.modules.users.models import User


def parse_seed_arguments() -> argparse.Namespace:
    argument_parser = argparse.ArgumentParser(
        description="Fill the database with fake data for UI review. Keeps every manager account."
    )
    argument_parser.add_argument("--salespeople", type=int, default=8, help="How many fake salespeople to create.")
    argument_parser.add_argument("--leads", type=int, default=400, help="How many fake leads to create.")
    argument_parser.add_argument("--seed", type=int, default=None, help="Optional random seed to get the same data again.")
    return argument_parser.parse_args()


def describe_database_uri(database_uri: str) -> str:
    credential_separator = "@"
    if credential_separator not in database_uri:
        return database_uri
    scheme_end = database_uri.find("://") + 3
    host_start = database_uri.rfind(credential_separator) + 1
    return database_uri[:scheme_end] + database_uri[host_start:]


def print_seed_summary(
    database_uri: str,
    kept_manager_names: list[str],
    salesperson_total: int,
    lead_total: int,
    call_total: int,
    demo_password: str,
) -> None:
    print(f"Seeded database: {describe_database_uri(database_uri)}")
    print(f"Kept manager(s): {', '.join(kept_manager_names)}")
    print(f"Created {salesperson_total} salespeople, {lead_total} leads, {call_total} calls.")
    print(f"Every salesperson logs in with the password: {demo_password}")


def remove_existing_team_data() -> list[str]:
    manager_role = "manager"
    managers = User.query.filter_by(role=manager_role).all()
    kept_manager_names = [manager.name for manager in managers]
    db.session.query(Call).delete()
    db.session.query(Lead).delete()
    db.session.query(User).filter(User.role != manager_role).delete()
    db.session.commit()
    return kept_manager_names


def build_ist_datetime(chosen_day: date, chosen_hour: int, chosen_minute: int) -> datetime:
    ist_zone = ZoneInfo("Asia/Kolkata")
    return datetime(chosen_day.year, chosen_day.month, chosen_day.day, chosen_hour, chosen_minute, 0, tzinfo=ist_zone)


def generate_unique_phone_number(used_numbers: set[str], data_faker: Faker) -> str:
    while True:
        raw_number = data_faker.phone_number()
        formatted_number = validate_and_format_e164(raw_number, "IN")
        if formatted_number is None:
            continue
        if formatted_number in used_numbers:
            continue
        used_numbers.add(formatted_number)
        return formatted_number


def decide_lead_bucket() -> str:
    buckets = ["done", "stopped", "waiting_fresh", "waiting_once", "waiting_twice", "scheduled"]
    bucket_weights = [35, 10, 22, 15, 8, 10]
    return random.choices(buckets, weights=bucket_weights, k=1)[0]


def decide_attempt_total(bucket: str) -> int:
    if bucket == "stopped":
        return MAX_LEAD_ATTEMPTS
    if bucket == "done":
        return random.randint(1, MAX_LEAD_ATTEMPTS)
    if bucket == "waiting_once":
        return 1
    if bucket == "waiting_twice":
        return 2
    if bucket == "scheduled":
        scheduled_attempt_totals = [0, 0, 1]
        return random.choice(scheduled_attempt_totals)
    return 0


def pick_attempt_outcome() -> str:
    outcome_names = ["no_answer", "connected", "long"]
    outcome_weights = [45, 45, 10]
    return random.choices(outcome_names, weights=outcome_weights, k=1)[0]


def decide_attempt_outcomes(bucket: str, attempt_total: int) -> list[str]:
    if bucket == "stopped":
        return ["no_answer"] * attempt_total
    attempt_outcomes: list[str] = []
    for attempt_index in range(attempt_total):
        is_final_attempt = attempt_index == attempt_total - 1
        finishes_as_done = bucket == "done" and is_final_attempt
        if finishes_as_done:
            final_outcome_names = ["connected", "long"]
            final_outcome_weights = [80, 20]
            attempt_outcomes.append(random.choices(final_outcome_names, weights=final_outcome_weights, k=1)[0])
        else:
            attempt_outcomes.append(pick_attempt_outcome())
    return attempt_outcomes


def pick_call_duration_seconds(outcome: str) -> int:
    no_answer_max_seconds = 8
    connected_min_seconds = 25
    connected_max_seconds = 420
    long_call_min_seconds = 420
    long_call_max_seconds = 900
    if outcome == "no_answer":
        return random.randint(0, no_answer_max_seconds)
    if outcome == "long":
        return random.randint(long_call_min_seconds, long_call_max_seconds)
    return random.randint(connected_min_seconds, connected_max_seconds)


def pick_dialed_at_utc(now_utc: datetime) -> datetime:
    ist_zone = ZoneInfo("Asia/Kolkata")
    now_ist = now_utc.astimezone(ist_zone)
    lookback_days = 30
    recent_lookback_days = 10
    recent_day_weight = 3
    old_day_weight = 1
    day_offsets = list(range(lookback_days))
    day_weights = [recent_day_weight if offset < recent_lookback_days else old_day_weight for offset in day_offsets]
    day_offset = random.choices(day_offsets, weights=day_weights, k=1)[0]
    business_start_hour = 9
    business_end_hour = 21
    business_hours = list(range(business_start_hour, business_end_hour))
    hour_weights = [2, 4, 5, 5, 4, 2, 1, 1, 3, 3, 3, 2]
    chosen_hour = random.choices(business_hours, weights=hour_weights, k=1)[0]
    dialed_day = now_ist.date() - timedelta(days=day_offset)
    dialed_ist = build_ist_datetime(dialed_day, chosen_hour, random.randint(0, 59))
    if dialed_ist > now_ist:
        dialed_ist = dialed_ist - timedelta(days=1)
    return dialed_ist.astimezone(timezone.utc)


def pick_created_at_ist(now_ist: datetime, attempt_total: int) -> datetime:
    fresh_lead_lookback_days = 45
    recent_lookback_days = 7
    recent_day_weight = 4
    old_day_weight = 1
    day_offsets = list(range(fresh_lead_lookback_days))
    if attempt_total > 0:
        day_weights = [recent_day_weight if offset < recent_lookback_days else old_day_weight for offset in day_offsets]
        day_offset = random.choices(day_offsets, weights=day_weights, k=1)[0]
    else:
        day_offset = random.choice(day_offsets)
    created_day = now_ist.date() - timedelta(days=day_offset)
    created_ist = build_ist_datetime(created_day, random.randint(0, 23), random.randint(0, 59))
    if created_ist > now_ist:
        created_ist = now_ist - timedelta(hours=random.randint(1, 5))
    return created_ist


def build_attempt_times_ist(created_at_ist: datetime, attempt_total: int, now_ist: datetime) -> list[datetime]:
    attempt_times: list[datetime] = []
    if attempt_total == 0:
        return attempt_times
    latest_end_ist = now_ist - timedelta(hours=3)
    if latest_end_ist <= created_at_ist:
        latest_end_ist = now_ist
    window_seconds = int((latest_end_ist - created_at_ist).total_seconds())
    slot_seconds = window_seconds // attempt_total
    for attempt_index in range(attempt_total):
        slot_start_ist = created_at_ist + timedelta(seconds=slot_seconds * attempt_index)
        attempt_times.append(slot_start_ist + timedelta(seconds=random.randint(0, slot_seconds)))
    return attempt_times


def apply_schedule(lead: Lead, salespeople: list[User], now_ist: datetime) -> None:
    minimum_days_ahead = 1
    days_ahead = random.randint(minimum_days_ahead, MAX_SCHEDULE_AHEAD_DAYS - 1)
    schedule_day = (now_ist + timedelta(days=days_ahead)).date()
    opening_hour = 10
    closing_hour = 18
    schedule_hour = random.randint(opening_hour, closing_hour)
    schedule_minute_choices = [0, 15, 30, 45]
    scheduled_ist = build_ist_datetime(schedule_day, schedule_hour, random.choice(schedule_minute_choices))
    lead.scheduled_at = scheduled_ist.astimezone(timezone.utc)
    chosen_salesperson = random.choice(salespeople)
    lead.scheduled_by = chosen_salesperson.id


def build_calls_for_lead(
    lead: Lead,
    salespeople: list[User],
    bucket: str,
    attempt_total: int,
    created_at_ist: datetime,
    now_ist: datetime,
) -> list[Call]:
    lead_calls: list[Call] = []
    attempt_times = build_attempt_times_ist(created_at_ist, attempt_total, now_ist)
    attempt_outcomes = decide_attempt_outcomes(bucket, attempt_total)
    for attempt_time_ist, attempt_outcome in zip(attempt_times, attempt_outcomes):
        attempt_time_utc = attempt_time_ist.astimezone(timezone.utc)
        lead.last_attempted_at = attempt_time_utc
        lead.retry_locked_until = attempt_time_utc + timedelta(hours=RETRY_LOCK_HOURS)
        calling_person = random.choice(salespeople)
        attempt_call = Call(
            call_id=uuid.uuid4().hex,
            user_id=calling_person.id,
            phone_number=lead.phone_number,
            dialed_at=attempt_time_utc,
            duration_seconds=pick_call_duration_seconds(attempt_outcome),
        )
        lead_calls.append(attempt_call)
    return lead_calls


def build_lead_with_calls(salespeople: list[User], used_numbers: set[str], now_ist: datetime, data_faker: Faker) -> tuple[Lead, list[Call]]:
    finished_statuses = {"done": "done", "stopped": "stopped"}
    bucket = decide_lead_bucket()
    phone_number = generate_unique_phone_number(used_numbers, data_faker)
    attempt_total = decide_attempt_total(bucket)
    created_at_ist = pick_created_at_ist(now_ist, attempt_total)
    lead = Lead(
        phone_number=phone_number,
        status=finished_statuses.get(bucket, "waiting"),
        attempt_count=attempt_total,
        created_at=created_at_ist.astimezone(timezone.utc),
    )
    lead_calls = build_calls_for_lead(lead, salespeople, bucket, attempt_total, created_at_ist, now_ist)
    if bucket == "scheduled":
        apply_schedule(lead, salespeople, now_ist)
    return lead, lead_calls


def build_salespeople(salesperson_total: int, demo_password: str, data_faker: Faker) -> list[User]:
    salesperson_role = "salesperson"
    default_country = "IN"
    minimum_total_for_inactive = 3
    password_hash_value = hash_password(demo_password)
    taken_names: set[str] = set()
    salespeople: list[User] = []
    while len(salespeople) < salesperson_total:
        person_name = f"{data_faker.first_name()} {data_faker.last_name()}"
        if person_name in taken_names:
            continue
        taken_names.add(person_name)
        is_last_person = len(salespeople) == salesperson_total - 1
        is_active = not (is_last_person and salesperson_total >= minimum_total_for_inactive)
        new_person = User(
            name=person_name,
            password_hash=password_hash_value,
            role=salesperson_role,
            is_active=is_active,
            country=default_country,
        )
        salespeople.append(new_person)
    db.session.add_all(salespeople)
    db.session.commit()
    return salespeople


def build_leads_and_calls(lead_total: int, salespeople: list[User], used_numbers: set[str], data_faker: Faker) -> tuple[list[Lead], list[Call]]:
    ist_zone = ZoneInfo("Asia/Kolkata")
    now_ist = datetime.now(timezone.utc).astimezone(ist_zone)
    all_leads: list[Lead] = []
    all_calls: list[Call] = []
    for _ in range(lead_total):
        lead, lead_calls = build_lead_with_calls(salespeople, used_numbers, now_ist, data_faker)
        all_leads.append(lead)
        all_calls.extend(lead_calls)
    db.session.add_all(all_leads)
    db.session.commit()
    db.session.add_all(all_calls)
    db.session.commit()
    return all_leads, all_calls


def build_extra_calls(salespeople: list[User], used_numbers: set[str], data_faker: Faker) -> list[Call]:
    extra_calls: list[Call] = []
    now_utc = datetime.now(timezone.utc)
    minimum_dials_per_person = 15
    maximum_dials_per_person = 60
    for calling_person in salespeople:
        dial_total = random.randint(minimum_dials_per_person, maximum_dials_per_person)
        for _ in range(dial_total):
            phone_number = generate_unique_phone_number(used_numbers, data_faker)
            dial_outcome = pick_attempt_outcome()
            extra_call = Call(
                call_id=uuid.uuid4().hex,
                user_id=calling_person.id,
                phone_number=phone_number,
                dialed_at=pick_dialed_at_utc(now_utc),
                duration_seconds=pick_call_duration_seconds(dial_outcome),
            )
            extra_calls.append(extra_call)
    db.session.add_all(extra_calls)
    db.session.commit()
    return extra_calls


def mark_some_leads_claimed(all_leads: list[Lead], salespeople: list[User]) -> None:
    waiting_status = "waiting"
    waiting_leads = [lead for lead in all_leads if lead.status == waiting_status]
    wanted_claim_total = 3
    claim_total = min(wanted_claim_total, len(waiting_leads))
    chosen_leads = random.sample(waiting_leads, claim_total)
    now_utc = datetime.now(timezone.utc)
    for chosen_lead in chosen_leads:
        claiming_person = random.choice(salespeople)
        chosen_lead.claimed_by = claiming_person.id
        chosen_lead.claimed_until = now_utc + timedelta(minutes=random.randint(2, CLAIM_MINUTES - 1))
    db.session.commit()


def main() -> None:
    arguments = parse_seed_arguments()
    data_faker = Faker("en_IN")
    if arguments.seed is not None:
        random.seed(arguments.seed)
        data_faker.seed_instance(arguments.seed)
    flask_app = create_app()
    with flask_app.app_context():
        kept_manager_names = remove_existing_team_data()
        demo_password = "Sales@2026"
        salespeople = build_salespeople(arguments.salespeople, demo_password, data_faker)
        used_numbers: set[str] = set()
        all_leads, lead_calls = build_leads_and_calls(arguments.leads, salespeople, used_numbers, data_faker)
        extra_calls = build_extra_calls(salespeople, used_numbers, data_faker)
        mark_some_leads_claimed(all_leads, salespeople)
        call_total = len(lead_calls) + len(extra_calls)
        print_seed_summary(
            flask_app.config["SQLALCHEMY_DATABASE_URI"],
            kept_manager_names,
            len(salespeople),
            len(all_leads),
            call_total,
            demo_password,
        )


if __name__ == "__main__":
    main()
