from extensions import db

class InventaireOuvrage(db.Model):
    __tablename__ = 'Inventaire_Ouvrage'

    Cote = db.Column(db.String(50), primary_key=True)
    Titre_Ouvrage = db.Column(db.String(255))
    Auteur = db.Column(db.String(255))
    Editeur = db.Column(db.String(255))
    Langue = db.Column(db.String(100))
    Categorie = db.Column(db.String(100))
    Edition_Date = db.Column(db.Date)
    Quantite = db.Column(db.Integer)
    Support_Accom = db.Column(db.String(255))
    Observations = db.Column(db.Text)

    # ✅ Foreign Keys
    CodeSec = db.Column(db.String(10), db.ForeignKey('Secteur.CodeSec'))
    CodeSousSec = db.Column(db.String(10), db.ForeignKey('SousSecteur.CodeSousSec'))

    exemplaires = db.relationship('Exemplaires', backref='ouvrage', lazy=True)
