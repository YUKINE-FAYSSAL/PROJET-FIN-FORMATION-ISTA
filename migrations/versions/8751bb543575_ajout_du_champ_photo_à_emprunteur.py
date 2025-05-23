"""Ajout du champ Photo à Emprunteur

Revision ID: 8751bb543575
Revises: e043fcad87ee
Create Date: 2025-05-16 07:40:04.459323

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import mysql

# revision identifiers, used by Alembic.
revision = '8751bb543575'
down_revision = 'e043fcad87ee'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column('Emprunteur', sa.Column('Photo', sa.String(length=255), nullable=True))

def downgrade():
    op.drop_column('Emprunteur', 'Photo')
