"""Ajout relation secteur et soussecteur dans inventaire

Revision ID: 70c4a2178c0b
Revises: 8751bb543575
Create Date: 2025-05-16 10:18:30.538128

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import mysql

# revision identifiers, used by Alembic.
revision = '70c4a2178c0b'
down_revision = '8751bb543575'
branch_labels = None
depends_on = None


def upgrade():
    # Création table Secteur
    op.create_table(
        'Secteur',
        sa.Column('CodeSec', sa.String(length=10), primary_key=True),
        sa.Column('LibelleSec', sa.String(length=100), nullable=True)
    )

    # Création table SousSecteur
    op.create_table(
        'SousSecteur',
        sa.Column('CodeSousSec', sa.String(length=10), primary_key=True),
        sa.Column('LibelleSousSec', sa.String(length=100), nullable=True),
        sa.Column('CodeSec', sa.String(length=10), sa.ForeignKey('Secteur.CodeSec'))
    )

    # Ajout colonnes dans Inventaire_Ouvrage
    op.add_column('Inventaire_Ouvrage', sa.Column('CodeSec', sa.String(length=10), nullable=True))
    op.add_column('Inventaire_Ouvrage', sa.Column('CodeSousSec', sa.String(length=10), nullable=True))

    # Ajout contraintes FOREIGN KEY
    op.create_foreign_key('fk_inventaire_secteur', 'Inventaire_Ouvrage', 'Secteur', ['CodeSec'], ['CodeSec'])
    op.create_foreign_key('fk_inventaire_soussecteur', 'Inventaire_Ouvrage', 'SousSecteur', ['CodeSousSec'], ['CodeSousSec'])

def downgrade():
    op.drop_constraint('fk_inventaire_secteur', 'Inventaire_Ouvrage', type_='foreignkey')
    op.drop_constraint('fk_inventaire_soussecteur', 'Inventaire_Ouvrage', type_='foreignkey')

    op.drop_column('Inventaire_Ouvrage', 'CodeSousSec')
    op.drop_column('Inventaire_Ouvrage', 'CodeSec')

    op.drop_table('SousSecteur')
    op.drop_table('Secteur')
