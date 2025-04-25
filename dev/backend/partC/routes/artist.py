from flask import Blueprint, jsonify, request
from db import get_db_connection
from urllib.parse import unquote

artist_bp = Blueprint("artist", __name__, url_prefix="/api")

print("✅ artist.py loaded")

@artist_bp.route("/artist-dashboard/<tag>", methods=["GET"])
def artist_dashboard(tag):
    tag = unquote(tag)
    print(f"🎤 Fetching artist dashboard for: {tag}")

    conn = get_db_connection()
    cursor = conn.cursor()

    artist = cursor.execute("SELECT Stage_Name, Label_ID FROM Artist WHERE Tag = ?", (tag,)).fetchone()
    if not artist:
        conn.close()
        return jsonify({"error": "Artist not found"}), 404

    stage_name = artist["Stage_Name"]
    label_id = artist["Label_ID"]

    label_name = "Independent"
    if label_id:
        row = cursor.execute("SELECT Label_Name FROM Record_Label WHERE Label_ID = ?", (label_id,)).fetchone()
        if row:
            label_name = row["Label_Name"]

    conn.close()
    return jsonify({
        "stage_name": stage_name,
        "label_name": label_name,
        "top_tracks": [],
        "genres": []
    })

@artist_bp.route("/artist-dashboard/<tag>/albums-and-tracks", methods=["GET"])
def get_albums_and_tracks(tag):
    tag = unquote(tag)
    conn = get_db_connection()
    cursor = conn.cursor()

    # Get all tracks written by the artist (include ones with no album too)
    tracks = cursor.execute('''
        SELECT Track.Track_ID, Track.Title, Track.Length, Track.Genre, Track.Album_ID, Album.Title AS Album_Title
        FROM Track
        JOIN Writes ON Track.Track_ID = Writes.Track_ID
        LEFT JOIN Album ON Track.Album_ID = Album.Album_ID
        WHERE Writes.Artist_Tag = ?
    ''', (tag,)).fetchall()

    # Get all albums associated with those track IDs
    albums = cursor.execute('''
        SELECT DISTINCT Album.Album_ID, Album.Title, Album.Date_Released
        FROM Album
        JOIN Track ON Album.Album_ID = Track.Album_ID
        JOIN Writes ON Track.Track_ID = Writes.Track_ID
        WHERE Writes.Artist_Tag = ? AND Album.Album_ID IS NOT NULL
    ''', (tag,)).fetchall()

    conn.close()

    return jsonify({
        "albums": [
            {
                "album_id": album["Album_ID"],
                "title": album["Title"],
                "release_date": album["Date_Released"]
            }
            for album in albums
        ],
        "tracks": [
            {
                "track_id": track["Track_ID"],
                "title": track["Title"],
                "length": track["Length"],
                "genre": track["Genre"],
                "album_id": track["Album_ID"],
                "album_title": track["Album_Title"] if track["Album_Title"] else "Single"
            }
            for track in tracks
        ]
    })

@artist_bp.route("/artist-dashboard/<tag>/create-track", methods=["POST"])
def create_track(tag):
    tag = unquote(tag)
    data = request.json

    title = data.get("title")
    minutes = data.get("minutes")
    seconds = data.get("seconds")
    date_released = data.get("date_released")
    album_id = data.get("album_id") or None

    if not title or minutes is None or seconds is None or not date_released:
        return jsonify({"error": "Missing required fields"}), 400

    conn = get_db_connection()
    cursor = conn.cursor()

    # Prevent duplicate track titles
    existing = cursor.execute("SELECT 1 FROM Track WHERE Title = ?", (title,)).fetchone()
    if existing:
        conn.close()
        return jsonify({"error": "A track with this title already exists."}), 400

    # Create time string from minutes and seconds
    try:
        total_seconds = int(minutes) * 60 + int(seconds)
        duration = f"0:{total_seconds // 60:02}:{total_seconds % 60:02}.000000"
    except:
        conn.close()
        return jsonify({"error": "Invalid time format."}), 400

    try:
        # Insert into Track
        cursor.execute("""
            INSERT INTO Track (Album_ID, Title, Date_Released, Length, Like_Count, Avg_Rating)
            VALUES (?, ?, ?, ?, 0, NULL)
        """, (album_id, title, date_released, duration))

        # Fetch the new track ID explicitly
        track_id = cursor.execute("SELECT Track_ID FROM Track WHERE Title = ?", (title,)).fetchone()[0]

        # Insert into Writes
        cursor.execute("""
            INSERT INTO Writes (Artist_Tag, Track_ID) VALUES (?, ?)
        """, (tag, track_id))

        conn.commit()
        print(f"✅ Track '{title}' added for artist {tag}, album: {album_id}")
        return jsonify({"message": "Track created successfully."}), 201

    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500

    finally:
        conn.close()

