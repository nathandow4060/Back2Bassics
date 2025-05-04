# Back2Bassics 🎵

A full-stack web application that connects to the Spotify API to display album information, track details, and user interactions such as likes, ratings, and reviews.

Built using:
- Python (Flask) for the backend
- HTML/CSS/JavaScript for the frontend
- SQLite for the database
- Spotify Web API for album and track data

You must have the following Python packages installed:
```bash
pip install Flask flask-cors python-dotenv requests
```

---

## How to Run the Project Locally

You will need two terminal windows (or tabs) open.


### 1. Start the Flask Backend

In the first terminal, navigate to where you downloaded BACK2BASSICS and run:

```bash
python Project/backend/app.py
```

This will start the backend server at:
http://127.0.0.1:5000


### 2. Start the Frontend Server

In the second terminal:

```bash
cd Project/frontend
python -m http.server
```
This will start a basic HTTP server for the frontend at:

```bash
http://127.0.0.1:8000
```

### 3. Open the App in Your Browser

Visit:

```bash
http://127.0.0.1:8000/login.html
```

From there, you can sign up, log in, browse albums, view tracks, leave reviews, and more!

## Environment Setup

Before running the app, ensure the `.env` file is at the root of the project containing your Spotify API credentials:

```bash
SPOTIFY_CLIENT_ID=your_spotify_client_id_here
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret_here
```
**(Do not include your Spotify access token — it will be auto-generated at runtime.)**

## Features
- User authentication (sign up / login)
- View albums with real-time Spotify album covers
- View track details
- Like albums and tracks
- Rate albums and tracks
- Leave reviews on albums and tracks
- Fully automated Spotify API token refresh

## Notes
- The project uses dynamic access tokens from Spotify and does not require manual updates of tokens.
- Album and track images are fetched from Spotify and cached to minimize API calls.