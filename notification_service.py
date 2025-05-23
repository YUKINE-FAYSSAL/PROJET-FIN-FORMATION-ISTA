from kafka import KafkaConsumer
import json
from app import app, db
from models.notification import Notification
from models.emprunteur import Emprunteur
from datetime import datetime

# ✅ Consommateur Kafka
consumer = KafkaConsumer(
    'reservation-topic',
    bootstrap_servers='localhost:9092',
    group_id='notification-group',
    value_deserializer=lambda x: json.loads(x.decode('utf-8'))
)

print("🟢 Notification Service running...")

with app.app_context():
    for message in consumer:
        data = message.value
        mat = data.get('mat')
        cote_exo = data.get('cote_exo', '')
        msg_type = data.get('type')

        user = Emprunteur.query.get(mat)
        nom = f"{user.Prenom} {user.Nom}" if user else f"Utilisateur {mat}"

        # 🔔 Message personnalisé selon le type
        if msg_type == 'reservation_created':
            message_text = f"{nom} a demandé la réservation de {cote_exo}"

        elif msg_type == 'reservation_validated':
            message_text = f"La réservation de {cote_exo} a été acceptée pour {nom}"

        elif msg_type == 'reservation_cancelled':
            message_text = f"La réservation de {cote_exo} a été annulée pour {nom}"

        elif msg_type == 'retour_urgent':
            message_text = data.get('message', f"📢 Rappel : retour de {cote_exo} demandé.")
        
        elif msg_type == 'besoin_ajoute':
            message_text = f"✅ Votre besoin a été ajouté au catalogue ({cote_exo})."

        else:
            print(f"❌ Type inconnu ignoré: {msg_type}")
            continue

        notif = Notification(
            Mat=mat,
            CoteExo=cote_exo,
            Date=datetime.now(),
            Message=message_text
        )
        db.session.add(notif)
        db.session.commit()
        print(f"🔔 Notification enregistrée: {message_text}")
