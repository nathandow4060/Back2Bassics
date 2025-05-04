#to run from root:
#   python dev/backend/partC/load_csv.py

import os
import sqlite3
import csv

# Paths
BASE_DIR = os.path.join('dev', 'backend', 'partC')
CSV_DIR = os.path.join(BASE_DIR, 'spotifyAPI')
DB_FILE = os.path.join(BASE_DIR, 'back2bassics.db')

# List of (CSV filename, table name) tuples
csv_table_map = [
    ('Record_Label.csv', 'Record_Label'),
    ('Artist.csv', 'Artist'),
    ('Album.csv', 'Album'),
    ('Track.csv', 'Track'),
    ('Users.csv', 'Users'),
    ('Listener.csv', 'Listener'),
    ('Playlist.csv', 'Playlist'),
    ('Review.csv', 'Review'),
    ('Follows.csv', 'Follows'),
    ('Writes.csv', 'Writes'),
    ('Added_To.csv', 'Added_To'),
    ('Likes.csv', 'Likes'),
    ('Listens_To.csv', 'Listens_To'),
    ('Interaction.csv', 'Interaction'),
    ('Rating.csv', 'Rating'),
]

def load_csv_to_table(filename, tablename):
    filepath = os.path.join(CSV_DIR, filename)

    if not os.path.isfile(filepath):
        print(f"File not found: {filepath}")
        return

    with open(filepath, 'r', encoding='utf-8') as f:
        reader = csv.reader(f)
        headers = next(reader)
        placeholders = ', '.join(['?'] * len(headers))

        conn = sqlite3.connect(DB_FILE)
        cursor = conn.cursor()

        for row in reader:
            if not any(row):  # Skip completely empty rows
                continue
            # Special case: Follows table — ensure exactly 2 values
            if tablename == 'Follows':
                if len(row) != 2:
                    print(f"Malformed row in Follows.csv: {row}")
                row = row[:2]

            try:
                cursor.execute(f"INSERT INTO {tablename} VALUES ({placeholders})", row)
            except sqlite3.IntegrityError as e:
                if tablename == 'Listener':
                    print(f"Skipping duplicate Listener tag: {row[0]}")
                elif tablename == 'Listens_To':
                    print(f"Skipping duplicate Listener-Artist pair: {row[0]}, {row[1]}")
                else:
                    raise e

        conn.commit()
        conn.close()
        print(f"Loaded {filename} into {tablename}")

# Load each CSV file into its corresponding table
for csv_file, table_name in csv_table_map:
    load_csv_to_table(csv_file, table_name)

print("All specified CSV files loaded successfully.")
