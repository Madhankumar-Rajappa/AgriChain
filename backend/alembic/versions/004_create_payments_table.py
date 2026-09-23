"""create_payments_table

Revision ID: 004_create_payments_table
Revises: 003_create_orders_and_notifications
Create Date: 2026-09-14 16:30:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = '004_create_payments_table'
down_revision: Union[str, None] = '003_orders_and_notifs'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'payments',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('order_id', sa.Integer(), nullable=False),
        sa.Column('buyer_id', sa.Integer(), nullable=False),
        sa.Column('amount', sa.Float(), nullable=False),
        sa.Column(
            'payment_method',
            sa.Enum('MOCK_BANK', 'MOCK_CARD', 'MOCK_UPI', 'MOCK_WALLET', name='payment_method_enum'),
            nullable=False,
            server_default='MOCK_CARD'
        ),
        sa.Column(
            'payment_status',
            sa.Enum('INITIATED', 'SUCCESS', 'FAILED', 'REFUNDED', name='payment_status_enum'),
            nullable=False,
            server_default='SUCCESS'
        ),
        sa.Column('transaction_reference', sa.String(length=100), nullable=False),
        sa.Column('paid_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['order_id'], ['orders.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['buyer_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_payments_order_id'), 'payments', ['order_id'], unique=True)
    op.create_index(op.f('ix_payments_buyer_id'), 'payments', ['buyer_id'], unique=False)
    op.create_index(op.f('ix_payments_payment_status'), 'payments', ['payment_status'], unique=False)
    op.create_index(op.f('ix_payments_transaction_reference'), 'payments', ['transaction_reference'], unique=True)


def downgrade() -> None:
    op.drop_index(op.f('ix_payments_transaction_reference'), table_name='payments')
    op.drop_index(op.f('ix_payments_payment_status'), table_name='payments')
    op.drop_index(op.f('ix_payments_buyer_id'), table_name='payments')
    op.drop_index(op.f('ix_payments_order_id'), table_name='payments')
    op.drop_table('payments')
