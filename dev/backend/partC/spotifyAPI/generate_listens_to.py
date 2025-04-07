import csv
import random

# Input files
LISTENER_CSV = "Listener.csv"
ARTIST_CSV = "Artist.csv"
OUTPUT_CSV = "Listens_To.csv"

# Load listeners
with open(LISTENER_CSV, newline='', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    listeners = [row["Tag"] for row in reader]

# Load artists
with open(ARTIST_CSV, newline='', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    artists = [row["Tag"] for row in reader]

# Generate 5 random listens for each listener
listens_to = []
for listener in listeners:
    followed_artists = random.sample(artists, 5)
    for artist in followed_artists:
        listens_to.append({"Listener_Tag": listener, "Artist_Tag": artist})

# Write to Listens_To.csv
with open(OUTPUT_CSV, "w", newline='', encoding='utf-8') as f:
    writer = csv.DictWriter(f, fieldnames=["Listener_Tag", "Artist_Tag"])
    writer.writeheader()
    writer.writerows(listens_to)

print(f"✅ Wrote {len(listens_to)} entries to {OUTPUT_CSV}")
