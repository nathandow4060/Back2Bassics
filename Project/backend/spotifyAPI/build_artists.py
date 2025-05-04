import os
import csv
import requests
import time
from dotenv import load_dotenv

# Load environment
ENV_PATH = r"C:\Users\User\Desktop\Back2Bassics\dev\backend\partC\spotifyAPI\.env"
load_dotenv(dotenv_path=ENV_PATH)

access_token = os.getenv("SPOTIFY_ACCESS_TOKEN").strip().replace('"', '').replace("'", "")
headers = {"Authorization": f"Bearer {access_token}"}

# Genres to query
top_genres = [
    "pop", "hip-hop", "rock", "indie", "edm", "rap",
    "r&b", "country", "latin", "metal"
]

# Output file paths
users_csv = "Users.csv"
artists_csv = "Artist.csv"

# Store collected artist tags to prevent duplicates
seen_tags = set()

# Utilities
def make_tag(name):
    return "@" + name.lower().replace(" ", "_").replace(".", "").replace("-", "").replace("'", "")

def search_artists_by_genre(genre, limit=15):
    artists = []
    query = f"genre:{genre}"
    url = "https://api.spotify.com/v1/search"
    params = {
        "q": query,
        "type": "artist",
        "limit": limit
    }
    res = requests.get(url, headers=headers, params=params)
    if res.status_code == 200:
        data = res.json()
        artists = data.get("artists", {}).get("items", [])
    else:
        print(f"❌ Failed to fetch artists for {genre}: {res.status_code}")
    return artists

# Open CSV files
with open(users_csv, "w", newline="", encoding="utf-8") as users_file, \
     open(artists_csv, "w", newline="", encoding="utf-8") as artists_file:

    users_writer = csv.writer(users_file)
    artists_writer = csv.writer(artists_file)

    # Write headers
    users_writer.writerow(["Tag", "Username"])
    artists_writer.writerow(["Tag", "Label_ID", "Stage_Name", "Monthly_Listeners", "Avg_Ranking"])

    for genre in top_genres:
        print(f"🎧 Searching for artists in genre: {genre}")
        artists = search_artists_by_genre(genre)

        for artist in artists:
            name = artist["name"]
            tag = make_tag(name)

            # Avoid duplicates
            if tag in seen_tags:
                continue
            seen_tags.add(tag)

            monthly_listeners = artist.get("followers", {}).get("total", 0)

            # Write to Users.csv
            users_writer.writerow([tag, name])

            # Write to Artist.csv
            artists_writer.writerow([tag, "", name, monthly_listeners, ""])

        time.sleep(0.5)  # Respect rate limits
