import os

BASE_DIR = os.path.join('dev', 'backend', 'partC')
DB_FILE = os.path.join(BASE_DIR, 'back2bassics.db')

def reset_database():
    if os.path.exists(DB_FILE):
        os.remove(DB_FILE)
        print("🔥 Database file deleted.")
    else:
        print("⚠️  Database file does not exist.")

reset_database()