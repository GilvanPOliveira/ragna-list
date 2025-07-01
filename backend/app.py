from flask import Flask
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_mail import Mail
from flask_jwt_extended import JWTManager
from config import Config

db  = SQLAlchemy()
mg  = Migrate()
mail = Mail()
jwt  = JWTManager()

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # –– Extensões ––
    CORS(app, supports_credentials=True)
    db.init_app(app)
    mg.init_app(app, db)
    mail.init_app(app)
    jwt.init_app(app)

    # –– Blueprints ––
    from routes.auth import bp as auth_bp
    app.register_blueprint(auth_bp, url_prefix="/api/auth")

    # rota simples
    @app.route("/")
    def index():
        return {"status": "RagnaList Backend online"}

    return app

# para gunicorn
app = create_app()

if __name__ == "__main__":
    # útil para rodar local
    app.run(host="0.0.0.0", port=5000, debug=app.config["DEBUG"])
