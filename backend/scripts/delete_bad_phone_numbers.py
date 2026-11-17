"""Delete every lead whose phone number is not a valid 10-digit Indian number.

A number is valid with or without the +91 country code: +91 followed by
exactly 10 digits, or just 10 digits on its own. Anything else (9 digits,
11 digits, letters, spaces) is bad. Shows the list, asks one yes or no
question, and deletes the leads plus their call logs only after a yes.
A no deletes nothing.

Run from the project root:
    backend/venv/Scripts/python.exe backend/scripts/delete_bad_phone_numbers.py
"""

import os
import sys

project_root: str = os.path.dirname(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
)
if project_root not in sys.path:
    sys.path.insert(0, project_root)

from flask import Flask

from backend.app import create_app
from backend.app.extensions import db
from backend.app.modules.calls.models import Call
from backend.app.modules.leads.models import Lead

SUCCESS_EXIT_CODE: int = 0
FAILURE_EXIT_CODE: int = 1


def describe_number_problem(phone_number: str) -> str | None:
    cleaned_number: str = phone_number.strip()
    digits_only: str = cleaned_number.lstrip("+")

    if not digits_only:
        return "Is empty"

    if not digits_only.isdigit():
        return "Has characters other than digits"

    digit_count: int = len(digits_only)
    has_country_code: bool = digit_count == 12 and digits_only.startswith("91")
    local_number: str = digits_only[2:] if has_country_code else digits_only
    local_digit_count: int = len(local_number)

    if local_digit_count == 10:
        return None

    return f"Has {local_digit_count} digits instead of 10"


def find_bad_leads_with_problems() -> list[tuple[Lead, str]]:
    all_leads: list[Lead] = Lead.query.order_by(Lead.phone_number).all()
    bad_leads_with_problems: list[tuple[Lead, str]] = []
    for lead in all_leads:
        problem: str | None = describe_number_problem(lead.phone_number)
        if problem is not None:
            bad_leads_with_problems.append((lead, problem))
    return bad_leads_with_problems


def count_calls_for_phone_numbers(phone_numbers: list[str]) -> int:
    call_log_count: int = Call.query.filter(
        Call.phone_number.in_(phone_numbers)
    ).count()
    return call_log_count


def user_confirms(prompt_text: str) -> bool:
    user_answer: str = input(prompt_text)
    cleaned_answer: str = user_answer.strip().lower()
    return cleaned_answer in ("y", "yes")


def show_bad_leads(bad_leads_with_problems: list[tuple[Lead, str]]) -> None:
    for lead, problem in bad_leads_with_problems:
        print(f"{lead.phone_number}  ->  {problem}")


def delete_bad_leads_and_call_logs(bad_leads: list[Lead]) -> None:
    for lead in bad_leads:
        Call.query.filter_by(phone_number=lead.phone_number).delete()
        db.session.delete(lead)
    db.session.commit()


def run_delete_once() -> bool:
    bad_leads_with_problems: list[tuple[Lead, str]] = find_bad_leads_with_problems()
    if not bad_leads_with_problems:
        print("All lead numbers are correct. Nothing to delete.")
        return True

    print(f"Bad numbers found: {len(bad_leads_with_problems)}")
    print()
    show_bad_leads(bad_leads_with_problems)

    bad_leads: list[Lead] = [lead for lead, problem in bad_leads_with_problems]
    bad_phone_numbers: list[str] = [lead.phone_number for lead in bad_leads]
    call_log_count: int = count_calls_for_phone_numbers(bad_phone_numbers)
    print()
    print(f"Leads to delete: {len(bad_leads)}")
    print(f"Call logs to delete: {call_log_count}")

    delete_confirmed: bool = user_confirms(
        "Delete all these leads and their call logs? (y/n): "
    )
    if not delete_confirmed:
        print("Cancelled. Nothing deleted.")
        return False

    delete_bad_leads_and_call_logs(bad_leads)
    print(f"Deleted leads: {len(bad_leads)}.")
    print(f"Deleted call logs: {call_log_count}.")
    return True


def main() -> None:
    application: Flask = create_app()
    with application.app_context():
        delete_succeeded: bool = run_delete_once()

    if delete_succeeded:
        print("Success.")
        sys.exit(SUCCESS_EXIT_CODE)

    print("Failure.")
    sys.exit(FAILURE_EXIT_CODE)


if __name__ == "__main__":
    main()
