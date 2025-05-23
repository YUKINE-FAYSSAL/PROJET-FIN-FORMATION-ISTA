from app import app
from extensions import db
from models.secteur import Secteur
from models.soussecteur import SousSecteur

if __name__ == '__main__':
    with app.app_context():
        try:
            # Supprimer les sous-secteurs d'abord (car ils dépendent de Secteur)
            db.session.query(SousSecteur).delete()
            db.session.query(Secteur).delete()
            db.session.commit()
            print("✅ Tous les secteurs et sous-secteurs ont été supprimés.")
        except Exception as e:
            db.session.rollback()
            print("❌ Erreur lors de la suppression:", e)
