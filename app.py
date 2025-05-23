# ---------------------- IMPORTS ----------------------
from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
from datetime import datetime
from extensions import db, migrate
from kafka import KafkaProducer
from werkzeug.security import check_password_hash, generate_password_hash
import json
import config
import os
import pandas as pd
from werkzeug.utils import secure_filename
from flask import request
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from reportlab.platypus import Table, TableStyle
from reportlab.lib import colors
from flask import send_file
from flask_cors import cross_origin


from models.inventaire_ouvrage import InventaireOuvrage
from models.exemplaires import Exemplaires
from models.reservation_ouvrage import ReservationOuvrage
from models.emprunteur import Emprunteur
from models.notification import Notification
from models.besoin_livre import BesoinLivre
from models.prets import Prets
from models.soussecteur import SousSecteur
from models.secteur import Secteur



# ---------------------- APP CONFIG ----------------------
app = Flask(__name__)
CORS(app, supports_credentials=True)


app.config.from_object(config)

db.init_app(app)
migrate.init_app(app, db)

# ---------------------- KAFKA ----------------------
producer = KafkaProducer(
    bootstrap_servers='localhost:9092',
    value_serializer=lambda v: json.dumps(v).encode('utf-8')
)

# ---------------------- ROUTES ----------------------

@app.route('/')
def home():
    return 'API Library working!'

@app.route('/static/images/<filename>')
def serve_image(filename):
    filepath = os.path.join('static/images', filename)
    if os.path.exists(filepath):
        return send_from_directory('static/images', filename)
    else:
        return send_from_directory('static/images', 'image.jpg')

# ---------------------- AUTH ----------------------
@app.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        email = data.get('email', '').strip().lower()
        password = data.get('password', '')

        matricule = email.split('@')[0]
        user = Emprunteur.query.get(matricule)

        if not user:
            return jsonify({'error': 'Utilisateur non trouvé'}), 404

        if not check_password_hash(user.Motdepasse, password):
            return jsonify({'error': 'Mot de passe incorrect'}), 401

        return jsonify({
            'Mat': user.Mat,
            'Nom': user.Nom,
            'Prenom': user.Prenom,
            'Genre': user.Genre,
            'DateNaissance': user.DateNaissance,
            'Adresse': user.Adresse,
            'Tel': user.Tel,
            'Email': user.Email,
            'CodeFil': user.CodeFil,
            'Niveau': user.Niveau,
            'Groupe': user.Groupe,
            'Role': user.TypeEmploye
        }), 200

    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({'error': f'Erreur serveur: {str(e)}'}), 500


# ---------------------- BOOKS ----------------------
@app.route('/books', methods=['GET'])
def get_books():
    try:
        books = InventaireOuvrage.query.all()
        result = [{
            'Cote': book.Cote,
            'Titre_Ouvrage': book.Titre_Ouvrage,
            'Auteur': book.Auteur,
            'Edition_Date': str(book.Edition_Date),
            'Quantite': book.Quantite,
            'Support_Accom': book.Support_Accom,
            'Observations': book.Observations
        } for book in books]
        return jsonify({'books': result, 'total': len(result)})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ---------------------- RESET PASSWORD  ----------------------
import traceback

@app.route('/update-password', methods=['PUT'])
def update_password():
    try:
        data = request.get_json()
        print("📥 Données reçues:", data)

        mat = data.get('mat')
        old_password = data.get('old_password')
        new_password = data.get('new_password')

        if not all([mat, old_password, new_password]):
            return jsonify({'error': 'Champs requis manquants'}), 400

        user = Emprunteur.query.get(mat)
        print("👤 Utilisateur trouvé:", user)

        if not user:
            return jsonify({'error': 'Utilisateur introuvable'}), 404

        print("🔐 Vérif:", user.Motdepasse, old_password)

        if not check_password_hash(user.Motdepasse, old_password):
            return jsonify({'error': 'Ancien mot de passe incorrect'}), 401

        user.Motdepasse = generate_password_hash(new_password)
        db.session.commit()

        return jsonify({'message': '✅ Mot de passe mis à jour avec succès'}), 200

    except Exception as e:
        traceback.print_exc()  # ✅ debug console
        db.session.rollback()
        return jsonify({'error': f'Erreur serveur: {str(e)}'}), 500

