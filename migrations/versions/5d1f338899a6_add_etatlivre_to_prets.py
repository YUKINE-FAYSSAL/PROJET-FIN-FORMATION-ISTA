"""add EtatLivre to Prets

Revision ID: 5d1f338899a6
Revises: 0371c390b513
Create Date: 2025-05-14 02:49:04.509854

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import mysql

# revision identifiers, used by Alembic.
revision = '5d1f338899a6'
down_revision = '0371c390b513'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column('Prets', sa.Column('EtatLivre', sa.String(length=20), nullable=True))


def downgrade():
    op.drop_column('Prets', 'EtatLivre')
