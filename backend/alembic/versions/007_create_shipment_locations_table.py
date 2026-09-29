"""create_shipment_locations_table

Revision ID: 007_create_shipment_locations_table
Revises: 006_create_shipments_table
Create Date: 2026-09-29 00:30:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = '007_shipment_locations'
down_revision: Union[str, None] = '006_create_shipments_table'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'shipment_locations',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('shipment_id', sa.Integer(), nullable=False),
        sa.Column('transporter_id', sa.Integer(), nullable=False),
        sa.Column('latitude', sa.Float(), nullable=False),
        sa.Column('longitude', sa.Float(), nullable=False),
        sa.Column('accuracy', sa.Float(), nullable=True),
        sa.Column('speed', sa.Float(), nullable=True),
        sa.Column('heading', sa.Float(), nullable=True),
        sa.Column('altitude', sa.Float(), nullable=True),
        sa.Column('recorded_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.ForeignKeyConstraint(['shipment_id'], ['shipments.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['transporter_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_shipment_locations_shipment_id'), 'shipment_locations', ['shipment_id'], unique=False)
    op.create_index(op.f('ix_shipment_locations_transporter_id'), 'shipment_locations', ['transporter_id'], unique=False)
    op.create_index(op.f('ix_shipment_locations_recorded_at'), 'shipment_locations', ['recorded_at'], unique=False)
    op.create_index('ix_shipment_locations_shipment_recorded', 'shipment_locations', ['shipment_id', 'recorded_at'], unique=False)


def downgrade() -> None:
    op.drop_index('ix_shipment_locations_shipment_recorded', table_name='shipment_locations')
    op.drop_index(op.f('ix_shipment_locations_recorded_at'), table_name='shipment_locations')
    op.drop_index(op.f('ix_shipment_locations_transporter_id'), table_name='shipment_locations')
    op.drop_index(op.f('ix_shipment_locations_shipment_id'), table_name='shipment_locations')
    op.drop_table('shipment_locations')