@artist_bp.route("/artist-dashboard/<tag>/delete-track/<int:track_id>", methods=["DELETE"])
def delete_track(tag, track_id):
    tag = unquote(tag)
    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        # Verify that the artist owns the track
        result = cursor.execute(
            "SELECT 1 FROM Writes WHERE Artist_Tag = ? AND Track_ID = ?",
            (tag, track_id)
        ).fetchone()

        if not result:
            conn.close()
            return jsonify({"error": "You are not the owner of this track."}), 403

        # Delete from Writes first to avoid FK constraint
        cursor.execute("DELETE FROM Writes WHERE Track_ID = ?", (track_id,))
        cursor.execute("DELETE FROM Track WHERE Track_ID = ?", (track_id,))
        conn.commit()

        print(f"🗑️ Deleted Track ID {track_id} for artist {tag}")
        return jsonify({"message": "Track deleted successfully."}), 200

    except Exception as e:
        conn.rollback()
        print("🔥 Deletion failed:", e)
        return jsonify({"error": str(e)}), 500

    finally:
        conn.close()

@artist_bp.route("/artist-dashboard/<tag>/update-track/<int:track_id>", methods=["PUT"])
def update_track(tag, track_id):
    tag = unquote(tag)
    data = request.json

    title = data.get("title")
    minutes = data.get("minutes")
    seconds = data.get("seconds")
    date_released = data.get("date_released")
    genre = data.get("genre")
    album_id = data.get("album_id") or None

    if not title or minutes is None or seconds is None or not date_released:
        return jsonify({"error": "Missing required fields"}), 400

    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        # Check ownership
        owned = cursor.execute(
            "SELECT 1 FROM Writes WHERE Artist_Tag = ? AND Track_ID = ?",
            (tag, track_id)
        ).fetchone()
        if not owned:
            return jsonify({"error": "You do not have permission to edit this track."}), 403

        # Build length time
        total_seconds = int(minutes) * 60 + int(seconds)
        duration = f"0:{total_seconds // 60:02}:{total_seconds % 60:02}.000000"

        cursor.execute("""
            UPDATE Track
            SET Title = ?, Length = ?, Date_Released = ?, Genre = ?, Album_ID = ?
            WHERE Track_ID = ?
        """, (title, duration, date_released, genre, album_id, track_id))

        conn.commit()
        return jsonify({"message": "Track updated successfully."}), 200

    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500

    finally:
        conn.close()


@artist_bp.route("/artist-dashboard/<tag>/create-album", methods=["POST"])
def create_album(tag):
    tag = unquote(tag)
    data = request.json

    title = data.get("title")
    date_released = data.get("date_released")
    single_track_ids = data.get("track_ids", [])

    if not title or not date_released:
        return jsonify({"error": "Missing album title or release date."}), 400

    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        # Insert into Album
        cursor.execute(
            "INSERT INTO Album (Title, Date_Released) VALUES (?, ?)",
            (title, date_released)
        )
        album_id = cursor.lastrowid

        # Update any selected tracks to belong to this album
        for track_id in single_track_ids:
            cursor.execute(
                "UPDATE Track SET Album_ID = ? WHERE Track_ID = ?",
                (album_id, track_id)
            )

        conn.commit()
        print(f"📀 Album '{title}' created for artist {tag}")
        return jsonify({"message": "Album created successfully."}), 201

    except Exception as e:
        conn.rollback()
        print("🚫 Album creation failed:", e)
        return jsonify({"error": str(e)}), 500

    finally:
        conn.close()

@artist_bp.route("/artist-dashboard/<tag>/update-album/<int:album_id>", methods=["PUT"])
def update_album(tag, album_id):
    tag = unquote(tag)
    data = request.json

    new_title = data.get("title")
    new_date = data.get("date_released")
    removed_track_ids = data.get("remove_tracks", [])

    if not new_title or not new_date:
        return jsonify({"error": "Missing album title or date"}), 400

    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        # Update album info
        cursor.execute("""
            UPDATE Album SET Title = ?, Date_Released = ? WHERE Album_ID = ?
        """, (new_title, new_date, album_id))

        # Set album_id to NULL for removed tracks
        for track_id in removed_track_ids:
            cursor.execute("""
                UPDATE Track SET Album_ID = NULL WHERE Track_ID = ? AND Album_ID = ?
            """, (track_id, album_id))

        conn.commit()
        return jsonify({"message": "Album updated successfully."}), 200

    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500

    finally:
        conn.close()

@artist_bp.route("/artist-dashboard/<tag>/delete-album/<int:album_id>", methods=["DELETE"])
def delete_album(tag, album_id):
    tag = unquote(tag)
    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        # Check if album exists
        album = cursor.execute("SELECT 1 FROM Album WHERE Album_ID = ?", (album_id,)).fetchone()
        if not album:
            return jsonify({"error": "Album not found"}), 404

        # Unlink all tracks from the album (set them to singles)
        cursor.execute("UPDATE Track SET Album_ID = NULL WHERE Album_ID = ?", (album_id,))

        # Delete the album
        cursor.execute("DELETE FROM Album WHERE Album_ID = ?", (album_id,))
        conn.commit()

        print(f"🗑️ Album {album_id} deleted and tracks unlinked.")
        return jsonify({"message": "Album deleted successfully."}), 200

    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500

    finally:
        conn.close()