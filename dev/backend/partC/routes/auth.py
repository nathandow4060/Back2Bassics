from flask import Blueprint, request, jsonify
from flask_cors import CORS  # ✅ ADD this
from db import get_db_connection

auth_bp = Blueprint("auth", __name__, url_prefix="/api")

# ✅ Apply CORS directly to auth_bp
CORS(auth_bp, resources={r"/*": {"origins": ["http://127.0.0.1:8000", "http://localhost:8000"]}})

@auth_bp.route("/login", methods=["POST"])
def login_unsafe():
    data = request.json
    tag = data.get("tag")
    password = data.get("password")  # Still receive but don't check

    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Vulnerable SQL concatenation
    query = f"SELECT * FROM Users WHERE Tag = '{tag}' AND Password = '{password}'"
    user = cursor.execute(query).fetchone()

    if user is None:
        conn.close()
        return jsonify({"error": "Login failed"}), 401  # Generic error

    # Determine user role
    role = None
    if cursor.execute("SELECT 1 FROM Artist WHERE Tag = ?", (tag,)).fetchone():
        role = "artist"
    elif cursor.execute("SELECT 1 FROM Listener WHERE Tag = ?", (tag,)).fetchone():
        role = "listener"

    conn.close()

    return jsonify({
        "message": "Login successful",
        "user": {
            "Tag": user["Tag"],
            "Username": user["Username"],
            "Role": role
        }
    })
    
@auth_bp.route("/signup", methods=["POST"])
def signup():
    data = request.json
    tag = data.get("tag")
    name = data.get("name")
    password = data.get("password")
    role = data.get("role")  # "artist" or "listener"

    if not tag or not name or not password or not role:
        return jsonify({"error": "Missing required fields"}), 400

    conn = get_db_connection()
    cursor = conn.cursor()

    existing = cursor.execute("SELECT * FROM Users WHERE Tag = ?", (tag,)).fetchone()
    if existing:
        conn.close()
        return jsonify({"error": "Tag already exists"}), 409

    try:
        cursor.execute(
            "INSERT INTO Users (Tag, Username, Password) VALUES (?, ?, ?)",
            (tag, name, password)
        )

        if role == "artist":
            cursor.execute(
                "INSERT INTO Artist (Tag, Label_ID, Stage_Name, Monthly_Listeners, Avg_Ranking) VALUES (?, ?, ?, ?, ?)",
                (tag, None, name, 0, 0.0)
            )
        elif role == "listener":
            cursor.execute(
                "INSERT INTO Listener (Tag, Top_Artist) VALUES (?, ?)",
                (tag, None)
            )
        else:
            return jsonify({"error": "Invalid role type"}), 400

        conn.commit()
        return jsonify({"message": f"{role.capitalize()} account created", "tag": tag})

    except Exception as e:
        conn.rollback()
        return jsonify({"error": f"Failed to create user: {str(e)}"}), 500
    finally:
        conn.close()
