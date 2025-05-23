from extensions import db

class Secteur(db.Model):
    __tablename__ = 'Secteur'

    CodeSec = db.Column(db.String(10), primary_key=True)
    LibelleSec = db.Column(db.String(100))

    # ✅ Relation vers SousSecteurs
    sous_secteurs = db.relationship('SousSecteur', backref='secteur', lazy=True)

    # ✅ Relation vers Livres
    livres = db.relationship('InventaireOuvrage', backref='secteur', lazy=True)
