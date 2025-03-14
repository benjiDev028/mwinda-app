import pika
import json
import threading
from app.config import RabbitMQConfig

class RabbitMQConsumer(threading.Thread):
    def __init__(self, queue_name, handler):
        super().__init__()
        self.queue_name = queue_name
        self.handler = handler
        try:
            # Connexion à RabbitMQ
            self.connection = pika.BlockingConnection(
                pika.ConnectionParameters(
                    host=RabbitMQConfig.RABBITMQ_HOST,
                    port=RabbitMQConfig.RABBITMQ_PORT,
                    credentials=pika.PlainCredentials(
                        RabbitMQConfig.RABBITMQ_USER,
                        RabbitMQConfig.RABBITMQ_PASSWORD
                    )
                )
            )
            self.channel = self.connection.channel()
            print(f"[INFO] Connexion à RabbitMQ établie pour la queue {self.queue_name}.")
        except Exception as e:
            print(f"[ERREUR] Échec de la connexion à RabbitMQ : {e}")
            raise

    def run(self):
        try:
            # Déclarer la queue
            self.channel.queue_declare(
                queue=RabbitMQConfig.QUEUES[self.queue_name],
                durable=True,
                auto_delete=False
            )
            print(f"[INFO] Queue {RabbitMQConfig.QUEUES[self.queue_name]} déclarée avec succès.")

            # Fonction de rappel pour traiter les messages
            def callback(ch, method, properties, body):
                try:
                    print(f"[DEBUG] Message brut reçu : {body}")  # Log du message brut
                    message = json.loads(body)
                    print(f"[INFO] Message décodé dans la queue {self.queue_name}: {message}")
                    self.handler.handle(message)
                    ch.basic_ack(delivery_tag=method.delivery_tag)
                except json.JSONDecodeError as e:
                    print(f"[ERREUR] Erreur de décodage JSON : {e}")
                except Exception as e:
                    print(f"[ERREUR] Erreur lors du traitement du message : {e}")

            # Démarrer l'écoute de la queue
            self.channel.basic_consume(queue=RabbitMQConfig.QUEUES[self.queue_name], on_message_callback=callback)
            print(f"En attente de messages dans la queue {self.queue_name}...")
            self.channel.start_consuming()
        except Exception as e:
            print(f"[ERREUR] Erreur dans RabbitMQConsumer : {e}")