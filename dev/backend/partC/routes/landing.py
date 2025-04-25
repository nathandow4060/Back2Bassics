from flask import Blueprint, jsonify
from db import get_db_connection

landing_bp = Blueprint("landing", __name__, url_prefix="/api/landing")


@landing_bp.route("/top-songs", methods=["GET"])
def get_top_songs():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
            SELECT
              T.Track_ID,
              T.Title           AS track_name,
              AR.Stage_Name     AS artist_name,
              COUNT(I.Interaction_ID) AS likes
            FROM Track AS T
            LEFT JOIN Interaction AS I
              ON I.Track_ID = T.Track_ID
            LEFT JOIN Album    AS A
              ON T.Album_ID = A.Album_ID
            LEFT JOIN Writes   AS W
              ON W.Track_ID = T.Track_ID
            LEFT JOIN Artist   AS AR
              ON W.Artist_Tag = AR.Tag
            WHERE I.Track_ID IS NOT NULL
            GROUP BY T.Track_ID
            ORDER BY likes DESC
            LIMIT 50;
        """)
        songs = [
            {
                "track_id": r["Track_ID"],
                "track_name": r["track_name"],
                "artist_name": r["artist_name"],
                "likes": r["likes"]
            }
            for r in cursor.fetchall()
        ]
        conn.close()
        return jsonify(songs)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@landing_bp.route("/top-artists", methods=["GET"])
def get_top_artists():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
            SELECT
              AR.Tag            AS artist_id,
              AR.Stage_Name     AS artist_name,
              COUNT(F.Follower_Tag) AS followers
            FROM Artist AS AR
            LEFT JOIN Follows AS F
              ON F.Followed_Tag = AR.Tag
            GROUP BY AR.Tag
            ORDER BY followers DESC
            LIMIT 50;
        """)
        artists = [
            {
                "artist_id": r["artist_id"],
                "artist_name": r["artist_name"],
                "followers": r["followers"]
            }
            for r in cursor.fetchall()
        ]
        conn.close()
        return jsonify(artists)
    except Exception as e:
        return jsonify({"error": str(e)}), 500
