import requests
import os
from dotenv import load_dotenv, set_key

# Path to your .env file
ENV_PATH = r"C:\Users\User\Desktop\Back2Bassics\dev\backend\partC\spotifyAPI\.env"

# Load environment variables
load_dotenv(dotenv_path=ENV_PATH)

client_id = os.getenv("SPOTIFY_CLIENT_ID")
client_secret = os.getenv("SPOTIFY_CLIENT_SECRET")

# Spotify token URL
token_url = "https://accounts.spotify.com/api/token"

# Request body for client credentials flow
response = requests.post(
    token_url,
    data={"grant_type": "client_credentials"},
    auth=(client_id, client_secret),
)

if response.status_code == 200:
    token_data = response.json()
    access_token = token_data["access_token"]

    # Write token back to the .env file (without quotes)
    set_key(ENV_PATH, "SPOTIFY_ACCESS_TOKEN", access_token)

    print("✅ Successfully updated access token.")
else:
    print("❌ Failed to get token:", response.status_code, response.text)
