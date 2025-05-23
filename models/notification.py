from extensions import db

class Notification(db.Model):
    __tablename__ = 'Notification'
    ID = db.Column(db.Integer, primary_key=True, autoincrement=True)
    Mat = db.Column(db.String(20))
    CoteExo = db.Column(db.String(50))
    Date = db.Column(db.DateTime)
    Message = db.Column(db.String(255))