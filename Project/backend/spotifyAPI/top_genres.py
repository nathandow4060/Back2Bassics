import os
import requests
from dotenv import load_dotenv

# Load from .env
ENV_PATH = r"C:\Users\User\Desktop\Back2Bassics\dev\backend\partC\spotifyAPI\.env"
load_dotenv(dotenv_path=ENV_PATH)

access_token = os.getenv("SPOTIFY_ACCESS_TOKEN")

if not access_token:
    print("❌ No access token found in .env file.")
    exit()

# Clean up any quotes or newlines
access_token = access_token.strip().replace('"', '').replace("'", '')

headers = {
    "Authorization": f"Bearer {access_token}"
}

url = "https://api.spotify.com/v1/recommendations/available-genre-seeds"
response = requests.get(url, headers=headers)

if response.status_code == 200:
    genres = response.json()["genres"]
    print(f"✅ Got {len(genres)} genres from Spotify:")
    for genre in genres[:10]:
        print("•", genre)
else:
    print(f"❌ Failed to fetch genres: {response.status_code}")
    print("Response:", response.text)
