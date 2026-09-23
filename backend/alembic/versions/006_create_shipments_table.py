"""create_shipments_table

Revision ID: 006_create_shipments_table
Revises: 005_create_warehouses_and_storage_bookings
Create Date: 2026-09-14 17:00:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = '006_create_shipments_table'
down_revision: Union[str, None] = '005_warehouses_and_storage'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'shipments',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('order_id', sa.Integer(), nullable=False),
        sa.Column('transporter_id', sa.Integer(), nullable=False),
        sa.Column('warehouse_id', sa.Integer(), nullable=True),
        sa.Column('vehicle_number', sa.String(length=50), nullable=False),
        sa.Column('driver_name', sa.String(length=100), nullable=False),
        sa.Column('driver_phone', sa.String(length=20), nullable=False),
        sa.Column(
            'shipment_status',
            sa.Enum('ASSIGNED', 'PICKED_UP', 'IN_TRANSIT', 'DELIVERED', 'FAILED', name='shipment_status_enum'),
            nullable=False,
            server_default='ASSIGNED'
        ),
        sa.Column('pickup_address', sa.Text(), nullable=False),
        sa.Column('delivery_address', sa.Text(), nullable=False),
        sa.Column('estimated_delivery', sa.DateTime(timezone=True), nullable=True),
        sa.Column('actual_delivery', sa.DateTime(timezone=True), nullable=True),
        sa.Column('tracking_notes', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['order_id'], ['orders.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['transporter_id'], ['users.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['warehouse_id'], ['warehouses.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_shipments_order_id'), 'shipments', ['order_id'], unique=True)
    op.create_index(op.f('ix_shipments_transporter_id'), 'shipments', ['transporter_id'], unique=False)
    op.create_index(op.f('ix_shipments_warehouse_id'), 'shipments', ['warehouse_id'], unique=False)
    op.create_index(op.f('ix_shipments_shipment_status'), 'shipments', ['shipment_status'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_shipments_shipment_status'), table_name='shipments')
    op.drop_index(op.f('ix_shipments_warehouse_id'), table_name='shipments')
    op.drop_index(op.f('ix_shipments_transporter_id'), table_name='shipments')
    op.drop_index(op.f('ix_shipments_order_id'), table_name='shipments')
    op.drop_table('shipments')
