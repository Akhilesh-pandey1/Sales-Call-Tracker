"""Delete one lead from the database by phone number.

Asks for one phone number in the terminal, shows the lead, and deletes the
lead plus every call log for that number only after a yes confirmation.
The script ends with Success or Failure.

Run from the project root:
    backend/venv/Scripts/python.exe backend/scripts/delete_lead.py
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
from backend.app.modules.leads.services import validate_and_format_e164

SUCCESS_EXIT_CODE: int = 0
FAILURE_EXIT_CODE: int = 1


def build_app() -> Flask:
    application: Flask = create_app()
    return application


def read_phone_number() -> str:
    entered_number: str = input("Enter the lead phone number to delete: ")
    return entered_number.strip()


def normalize_entered_number(entered_number: str) -> str | None:
    default_country: str = "IN"
    formatted_number: str | None = validate_and_format_e164(
        entered_number, default_country
    )
    return formatted_number


def find_lead_by_phone(phone_number: str) -> Lead | None:
    found_lead: Lead | None = Lead.query.filter_by(phone_number=phone_number).first()
    return found_lead


def count_calls_for_phone(phone_number: str) -> int:
    call_log_count: int = Call.query.filter_by(phone_number=phone_number).count()
    return call_log_count


def describe_yes_no(value: bool) -> str:
    yes_label: str = "yes"
    no_label: str = "no"
    if value:
        return yes_label
    return no_label


def show_lead_details(lead: Lead) -> None:
    print(f"Phone number: {lead.phone_number}")
    print(f"Status:       {lead.status}")
    print(f"Attempts:     {lead.attempt_count}")
    print(f"Interested:   {describe_yes_no(lead.interested)}")
    print(f"Do not call:  {describe_yes_no(lead.do_not_call)}")
    print(f"Notes:        {lead.notes or '-'}")
    print(f"Created at:   {lead.created_at}")


def user_confirms(prompt_text: str) -> bool:
    user_answer: str = input(prompt_text)
    cleaned_answer: str = user_answer.strip().lower()
    return cleaned_answer in ("y", "yes")


def delete_lead_and_call_logs(lead: Lead) -> None:
    phone_number: str = lead.phone_number
    Call.query.filter_by(phone_number=phone_number).delete()
    db.session.delete(lead)
    db.session.commit()


def run_delete_once() -> bool:
    entered_number: str = read_phone_number()
    if not entered_number:
        print("No number entered. Nothing deleted.")
        return False

    normalized_number: str | None = normalize_entered_number(entered_number)
    if normalized_number is None:
        print("That is not a valid phone number. Nothing deleted.")
        return False

    found_lead: Lead | None = find_lead_by_phone(normalized_number)
    if found_lead is None:
        print(f"No lead found with number {normalized_number}. Nothing deleted.")
        return False

    show_lead_details(found_lead)
    call_log_count: int = count_calls_for_phone(found_lead.phone_number)
    print(f"Call logs to delete: {call_log_count}")

    delete_confirmed: bool = user_confirms(
        f"Delete lead {found_lead.phone_number} and its call logs? (y/n): "
    )
    if not delete_confirmed:
        print("Cancelled. Nothing deleted.")
        return False

    delete_lead_and_call_logs(found_lead)
    print(f"Deleted lead {found_lead.phone_number}.")
    print(f"Deleted call logs: {call_log_count}.")
    return True


def main() -> None:
    application: Flask = build_app()
    with application.app_context():
        delete_succeeded: bool = run_delete_once()

    if delete_succeeded:
        print("Success.")
        sys.exit(SUCCESS_EXIT_CODE)

    print("Failure.")
    sys.exit(FAILURE_EXIT_CODE)


if __name__ == "__main__":
    main()
