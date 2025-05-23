from extensions import db

class Emprunteur(db.Model):
    __tablename__ = 'Emprunteur'
    
    Mat = db.Column(db.String(20), primary_key=True)
    Nom = db.Column(db.String(100))
    Prenom = db.Column(db.String(100))
    CodeFil = db.Column(db.String(100))
    Niveau = db.Column(db.String(10))
    Groupe = db.Column(db.String(10))
    Anincription = db.Column(db.Date)
    TypeEmploye = db.Column(db.String(20))
    Motdepasse = db.Column(db.String(300))
    Tel = db.Column(db.String(20))
    N_Pretes = db.Column(db.Integer)
    CoteExo = db.Column(db.String(50))
    Numero = db.Column(db.String(50))
    DateNaissance = db.Column(db.String(20))
    Adresse = db.Column(db.String(255))
    Email = db.Column(db.String(255))
    Genre = db.Column(db.String(10))
    Photo = db.Column(db.String(255))

    besoins = db.relationship('BesoinLivre', backref='emprunteur', lazy=True)
    reservations = db.relationship('ReservationOuvrage', backref='emprunteur', lazy=True)
    prets = db.relationship('Prets', backref='emprunteur', lazy=True)