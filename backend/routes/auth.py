from flask import Blueprint, request, jsonify
from flask_jwt_extended import (
    create_access_token, jwt_required,
    set_access_cookies, unset_jwt_cookies, get_jwt_identity,verify_jwt_in_request
)
from flask_jwt_extended.exceptions import NoAuthorizationError
from itsdangerous import URLSafeTimedSerializer, BadSignature, SignatureExpired
from extensions import db, mail               
from models import User
from flask_mail import Message
from config import Config

bp = Blueprint("auth", __name__)

# –– Helpers --------------------------------------------------
def get_serializer():
    return URLSafeTimedSerializer(Config.SECRET_KEY, salt="pwd-reset")

def send_reset_email(user: User, token: str):
    msg = Message(
        subject="RagnaList – Redefinição de senha",
        recipients=[user.email],
        body=f"Use este token para redefinir sua senha (30 min de validade):\n\n{token}"
    )
    mail.send(msg)

# –– Rotas ----------------------------------------------------
@bp.post("/register")
def register():
    data = request.get_json() or {}
    email = data.get("email", "").lower()
    password = data.get("password")

    if not email or not password:
        return {"msg": "Email e senha obrigatórios"}, 400

    if User.query.filter_by(email=email).first():
        return {"msg": "Usuário já existe"}, 409

    user = User(email=email)
    user.set_password(password)
    db.session.add(user)
    db.session.commit()

    return {"msg": "Cadastro realizado"}, 201


@bp.post("/login")
def login():
    data = request.get_json() or {}
    email = data.get("email", "").lower()
    password = data.get("password")

    user = User.query.filter_by(email=email).first()
    if not user or not user.check_password(password):
        return {"msg": "Credenciais inválidas"}, 401

    token = create_access_token(identity=user.id)
    resp = jsonify({"msg": "Login ok"})
    set_access_cookies(resp, token, max_age=86400)
    return resp, 200


@bp.post("/logout")
@jwt_required()
def logout():
    resp = jsonify({"msg": "Logout"})
    unset_jwt_cookies(resp)
    return resp, 200


@bp.post("/password-reset-request")
def pwd_reset_request():
    data = request.get_json() or {}
    email = data.get("email", "").lower()

    user = User.query.filter_by(email=email).first()
    if user:
        token = get_serializer().dumps({"uid": user.id})
        send_reset_email(user, token)
    # resposta genérica
    return {"msg": "Se existir, enviaremos o email"}, 200


@bp.post("/password-reset-confirm")
def pwd_reset_confirm():
    data = request.get_json() or {}
    token = data.get("token")
    new_password = data.get("password")

    s = get_serializer()
    try:
        payload = s.loads(token, max_age=1800)  # 30 min
    except SignatureExpired:
        return {"msg": "Token expirado"}, 400
    except BadSignature:
        return {"msg": "Token inválido"}, 400

    user = User.query.get(payload["uid"])
    if not user:
        return {"msg": "Usuário não encontrado"}, 404

    user.set_password(new_password)
    db.session.commit()
    return {"msg": "Senha redefinida"}, 200


@bp.get("/ping")
def ping():
    """
    Sempre devolve 200.
    - Se o cookie JWT existir e for válido → devolve dados do usuário.
    - Caso contrário → devolve {"user": None}.
    Nenhum decorator JWT é usado, então não sairão 401/422 automáticos.
    """
    uid = None
    try:
        verify_jwt_in_request()   # tenta validar; se não houver ou for inválido, dispara exceção
        uid = get_jwt_identity()
    except Exception:
        pass                      # ignora faltas/erros de token

    if not uid:
        return {"user": None}, 200

    user = User.query.get(uid)
    if not user:
        return {"user": None}, 200

    return {"user": {"id": user.id, "email": user.email}}, 200
    try:
        # tenta ler o cookie; se não houver, apenas continua
        verify_jwt_in_request(optional=True)      # não levanta se versão nova
    except NoAuthorizationError:
        pass                                      # versões antigas levantam – ignoramos

    uid = get_jwt_identity()                      # None se não logado
    if not uid:
        return {"user": None}, 200

    user = User.query.get(uid)
    if not user:
        return {"user": None}, 200

    return {"user": {"id": user.id, "email": user.email}}, 200
    verify_jwt_in_request(optional=True)      # não gera erro se não houver
    uid = get_jwt_identity()              # None caso sem cookie
    if not uid:
        return {"user": None}, 200

    user = User.query.get(uid)
    return {"user": {"id": user.id, "email": user.email}}, 200