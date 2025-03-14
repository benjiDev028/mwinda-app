import smtplib
from email.mime.text import MIMEText
from email.utils import formataddr
from app.config import SMTPConfig

class EmailService:
    @staticmethod
    def send_email(to_email, subject, body):
        """
        Envoie un e-mail via SMTP.

        Args:
            to_email (str): L'adresse e-mail du destinataire.
            subject (str): Le sujet de l'e-mail.
            body (str): Le corps de l'e-mail (en HTML ou texte).
        """
        try:
            # Créer le message MIME
            msg = MIMEText(body, 'html')  # Utilisez 'plain' pour du texte brut
            msg['Subject'] = subject
            msg['From'] = formataddr(('Notification Service', SMTPConfig.SMTP_USER))
            msg['To'] = to_email

            # Envoyer l'e-mail via SMTP
            with smtplib.SMTP(SMTPConfig.SMTP_HOST, SMTPConfig.SMTP_PORT) as server:
                server.starttls()  # Activer le chiffrement TLS
                server.login(SMTPConfig.SMTP_USER, SMTPConfig.SMTP_PASSWORD)
                server.send_message(msg)
                print(f"E-mail envoyé à {to_email} avec succès.")
        except Exception as e:
            print(f"Erreur lors de l'envoi de l'e-mail à {to_email}: {e}")