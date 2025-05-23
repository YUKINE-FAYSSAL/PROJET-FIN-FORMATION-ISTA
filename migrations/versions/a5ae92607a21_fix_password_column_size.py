"""fix password column size

Revision ID: a5ae92607a21
Revises: 5d1f338899a6
Create Date: 2025-05-14 06:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = 'a5ae92607a21'
down_revision = '5d1f338899a6'
branch_labels = None
depends_on = None

def upgrade():
    op.alter_column('Emprunteur', 'Motdepasse',
        existing_type=sa.String(length=100),
        type_=sa.String(length=300),
        existing_nullable=True
    )

def downgrade():
    op.alter_column('Emprunteur', 'Motdepasse',
        existing_type=sa.String(length=300),
        type_=sa.String(length=100),
        existing_nullable=True
    )
