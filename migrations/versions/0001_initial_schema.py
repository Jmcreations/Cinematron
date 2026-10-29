"""Create the initial Cinematron schema."""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy import inspect

revision: str = "0001"
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def _create_if_missing(
    table_name: str,
    columns: list[sa.Column],
    constraints: list[sa.Constraint] | None = None,
) -> None:
    inspector = inspect(op.get_bind())
    if table_name not in inspector.get_table_names():
        op.create_table(table_name, *columns, *(constraints or []))


def upgrade() -> None:
    _create_if_missing(
        "users",
        [sa.Column("id", sa.Integer(), primary_key=True), sa.Column("email", sa.String())],
        [sa.UniqueConstraint("email")],
    )
    _create_if_missing(
        "ratings",
        [
            sa.Column("id", sa.Integer(), primary_key=True),
            sa.Column("user_id", sa.Integer()),
            sa.Column("media_id", sa.Integer()),
            sa.Column("media_type", sa.String()),
            sa.Column("score", sa.Integer()),
        ],
        [sa.UniqueConstraint("user_id", "media_id", "media_type", name="_user_media_uc")],
    )
    _create_if_missing(
        "watchlist",
        [
            sa.Column("id", sa.Integer(), primary_key=True),
            sa.Column("user_id", sa.Integer()),
            sa.Column("media_id", sa.Integer()),
            sa.Column("media_type", sa.String()),
        ],
        [sa.UniqueConstraint("user_id", "media_id", "media_type", name="_user_watchlist_uc")],
    )


def downgrade() -> None:
    op.drop_table("watchlist")
    op.drop_table("ratings")
    op.drop_table("users")
