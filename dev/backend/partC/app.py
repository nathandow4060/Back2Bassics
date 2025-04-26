from flask import Flask
from flask_cors import CORS
from routes.albums import albums_bp
from routes.auth import auth_bp
from routes.artist import artist_bp
from routes.listener import listener_bp
from routes.landing import landing_bp 
from routes.search  import search_bp
from routes.tracks import tracks_bp
from routes.follows import follows_bp

app = Flask(__name__)
CORS(app)

# Register routes
app.register_blueprint(albums_bp)
app.register_blueprint(auth_bp)
app.register_blueprint(artist_bp)
app.register_blueprint(listener_bp)
app.register_blueprint(landing_bp) 
app.register_blueprint(search_bp)
app.register_blueprint(tracks_bp)
app.register_blueprint(follows_bp)

if __name__ == '__main__':
    app.run(debug=True)
