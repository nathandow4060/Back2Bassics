from flask import Blueprint, request, jsonify
from db import get_db_connection

follows_bp = Blueprint("follows", __name__, url_prefix="/api/follows")

# Check if a user follows another user
@follows_bp.route("/<follower_tag>/<followed_tag>", methods=["GET"])
def is_following(follower_tag, followed_tag):
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("""
            SELECT 1 FROM Follows
            WHERE Follower_Tag = ? AND Followed_Tag = ?
        """, (follower_tag, followed_tag))
        result = cur.fetchone()
        conn.close()
        return jsonify({"is_following": bool(result)})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Follow a user
@follows_bp.route("/follow", methods=["POST"])
def follow_user():
    try:
        data = request.get_json()
        follower_tag = data["follower_tag"]
        followed_tag = data["followed_tag"]

        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("""
            INSERT OR IGNORE INTO Follows (Follower_Tag, Followed_Tag)
            VALUES (?, ?)
        """, (follower_tag, followed_tag))
        conn.commit()
        conn.close()

        return jsonify({"success": True})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Unfollow a user
@follows_bp.route("/unfollow", methods=["POST"])
def unfollow_user():
    try:
        data = request.get_json()
        follower_tag = data["follower_tag"]
        followed_tag = data["followed_tag"]

        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("""
            DELETE FROM Follows
            WHERE Follower_Tag = ? AND Followed_Tag = ?
        """, (follower_tag, followed_tag))
        conn.commit()
        conn.close()

        return jsonify({"success": True})
    except Exception as e:
        return jsonify({"error": str(e)}), 500
