"""ajout date naissance

Revision ID: db0977fd3912
Revises: a5ae92607a21
Create Date: 2025-05-14 06:28:14.782102

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import mysql

# revision identifiers, used by Alembic.
revision = 'db0977fd3912'
down_revision = 'a5ae92607a21'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column('Emprunteur',
        sa.Column('DateNaissance', sa.String(length=20), nullable=True)
    )



def downgrade():
    op.drop_column('Emprunteur', 'DateNaissance')
