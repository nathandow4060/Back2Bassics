from flask import Blueprint, jsonify, request
from urllib.parse import unquote
from db import get_db_connection  # assuming you have this in your db.py

listener_bp = Blueprint('listener', __name__, url_prefix='/api')

@listener_bp.route("/listener-dashboard/<tag>", methods=["GET"])
def get_listener_dashboard(tag):
    tag = unquote(tag)
    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        # Basic listener info
        listener = cursor.execute("""
            SELECT U.Username, L.Top_Artist
            FROM Listener L
            JOIN Users U ON L.Tag = U.Tag
            WHERE L.Tag = ?
        """, (tag,)).fetchone()

        # Total playlists
        playlist_count = cursor.execute("""
            SELECT COUNT(*) AS total FROM Playlist WHERE Tag = ?
        """, (tag,)).fetchone()["total"]

        # Total listens
        listens_count = cursor.execute("""
            SELECT COUNT(*) AS total FROM Interaction WHERE Tag = ? AND Track_ID IS NOT NULL
        """, (tag,)).fetchone()["total"]

        return jsonify({
            "username": listener["Username"],
            "top_artist": listener["Top_Artist"],
            "total_playlists": playlist_count,
            "total_listens": listens_count
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

    finally:
        conn.close()

@listener_bp.route("/listener-dashboard/<tag>/follows", methods=["GET"])
def get_listener_follows(tag):
    tag = unquote(tag)
    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        result = cursor.execute("""
            SELECT
                (SELECT COUNT(*) FROM Follows WHERE Followed_Tag = ?) AS followers,
                (SELECT COUNT(*) FROM Follows WHERE Follower_Tag = ?) AS following
        """, (tag, tag)).fetchone()

        return jsonify({
            "followers": result["followers"],
            "following": result["following"]
        })

    except Exception as e:
        print("Error getting follows for listener:", e)
        return jsonify({"error": str(e)}), 500

    finally:
        conn.close()

@listener_bp.route("/listener-dashboard/<tag>/update-top-artist", methods=["PUT"])
def update_top_artist(tag):
    tag = unquote(tag)
    data = request.json
    new_top = data.get("top_artist")

    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        cursor.execute("""
            UPDATE Listener SET Top_Artist = ? WHERE Tag = ?
        """, (new_top, tag))
        conn.commit()
        return jsonify({"message": "Top artist updated."}), 200

    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500

    finally:
        conn.close()

@listener_bp.route("/search-artists", methods=["GET"])
def search_artists():
    query = request.args.get("q", "").lower()
    if not query:
        return jsonify([])

    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        matches = cursor.execute("""
            SELECT Tag, Stage_Name FROM Artist
            WHERE LOWER(Stage_Name) LIKE ? OR LOWER(Tag) LIKE ?
            LIMIT 10
        """, (f"%{query}%", f"%{query}%")).fetchall()

        return jsonify([{"tag": row["Tag"], "stage_name": row["Stage_Name"]} for row in matches])

    except Exception as e:
        return jsonify({"error": str(e)}), 500

    finally:
        conn.close()

@listener_bp.route("/listener-dashboard/<tag>/playlists", methods=["GET"])
def get_playlists(tag):
    tag = unquote(tag)
    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        playlists = cursor.execute("""
            SELECT P.Playlist_ID, P.Playlist_Name, COUNT(AT.Track_ID) AS track_count
            FROM Playlist P
            LEFT JOIN Added_To AT ON P.Playlist_ID = AT.Playlist_ID
            WHERE P.Tag = ?
            GROUP BY P.Playlist_ID, P.Playlist_Name
            ORDER BY P.Playlist_Name ASC
        """, (tag,)).fetchall()

        return jsonify([
            {
                "playlist_id": row["Playlist_ID"],
                "name": row["Playlist_Name"],
                "track_count": row["track_count"]
            }
            for row in playlists
        ])

    except Exception as e:
        return jsonify({"error": str(e)}), 500

    finally:
        conn.close()

@listener_bp.route("/listener-dashboard/<tag>/playlist/<int:playlist_id>", methods=["DELETE"])
def delete_playlist(tag, playlist_id):
    tag = unquote(tag)
    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        cursor.execute("DELETE FROM Playlist WHERE Playlist_ID = ? AND Tag = ?", (playlist_id, tag))
        conn.commit()
        return jsonify({"message": "Playlist deleted."})

    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500

    finally:
        conn.close()
        
@listener_bp.route("/listener-dashboard/<tag>/playlist/<int:playlist_id>", methods=["PUT"])
def rename_playlist(tag, playlist_id):
    tag = unquote(tag)
    data = request.json
    new_name = data.get("new_name")

    if not new_name:
        return jsonify({"error": "Missing new name"}), 400

    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        cursor.execute("""
            UPDATE Playlist SET Playlist_Name = ?
            WHERE Playlist_ID = ? AND Tag = ?
        """, (new_name, playlist_id, tag))
        conn.commit()
        return jsonify({"message": "Playlist renamed."})

    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500

    finally:
        conn.close()

@listener_bp.route("/listener-dashboard/<tag>/playlist/<int:playlist_id>/tracks", methods=["GET"])
def get_playlist_tracks(tag, playlist_id):
    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        tracks = cursor.execute("""
            SELECT T.Track_ID, T.Title, T.Length, T.Genre
            FROM Added_To A
            JOIN Track T ON A.Track_ID = T.Track_ID
            WHERE A.Playlist_ID = ?
        """, (playlist_id,)).fetchall()

        return jsonify([dict(row) for row in tracks])

    except Exception as e:
        return jsonify({"error": str(e)}), 500

    finally:
        conn.close()

@listener_bp.route("/search-tracks", methods=["GET"])
def search_tracks():
    query = request.args.get("q", "").lower()
    if not query:
        return jsonify([])

    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        tracks = cursor.execute("""
            SELECT Track_ID, Title, Length FROM Track
            WHERE LOWER(Title) LIKE ?
            ORDER BY Date_Released DESC
            LIMIT 20
        """, (f"%{query}%",)).fetchall()

        return jsonify([dict(row) for row in tracks])

    except Exception as e:
        return jsonify({"error": str(e)}), 500

    finally:
        conn.close()


@listener_bp.route("/listener-dashboard/<tag>/playlist/<int:playlist_id>/add-track", methods=["POST"])
def add_track_to_playlist(tag, playlist_id):
    data = request.json
    track_id = data.get("track_id")

    if not track_id:
        return jsonify({"error": "Missing track_id"}), 400

    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        cursor.execute("""
            INSERT INTO Added_To (Playlist_ID, Track_ID)
            VALUES (?, ?)
        """, (playlist_id, track_id))
        conn.commit()
        return jsonify({"message": "Track added."})

    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500

    finally:
        conn.close()

@listener_bp.route("/listener-dashboard/<tag>/playlist/<int:playlist_id>/remove-track", methods=["DELETE"])
def remove_track_from_playlist(tag, playlist_id):
    data = request.json
    track_id = data.get("track_id")

    if not track_id:
        return jsonify({"error": "Missing track_id"}), 400

    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        cursor.execute("""
            DELETE FROM Added_To
            WHERE Playlist_ID = ? AND Track_ID = ?
        """, (playlist_id, track_id))
        conn.commit()
        return jsonify({"message": "Track removed."})

    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500

    finally:
        conn.close()


@listener_bp.route("/listener-dashboard/<tag>/create-playlist", methods=["POST"])
def create_playlist(tag):
    tag = unquote(tag)
    data = request.json
    name = data.get("name")
    track_ids = data.get("track_ids", [])

    if not name:
        return jsonify({"error": "Missing playlist name"}), 400

    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        cursor.execute("INSERT INTO Playlist (Tag, Playlist_Name) VALUES (?, ?)", (tag, name))
        playlist_id = cursor.lastrowid

        for track_id in track_ids:
            cursor.execute("INSERT INTO Added_To (Playlist_ID, Track_ID) VALUES (?, ?)", (playlist_id, track_id))

        conn.commit()
        return jsonify({"message": "Playlist created."})

    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500

    finally:
        conn.close()
