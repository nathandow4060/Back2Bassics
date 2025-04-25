import sqlite3
import os

# Define the path to your database
BASE_DIR = os.path.dirname(__file__)
DB_FILE = os.path.join(BASE_DIR, 'back2bassics.db')

# Interaction data
interaction_id = 10001  # Make sure this is unique
user_tag = "@silly_panda"
album_id = 1
track_id = None  # We're testing an album interaction
rating = 5
review_text = "Awesome album!"

# Connect to the database
conn = sqlite3.connect(DB_FILE)
cursor = conn.cursor()

try:
    # Insert into Interaction
    cursor.execute(
        "INSERT INTO Interaction (Interaction_ID, Tag, Track_ID, Album_ID) VALUES (?, ?, ?, ?)",
        (interaction_id, user_tag, track_id, album_id)
    )

    # Insert into Likes
    cursor.execute("INSERT INTO Likes (Interaction_ID, Liked) VALUES (?, ?)", (interaction_id, "TRUE"))


    # Insert into Rating
    cursor.execute("INSERT INTO Rating (Interaction_ID, Rating_Value) VALUES (?, ?)", (interaction_id, rating))

    # Insert into Review (optional)
    cursor.execute("INSERT INTO Review (Interaction_ID, Review_Txt) VALUES (?, ?)", (interaction_id, review_text))

    conn.commit()
    print(f"✅ Inserted test interaction {interaction_id} for album {album_id} (user: {user_tag})")

except sqlite3.IntegrityError as e:
    print(f"❌ IntegrityError: {e}")
except Exception as e:
    print(f"❌ Unexpected error: {e}")
finally:
    conn.close()
