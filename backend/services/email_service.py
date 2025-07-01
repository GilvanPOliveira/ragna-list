from flask_mail import Message
from app import mail, app

def send_mail(subject, recipients, body):
    if app.config["DEBUG"]:
        print("[MAIL]", recipients, body)
        return
    msg = Message(subject=subject, recipients=recipients, body=body)
    mail.send(msg)
