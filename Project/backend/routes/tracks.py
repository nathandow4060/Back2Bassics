from flask import Blueprint, jsonify, request
from db import get_db_connection

tracks_bp = Blueprint("tracks", __name__, url_prefix="/api")

@tracks_bp.route("/track/<int:track_id>", methods=["GET"])
def get_track(track_id):
    conn = get_db_connection()
    cursor = conn.cursor()

    track = cursor.execute("SELECT * FROM Track WHERE Track_ID = ?", (track_id,)).fetchone()

    like_count = cursor.execute('''
        SELECT COUNT(*) AS count
        FROM Likes
        JOIN Interaction ON Likes.Interaction_ID = Interaction.Interaction_ID
        WHERE Interaction.Track_ID = ?
    ''', (track_id,)).fetchone()["count"]

    try:
        avg_rating = cursor.execute('''
            SELECT ROUND(AVG(Rating_Value), 2) AS avg
            FROM Rating
            JOIN Interaction ON Rating.Interaction_ID = Interaction.Interaction_ID
            WHERE Interaction.Track_ID = ?
        ''', (track_id,)).fetchone()["avg"]
    except:
        avg_rating = None

    track_count = cursor.execute("SELECT COUNT(*) FROM Track WHERE Track_ID = ?", (track_id,)).fetchone()[0]
    artist_tag = cursor.execute('''
        SELECT Artist_Tag
        FROM Writes
        WHERE Track_ID = ?
        LIMIT 1
    ''', (track_id,)).fetchone()

    conn.close()

    if track is None:
        return jsonify({"error": "Track not found"}), 404

    track_data = dict(track)
    track_data["Like_Count"] = like_count
    track_data["Avg_Rating"] = avg_rating
    track_data["Num_Tracks"] = track_count
    track_data["Artist_Tag"] = artist_tag["Artist_Tag"] if artist_tag else None

    return jsonify(track_data)

#@tracks_bp.route("/track/<int:track_id>/tracks", methods=["GET"])
#def get_album_tracks(album_id):
#    conn = get_db_connection()
#    tracks = conn.execute("SELECT * FROM Track WHERE Album_ID = ?", (album_id,)).fetchall()
#    conn.close()
#    return jsonify([dict(track) for track in tracks])

@tracks_bp.route("/track/<int:track_id>/reviews", methods=["GET"])
def get_track_reviews(track_id):
    conn = get_db_connection()
    rows = conn.execute('''
        SELECT Tag, Review_Txt
        FROM Interaction
        JOIN Review ON Interaction.Interaction_ID = Review.Interaction_ID
        WHERE Track_ID = ?
    ''', (track_id,)).fetchall()
    conn.close()

    return jsonify([{"tag": r["Tag"], "text": r["Review_Txt"]} for r in rows])

@tracks_bp.route("/track/<int:track_id>/like", methods=["POST"])
def like_track(track_id):
    data = request.json
    user_tag = data.get("tag")

    conn = get_db_connection()
    cursor = conn.cursor()

    interaction_id = cursor.execute("SELECT MAX(Interaction_ID) FROM Interaction").fetchone()[0] + 1
    cursor.execute("INSERT INTO Interaction (Interaction_ID, Tag, Track_ID) VALUES (?, ?, ?)",
                   (interaction_id, user_tag, track_id))
    cursor.execute("INSERT INTO Likes (Interaction_ID, Liked) VALUES (?, ?)", (interaction_id, "TRUE"))

    conn.commit()
    conn.close()
    return jsonify({"message": "Track liked", "interaction_id": interaction_id})

@tracks_bp.route("/track/<int:track_id>/rate", methods=["POST"])
def rate_track(track_id):
    data = request.json
    user_tag = data.get("tag")
    rating_value = data.get("rating")

    conn = get_db_connection()
    cursor = conn.cursor()

    interaction_id = cursor.execute("SELECT MAX(Interaction_ID) FROM Interaction").fetchone()[0] + 1
    cursor.execute("INSERT INTO Interaction (Interaction_ID, Tag, Track_ID) VALUES (?, ?, ?)",
                   (interaction_id, user_tag, track_id))
    cursor.execute("INSERT INTO Rating (Interaction_ID, Rating_Value) VALUES (?, ?)", (interaction_id, rating_value))

    conn.commit()
    conn.close()
    return jsonify({"message": "Rating submitted", "rating": rating_value})

@tracks_bp.route("/track/<int:track_id>/review", methods=["POST"])
def review_track(track_id):
    data = request.json
    user_tag = data.get("tag")
    review_text = data.get("text")  # intentionally vulnerable

    conn = get_db_connection()
    cursor = conn.cursor()

    interaction_id = cursor.execute("SELECT MAX(Interaction_ID) FROM Interaction").fetchone()[0] + 1
    cursor.execute("INSERT INTO Interaction (Interaction_ID, Tag, Track_ID) VALUES (?, ?, ?)",
                   (interaction_id, user_tag, track_id))
    cursor.execute(f"INSERT INTO Review (Interaction_ID, Review_Txt) VALUES ({interaction_id}, '{review_text}')")

    conn.commit()
    conn.close()
    return jsonify({"message": "Review submitted", "review": review_text})

@tracks_bp.route("/top-albums", methods=["GET"])
def top_albums():
    conn = get_db_connection()
    albums = conn.execute("SELECT * FROM Album ORDER BY Avg_Rating DESC LIMIT 100").fetchall()
    conn.close()
    return jsonify([dict(a) for a in albums])

@tracks_bp.route("/top-artists", methods=["GET"])
def top_artists():
    conn = get_db_connection()
    artists = conn.execute("SELECT * FROM Artist ORDER BY Popularity DESC LIMIT 100").fetchall()
    conn.close()
    return jsonify([dict(a) for a in artists])

@tracks_bp.route("/top-songs", methods=["GET"])
def top_songs():
    conn = get_db_connection()
    songs = conn.execute("SELECT * FROM Track ORDER BY Avg_Rating DESC LIMIT 100").fetchall()
    conn.close()
    return jsonify([dict(s) for s in songs])