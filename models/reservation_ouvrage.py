from extensions import db


class ReservationOuvrage(db.Model):
    __tablename__ = 'Reservation_Ouvrage'
    Mat = db.Column(db.String(20), db.ForeignKey('Emprunteur.Mat'), primary_key=True)
    CoteExo = db.Column(db.String(50), db.ForeignKey('Exemplaires.CoteExo'), primary_key=True)
    DateReserv = db.Column(db.Date)
    Status = db.Column(db.String(20))