import pika
import json
from pydantic import BaseModel, EmailStr
from uuid import UUID

class PointsThresholdNotification(BaseModel):
    user_id: UUID
    current_points: int
    threshold: int
    message: str


def callback(ch, method, properties, body):
    message = json.loads(body)
    notification = PointsThresholdNotification.parse_obj(message)
    
    # Afficher le message ou effectuer toute autre action (par exemple, envoyer un email)
    print(f"Notification reçue : {notification.message}")
    
    # Accuser réception du message
    ch.basic_ack(delivery_tag=method.delivery_tag)

def start_consumer():
    # Connexion à RabbitMQ (assurez-vous que le service RabbitMQ est en cours d'exécution)
    connection = pika.BlockingConnection(pika.ConnectionParameters('localhost'))
    channel = connection.channel()

    # Déclarer la file d'attente pour garantir qu'elle existe avant de consommer
    channel.queue_declare(queue='points_threshold_reached', durable=True)

    # Consommer les messages
    channel.basic_consume(queue='points_threshold_reached', on_message_callback=callback)
    print('En attente de messages...')
    channel.start_consuming()

start_consumer()

