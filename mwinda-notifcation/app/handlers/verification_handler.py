from app.services.email_service import EmailService
from app.services.template_service import TemplateService

class VerificationHandler:
    def handle(self, message):
        try:
            print(f"[INFO] Traitement du message dans VerificationHandler : {message}")
            email = message.get('email')
            reset_code = message.get('reset_code')

            template_data = {
                'reset_code': reset_code,
                'email': email
            }

            if not email or not reset_code:
                print(f"[ERREUR] Données manquantes dans le message : {email}")
                return

            print(f"[DEBUG] Données extraites - email: {email}, data: {reset_code}")

            # Générer l'e-mail avec le template Mustache
            template = TemplateService.render_template('verification', template_data)
            print(f"[DEBUG] Template généré : {template}")

            # Envoyer l'e-mail via SMTP
            EmailService.send_email(email, 'Code de Vérification', template)
            print(f"[INFO] E-mail envoyé à {email} avec succès.")
        except Exception as e:
            print(f"[ERREUR] Erreur dans VerificationHandler : {e}")