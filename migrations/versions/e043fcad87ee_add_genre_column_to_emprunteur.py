"""add Genre column to Emprunteur

Revision ID: e043fcad87ee
Revises: 47ee8e549ea0
Create Date: 2025-05-14 06:54:55.517303

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import mysql

# revision identifiers, used by Alembic.
revision = 'e043fcad87ee'
down_revision = '47ee8e549ea0'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column('Emprunteur',
        sa.Column('Genre', sa.String(length=10), nullable=True)
    )


def downgrade():
    op.drop_column('Emprunteur', 'Genre')
