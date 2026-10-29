from backend.migrate import run_migrations
from backend.main import app

run_migrations()

__all__ = ["app"]
