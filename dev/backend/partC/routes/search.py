from flask import Blueprint, request, jsonify
from db import get_db_connection

search_bp = Blueprint("search", __name__, url_prefix="/api/search")

@search_bp.route("", methods=["GET"])
def search_all():
    q = request.args.get("q", "").strip()
    if not q:
        return jsonify({"tracks": [], "albums": [], "artists": [], "users": []})

    conn = get_db_connection()
    cur = conn.cursor()

    # case-insensitive LIKE, limit each category to 5
    pattern = f"%{q}%"
    results = {}

    # Tracks
    cur.execute("""
      SELECT Track_ID, Title AS name
      FROM Track
      WHERE Title LIKE ?
      LIMIT 5
    """, (pattern,))
    results["tracks"] = [
      {"id": r["Track_ID"], "name": r["name"]} for r in cur.fetchall()
    ]

    # Albums
    cur.execute("""
      SELECT Album_ID, Title AS name
      FROM Album
      WHERE Title LIKE ?
      LIMIT 5
    """, (pattern,))
    results["albums"] = [
      {"id": r["Album_ID"], "name": r["name"]} for r in cur.fetchall()
    ]

    # Artists (Stage_Name)
    cur.execute("""
      SELECT Tag AS id, Stage_Name AS name
      FROM Artist
      WHERE Stage_Name LIKE ?
      LIMIT 5
    """, (pattern,))
    results["artists"] = [
      {"id": r["id"], "name": r["name"]} for r in cur.fetchall()
    ]

    # Users (Username)
    cur.execute("""
      SELECT Tag AS id, Username AS name
      FROM Users
      WHERE Username LIKE ?
      LIMIT 5
    """, (pattern,))
    results["users"] = [
      {"id": r["id"], "name": r["name"]} for r in cur.fetchall()
    ]

    conn.close()
    return jsonify(results)
