import os
from datetime import timedelta

class Config:
    # Flask
    SECRET_KEY = os.environ.get("SECRET_KEY", "change-me")
    DEBUG      = os.environ.get("FLASK_ENV") == "development"

    # Banco (Render ou local)
    SQLALCHEMY_DATABASE_URI = (
    os.environ.get("DATABASE_URL") or "sqlite:///ragna_local.db")
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # JWT
    JWT_SECRET_KEY           = os.environ.get("JWT_SECRET_KEY", "jwt-secret")
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=24)
    JWT_TOKEN_LOCATION       = ["cookies"]
    JWT_COOKIE_SECURE = not (os.environ.get("FLASK_ENV") == "development")
    JWT_COOKIE_SAMESITE      = "Lax"
    JWT_COOKIE_CSRF_PROTECT  = False          # simplifica no início

    # E-mail
    MAIL_SERVER          = os.environ.get("MAIL_SERVER", "smtp.gmail.com")
    MAIL_PORT            = int(os.environ.get("MAIL_PORT", 587))
    MAIL_USE_TLS         = os.environ.get("MAIL_USE_TLS", "True") == "True"
    MAIL_USERNAME        = os.environ.get("MAIL_USERNAME")
    MAIL_PASSWORD        = os.environ.get("MAIL_PASSWORD")
    MAIL_DEFAULT_SENDER  = os.environ.get(
        "MAIL_DEFAULT_SENDER",
        "RagnaList <noreply@ragna-list.com>"
    )

    # APIs externas
    DIVINE_PRIDE_API_KEY = os.environ.get("DIVINE_PRIDE_API_KEY")
