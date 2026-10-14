import os
import click
from flask import Flask
from backend.app.core.security import hash_password
from backend.app.extensions import db
from backend.app.modules.users.models import User


@click.command("seed")
def seed_command() -> None:
    manager_name: str = os.getenv("MANAGER_NAME") or os.getenv("INITIAL_MANAGER_NAME") or "Manager"
    manager_password: str = os.getenv("MANAGER_PASSWORD") or os.getenv("INITIAL_MANAGER_PASSWORD") or "Manager@123"
    
    existing_manager: User | None = User.query.filter_by(name=manager_name).first()
    if existing_manager is not None:
        click.echo("Manager account already exists.")
        return

    password_hash: str = hash_password(manager_password)
    new_manager: User = User(
        name=manager_name,
        password_hash=password_hash,
        role="manager",
        is_active=True,
        country="IN",
    )
    db.session.add(new_manager)
    db.session.commit()
    click.echo(f"Manager account '{manager_name}' created successfully.")


def register_commands(app: Flask) -> None:
    app.cli.add_command(seed_command)
