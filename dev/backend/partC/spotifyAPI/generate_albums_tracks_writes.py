import csv
import os
import requests
import time
from datetime import timedelta
from dotenv import load_dotenv

# Load environment variables
ENV_PATH = r"C:\Users\User\Desktop\Back2Bassics\dev\backend\partC\spotifyAPI\.env"
load_dotenv(dotenv_path=ENV_PATH)
access_token = os.getenv("SPOTIFY_ACCESS_TOKEN").strip().replace('"', '').replace("'", "")
headers = {"Authorization": f"Bearer {access_token}"}

# Input
ARTIST_CSV = "Artist.csv"

# Output
ALBUM_CSV = "Album.csv"
TRACK_CSV = "Track.csv"
WRITES_CSV = "Writes.csv"

# Control limits
ALBUMS_PER_ARTIST = 2
TRACKS_PER_ALBUM = 10
REQUEST_SLEEP = 0.5

# Helpers
def to_sql_time(ms):
    return str(timedelta(milliseconds=ms))

def get_artist_id(name):
    url = "https://api.spotify.com/v1/search"
    params = {"q": name, "type": "artist", "limit": 1}
    res = requests.get(url, headers=headers, params=params)
    time.sleep(REQUEST_SLEEP)
    if res.status_code == 200:
        items = res.json().get("artists", {}).get("items", [])
        if items:
            return items[0]["id"]
    return None

def get_albums_for_artist(artist_id):
    url = f"https://api.spotify.com/v1/artists/{artist_id}/albums"
    params = {
        "include_groups": "album",
        "limit": ALBUMS_PER_ARTIST,
        "market": "US"
    }
    res = requests.get(url, headers=headers, params=params)
    time.sleep(REQUEST_SLEEP)
    return res.json().get("items", []) if res.status_code == 200 else []

def get_album_tracks(album_id):
    url = f"https://api.spotify.com/v1/albums/{album_id}/tracks"
    params = {"limit": TRACKS_PER_ALBUM, "market": "US"}
    res = requests.get(url, headers=headers, params=params)
    time.sleep(REQUEST_SLEEP)
    return res.json().get("items", []) if res.status_code == 200 else []

def get_album_release_date(album_id):
    url = f"https://api.spotify.com/v1/albums/{album_id}"
    res = requests.get(url, headers=headers)
    time.sleep(REQUEST_SLEEP)
    if res.status_code == 200:
        return res.json().get("release_date", "2000-01-01")
    return "2000-01-01"

# Load artists
with open(ARTIST_CSV, newline='', encoding='utf-8') as file:
    artist_reader = csv.DictReader(file)
    artist_data = [(row["Tag"], row["Stage_Name"]) for row in artist_reader]

albums = []
tracks = []
writes = []
album_id = 1
track_id = 1

for artist_tag, artist_name in artist_data:
    print(f"🎤 Processing {artist_name} ({artist_tag})")

    spotify_artist_id = get_artist_id(artist_name)
    if not spotify_artist_id:
        print(f"⚠️  Artist not found: {artist_name}")
        continue

    artist_albums = get_albums_for_artist(spotify_artist_id)
    seen_titles = set()

    for album in artist_albums:
        title = album["name"]
        if title in seen_titles:
            continue
        seen_titles.add(title)

        release_date = get_album_release_date(album["id"])
        album_tracks = get_album_tracks(album["id"])
        num_tracks = len(album_tracks)

        # Save album
        albums.append({
            "Album_ID": album_id,
            "Title": title,
            "Date_Released": release_date,
            "Like_Count": 0,
            "Avg_Rating": "",
            "Num_Tracks": num_tracks
        })

        for track in album_tracks[:TRACKS_PER_ALBUM]:
            duration = to_sql_time(track["duration_ms"])
            track_title = track["name"]

            tracks.append({
                "Track_ID": track_id,
                "Album_ID": album_id,
                "Title": track_title,
                "Date_Released": release_date,
                "Genre": "",
                "Length": duration,
                "Like_Count": 0,
                "Avg_Rating": ""
            })

            writes.append({
                "Artist_Tag": artist_tag,
                "Track_ID": track_id
            })

            track_id += 1

        album_id += 1

# Write Album.csv
with open(ALBUM_CSV, "w", newline='', encoding='utf-8') as f:
    writer = csv.DictWriter(f, fieldnames=["Album_ID", "Title", "Date_Released", "Like_Count", "Avg_Rating", "Num_Tracks"])
    writer.writeheader()
    writer.writerows(albums)

# Write Track.csv
with open(TRACK_CSV, "w", newline='', encoding='utf-8') as f:
    writer = csv.DictWriter(f, fieldnames=["Track_ID", "Album_ID", "Title", "Date_Released", "Genre", "Length", "Like_Count", "Avg_Rating"])
    writer.writeheader()
    writer.writerows(tracks)

# Write Writes.csv
with open(WRITES_CSV, "w", newline='', encoding='utf-8') as f:
    writer = csv.DictWriter(f, fieldnames=["Artist_Tag", "Track_ID"])
    writer.writeheader()
    writer.writerows(writes)

print(f"\n✅ Done! Albums: {len(albums)}, Tracks: {len(tracks)}, Writes: {len(writes)}")
