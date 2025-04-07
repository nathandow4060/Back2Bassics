import csv
import random

# INPUT FILES
LISTENER_CSV = "Listener.csv"
TRACK_CSV = "Track.csv"
ALBUM_CSV = "Album.csv"

# OUTPUT FILES
INTERACTION_CSV = "Interaction.csv"
LIKES_CSV = "Likes.csv"
RATING_CSV = "Rating.csv"
REVIEW_CSV = "Review.csv"

# Load listeners
with open(LISTENER_CSV, newline='', encoding="utf-8") as f:
    listeners = [row["Tag"] for row in csv.DictReader(f)]

# Load tracks (Track_ID, Album_ID)
with open(TRACK_CSV, newline='', encoding="utf-8") as f:
    tracks = list(csv.DictReader(f))
    track_tuples = [(row["Track_ID"], row["Album_ID"]) for row in tracks]

# Load albums (Album_ID only)
with open(ALBUM_CSV, newline='', encoding="utf-8") as f:
    albums = [row["Album_ID"] for row in csv.DictReader(f)]

# Review texts
good_reviews = [
    "Absolutely loved this album!",
    "Great from start to finish!",
    "Instant favorite!"
]
bad_reviews = [
    "Felt underwhelming as a whole.",
    "Didn't connect with the vibe.",
    "Album was too repetitive for me."
]
all_reviews = good_reviews + bad_reviews

# Prepare outputs
interaction_rows = []
likes_rows = []
rating_rows = []
review_rows = []

interaction_id = 1
selected_listeners = random.sample(listeners, int(len(listeners) * 0.7))

for listener in selected_listeners:
    # 1. Like a random track
    track_id, album_id = random.choice(track_tuples)
    interaction_rows.append({
        "Interaction_ID": interaction_id,
        "Tag": listener,
        "Track_ID": track_id,
        "Album_ID": ""  # NULL equivalent for CSV
    })
    likes_rows.append({
        "Interaction_ID": interaction_id,
        "Liked": "TRUE"
    })
    interaction_id += 1

    # 2. Either rate a different track or review an album
    if random.random() < 0.5:
        # Rate a different track
        other_track_id, other_album_id = random.choice([t for t in track_tuples if t[0] != track_id])
        interaction_rows.append({
            "Interaction_ID": interaction_id,
            "Tag": listener,
            "Track_ID": other_track_id,
            "Album_ID": ""
        })
        rating_rows.append({
            "Interaction_ID": interaction_id,
            "Rating_Value": round(random.uniform(0.0, 10.0), 1)
        })
    else:
        # Review an album
        album_choice = random.choice(albums)
        interaction_rows.append({
            "Interaction_ID": interaction_id,
            "Tag": listener,
            "Track_ID": "",
            "Album_ID": album_choice
        })
        review_rows.append({
            "Interaction_ID": interaction_id,
            "Review_Txt": random.choice(all_reviews)
        })

    interaction_id += 1

# Write CSVs
def write_csv(path, fieldnames, rows):
    with open(path, "w", newline='', encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)

write_csv(INTERACTION_CSV, ["Interaction_ID", "Tag", "Track_ID", "Album_ID"], interaction_rows)
write_csv(LIKES_CSV, ["Interaction_ID", "Liked"], likes_rows)
write_csv(RATING_CSV, ["Interaction_ID", "Rating_Value"], rating_rows)
write_csv(REVIEW_CSV, ["Interaction_ID", "Review_Txt"], review_rows)

print(f"✅ Created {len(interaction_rows)} interactions — {len(likes_rows)} likes, "
      f"{len(rating_rows)} ratings, {len(review_rows)} reviews.")
