import random
import csv

# Input files
LISTENER_CSV = "Listener.csv"
TRACK_CSV = "Track.csv"

# Output files
PLAYLIST_CSV = "Playlist.csv"
ADDED_TO_CSV = "Added_To.csv"

# Constants
MIN_TRACKS = 5
MAX_TRACKS = 20
MIN_PLAYLISTS = 1
MAX_PLAYLISTS = 2

# Helper function to generate a random playlist name
def generate_playlist_name(listener_tag):
    return f"{listener_tag}'s Favorites"

# Load listeners
with open(LISTENER_CSV, newline='', encoding="utf-8") as file:
    listener_reader = csv.DictReader(file)
    listeners = [row["Tag"] for row in listener_reader]

# Load tracks
with open(TRACK_CSV, newline='', encoding="utf-8") as file:
    track_reader = csv.DictReader(file)
    tracks = [row["Track_ID"] for row in track_reader]

# Prepare playlist and track association data
playlists = []
added_to = []
playlist_id = 1

for listener_tag in listeners:
    num_playlists = random.randint(MIN_PLAYLISTS, MAX_PLAYLISTS)
    
    for _ in range(num_playlists):
        playlist_name = generate_playlist_name(listener_tag)
        playlists.append({
            "Playlist_ID": playlist_id,
            "Tag": listener_tag,
            "Playlist_Name": playlist_name
        })

        num_tracks = random.randint(MIN_TRACKS, MAX_TRACKS)
        selected_tracks = random.sample(tracks, min(num_tracks, len(tracks)))

        for track_id in selected_tracks:
            added_to.append({
                "Playlist_ID": playlist_id,
                "Track_ID": track_id
            })

        playlist_id += 1

# Write Playlist.csv
with open(PLAYLIST_CSV, "w", newline='', encoding="utf-8") as file:
    writer = csv.DictWriter(file, fieldnames=["Playlist_ID", "Tag", "Playlist_Name"])
    writer.writeheader()
    writer.writerows(playlists)

# Write Added_To.csv
with open(ADDED_TO_CSV, "w", newline='', encoding="utf-8") as file:
    writer = csv.DictWriter(file, fieldnames=["Playlist_ID", "Track_ID"])
    writer.writeheader()
    writer.writerows(added_to)

print(f"✅ Created {len(playlists)} playlists and {len(added_to)} track entries.")
