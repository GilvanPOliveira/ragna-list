from dotenv import load_dotenv
load_dotenv()

from flask import Flask
from flask_cors import CORS
from config import Config
from extensions import db, mg, mail, jwt    # <<== AQUI

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Extensões
    CORS(app, supports_credentials=True)
    db.init_app(app)
    mg.init_app(app, db)
    mail.init_app(app)
    jwt.init_app(app)

    # Blueprints
    from routes.auth import bp as auth_bp
    app.register_blueprint(auth_bp, url_prefix="/api/auth")

    @app.route("/")
    def index():
        return {"status": "RagnaList Backend online"}

    return app

app = create_app()

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=app.config["DEBUG"])
