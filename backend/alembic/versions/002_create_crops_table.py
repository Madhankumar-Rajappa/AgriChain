"""create_crops_table

Revision ID: 002_create_crops_table
Revises: 001_create_users_table
Create Date: 2026-09-14 15:45:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = '002_create_crops_table'
down_revision: Union[str, None] = '001_create_users_table'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'crops',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('farmer_id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(length=100), nullable=False),
        sa.Column('category', sa.Enum('GRAINS', 'VEGETABLES', 'FRUITS', 'PULSES', 'SPICES', 'OTHER', name='crop_category_enum'), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('quantity', sa.Float(), nullable=False),
        sa.Column('unit', sa.String(length=20), nullable=False),
        sa.Column('expected_price', sa.Float(), nullable=False),
        sa.Column('quality', sa.Enum('GRADE_A', 'GRADE_B', 'PREMIUM', 'STANDARD', name='crop_quality_enum'), nullable=False),
        sa.Column('harvest_date', sa.Date(), nullable=False),
        sa.Column('location', sa.String(length=150), nullable=False),
        sa.Column('status', sa.Enum('AVAILABLE', 'RESERVED', 'SOLD', 'INACTIVE', name='crop_status_enum'), nullable=False, server_default='AVAILABLE'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['farmer_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_crops_farmer_id'), 'crops', ['farmer_id'], unique=False)
    op.create_index(op.f('ix_crops_name'), 'crops', ['name'], unique=False)
    op.create_index(op.f('ix_crops_category'), 'crops', ['category'], unique=False)
    op.create_index(op.f('ix_crops_location'), 'crops', ['location'], unique=False)
    op.create_index(op.f('ix_crops_status'), 'crops', ['status'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_crops_status'), table_name='crops')
    op.drop_index(op.f('ix_crops_location'), table_name='crops')
    op.drop_index(op.f('ix_crops_category'), table_name='crops')
    op.drop_index(op.f('ix_crops_name'), table_name='crops')
    op.drop_index(op.f('ix_crops_farmer_id'), table_name='crops')
    op.drop_table('crops')
