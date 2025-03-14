from app.services.queue_service import RabbitMQConsumer
from app.handlers.welcome_handler import WelcomeHandler
from app.handlers.verification_handler import VerificationHandler
from app.handlers.success_handler import SuccessHandler
from app.handlers.activate_compte_handler import ActivateHandler

def main():
    # Associer chaque queue à son handler
    handlers = {
        'welcome': WelcomeHandler(),
        'verification': VerificationHandler(),
        'success': SuccessHandler(),
        'activate_compte':ActivateHandler()
    }

    # Démarrer un consumer pour chaque queue
    consumers = []
    for queue_name, handler in handlers.items():
        try:
            consumer = RabbitMQConsumer(queue_name, handler)
            consumer.start()  # Démarrer le thread
            consumers.append(consumer)
            print(f"[INFO] Consumer démarré pour la queue {queue_name}.")
        except Exception as e:
            print(f"[ERREUR] Échec du démarrage du consumer pour la queue {queue_name} : {e}")

    # Attendre que tous les threads se terminent (ne se produira jamais ici)
    for consumer in consumers:
        consumer.join()

if __name__ == "__main__":
    main()