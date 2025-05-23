from extensions import db

class SousSecteur(db.Model):
    __tablename__ = 'SousSecteur'

    CodeSousSec = db.Column(db.String(10), primary_key=True)
    LibelleSousSec = db.Column(db.String(100))
    
    # ✅ ForeignKey li Secteur
    CodeSec = db.Column(db.String(10), db.ForeignKey('Secteur.CodeSec'))

    # ✅ Relation vers Livres
    livres = db.relationship('InventaireOuvrage', backref='sous_secteur', lazy=True)
