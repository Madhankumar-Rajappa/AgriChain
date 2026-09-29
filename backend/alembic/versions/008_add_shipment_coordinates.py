"""Add geocoded coordinate columns to shipments table

Revision ID: 008
Revises: 007
Create Date: 2026-09-29

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '008'
down_revision = '007'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column('shipments', sa.Column('pickup_lat', sa.Float(), nullable=True))
    op.add_column('shipments', sa.Column('pickup_lng', sa.Float(), nullable=True))
    op.add_column('shipments', sa.Column('destination_lat', sa.Float(), nullable=True))
    op.add_column('shipments', sa.Column('destination_lng', sa.Float(), nullable=True))


def downgrade() -> None:
    op.drop_column('shipments', 'destination_lng')
    op.drop_column('shipments', 'destination_lat')
    op.drop_column('shipments', 'pickup_lng')
    op.drop_column('shipments', 'pickup_lat')
