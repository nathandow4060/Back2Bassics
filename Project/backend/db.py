import sqlite3
import os

BASE_DIR = os.path.dirname(__file__)
DB_FILE = os.path.join(BASE_DIR, 'back2bassics.db')

def get_db_connection():
    conn = sqlite3.connect(DB_FILE)
    conn.execute("PRAGMA foreign_keys = ON")
    conn.row_factory = sqlite3.Row
    return conn