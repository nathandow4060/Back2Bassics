import sqlite3
import os

# Adjust path to your actual DB location
DB_PATH = os.path.join("dev", "backend", "partC", "back2bassics.db")

def debug_check_new_track():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    print("Checking for 'NewNewTest' in Track table")
    try:
        track = cursor.execute("SELECT * FROM Track WHERE Title = 'NewNewTest'").fetchone()
        if track:
            print("Track Found:", dict(track))
        else:
            print("Track not found")

        print("\n🔗 Checking Writes mapping for 'NewNewTest'")
        if track:
            track_id = track["Track_ID"]
            writes = cursor.execute("SELECT * FROM Writes WHERE Track_ID = ?", (track_id,)).fetchall()
            for row in writes:
                print("Written By:", dict(row))
            if not writes:
                print("No Writes entry found for this track.")
        else:
            print("Skipping Writes check since track wasn't found.")

    except Exception as e:
        print("Error during query:", e)

    conn.close()

debug_check_new_track()
