from pathlib import Path

from alembic import command
from alembic.config import Config

from backend.main import SQLALCHEMY_DATABASE_URL


def run_migrations() -> None:
    project_root = Path(__file__).resolve().parents[1]
    config = Config(str(project_root / "alembic.ini"))
    config.set_main_option("sqlalchemy.url", SQLALCHEMY_DATABASE_URL)
    command.upgrade(config, "head")


if __name__ == "__main__":
    run_migrations()
