"""Enable row-level security on public application tables."""
from typing import Sequence, Union

from alembic import op


revision: str = "0002"
down_revision: Union[str, Sequence[str], None] = "0001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


_RLS_TABLES = ("alembic_version", "users", "ratings", "watchlist")


def upgrade() -> None:
    if op.get_bind().dialect.name != "postgresql":
        return

    for table_name in _RLS_TABLES:
        op.execute(f"ALTER TABLE public.{table_name} ENABLE ROW LEVEL SECURITY")


def downgrade() -> None:
    if op.get_bind().dialect.name != "postgresql":
        return

    for table_name in reversed(_RLS_TABLES):
        op.execute(f"ALTER TABLE public.{table_name} DISABLE ROW LEVEL SECURITY")
