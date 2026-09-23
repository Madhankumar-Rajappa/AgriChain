"""create_warehouses_and_storage_bookings_tables

Revision ID: 005_create_warehouses_and_storage_bookings
Revises: 004_create_payments_table
Create Date: 2026-09-14 16:45:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = '005_warehouses_and_storage'
down_revision: Union[str, None] = '004_create_payments_table'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Warehouses table
    op.create_table(
        'warehouses',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('manager_id', sa.Integer(), nullable=True),
        sa.Column('name', sa.String(length=150), nullable=False),
        sa.Column('location', sa.String(length=255), nullable=False),
        sa.Column('total_capacity_tons', sa.Float(), nullable=False),
        sa.Column('available_capacity_tons', sa.Float(), nullable=False),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default=sa.text('1')),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['manager_id'], ['users.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_warehouses_manager_id'), 'warehouses', ['manager_id'], unique=False)
    op.create_index(op.f('ix_warehouses_location'), 'warehouses', ['location'], unique=False)

    # 2. Storage Bookings table
    op.create_table(
        'storage_bookings',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('order_id', sa.Integer(), nullable=False),
        sa.Column('warehouse_id', sa.Integer(), nullable=False),
        sa.Column('allocated_by_id', sa.Integer(), nullable=False),
        sa.Column('quantity_stored', sa.Float(), nullable=False),
        sa.Column(
            'storage_status',
            sa.Enum('RESERVED', 'STORED', 'RELEASED_FOR_DISPATCH', name='storage_status_enum'),
            nullable=False,
            server_default='RESERVED'
        ),
        sa.Column('entry_date', sa.DateTime(timezone=True), nullable=True),
        sa.Column('release_date', sa.DateTime(timezone=True), nullable=True),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['order_id'], ['orders.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['warehouse_id'], ['warehouses.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['allocated_by_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_storage_bookings_order_id'), 'storage_bookings', ['order_id'], unique=True)
    op.create_index(op.f('ix_storage_bookings_warehouse_id'), 'storage_bookings', ['warehouse_id'], unique=False)
    op.create_index(op.f('ix_storage_bookings_allocated_by_id'), 'storage_bookings', ['allocated_by_id'], unique=False)
    op.create_index(op.f('ix_storage_bookings_storage_status'), 'storage_bookings', ['storage_status'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_storage_bookings_storage_status'), table_name='storage_bookings')
    op.drop_index(op.f('ix_storage_bookings_allocated_by_id'), table_name='storage_bookings')
    op.drop_index(op.f('ix_storage_bookings_warehouse_id'), table_name='storage_bookings')
    op.drop_index(op.f('ix_storage_bookings_order_id'), table_name='storage_bookings')
    op.drop_table('storage_bookings')

    op.drop_index(op.f('ix_warehouses_location'), table_name='warehouses')
    op.drop_index(op.f('ix_warehouses_manager_id'), table_name='warehouses')
    op.drop_table('warehouses')
