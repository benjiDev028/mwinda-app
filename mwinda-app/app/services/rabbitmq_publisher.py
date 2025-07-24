import pika
from app.db.schemas import PointsThresholdNotification
from uuid import UUID
import json

def send_threshold_reached_notification(user_id: UUID,pourcentage , current_points: int, threshold: int, reference : str):
    try:
        # Connexion à RabbitMQ
        connection = pika.BlockingConnection(pika.ConnectionParameters('localhost'))
        channel = connection.channel()

        # Déclarer une file d'attente durable
        channel.queue_declare(queue='points_threshold_reached', durable=True)
        if reference == "Studio":
            if(current_points >= 5000):
                message=f"L'utilisateur {user_id} a droit à un service gratuit en {reference} "
        else:
            if(current_points >= 40000):
                message=f"L'utilisateur {user_id} a droit à un service gratuit en {reference}"


        if (pourcentage >= 1):
            message=f"L'utilisateur {user_id} a atteint  le seuil de points en {reference} "
        else:
            message=f"L'utilisateur {user_id} a atteint {int(pourcentage*100)}% du seuil de {threshold} points en {reference} "


        # Créer le message de notification
        message_data = PointsThresholdNotification(
            user_id=user_id,
            current_points=current_points,
            threshold=threshold,
            message= message,
            
            
        )
        
        message_json = message_data.json()

        # Publier le message
        channel.basic_publish(
            exchange='',
            routing_key='points_threshold_reached',  # Nom de la file d'attente
            body=message_json,
            properties=pika.BasicProperties(
                delivery_mode=2,  # Persistance du message
            )
        )
        
        print(f"Notification envoyée : {message_json}")
        connection.close()
    except Exception as e:
        print(f"Erreur lors de l'envoi du message : {e}")


##pour le consommateur voit fichier threshold_event_consumer.py