# ---------------------- BOOKS ----------------------
@app.route('/books/<cote>', methods=['GET'])
def get_book(cote):
    try:
        book = InventaireOuvrage.query.get(cote)
        if not book:
            return jsonify({'error': 'Livre non trouvé'}), 404

        return jsonify({
            'Cote': book.Cote,
            'Titre_Ouvrage': book.Titre_Ouvrage,
            'Auteur': book.Auteur,
            'Editeur': book.Editeur,
            'Langue': book.Langue,
            'Categorie': book.Categorie,
            'Edition_Date': str(book.Edition_Date) if book.Edition_Date else '',
            'Quantite': book.Quantite,
            'Support_Accom': book.Support_Accom,
            'Observations': book.Observations,
            'CodeSec': book.CodeSec,
            'CodeSousSec': book.CodeSousSec
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/books', methods=['POST'])
def add_book():
    try:
        data = request.form.to_dict()
        print("📥 Données reçues:", data)

        besoin_id = data.pop("besoin_id", None)
        cote = data["Cote"]
        quantite = int(data.get("Quantite", 1))

        # ✅ Gestion de l'image
        if 'image' in request.files:
            image = request.files['image']
            filename = secure_filename(image.filename)
            image.save(os.path.join("static/images", filename))
            data['Support_Accom'] = filename

        # ✅ Création du livre
        new_book = InventaireOuvrage(**data)
        db.session.add(new_book)
        db.session.commit()

        # ✅ Création des exemplaires
        for i in range(1, quantite + 1):
            cote_exo = f"{cote}-{i}"
            ex = Exemplaires(
                CoteExo=cote_exo,
                Cote=cote,
                Inv_Cote=f"INV-{i:03d}"
            )
            db.session.add(ex)

        db.session.commit()

        # ✅ Mise à jour du besoin (sans suppression)
        if besoin_id:
            besoin = BesoinLivre.query.get(besoin_id)
            if besoin:
                besoin.Ajoute = True
                besoin.Cote = cote
                db.session.commit()
                print(f"🔄 Besoin {besoin_id} mis à jour comme ajouté avec cote {cote}.")

        return jsonify({'message': f"Livre ajouté avec {quantite} exemplaires."})

    except Exception as e:
        import traceback
        traceback.print_exc()
        db.session.rollback()
        return jsonify({'error': str(e)}), 500



@app.route('/books/<cote>', methods=['PUT'])
def update_book(cote):
    data = request.get_json()
    try:
        book = InventaireOuvrage.query.get(cote)
        if not book:
            return jsonify({'error': 'Livre non trouvé'}), 404

        for key, value in data.items():
            setattr(book, key, value)

        db.session.commit()
        return jsonify({'message': f'Livre {cote} modifié!'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/books/<cote>', methods=['DELETE'])
def delete_book(cote):
    try:
        print(f"🔍 Tentative suppression du livre: {cote}")

        # 1. Supprimer toutes les réservations liées aux exemplaires de ce livre
        reservations = ReservationOuvrage.query.filter(
            ReservationOuvrage.CoteExo.like(f"{cote}-%")
        ).all()
        for r in reservations:
            print(f"🗑️ Suppression réservation: {r.CoteExo}")
            db.session.delete(r)

        # 2. Supprimer exemplaires
        exemplaires = Exemplaires.query.filter_by(Cote=cote).all()
        for e in exemplaires:
            print(f"🗑️ Suppression exemplaire: {e.CoteExo}")
            db.session.delete(e)

        # 3. Supprimer le livre lui-même
        book = InventaireOuvrage.query.get(cote)
        if not book:
            return jsonify({'error': 'Livre introuvable'}), 404

        db.session.delete(book)
        db.session.commit()
        return jsonify({'message': f"Livre '{cote}' supprimé avec succès"}), 200

    except Exception as e:
        import traceback
        traceback.print_exc()
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


# ---------------------- RESERVATION ----------------------

@app.route('/reservation', methods=['POST'])
def reserver_livre():
    try:
        data = request.get_json()
        print("📥 Réservation reçue:", data)

        mat = data.get('Mat')
        cote_exo = data.get('CoteExo')
        role = data.get('Role')

        if not mat or not cote_exo or not role:
            return jsonify({'error': 'Champs requis manquants'}), 400

        nb_actifs = ReservationOuvrage.query.filter(
            ReservationOuvrage.Mat == mat,
            ReservationOuvrage.Status.in_(['en attente', 'réservé'])
        ).count()

        if role.lower() == 'stagiaire' and nb_actifs >= 1:
            return jsonify({'error': 'Un stagiaire ne peut avoir qu’une seule réservation active.'}), 400
        if role.lower() == 'formateur' and nb_actifs >= 2:
            return jsonify({'error': 'Un formateur ne peut pas dépasser 2 réservations actives.'}), 400

        ancienne = ReservationOuvrage.query.get((mat, cote_exo))
        date_reserv = datetime.now().date()

        if ancienne:
            if ancienne.Status == 'annulée':
                ancienne.Status = 'en attente'
                ancienne.DateReserv = date_reserv
                db.session.commit()

                # 🔔 Notification Kafka
                producer.send('reservation-topic', {
                    'mat': mat,
                    'cote_exo': cote_exo,
                    'type': 'reservation_created'
                })

                return jsonify({'message': 'Réservation réactivée avec succès ✅'}), 200
            else:
                return jsonify({'error': 'Cette réservation existe déjà.'}), 400

        max_days = 15 if role.lower() == 'formateur' else 7
        date_retour_prevue = date_reserv + timedelta(days=max_days)

        reservation = ReservationOuvrage(
            Mat=mat,
            CoteExo=cote_exo,
            DateReserv=date_reserv,
            Status='en attente'
        )
        db.session.add(reservation)

        exemplaire = Exemplaires.query.get(cote_exo)
        if exemplaire:
            inventaire = InventaireOuvrage.query.get(exemplaire.Cote)
            if inventaire and inventaire.Quantite > 0:
                inventaire.Quantite -= 1

        db.session.commit()

        # 🔔 Notification Kafka
        producer.send('reservation-topic', {
            'mat': mat,
            'cote_exo': cote_exo,
            'type': 'reservation_created'
        })

        return jsonify({
            'message': f'Réservation confirmée pour {max_days} jours.',
            'date_retour_prevue': str(date_retour_prevue)
        }), 200

    except Exception as e:
        import traceback
        traceback.print_exc()
        db.session.rollback()
        return jsonify({'error': f'Erreur serveur: {str(e)}'}), 500




@app.route('/all-reservations')
def all_reservations():
    try:
        reservations = ReservationOuvrage.query.all()
        result = [{
            'Mat': r.Mat,
            'CoteExo': r.CoteExo,
            'DateReserv': str(r.DateReserv),
            'Status': r.Status
        } for r in reservations]
        return jsonify(result), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/mes-reservations')
def mes_reservations():
    mat = request.args.get('mat')
    if not mat:
        return jsonify({'error': 'Matricule requis'}), 400

    try:
        # 🔁 Récupérer les réservations + joindre avec DateRetourPrevue
        reservations = db.session.query(
            ReservationOuvrage,
            Prets.DateRetourPrevue
        ).outerjoin(
            Prets,
            (ReservationOuvrage.Mat == Prets.Mat) &
            (ReservationOuvrage.CoteExo == Prets.CoteExo)
        ).filter(ReservationOuvrage.Mat == mat).all()

        result = []
        for res, retour in reservations:
            result.append({
                'Mat': res.Mat,
                'CoteExo': res.CoteExo,
                'DateReserv': res.DateReserv.strftime('%Y-%m-%d') if res.DateReserv else '',
                'Status': res.Status,
                'DateRetourPrevue': retour.strftime('%Y-%m-%d') if retour else None  # ✅ ajouté
            })

        return jsonify(result), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

from datetime import datetime, timedelta

@app.route('/reservation/<mat>/<cote_exo>', methods=['PUT'])
def update_reservation(mat, cote_exo):
    data = request.get_json()
    try:
        reservation = ReservationOuvrage.query.get((mat, cote_exo))
        if not reservation:
            return jsonify({'error': 'Réservation non trouvée'}), 404

        new_status = data.get('Status', reservation.Status)
        reservation.Status = new_status

        # ✅ Notification type par statut
        notif_type = None

        if new_status.lower() == 'réservé':
            reservation.DateReserv = datetime.now().date()

            user = Emprunteur.query.get(mat)
            days = 15 if user and user.TypeEmploye.lower() == 'formateur' else 7

            date_pret = datetime.now().date()
            date_retour_prevue = date_pret + timedelta(days=days)

            new_pret = Prets(
                Mat=mat,
                CoteExo=cote_exo,
                DatePret=date_pret,
                Statut='en cours',
                DateRetourPrevue=date_retour_prevue
            )
            db.session.add(new_pret)
            notif_type = 'reservation_validated'

        elif new_status.lower() == 'annulée':
            exemplaire = Exemplaires.query.get(cote_exo)
            if exemplaire:
                inventaire = InventaireOuvrage.query.get(exemplaire.Cote)
                if inventaire:
                    inventaire.Quantite += 1
            notif_type = 'reservation_cancelled'

        db.session.commit()

        if notif_type:
            producer.send('reservation-topic', {
                'mat': mat,
                'cote_exo': cote_exo,
                'type': notif_type
            })

        return jsonify({'message': f'Statut mis à jour à {new_status}!'}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


# ---------------------- BESOINS ----------------------
@app.route('/mes-besoins')
def mes_besoins():
    mat = request.args.get('mat')
    try:
        besoins = BesoinLivre.query.filter_by(Mat=mat).all()
        result = [{
            'ID': b.ID,
            'Titre_Ouvrage': b.Titre_Ouvrage,
            'Auteur': b.Auteur,
            'DateDemande': str(b.DateDemande),
            'Ajoute': b.Ajoute,
            'Cote': getattr(b, 'Cote', None)
        } for b in besoins]
        return jsonify(result), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500




@app.route('/all-besoins')
def all_besoins():
    try:
        besoins = BesoinLivre.query.all()
        result = [{
            'ID': b.ID,
            'Titre_Ouvrage': b.Titre_Ouvrage,
            'Auteur': b.Auteur,
            'DateDemande': str(b.DateDemande),
            'Mat': b.Mat,
            'Ajoute': bool(b.Ajoute),
            'Cote': b.Cote
        } for b in besoins]
        return jsonify(result), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500



@app.route('/demander-besoin', methods=['POST'])
def demander_besoin():
    data = request.get_json()
    try:
        besoin = BesoinLivre(
            Mat=data['Mat'],
            Titre_Ouvrage=data['Titre_Ouvrage'],
            Auteur=data['Auteur'],
            DateDemande=datetime.now().date()
        )
        db.session.add(besoin)
        db.session.commit()
        return jsonify({'message': 'Demande de besoin enregistrée!'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# ---------------------- EMPRUNTEURS ----------------------
@app.route('/emprunteurs')
def get_emprunteurs():
    try:
        emprunteurs = Emprunteur.query.all()
        result = [{
            'Mat': e.Mat,
            'Nom': e.Nom,
            'Prenom': e.Prenom,
            'CodeFil': e.CodeFil,
            'Niveau': e.Niveau,
            'Groupe': e.Groupe,
            'TypeEmploye': e.TypeEmploye,
            'Tel': e.Tel,
            'N_Pretes': e.N_Pretes,
            'Role': e.TypeEmploye
        } for e in emprunteurs]
        return jsonify(result), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/emprunteurs/<mat>')
def get_emprunteur(mat):
    try:
        emprunteur = Emprunteur.query.get(mat)
        if not emprunteur:
            return jsonify({'error': 'Emprunteur non trouvé'}), 404

        result = {
            'Mat': emprunteur.Mat,
            'Nom': emprunteur.Nom,
            'Prenom': emprunteur.Prenom,
            'CodeFil': emprunteur.CodeFil,
            'Niveau': emprunteur.Niveau,
            'Groupe': emprunteur.Groupe,
            'TypeEmploye': emprunteur.TypeEmploye,
            'Tel': emprunteur.Tel,
            'N_Pretes': emprunteur.N_Pretes
        }
        return jsonify(result), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
# ---------------------- EXEMPLAIRES ----------------------
@app.route('/exemplaires')
def get_exemplaires():
    try:
        exemplaires = Exemplaires.query.all()
        result = [{
            'CoteExo': e.CoteExo,
            'Cote': e.Cote,
            'Inv_Cote': e.Inv_Cote,
            'Disponible': e.Disponible
        } for e in exemplaires]
        return jsonify(result), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/exemplaires/<cote>')
def get_exemplaires_by_book(cote):
    try:
        exemplaires = Exemplaires.query.filter_by(Cote=cote).all()
        result = [{
            'CoteExo': e.CoteExo,
            'Cote': e.Cote,
            'Inv_Cote': e.Inv_Cote,
            'Disponible': e.Disponible
        } for e in exemplaires]
        return jsonify(result), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ---------------------- STATS ----------------------
@app.route('/stats')
def get_stats():
    try:
        total_books = InventaireOuvrage.query.count()
        total_reservations = ReservationOuvrage.query.count()
        total_users = Emprunteur.query.count()
        return jsonify({
            'total_books': total_books,
            'total_reservations': total_reservations,
            'total_users': total_users
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/search')
def search_books():
    keyword = request.args.get('q', '')
    books = InventaireOuvrage.query.filter(
        (InventaireOuvrage.Titre_Ouvrage.like(f'%{keyword}%')) |
        (InventaireOuvrage.Auteur.like(f'%{keyword}%'))
    ).all()
    result = [{
        'Cote': b.Cote,
        'Titre_Ouvrage': b.Titre_Ouvrage,
        'Auteur': b.Auteur
    } for b in books]
    return jsonify(result), 200

# ---------------------- NOTIFICATIONS ----------------------


@app.route('/notifications/<mat>')
def get_notifications(mat):
    try:
        if not mat or mat == "undefined" or mat == "null":
            return jsonify([])  # ✅ ما تدير والو إلى كان mat غير صالح

        notifs = Notification.query.filter(
            Notification.Mat == mat,
            Notification.Mat.isnot(None)
        ).order_by(Notification.Date.desc()).all()

        result = []
        for n in notifs:
            try:
                result.append({
                    'id': getattr(n, 'ID', None),
                    'mat': getattr(n, 'Mat', ''),
                    'cote_exo': getattr(n, 'CoteExo', ''),
                    'message': getattr(n, 'Message', ''),
                    'date': n.Date.strftime('%Y-%m-%d %H:%M:%S') if getattr(n, 'Date', None) else ''
                })
            except Exception as inner_error:
                print("⚠️ Notification corrompue ignorée:", inner_error)
                continue

        return jsonify(result), 200

    except Exception as e:
        import traceback
        traceback.print_exc()
        print("🔥 ERROR dans /notifications/<mat>:", e)
        return jsonify({'error': str(e)}), 500

@app.route('/send-alert', methods=['POST'])
def send_alert():
    data = request.get_json()
    try:
        notif = Notification(
            Mat=data['mat'],
            CoteExo=data.get('cote_exo', ''),
            Date=datetime.now(),
            Message=data['message']
        )
        db.session.add(notif)
        db.session.commit()
        return jsonify({'message': 'Notification envoyée'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/notifications/<mat>', methods=['DELETE'])
def delete_notifications(mat):
    try:
        Notification.query.filter_by(Mat=mat).delete()
        db.session.commit()
        return jsonify({'message': 'Notifications supprimées.'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# ---------------------- IMPORT USERS ----------------------
@app.route('/import-users', methods=['POST'])
def import_users():
    try:
        with open('users.json', encoding='utf-8') as f:
            users = json.load(f)

        for user in users:
            if Emprunteur.query.get(user['Numéro stagiaire']):
                continue

            new_user = Emprunteur(
                Mat=user['Numéro stagiaire'],
                Nom=user['Nom'],
                Prenom=user['Prénom'],
                CodeFil=user.get('Code Filière', ''),
                Niveau=user.get('Niveau', ''),
                Groupe=user.get('Groupe', ''),
                Anincription=datetime.now(),
                TypeEmploye=user.get('Role', 'stagiaire'),
                Motdepasse=user.get('Date naissance', 'pass123'),
                Tel=user.get('Numéro téléphone', ''),
                N_Pretes=0
            )
            db.session.add(new_user)

        db.session.commit()
        return jsonify({'message': '✅ Utilisateurs importés avec succès!'}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/import-excel-users', methods=['POST'])
def import_excel_users():
    if 'file' not in request.files:
        return jsonify({'error': 'Aucun fichier fourni'}), 400

    file = request.files['file']
    if not file.filename.endswith('.xlsx'):
        return jsonify({'error': 'Format non supporté'}), 400

    try:
        import pandas as pd
        df = pd.read_excel(file)

        for _, row in df.iterrows():
            if Emprunteur.query.get(str(row['Numéro stagiaire'])):
                continue

            user = Emprunteur(
                Mat=str(row['Numéro stagiaire']),
                Nom=row['Nom'],
                Prenom=row['Prénom'],
                CodeFil=row.get('Code Filière', ''),
                Niveau=row.get('Niveau', ''),
                Groupe=row.get('Groupe', ''),
                Anincription=datetime.now(),
                TypeEmploye=row.get('Role', 'stagiaire'),
                Motdepasse=row.get('Mot de passe', 'pass123'),
                Tel=str(row.get('Numéro téléphone', '')),
                N_Pretes=0
            )
            db.session.add(user)

        db.session.commit()
        return jsonify({'message': '✅ Importation réussie depuis Excel'}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
    
@app.route('/import-json-users', methods=['POST'])
def import_json_users():
    if 'file' not in request.files:
        return jsonify({'error': 'Aucun fichier JSON fourni'}), 400

    file = request.files['file']
    if not file.filename.endswith('.json'):
        return jsonify({'error': 'Format JSON non supporté'}), 400

    try:
        users = json.load(file)

        for user in users:
            if Emprunteur.query.get(str(user['Numéro stagiaire'])):
                continue

            new_user = Emprunteur(
                Mat=str(user['Numéro stagiaire']),
                Nom=user['Nom'],
                Prenom=user['Prénom'],
                CodeFil=user.get('Code Filière', ''),
                Niveau=user.get('Niveau', ''),
                Groupe=user.get('Groupe', ''),
                Anincription=datetime.now(),
                TypeEmploye=user.get('Role', 'stagiaire'),
                Motdepasse=user.get('Mot de passe', 'pass123'),
                Tel=str(user.get('Numéro téléphone', '')),
                N_Pretes=0
            )
            db.session.add(new_user)

        db.session.commit()
        return jsonify({'message': '✅ Utilisateurs JSON importés avec succès!'}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/add-user', methods=['POST'])
def add_user():
    try:
        data = request.get_json()

        # 🔐 Vérifier unicité du matricule
        if Emprunteur.query.get(data['Mat']):
            return jsonify({'error': 'Matricule déjà utilisé'}), 400

        # 🔐 Hachage du mot de passe
        hashed_password = generate_password_hash(data.get('Motdepasse', ''))

        # ✅ Création de l'utilisateur
        new_user = Emprunteur(
            Mat=data['Mat'],
            Nom=data['Nom'],
            Prenom=data['Prenom'],
            CodeFil=data.get('CodeFil', ''),
            Niveau=data.get('Niveau', ''),
            Groupe=data.get('Groupe', ''),
            Anincription=datetime.now(),
            TypeEmploye=data.get('Role', 'stagiaire'),
            Motdepasse=hashed_password,
            Tel=data.get('Tel', ''),
            N_Pretes=0
        )

        db.session.add(new_user)
        db.session.commit()

        return jsonify({'message': '✅ Utilisateur ajouté avec succès!'}), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f"❌ Erreur: {str(e)}"}), 500

@app.route('/generate-exemplaires/<cote>')
def generate_exemplaires(cote):
    try:
        with open("exeplaire.json", encoding='utf-8') as f:
            all_ex = json.load(f)

        count = 1
        for e in all_ex:
            if e["Cote"] == cote:
                if Exemplaires.query.get(e["CoteExo"]):
                    continue
                db.session.add(Exemplaires(
                    CoteExo=e["CoteExo"],
                    Cote=e["Cote"],
                    Inv_Cote=f"INV-{count:03d}"
                ))
                count += 1

        db.session.commit()
        return jsonify({"message": f"{count-1} exemplaires ajoutés pour {cote}"})
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@app.route('/exemplaires-par-cote/<cote>')
def get_exemplaires_by_cote(cote):
    exemplaires = Exemplaires.query.filter_by(Cote=cote).all()
    return jsonify([{
        'CoteExo': e.CoteExo,
        'Disponible': True  # ممكن تزيد شرط
    } for e in exemplaires])

@app.route('/import-exemplaires')
def import_exemplaires():
    try:
        with open("exeplaire.json", encoding='utf-8') as f:
            data = json.load(f)

        count_added = 0
        for item in data:
            cote = item["Cote"]
            cote_exo = item["CoteExo"]

            # ✅ vérifie si le livre existe
            if InventaireOuvrage.query.get(cote):
                # ✅ vérifie si l'exemplaire existe déjà
                if not Exemplaires.query.get(cote_exo):
                    ex = Exemplaires(
                        CoteExo=cote_exo,
                        Cote=cote,
                        Inv_Cote=f"INV-{cote_exo}"
                    )
                    db.session.add(ex)
                    count_added += 1

        db.session.commit()
        return jsonify({"message": f"{count_added} exemplaires ajoutés avec succès ✅"}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500
    
@app.route('/prets', methods=['GET'])
def get_prets():
    try:
        prets = Prets.query.all()
        result = []
        for p in prets:
            result.append({
                'Mat': p.Mat,
                'CoteExo': p.CoteExo,
                'DatePret': p.DatePret.strftime('%Y-%m-%d') if p.DatePret else '',
                'DateRetour': p.DateRetour.strftime('%Y-%m-%d') if p.DateRetour else '',
                'Statut': p.Statut,
                'EtatLivre': p.EtatLivre
            })
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

from flask import request

@app.route('/prets/<mat>/<cote_exo>', methods=['PUT'])
def update_etat_livre(mat, cote_exo):
    try:
        pret = Prets.query.filter_by(Mat=mat, CoteExo=cote_exo).first()
        if not pret:
            return jsonify({'error': 'Prêt introuvable'}), 404

        data = request.get_json()
        etat = data.get('EtatLivre')

        if etat not in ['bon', 'abîmé']:
            return jsonify({'error': 'Valeur EtatLivre invalide'}), 400

        pret.EtatLivre = etat
        db.session.commit()

        return jsonify({'message': 'État du livre mis à jour avec succès.'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/dashboard-stats')
def dashboard_stats():
    try:
        today = datetime.now().date()
        past_28 = today - timedelta(days=28)

        # 🔹 Réservations (28 derniers jours)
        reservations = ReservationOuvrage.query.filter(ReservationOuvrage.DateReserv >= past_28).all()
        stats_res = {'en_attente': 0, 'reserve': 0, 'annulée': 0}

        for r in reservations:
            if r.Status == 'en attente':
                stats_res['en_attente'] += 1
            elif r.Status == 'réservé':
                stats_res['reserve'] += 1
            elif r.Status == 'annulée':
                stats_res['annulée'] += 1

        # 🔹 Livres rendus (état)
        prets = Prets.query.filter(Prets.DatePret >= past_28).all()
        etats = {'bon': 0, 'abime': 0}

        for p in prets:
            if p.EtatLivre == 'bon':
                etats['bon'] += 1
            elif p.EtatLivre == 'abîmé':
                etats['abime'] += 1

        # 🔹 Compteurs globaux
        total_livres = InventaireOuvrage.query.count()
        total_stagiaires = Emprunteur.query.filter_by(TypeEmploye='stagiaire').count()
        total_formateurs = Emprunteur.query.filter_by(TypeEmploye='formateur').count()
        total_reservations = ReservationOuvrage.query.count()
        total_besoins = BesoinLivre.query.count()

        return jsonify({
            'reservations': stats_res,
            'rendu': etats,
            'counters': {
                'livres': total_livres,
                'stagiaires': total_stagiaires,
                'formateurs': total_formateurs,
                'reservations': total_reservations,
                'besoins': total_besoins
            }
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/prets/retour/<mat>/<cote_exo>', methods=['PUT'])
def retour_livre(mat, cote_exo):
    try:
        pret = Prets.query.filter_by(Mat=mat, CoteExo=cote_exo).first()
        if not pret:
            return jsonify({'error': 'Prêt introuvable'}), 404

        pret.DateRetour = datetime.now().date()
        pret.Statut = 'rendu'
        db.session.commit()

        return jsonify({'message': 'Retour confirmé avec succès.'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
    
# ---------------------- RECUS PDF ----------------------

@cross_origin()
@app.route('/generate-pdf/<mat>/<cote_exo>', methods=['GET'])
def generate_reservation_pdf(mat, cote_exo):
    try:
        from reportlab.lib.pagesizes import A4
        from reportlab.pdfgen import canvas
        from reportlab.platypus import Table, TableStyle
        from reportlab.lib import colors
        import os

        res = db.session.query(
            ReservationOuvrage,
            Emprunteur,
            Prets.DateRetourPrevue
        ).join(
            Emprunteur, ReservationOuvrage.Mat == Emprunteur.Mat
        ).outerjoin(
            Prets,
            (ReservationOuvrage.Mat == Prets.Mat) & 
            (ReservationOuvrage.CoteExo == Prets.CoteExo)
        ).filter(
            ReservationOuvrage.Mat == mat,
            ReservationOuvrage.CoteExo == cote_exo,
            ReservationOuvrage.Status == 'réservé'
        ).first()

        if not res:
            return jsonify({'error': 'Réservation non trouvée ou non confirmée'}), 404

        reservation, user, retour = res
        logo_path = "static/logos/ofppt.png"
        output_path = f"static/recus/recu_{cote_exo}.pdf"

        c = canvas.Canvas(output_path, pagesize=A4)
        width, height = A4

        # ✅ Zone blanche + logo bien placé
        c.setFillColor(colors.white)
        c.rect(width - 180, height - 80, 120, 50, fill=1, stroke=0)
        if os.path.exists(logo_path):
            c.drawImage(logo_path, width - 175, height - 75, width=100, height=40, mask='auto')

        # ✅ Titre
        c.setFont("Helvetica-Bold", 16)
        c.setFillColor(colors.darkblue)
        c.drawString(50, height - 50, "📚 Bibliothèque - ISTA OFPPT Taza")
        c.setStrokeColor(colors.grey)
        c.line(50, height - 55, width - 50, height - 55)

        # ✅ Données
        c.setFont("Helvetica-Bold", 13)
        c.setFillColor(colors.darkblue)
        c.drawString(50, 720, "Reçu de Réservation")

        data = [
            ["Nom complet", f"{user.Nom} {user.Prenom}"],
            ["Matricule", user.Mat],
            ["Cote de l’ouvrage", reservation.CoteExo],
            ["Date de réservation", reservation.DateReserv.strftime('%Y-%m-%d')],
            ["Date retour prévue", retour.strftime('%Y-%m-%d') if retour else "---"],
        ]

        if getattr(user, "TypeEmploye", "").lower() == "stagiaire":
            if getattr(user, "CodeFil", ""):
                data.append(["Filière", user.CodeFil])
            if getattr(user, "Groupe", ""):
                data.append(["Groupe", user.Groupe])

        table = Table(data, colWidths=[180, 300])
        table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.whitesmoke),
            ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
            ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 0), (-1, -1), 12),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
            ('GRID', (0, 0), (-1, -1), 0.25, colors.grey),
        ]))

        table.wrapOn(c, width, height)
        table.drawOn(c, 50, 560)

        c.setFont("Helvetica", 10)
        c.setFillColor(colors.grey)
        c.drawString(50, 100, "Merci de respecter les délais de retour.")
        c.drawString(50, 85, "Ce reçu est généré automatiquement.")
        c.drawString(width - 250, 85, "Signature Bibliothécaire : ................")

        c.save()

        return send_file(output_path, download_name=f"recu_{cote_exo}.pdf", as_attachment=True)

    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({'error': f"Erreur PDF: {str(e)}"}), 500
    


# ---------------------- UPDATE AVATAR --------------

@app.route('/update-avatar', methods=['POST'])
def update_avatar():
    try:
        # 📩 Debug pour voir le contenu du POST
        print("📩 request.form:", request.form)
        print("📎 request.files:", request.files)

        mat = request.form.get('mat')
        file = request.files.get('photo')

        if not mat or not file:
            print("❌ Champs manquants")
            return jsonify({'error': 'Champs requis manquants'}), 400

        # 🗂️ Assurez-vous que le dossier existe
        upload_folder = "static/profil-icons"
        os.makedirs(upload_folder, exist_ok=True)

        # 📂 Nom et chemin du fichier
        filename = secure_filename(file.filename)
        save_path = os.path.join(upload_folder, filename)

        # 💾 Sauvegarde
        file.save(save_path)
        print(f"📥 Fichier sauvegardé: {save_path}")

        # 🧍‍♂️ Récupération de l'utilisateur
        user = Emprunteur.query.get(mat)
        if not user:
            print("❌ Utilisateur introuvable:", mat)
            return jsonify({'error': 'Utilisateur introuvable'}), 404

        # 🧹 Suppression ancienne image
        if user.Photo:
            old_path = os.path.join(upload_folder, user.Photo)
            if os.path.exists(old_path):
                os.remove(old_path)
                print(f"🗑️ Ancienne image supprimée: {user.Photo}")

        # 🖼️ Mise à jour dans la DB
        user.Photo = filename
        db.session.commit()

        print(f"✅ Photo mise à jour pour {mat}: {filename}")
        return jsonify({'message': '✅ Photo mise à jour avec succès', 'photo': filename}), 200

    except Exception as e:
        import traceback
        traceback.print_exc()
        db.session.rollback()
        print("🔥 Erreur serveur:", str(e))
        return jsonify({'error': str(e)}), 500

# ----------------------SECTEUR -----------------------------
@app.route('/secteurs')
def get_secteurs():
    try:
        secteurs = Secteur.query.all()
        return jsonify([
            {'CodeSec': s.CodeSec, 'LibelleSec': s.LibelleSec}
            for s in secteurs
        ])
    except Exception as e:
        return jsonify({'error': str(e)}), 500

    

@app.route('/soussecteurs/<code_sec>')
def get_soussecteurs(code_sec):
    try:
        soussecteurs = SousSecteur.query.filter_by(CodeSec=code_sec).all()
        return jsonify([
            {'CodeSousSec': s.CodeSousSec, 'LibelleSousSec': s.LibelleSousSec}
            for s in soussecteurs
        ])
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    

@app.route('/secteurs', methods=['POST'])
def add_secteur():
    try:
        data = request.get_json()
        new_sec = Secteur(
            CodeSec=data['CodeSec'],
            LibelleSec=data['LibelleSec']
        )
        db.session.add(new_sec)
        db.session.commit()
        return jsonify({'message': '✅ Secteur ajouté'}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/soussecteurs', methods=['POST'])
def add_sous_secteur():
    try:
        data = request.get_json()
        print("DATA:", data)
        new_ss = SousSecteur(
            CodeSousSec=data['CodeSousSec'],
            LibelleSousSec=data['LibelleSousSec'],
            CodeSec=data['CodeSec']  # مهم جداً هذا يكون موجود
        )
        db.session.add(new_ss)
        db.session.commit()
        return jsonify({'message': '✅ Sous-secteur ajouté'}), 201
    except Exception as e:
        print("DATA:", data)
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@app.route('/secteurs/<code_sec>', methods=['DELETE'])
def delete_secteur(code_sec):
    try:
        secteur = Secteur.query.get(code_sec)
        if not secteur:
            return jsonify({'error': 'Secteur introuvable'}), 404

        db.session.delete(secteur)
        db.session.commit()
        return jsonify({'message': 'Secteur supprimé ✅'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/soussecteurs/<code_sous_sec>', methods=['DELETE'])
def delete_sous_secteur(code_sous_sec):
    try:
        sous_secteur = SousSecteur.query.get(code_sous_sec)
        if not sous_secteur:
            return jsonify({'error': 'Sous-secteur introuvable'}), 404

        db.session.delete(sous_secteur)
        db.session.commit()
        return jsonify({'message': 'Sous-secteur supprimé ✅'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# ---------------------- MAIN ----------------------
if __name__ == '__main__':
    with app.app_context():
        try:
            # ✅ Importer utilisateurs depuis users.json
            with open('users.json', encoding='utf-8') as f:
                users = json.load(f)

            for user in users:
                if Emprunteur.query.get(user['Numéro stagiaire']):
                    continue

                new_user = Emprunteur(
                    Mat=user['Numéro stagiaire'],
                    Nom=user['Nom'],
                    Prenom=user['Prénom'],
                    CodeFil=user.get('Code Filière', ''),
                    Niveau=user.get('Niveau', ''),
                    Groupe=user.get('Groupe', ''),
                    Anincription=datetime.now(),
                    TypeEmploye=user.get('Role', 'stagiaire'),
                    Motdepasse=generate_password_hash(user.get('Date naissance', 'pass123')),
                    Tel=user.get('Numéro téléphone', ''),
                    DateNaissance=user.get('Date naissance', ''),
                    Adresse=user.get('Adresse', ''),
                    Email=user.get('Email', ''),
                    Genre=user.get('Genre', ''),
                    N_Pretes=0
                )
                db.session.add(new_user)

            db.session.commit()
            print("✅ Utilisateurs auto-importés avec succès.")
        except Exception as e:
            print("❌ Erreur d'import automatique utilisateurs:", e)

    app.run(debug=True)
