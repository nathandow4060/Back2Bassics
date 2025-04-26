document.addEventListener("DOMContentLoaded", () => {
    const params = new URLSearchParams(window.location.search);
    const listenerTag = params.get("user");
    const userTag = localStorage.getItem("user_tag");

    if (!listenerTag) {
        alert("No listener specified.");
        window.location.href = "landing.html";
        return;
    }

    document.getElementById("home-btn").addEventListener("click", () => {
        window.location.href = "landing.html";
    });

    const followBtn = document.getElementById("follow-btn");

    // Load listener info
    fetch(`http://127.0.0.1:5000/api/listener-dashboard/${encodeURIComponent(listenerTag)}`)
        .then(res => res.json())
        .then(data => {
            document.getElementById("username").textContent = data.username;
            document.getElementById("top-artist").textContent = `Top Artist: ${data.top_artist || "None"}`;
            document.getElementById("listen-count").textContent = `Total Listens: ${data.total_listens || 0}`;
        })
        .catch(err => {
            console.error("Failed to load listener info:", err);
            alert("Error loading listener profile.");
        });

    // Load playlists
    fetch(`http://127.0.0.1:5000/api/listener-dashboard/${encodeURIComponent(listenerTag)}/playlists`)
        .then(res => res.json())
        .then(data => {
            const playlistList = document.getElementById("playlist-list");
            playlistList.innerHTML = "";

            if (!data.playlists || data.playlists.length === 0) {
                playlistList.innerHTML = "<p>This listener has no playlists yet.</p>";
                return;
            }

            data.playlists.forEach(playlist => {
                const div = document.createElement("div");
                div.classList.add("card");
                div.innerHTML = `
                    <strong>${playlist.name}</strong> (${playlist.num_tracks} tracks)
                `;
                playlistList.appendChild(div);
            });
        })
        .catch(err => {
            console.error("Failed to load playlists:", err);
            alert("Error loading playlists.");
        });

    // Load follower count
    function loadFollowerCount() {
        fetch(`http://127.0.0.1:5000/api/listener-dashboard/${encodeURIComponent(listenerTag)}/follows`)
            .then(res => res.json())
            .then(data => {
                document.getElementById("follower-count").textContent = `👥 Followers: ${data.followers}`;
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
            followBtn.style.display = "none";
            return;
        }

        fetch(`http://127.0.0.1:5000/api/follows/${encodeURIComponent(userTag)}/${encodeURIComponent(listenerTag)}`)
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
            alert("You must be logged in to follow users.");
            return;
        }

        const action = followBtn.textContent === "Follow" ? "follow" : "unfollow";
        fetch(`http://127.0.0.1:5000/api/follows/${action}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                follower_tag: userTag,
                followed_tag: listenerTag
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
