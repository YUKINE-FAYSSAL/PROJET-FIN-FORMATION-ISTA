"""create Prets table

Revision ID: 90c0703d785b
Revises: 5c5ce3d89c0d
Create Date: 2025-05-13 01:08:03.042839

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import mysql

# revision identifiers, used by Alembic.
revision = '90c0703d785b'
down_revision = '5c5ce3d89c0d'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table('Prets',
        sa.Column('ID', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('Mat', sa.String(length=20), nullable=True),
        sa.Column('CoteExo', sa.String(length=50), nullable=True),
        sa.Column('DatePret', sa.Date(), nullable=True),
        sa.Column('DateRetour', sa.Date(), nullable=True),
        sa.Column('Statut', sa.String(length=20), nullable=True),
        sa.ForeignKeyConstraint(['CoteExo'], ['Exemplaires.CoteExo']),
        sa.ForeignKeyConstraint(['Mat'], ['Emprunteur.Mat']),
        sa.PrimaryKeyConstraint('ID')
    )
