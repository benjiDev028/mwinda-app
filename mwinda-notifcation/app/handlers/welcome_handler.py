from app.services.email_service import EmailService
from app.services.template_service import TemplateService

class WelcomeHandler:
    def handle(self, message):
        try:
            print(f"[INFO] Traitement du message dans WelcomeHandler : {message}")
            email = message.get('email')
            data = message.get('data')

            if not email or not data:
                print(f"[ERREUR] Données manquantes dans le message : {message}")
                return

            print(f"[DEBUG] Données extraites - email: {email}, data: {data}")

            # Générer l'e-mail avec le template Mustache
            template = TemplateService.render_template('welcome', data)
            print(f"[DEBUG] Template généré : {template}")

            # Envoyer l'e-mail via SMTP
            EmailService.send_email(email, 'Bienvenue', template)
            print(f"[INFO] E-mail envoyé à {email} avec succès.")
        except Exception as e:
            print(f"[ERREUR] Erreur dans WelcomeHandler : {e}")