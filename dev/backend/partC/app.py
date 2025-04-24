from flask import Flask, jsonify
from flask_cors import CORS
import sqlite3
import os

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

BASE_DIR = os.path.dirname(__file__)
DB_FILE = os.path.join(BASE_DIR, 'back2bassics.db')

def get_db_connection():
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    return conn

# --- Album routes ---

@app.route('/api/album/<int:album_id>', methods=['GET'])
def get_album(album_id):
    print("⏳ Fetching album info for album:", album_id)
    conn = get_db_connection()

    try:
        album = conn.execute('SELECT * FROM Album WHERE Album_ID = ?', (album_id,)).fetchone()
        if album is None:
            conn.close()
            print("❌ Album not found.")
            return jsonify({'error': 'Album not found'}), 404

        album_dict = dict(album)

        # Derive artist tag
        first_track = conn.execute(
            'SELECT Track_ID FROM Track WHERE Album_ID = ? ORDER BY Track_ID ASC LIMIT 1',
            (album_id,)
        ).fetchone()

        artist_tag = "Unknown"
        if first_track:
            track_id = first_track["Track_ID"]
            artist_row = conn.execute(
                'SELECT Artist_Tag FROM Writes WHERE Track_ID = ? LIMIT 1',
                (track_id,)
            ).fetchone()
            if artist_row:
                artist_tag = artist_row["Artist_Tag"]

        album_dict["Artist_Tag"] = artist_tag

        # Like count
        try:
            like_count = conn.execute('''
                SELECT COUNT(*) AS count
                FROM Likes
                JOIN Interaction ON Likes.Interaction_ID = Interaction.Interaction_ID
                WHERE Interaction.Album_ID = ?
            ''', (album_id,)).fetchone()["count"]
        except Exception as e:
            print("⚠️ Like Count Error:", e)
            like_count = 0

        album_dict["Like_Count"] = like_count

        # Average rating
        try:
            avg_rating_row = conn.execute('''
                SELECT AVG(Rating) AS avg_rating
                FROM Rating
                JOIN Interaction ON Rating.Interaction_ID = Interaction.Interaction_ID
                WHERE Interaction.Album_ID = ?
            ''', (album_id,)).fetchone()
            avg_rating = round(avg_rating_row["avg_rating"], 2) if avg_rating_row and avg_rating_row["avg_rating"] is not None else None
        except Exception as e:
            print("⚠️ Avg Rating Error:", e)
            avg_rating = None

        album_dict["Avg_Rating"] = avg_rating

        print("✅ Album response:", album_dict)
        conn.close()
        return jsonify(album_dict)

    except Exception as e:
        print("🔥 Album fetch failed:", e)
        conn.close()
        return jsonify({'error': 'Internal Server Error'}), 500




@app.route('/api/album/<int:album_id>/tracks', methods=['GET'])
def get_album_tracks(album_id):
    conn = get_db_connection()
    tracks = conn.execute('SELECT * FROM Track WHERE Album_ID = ?', (album_id,)).fetchall()
    conn.close()
    return jsonify([dict(track) for track in tracks])

# --- Artist routes ---

@app.route('/api/artist/<int:artist_id>', methods=['GET'])
def get_artist(artist_id):
    conn = get_db_connection()
    artist = conn.execute('SELECT * FROM Artist WHERE Artist_ID = ?', (artist_id,)).fetchone()
    conn.close()
    if artist is None:
        return jsonify({'error': 'Artist not found'}), 404
    return jsonify(dict(artist))

@app.route('/api/artist/<int:artist_id>/albums', methods=['GET'])
def get_artist_albums(artist_id):
    conn = get_db_connection()
    albums = conn.execute('SELECT * FROM Album WHERE Artist_ID = ?', (artist_id,)).fetchall()
    conn.close()
    return jsonify([dict(album) for album in albums])

@app.route('/api/artist/<int:artist_id>/tracks', methods=['GET'])
def get_artist_tracks(artist_id):
    conn = get_db_connection()
    tracks = conn.execute('SELECT * FROM Track WHERE Artist_ID = ?', (artist_id,)).fetchall()
    conn.close()
    return jsonify([dict(track) for track in tracks])

# --- User routes ---

@app.route('/api/user/<tag>', methods=['GET'])
def get_user_profile(tag):
    conn = get_db_connection()
    user = conn.execute('SELECT * FROM Listener WHERE Tag = ?', (tag,)).fetchone()
    conn.close()
    if user is None:
        return jsonify({'error': 'User not found'}), 404
    return jsonify(dict(user))

# --- Top content routes ---

@app.route('/api/top-albums', methods=['GET'])
def get_top_albums():
    conn = get_db_connection()
    albums = conn.execute('SELECT * FROM Album ORDER BY Avg_Rating DESC LIMIT 100').fetchall()
    conn.close()
    return jsonify([dict(album) for album in albums])

@app.route('/api/top-artists', methods=['GET'])
def get_top_artists():
    conn = get_db_connection()
    artists = conn.execute('SELECT * FROM Artist ORDER BY Popularity DESC LIMIT 100').fetchall()
    conn.close()
    return jsonify([dict(artist) for artist in artists])

@app.route('/api/top-songs', methods=['GET'])
def get_top_songs():
    conn = get_db_connection()
    songs = conn.execute('SELECT * FROM Track ORDER BY Avg_Rating DESC LIMIT 100').fetchall()
    conn.close()
    return jsonify([dict(song) for song in songs])

if __name__ == '__main__':
    app.run(debug=True)
