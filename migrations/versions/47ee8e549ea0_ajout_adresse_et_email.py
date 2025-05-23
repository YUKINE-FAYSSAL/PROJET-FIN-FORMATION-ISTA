"""ajout adresse et email

Revision ID: 47ee8e549ea0
Revises: db0977fd3912
Create Date: 2025-05-14 06:39:44.000409

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import mysql

# revision identifiers, used by Alembic.
revision = '47ee8e549ea0'
down_revision = 'db0977fd3912'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column('Emprunteur', sa.Column('Adresse', sa.String(length=255), nullable=True))
    op.add_column('Emprunteur', sa.Column('Email', sa.String(length=255), nullable=True))

def downgrade():
    op.drop_column('Emprunteur', 'Email')
    op.drop_column('Emprunteur', 'Adresse')
