from extensions import db
from sqlalchemy.orm import relationship

class Exemplaires(db.Model):
    __tablename__ = 'Exemplaires'
    
    CoteExo = db.Column(db.String(50), primary_key=True)
    
    # 🔗 Cote kayrbot l'inventaire
    Cote = db.Column(db.String(50), db.ForeignKey('Inventaire_Ouvrage.Cote'))
    
    Inv_Cote = db.Column(db.String(50))

    # 🔁 Relation ma3a reservations
    reservations = db.relationship('ReservationOuvrage', backref='exemplaire', lazy=True)

    # 🔁 Relation ma3a prets
    prets = relationship("Prets", backref="exemplaire", lazy=True)
