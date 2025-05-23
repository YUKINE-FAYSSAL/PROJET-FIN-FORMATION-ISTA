from extensions import db


class Prets(db.Model):
    __tablename__ = 'Prets'

    ID = db.Column(db.Integer, primary_key=True, autoincrement=True)
    Mat = db.Column(db.String(20), db.ForeignKey('Emprunteur.Mat'))
    CoteExo = db.Column(db.String(50), db.ForeignKey('Exemplaires.CoteExo'))
    DatePret = db.Column(db.Date)
    DateRetour = db.Column(db.Date)
    Statut = db.Column(db.String(20))
    DateRetourPrevue = db.Column(db.Date)  # ✅ جديد
    EtatLivre = db.Column(db.String(20))  # ex: 'bon' ou 'abîmé'
