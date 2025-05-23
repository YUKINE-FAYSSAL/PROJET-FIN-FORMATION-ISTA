from extensions import db

class BesoinLivre(db.Model):
    __tablename__ = 'Besoin_Livre'
    ID = db.Column(db.Integer, primary_key=True, autoincrement=True)
    Mat = db.Column(db.String(20), db.ForeignKey('Emprunteur.Mat'))
    Titre_Ouvrage = db.Column(db.String(255))
    Auteur = db.Column(db.String(255))
    DateDemande = db.Column(db.Date)
    Ajoute = db.Column(db.Boolean, default=False)   # ✅ ajouté
    Cote = db.Column(db.String(50))                 # ✅ ajouté
