"""add Ajoute column to Besoin_Livre

Revision ID: 58243654f23b
Revises: 90c0703d785b
Create Date: 2025-05-13 02:12:29.004254

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '58243654f23b'
down_revision = '90c0703d785b'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column('Besoin_Livre', sa.Column('Ajoute', sa.Boolean(), server_default=sa.text('false')))


def downgrade():
    op.drop_column('Besoin_Livre', 'Ajoute')
