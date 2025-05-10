document.addEventListener("DOMContentLoaded", () => {
    const params = new URLSearchParams(window.location.search);
    const artistTag = params.get("tag");
    const userTag = localStorage.getItem("user_tag");

    if (!artistTag) {
        alert("No artist specified.");
        window.location.href = "landing.html";
        return;
    }

    document.getElementById("home-btn").addEventListener("click", () => {
        window.location.href = "landing.html";
    });

    const followBtn = document.getElementById("follow-btn");

    // Load artist info
    fetch(`http://127.0.0.1:5000/api/artist-dashboard/${encodeURIComponent(artistTag)}`)
        .then(res => res.json())
        .then(data => {
            document.getElementById("stage-name").textContent = data.stage_name;
            document.getElementById("label-info").textContent = `Label: ${data.label_name || "Unknown"}`;
        })
        .catch(err => {
            console.error("Failed to load artist info:", err);
            alert("Error loading artist profile.");
        });

    // Load albums and tracks
    fetch(`http://127.0.0.1:5000/api/artist-dashboard/${encodeURIComponent(artistTag)}/albums-and-tracks`)
        .then(res => res.json())
        .then(data => {
            const albumList = document.getElementById("album-list");
            const trackList = document.getElementById("track-list");
            albumList.innerHTML = "";
            trackList.innerHTML = "";

            data.albums.forEach(album => {
                const div = document.createElement("div");
                div.classList.add("card");
                div.innerHTML = `
                    <a href="album.html?albumId=${album.album_id}">
                      <strong>${album.title}</strong> (Released: ${album.release_date})
                    </a>
                `;
                albumList.appendChild(div);
            });

            data.tracks.forEach(track => {
                const div = document.createElement("div");
                div.classList.add("card");
                div.innerHTML = `
                    <a href="track.html?trackId=${track.track_id}">
                      <strong>${track.title}</strong> (${track.length}) - Genre: ${track.genre || "Unknown"}
                    </a>
                `;
                trackList.appendChild(div);
            });
        })
        .catch(err => {
            console.error("Failed to load albums/tracks:", err);
            alert("Error loading artist's music.");
        });

    // Load follower count
    function loadFollowerCount() {
        fetch(`http://127.0.0.1:5000/api/artist-dashboard/${encodeURIComponent(artistTag)}/followers`)
            .then(res => res.json())
            .then(data => {
                document.getElementById("follower-count").textContent = `👥 Followers: ${data.follower_count}`;
            })
            .catch(err => {
                console.error("Failed to load follower count:", err);
                document.getElementById("follower-count").textContent = "👥 Followers: error";
            });
    }
    loadFollowerCount();

    // Load following status
    function loadFollowingStatus() {
        if (!userTag) {
            followBtn.style.display = "none"; // Hide follow button if not logged in
            return;
        }

        fetch(`http://127.0.0.1:5000/api/follows/${encodeURIComponent(userTag)}/${encodeURIComponent(artistTag)}`)
            .then(res => res.json())
            .then(data => {
                if (data.is_following) {
                    followBtn.textContent = "Unfollow";
                } else {
                    followBtn.textContent = "Follow";
                }
            })
            .catch(err => {
                console.error("Failed to load following status:", err);
            });
    }
    loadFollowingStatus();

    // Follow/Unfollow behavior
    followBtn.addEventListener("click", () => {
        if (!userTag) {
            alert("You must be logged in to follow artists.");
            return;
        }

        const action = followBtn.textContent === "Follow" ? "follow" : "unfollow";
        fetch(`http://127.0.0.1:5000/api/follows/${action}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                follower_tag: userTag,
                followed_tag: artistTag
            })
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                followBtn.textContent = action === "follow" ? "Unfollow" : "Follow";
                loadFollowerCount();
            } else {
                alert("Something went wrong.");
            }
        })
        .catch(err => {
            console.error("Failed to follow/unfollow:", err);
            alert("Error following or unfollowing.");
        });
    });
});
