"""make Cote in Exemplaires nullable

Revision ID: ad7536ae814c
Revises: a7462dadc452
Create Date: 2025-05-12 23:28:54.192824
"""

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = 'ad7536ae814c'
down_revision = 'a7462dadc452'
branch_labels = None
depends_on = None

def upgrade():
    op.alter_column('Exemplaires', 'Cote',
        existing_type=sa.String(length=50),
        nullable=True)

def downgrade():
    op.alter_column('Exemplaires', 'Cote',
        existing_type=sa.String(length=50),
        nullable=False)
