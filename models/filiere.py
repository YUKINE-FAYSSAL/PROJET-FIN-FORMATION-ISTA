from extensions import db


class Filiere(db.Model):
    __tablename__ = 'Filiere'
    CodeFil = db.Column(db.String(10), primary_key=True)
    LibelleFil = db.Column(db.String(100))