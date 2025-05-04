# Run from Back2Bassics root using:
#    python dev/backend/partC/init_db.py

import os
import sqlite3

# Path when run from root: C:/.../Back2Bassics
BASE_DIR = os.path.join('dev', 'backend', 'partC')
DB_FILE = os.path.join(BASE_DIR, 'back2bassics.db')

def execute_sql_file(filename):
    filepath = os.path.join(BASE_DIR, filename)
    with open(filepath, 'r', encoding='utf-8') as f:
        sql = f.read()
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    cursor.executescript(sql)
    conn.commit()
    conn.close()

# Create schema and views
execute_sql_file('create.sql')
execute_sql_file('create_views.sql')
print("Database initialized and views created.")
