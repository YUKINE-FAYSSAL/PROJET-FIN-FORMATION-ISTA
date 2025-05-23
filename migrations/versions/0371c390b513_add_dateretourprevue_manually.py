"""add DateRetourPrevue manually

Revision ID: 0371c390b513
Revises: f9fdbad9ed53
Create Date: 2025-05-14 01:33:48.434777

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '0371c390b513'
down_revision = 'f9fdbad9ed53'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column('Prets', sa.Column('DateRetourPrevue', sa.Date(), nullable=True))

def downgrade():
    op.drop_column('Prets', 'DateRetourPrevue')

