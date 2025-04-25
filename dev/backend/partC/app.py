from flask import Flask
from flask_cors import CORS
from routes.albums import albums_bp
from routes.auth import auth_bp
from routes.artist import artist_bp

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

# Register routes
app.register_blueprint(albums_bp)
app.register_blueprint(auth_bp)
app.register_blueprint(artist_bp)

if __name__ == '__main__':
    app.run(debug=True)