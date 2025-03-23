from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from flask_cors import CORS
import requests

# Configuración inicial de la aplicación
app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///users.db'
app.config['JWT_SECRET_KEY'] = 'your_jwt_secret_key'

# Inicialización de extensiones
db = SQLAlchemy(app)
bcrypt = Bcrypt(app)
jwt = JWTManager(app)
CORS(app)

# Modelo de Usuario
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    saved_offers = db.relationship('SavedOffer', backref='user', lazy=True)

# Modelo de Ofertas Guardadas
class SavedOffer(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    position = db.Column(db.String(100), nullable=False)
    company = db.Column(db.String(100), nullable=False)
    url = db.Column(db.String(200), nullable=False)
    tags = db.Column(db.String(200))  # Tags separados por comas

# Middleware para configurar encabezados
@app.after_request
def after_request(response):
    response.headers['Access-Control-Allow-Origin'] = 'http://localhost:3000'
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
    return response

# Ruta para obtener trabajos desde Remote OK
@app.route('/api/jobs', methods=['GET'])
def get_jobs():
    try:
        response = requests.get("https://remoteok.io/api")  # Llama a la API de Remote OK
        response.raise_for_status()  # Verifica que no haya errores
        jobs = response.json()  # Procesa los datos de la API externa
        return jsonify(jobs), 200  # Devuelve los datos al frontend
    except requests.exceptions.RequestException as e:
        return jsonify({'error': str(e)}), 500  # Maneja errores

# Ruta para registrar usuarios
@app.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()
    hashed_password = bcrypt.generate_password_hash(data['password']).decode('utf-8')
    new_user = User(username=data['username'], password=hashed_password)
    db.session.add(new_user)
    db.session.commit()
    return jsonify({'message': 'Usuario registrado exitosamente'}), 201

# Ruta para iniciar sesión
@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    user = User.query.filter_by(username=data['username']).first()
    if user and bcrypt.check_password_hash(user.password, data['password']):
        access_token = create_access_token(identity={'id': user.id, 'username': user.username})
        return jsonify({'token': access_token}), 200
    return jsonify({'message': 'Credenciales inválidas'}), 401

# Ruta para guardar una oferta
@app.route('/api/save-offer', methods=['POST'])
@jwt_required()
def save_offer():
    current_user = get_jwt_identity()  # Usuario autenticado a través del token
    data = request.get_json()

    # Validar campos obligatorios
    if not data.get('position') or not data.get('company') or not data.get('url'):
        return jsonify({'error': 'Faltan datos requeridos: posición, compañía o URL.'}), 400

    try:
        # Crear una nueva oferta guardada
        new_offer = SavedOffer(
            user_id=current_user['id'],
            position=data['position'],
            company=data['company'],
            url=data['url'],
            tags=','.join(data.get('tags', [])) if data.get('tags') else ''
        )
        db.session.add(new_offer)
        db.session.commit()
        return jsonify({'message': 'Oferta guardada exitosamente'}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Ruta para obtener ofertas guardadas
@app.route('/api/saved-offers', methods=['GET'])
@jwt_required()
def get_saved_offers():
    current_user = get_jwt_identity()  # Usuario autenticado a través del token
    try:
        saved_offers = SavedOffer.query.filter_by(user_id=current_user['id']).all()
        return jsonify([
            {
                'id': offer.id,
                'position': offer.position,
                'company': offer.company,
                'url': offer.url,
                'tags': offer.tags.split(',') if offer.tags else []
            } for offer in saved_offers
        ]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Iniciar la aplicación
if __name__ == '__main__':
    app.run(debug=True)
