"""Add geocoded coordinate columns to shipments table

Revision ID: 008_add_shipment_coordinates
Revises: 007_shipment_locations
Create Date: 2026-09-29 18:00:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = '008_add_shipment_coordinates'
down_revision: Union[str, None] = '007_shipment_locations'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Use batch_alter_table or check column existence to ensure clean idempotent execution on MySQL
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    columns = [col['name'] for col in inspector.get_columns('shipments')]

    if 'pickup_lat' not in columns:
        op.add_column('shipments', sa.Column('pickup_lat', sa.Float(), nullable=True))
    if 'pickup_lng' not in columns:
        op.add_column('shipments', sa.Column('pickup_lng', sa.Float(), nullable=True))
    if 'destination_lat' not in columns:
        op.add_column('shipments', sa.Column('destination_lat', sa.Float(), nullable=True))
    if 'destination_lng' not in columns:
        op.add_column('shipments', sa.Column('destination_lng', sa.Float(), nullable=True))


def downgrade() -> None:
    op.drop_column('shipments', 'destination_lng')
    op.drop_column('shipments', 'destination_lat')
    op.drop_column('shipments', 'pickup_lng')
    op.drop_column('shipments', 'pickup_lat')
