document.addEventListener("DOMContentLoaded", () => {
    const userTag = localStorage.getItem("user_tag");
    let currentEditAlbumId = null;

    if (!userTag) {
        alert("You must be logged in to view this page.");
        window.location.href = "login.html";
        return;
    }

    document.getElementById("logout-btn").addEventListener("click", () => {
        localStorage.removeItem("user_tag");
        window.location.href = "login.html";
    });

    const homeBtn = document.getElementById("home-btn");
    if (homeBtn) {
    homeBtn.addEventListener("click", () => {
        window.location.href = "./landing.html";
    });
    }

    // Fetch stage name, label, and basic info
    function loadArtistInfo() {
        fetch(`http://127.0.0.1:5000/api/artist-dashboard/${encodeURIComponent(userTag)}`)
            .then(res => res.json())
            .then(data => {
                document.getElementById("stage-name").textContent = data.stage_name;
                document.getElementById("label-info").textContent = `Label: ${data.label_name || "Unknown"}`;
    
                // Populate inputs for editing
                document.getElementById("stage-name-input").value = data.stage_name;
                document.getElementById("label-name-input").value = data.label_name || "";
            })
            .catch(err => {
                console.error("❌ Failed to load dashboard info:", err);
                alert("Error loading artist dashboard info.");
            });
    }

    function loadFollowerCount() {
        fetch(`http://127.0.0.1:5000/api/artist-dashboard/${encodeURIComponent(userTag)}/followers`)
            .then(res => res.json())
            .then(data => {
                document.getElementById("follower-count").textContent = `👥 Followers: ${data.follower_count}`;
            })
            .catch(err => {
                console.error("❌ Failed to load follower count:", err);
                document.getElementById("follower-count").textContent = "👥 Followers: error";
            });
    }

    loadArtistInfo(); 
    loadFollowerCount();

    // Fetch albums and tracks
    function loadAlbumsAndTracks() {
        fetch(`http://127.0.0.1:5000/api/artist-dashboard/${encodeURIComponent(userTag)}/albums-and-tracks`)
            .then(res => res.json())
            .then(data => {
                // Populate Albums
                const albumList = document.getElementById("album-list");
                albumList.innerHTML = "";
                data.albums.forEach(album => {
                    const div = document.createElement("div");
                    div.classList.add("card");
                    div.innerHTML = `
                        <strong>${album.title}</strong> <br> Released: ${album.release_date}
                    `;
                
                    const updateBtn = document.createElement("button");
                    updateBtn.classList.add("button");
                    updateBtn.textContent = "✏️ Update";
                    updateBtn.addEventListener("click", () => {
                        openUpdateAlbumModal(album.album_id, album.title, album.release_date, data.tracks);
                    });
                
                    div.appendChild(updateBtn);

                    const deleteBtn = document.createElement("button");
                    deleteBtn.classList.add("button", "button-gray");
                    deleteBtn.textContent = "🗑️ Delete";
                    deleteBtn.addEventListener("click", () => {
                        if (confirm(`Are you sure you want to delete the album "${album.title}"? This will not delete the tracks — they'll become singles.`)) {
                            fetch(`http://127.0.0.1:5000/api/artist-dashboard/${encodeURIComponent(userTag)}/delete-album/${album.album_id}`, {
                                method: "DELETE"
                            })
                            .then(res => res.json())
                            .then(response => {
                                if (response.error) {
                                    alert("Error: " + response.error);
                                    return;
                                }
                                alert("✅ Album deleted!");
                                loadAlbumsAndTracks();
                            })
                            .catch(err => {
                                console.error("🚫 Failed to delete album:", err);
                                alert("Something went wrong while deleting the album.");
                            });
                        }
                    });
                    div.appendChild(deleteBtn);

                    albumList.appendChild(div);
                });
    
                // Populate Tracks
                const trackList = document.getElementById("track-list");
                trackList.innerHTML = "";
                data.tracks.forEach(track => {
                    const div = document.createElement("div");
                    div.classList.add("card");
                    div.innerHTML = `
                        <strong>${track.title}</strong> (${track.length}) - Genre: ${track.genre || 'Unknown'}<br>
                        ${track.album_title}
                        <button class="button delete-track-btn" data-track-id="${track.track_id}">Delete</button>
                        <button class="button edit-track-btn" data-track='${JSON.stringify(track).replace(/'/g, "&apos;")}'>✏️ Update</button>
                    `;
                    trackList.appendChild(div);
                });
    
                // Attach update event listeners
                document.querySelectorAll(".edit-track-btn").forEach(btn => {
                    btn.addEventListener("click", () => {
                        const trackData = JSON.parse(btn.getAttribute("data-track").replace(/&apos;/g, "'"));
                        openUpdateTrackModal(trackData);
                    });
                });
    
                // Attach delete event listeners
                document.querySelectorAll(".delete-track-btn").forEach(btn => {
                    btn.addEventListener("click", () => {
                        const trackId = btn.getAttribute("data-track-id");
                        if (confirm("Are you sure you want to delete this track?")) {
                            fetch(`http://127.0.0.1:5000/api/artist-dashboard/${encodeURIComponent(userTag)}/delete-track/${trackId}`, {
                                method: "DELETE"
                            })
                            .then(res => res.json())
                            .then(response => {
                                if (response.error) {
                                    alert("Error: " + response.error);
                                    return;
                                }
                                alert("✅ Track deleted successfully!");
                                loadAlbumsAndTracks();
                            })
                            .catch(err => {
                                console.error("🚫 Failed to delete track:", err);
                                alert("Something went wrong while deleting the track.");
                            });
                        }
                    });
                });
            })
            .catch(err => {
                console.error("⚠️ Failed to load albums/tracks:", err);
                alert("Could not load albums or tracks.");
            });
    }
    
});


