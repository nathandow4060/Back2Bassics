import os
import csv
import time
import requests
from dotenv import load_dotenv

# Load environment variables
ENV_PATH = r"C:\Users\User\Desktop\Back2Bassics\dev\backend\partC\spotifyAPI\.env"
load_dotenv(dotenv_path=ENV_PATH)

access_token = os.getenv("SPOTIFY_ACCESS_TOKEN").strip().replace('"', '').replace("'", "")
headers = {"Authorization": f"Bearer {access_token}"}

# Input/Output paths
ARTIST_IN_PATH = "Artist.csv"
ARTIST_OUT_PATH = "Artist_with_labels.csv"
LABEL_OUT_PATH = "Record_Label.csv"

# Track label names and assign Label_IDs
label_map = {}
label_id_counter = 1

updated_artists = []

def search_artist(artist_name):
    """Get Spotify artist ID by name"""
    url = "https://api.spotify.com/v1/search"
    params = {
        "q": artist_name,
        "type": "artist",
        "limit": 1
    }
    res = requests.get(url, headers=headers, params=params)
    if res.status_code == 200:
        items = res.json().get("artists", {}).get("items", [])
        return items[0]["id"] if items else None
    return None

def get_top_album_label(artist_id):
    """Get the label from one album (usually latest)"""
    url = f"https://api.spotify.com/v1/artists/{artist_id}/albums"
    params = {
        "limit": 1,
        "include_groups": "album",
        "market": "US"
    }
    res = requests.get(url, headers=headers, params=params)
    if res.status_code == 200:
        items = res.json().get("items", [])
        if items:
            album_id = items[0]["id"]
            album_url = f"https://api.spotify.com/v1/albums/{album_id}"
            album_res = requests.get(album_url, headers=headers)
            if album_res.status_code == 200:
                return album_res.json().get("label")
    return None

# Step 1: Read Artist.csv
with open(ARTIST_IN_PATH, newline='', encoding="utf-8") as file:
    reader = csv.DictReader(file)
    artists = list(reader)

# Step 2: Process each artist
for artist in artists:
    stage_name = artist["Stage_Name"]
    tag = artist["Tag"]

    print(f"🎤 Processing {stage_name}...")

    artist_id = search_artist(stage_name)
    time.sleep(0.2)

    if not artist_id:
        print(f"⚠️  Could not find Spotify ID for {stage_name}")
        continue

    label = get_top_album_label(artist_id)
    time.sleep(0.2)

    if not label:
        print(f"⚠️  Could not get label for {stage_name}")
        continue

    if label not in label_map:
        label_map[label] = label_id_counter
        label_id_counter += 1

    artist["Label_ID"] = label_map[label]
    updated_artists.append(artist)

# Step 3: Write Record_Label.csv
with open(LABEL_OUT_PATH, "w", newline='', encoding="utf-8") as file:
    writer = csv.writer(file)
    writer.writerow(["Label_ID", "Label_Name"])
    for label, lid in sorted(label_map.items(), key=lambda x: x[1]):
        writer.writerow([lid, label])

# Step 4: Write updated Artist.csv
with open(ARTIST_OUT_PATH, "w", newline='', encoding="utf-8") as file:
    writer = csv.DictWriter(file, fieldnames=artists[0].keys())
    writer.writeheader()
    writer.writerows(updated_artists)

print("\n✅ Done!")
print(f"🎵 Labels written to: {LABEL_OUT_PATH}")
print(f"🎤 Updated artists written to: {ARTIST_OUT_PATH}")
