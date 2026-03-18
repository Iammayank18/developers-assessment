"""Add record table

Revision ID: a1b2c3d4e5f6
Revises: 1a31ce608336
Create Date: 2026-03-18

"""
import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision = "a1b2c3d4e5f6"
down_revision = "1a31ce608336"
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "record",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("type", sa.String(), nullable=False),
        sa.Column("parent_id", sa.Uuid(), nullable=True),
        sa.Column("data", sa.String(), nullable=False, server_default="{}"),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(["parent_id"], ["record.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_record_type"), "record", ["type"])
    op.create_index(op.f("ix_record_parent_id"), "record", ["parent_id"])
    op.create_index(op.f("ix_record_created_at"), "record", ["created_at"])


def downgrade():
    op.drop_index(op.f("ix_record_created_at"), table_name="record")
    op.drop_index(op.f("ix_record_parent_id"), table_name="record")
    op.drop_index(op.f("ix_record_type"), table_name="record")
    op.drop_table("record")
