"""remove Vu column from Notification

Revision ID: f9fdbad9ed53
Revises: 91f2fc1678d1
Create Date: 2025-05-14 00:37:52.609679

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import mysql

# revision identifiers, used by Alembic.
revision = 'f9fdbad9ed53'
down_revision = '91f2fc1678d1'
branch_labels = None
depends_on = None

def upgrade():
    with op.batch_alter_table('Notification') as batch_op:
        batch_op.drop_column('Vu')

def downgrade():
    with op.batch_alter_table('Notification') as batch_op:
        batch_op.add_column(sa.Column('Vu', sa.Boolean(), nullable=True))
