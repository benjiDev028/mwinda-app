import os

class RabbitMQConfig:
    RABBITMQ_HOST = os.getenv('RABBITMQ_HOST', 'localhost')
    RABBITMQ_PORT = int(os.getenv('RABBITMQ_PORT', 5672))
    RABBITMQ_USER = os.getenv('RABBITMQ_USER', 'guest')
    RABBITMQ_PASSWORD = os.getenv('RABBITMQ_PASSWORD', 'guest')
    # Configuration des queues
    QUEUES = {
        'welcome': 'welcome_queue',
        'verification': 'reset_password_queue',
        'success': 'success_queue',
        'activate_compte':'activate_compte_queue',
        'update_password':'update_password_queue',
        'earn_point':'earn_point_queue',
        'add_point':'add_point_queue'
    }

class SMTPConfig:
    SMTP_HOST = os.getenv('SMTP_HOST', 'smtp.gmail.com')
    SMTP_PORT = int(os.getenv('SMTP_PORT', 587))
    SMTP_USER = os.getenv('SMTP_USER', 'faithtravel00243@gmail.com')
    SMTP_PASSWORD = os.getenv('SMTP_PASSWORD', 'fpilyokjilhqncmt')