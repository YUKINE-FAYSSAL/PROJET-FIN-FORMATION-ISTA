"""Add Cote column to Besoin_Livre

Revision ID: 91f2fc1678d1
Revises: 58243654f23b
Create Date: 2025-05-13 02:23:10.772742
"""

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '91f2fc1678d1'
down_revision = '58243654f23b'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column('Besoin_Livre', sa.Column('Cote', sa.String(length=50), nullable=True))


def downgrade():
    op.drop_column('Besoin_Livre', 'Cote')
