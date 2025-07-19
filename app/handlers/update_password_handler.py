from app.services.email_service import EmailService
from app.services.template_service import TemplateService

class UpdateHandler:
    def handle(self, message):
        try:
            print(f"[INFO] Traitement du message dans update password de Handler : {message}")
            email = message.get('email')
            firstname = message.get('first_name')
            lastname = message.get('last_name')

            template_data = {
                'firstname': firstname,
                'lastname': lastname,
                'email': email
            }

            if not email or not lastname or not firstname:
                print(f"[ERREUR] Données manquantes dans le message : {email},{firstname},{lastname}")
                return

            print(f"[DEBUG] Données extraites - email: {email}, data: {template_data}")

            # Générer l'e-mail avec le template Mustache
            template = TemplateService.render_template('update_password', template_data)
            print(f"[DEBUG] Template généré : {template}")

            # Envoyer l'e-mail via SMTP
            EmailService.send_email(email, 'C', template)
            print(f"[INFO] E-mail envoyé à {email} avec succès.")
        except Exception as e:
            print(f"[ERREUR] Erreur dans Update_passwordHandler : {e}")