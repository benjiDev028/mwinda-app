from app.services.queue_service import RabbitMQConsumer
from app.handlers.welcome_handler import WelcomeHandler
from app.handlers.verification_handler import VerificationHandler
from app.handlers.success_handler import SuccessHandler
from app.handlers.activate_compte_handler import ActivateHandler
from app.handlers.update_password_handler import UpdateHandler
from app.handlers.earn_point_handler import EarnHandler
from app.handlers.add_point_handler import AddHandler

def main():
    # Associer chaque queue à son handler
    handlers = {
        'welcome': WelcomeHandler(),
        'verification': VerificationHandler(),
        'success': SuccessHandler(),
        'activate_compte':ActivateHandler(),
        'update_password':UpdateHandler(),
        'earn_point':EarnHandler(),
        'add_point':AddHandler(),

    }

    # Démarrer un con
    # sumer pour chaque queue
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