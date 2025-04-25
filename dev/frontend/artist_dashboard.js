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

    function openUpdateAlbumModal(albumId, title, date, allTracks) {
        currentEditAlbumId = albumId;
        document.getElementById("update-album-title").value = title;
        document.getElementById("update-album-date").value = date;
    
        const checkboxContainer = document.getElementById("update-album-tracks");
        checkboxContainer.innerHTML = "";
    
        const tracksOnThisAlbum = allTracks.filter(track => track.album_id === albumId);
        tracksOnThisAlbum.forEach(track => {
            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.checked = true;
            checkbox.value = track.track_id;
            checkbox.id = `track-${track.track_id}`;
    
            const label = document.createElement("label");
            label.setAttribute("for", `track-${track.track_id}`);
            label.textContent = track.title;
    
            const line = document.createElement("div");
            line.appendChild(checkbox);
            line.appendChild(label);
    
            checkboxContainer.appendChild(line);
        });
    
        document.getElementById("update-album-modal").style.display = "block";
    }
    

    loadAlbumsAndTracks();

    // Modal logic
    const trackModal = document.getElementById("track-modal");
    const openTrackBtn = document.getElementById("create-track-btn");
    const closeTrackBtn = document.getElementById("close-track-modal");

    openTrackBtn.addEventListener("click", () => {
        trackModal.style.display = "block";
        populateAlbumDropdown();
    });

    closeTrackBtn.addEventListener("click", () => {
        trackModal.style.display = "none";
    });

    window.addEventListener("click", event => {
        if (event.target === trackModal) {
            trackModal.style.display = "none";
        }
    });

    // Populate album dropdown
    function populateAlbumDropdown() {
        const dropdown = document.getElementById("track-album");
        dropdown.innerHTML = `<option value="">Single (no album)</option>`;

        fetch(`http://127.0.0.1:5000/api/artist-dashboard/${encodeURIComponent(userTag)}/albums-and-tracks`)
            .then(res => res.json())
            .then(data => {
                data.albums.forEach(album => {
                    const option = document.createElement("option");
                    option.value = album.album_id;
                    option.textContent = album.title;
                    dropdown.appendChild(option);
                });
            })
            .catch(err => {
                console.error("❌ Failed to load albums for dropdown:", err);
            });
    }

    // Submit new track
    document.getElementById("submit-track-btn").addEventListener("click", () => {
        const title = document.getElementById("track-title").value;
        const minutes = document.getElementById("track-minutes").value;
        const seconds = document.getElementById("track-seconds").value;
        const date = document.getElementById("track-date").value;
        const albumId = document.getElementById("track-album").value || null;

        fetch(`http://127.0.0.1:5000/api/artist-dashboard/${encodeURIComponent(userTag)}/create-track`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                title,
                minutes,
                seconds,
                date_released: date,
                album_id: albumId
            })
        })
        .then(res => res.json())
        .then(response => {
            if (response.error) {
                alert("Error: " + response.error);
                return;
            }
            alert("✅ Track created successfully!");
            document.getElementById("track-title").value = "";
            document.getElementById("track-minutes").value = "";
            document.getElementById("track-seconds").value = "";
            document.getElementById("track-date").value = "";
            document.getElementById("track-album").value = "";
            trackModal.style.display = "none";
            loadAlbumsAndTracks();
        })
        .catch(err => {
            console.error("🚫 Failed to create track:", err);
            alert("Something went wrong while creating the track.");
        });
    });

    // Modal logic for album
    const albumModal = document.getElementById("album-modal");
    const openAlbumBtn = document.getElementById("create-album-btn");
    const closeAlbumBtn = document.getElementById("close-album-modal");

    // Open album modal
    openAlbumBtn.addEventListener("click", () => {
        console.log("🎬 Create Album button clicked");
    
        if (!albumModal) {
            console.error("❌ Album modal element not found!");
            return;
        }
    
        albumModal.style.display = "block";
        console.log("📦 Album modal style set to visible");
    
        populateSinglesForAlbum(); // ✅ Load options
    });

    // Close album modal
    closeAlbumBtn.addEventListener("click", () => {
        albumModal.style.display = "none";
    });

    window.addEventListener("click", (event) => {
        if (event.target === albumModal) {
            albumModal.style.display = "none";
        }
    });

    function populateSinglesForAlbum() {
        const dropdown = document.getElementById("track-select");
        dropdown.innerHTML = "";  // Clear previous options
    
        fetch(`http://127.0.0.1:5000/api/artist-dashboard/${encodeURIComponent(userTag)}/albums-and-tracks`)
            .then(res => res.json())
            .then(data => {
                const singles = data.tracks.filter(track => !track.album_id); // No album = single
    
                if (singles.length === 0) {
                    const option = document.createElement("option");
                    option.textContent = "No singles to add";
                    option.disabled = true;
                    dropdown.appendChild(option);
                    return;
                }
    
                singles.forEach(track => {
                    const option = document.createElement("option");
                    option.value = track.track_id;
                    option.textContent = track.title;
                    dropdown.appendChild(option);
                });
            })
            .catch(err => {
                console.error("❌ Failed to load singles for album creation:", err);
            });
    }

    document.getElementById("submit-album-btn").addEventListener("click", () => {
        const title = document.getElementById("album-title").value;
        const releaseDate = document.getElementById("album-date").value;
        const selectedTrackIds = Array.from(document.getElementById("track-select").selectedOptions)
            .map(option => option.value);

        fetch(`http://127.0.0.1:5000/api/artist-dashboard/${encodeURIComponent(userTag)}/create-album`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                title,
                date_released: releaseDate,
                track_ids: selectedTrackIds
            })
        })
        .then(res => res.json())
        .then(response => {
            if (response.error) {
                alert("Error: " + response.error);
                return;
            }
            alert("✅ Album created!");
            document.getElementById("album-title").value = "";
            document.getElementById("album-date").value = "";
            document.getElementById("track-select").innerHTML = "";
            albumModal.style.display = "none";
            loadAlbumsAndTracks();
        })
        .catch(err => {
            console.error("🚫 Failed to create album:", err);
            alert("Something went wrong while creating the album.");
        });
    });

    document.getElementById("update-artist-profile-btn").addEventListener("click", () => {
        const stageName = document.getElementById("stage-name-input").value;
        const labelName = document.getElementById("label-name-input").value;
    
        fetch(`http://127.0.0.1:5000/api/artist-dashboard/${encodeURIComponent(userTag)}/update-profile`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                stage_name: stageName,
                label_name: labelName
            })
        })
        .then(res => res.json())
        .then(response => {
            if (response.error) {
                alert("Error: " + response.error);
                return;
            }
            alert("✅ Profile updated!");
            loadArtistInfo(); // Optional: refresh the name and label display
        })
        .catch(err => {
            console.error("🚫 Failed to update profile:", err);
            alert("Something went wrong while updating your profile.");
        });
    });

    // ========= Update Track Modal Logic ========= //
    let currentEditTrackId = null;

    const updateModal = document.createElement("div");
    updateModal.id = "update-track-modal";
    updateModal.className = "modal";
    updateModal.style.display = "none";
    updateModal.innerHTML = `
        <div class="modal-content">
            <span class="close-btn" id="close-update-track-modal">&times;</span>
            <h3>Update Track</h3>
            <label for="update-track-title">Track Title:</label>
            <input type="text" id="update-track-title" /><br>

            <label for="update-track-minutes">Length (min:sec):</label>
            <input type="number" id="update-track-minutes" min="0" style="width: 70px;" />
            <input type="number" id="update-track-seconds" min="0" max="59" style="width: 70px;" /><br>

            <label for="update-track-date">Release Date:</label>
            <input type="date" id="update-track-date" /><br>

            <label for="update-track-genre">Genre:</label>
            <input type="text" id="update-track-genre" /><br>

            <label for="update-track-album">Album:</label>
            <select id="update-track-album"></select><br><br>

            <button class="button" id="submit-update-track-btn">Save Changes</button>
        </div>
    `;
    document.body.appendChild(updateModal);

    document.getElementById("close-update-track-modal").addEventListener("click", () => {
        updateModal.style.display = "none";
    });

    window.addEventListener("click", event => {
        if (event.target === updateModal) updateModal.style.display = "none";
    });

    function openUpdateTrackModal(track) {
        currentEditTrackId = track.track_id;
        document.getElementById("update-track-title").value = track.title;
    
        // ✅ Extract the date part if there's a timestamp
        const formattedDate = track.date_released.split("T")[0];
        document.getElementById("update-track-date").value = formattedDate;
    
        document.getElementById("update-track-genre").value = track.genre || "";
    
        const lengthParts = track.length.split(":");
        document.getElementById("update-track-minutes").value = parseInt(lengthParts[1]);
        document.getElementById("update-track-seconds").value = parseInt(lengthParts[2]);
    
        const dropdown = document.getElementById("update-track-album");
        dropdown.innerHTML = '<option value="">Single (no album)</option>';
    
        fetch(`http://127.0.0.1:5000/api/artist-dashboard/${encodeURIComponent(userTag)}/albums-and-tracks`)
            .then(res => res.json())
            .then(data => {
                data.albums.forEach(album => {
                    const option = document.createElement("option");
                    option.value = album.album_id;
                    option.textContent = album.title;
                    if (track.album_id == album.album_id) option.selected = true;
                    dropdown.appendChild(option);
                });
                updateModal.style.display = "block";
            });
    }
    

    document.getElementById("submit-update-track-btn").addEventListener("click", () => {
        const title = document.getElementById("update-track-title").value;
        const minutes = document.getElementById("update-track-minutes").value;
        const seconds = document.getElementById("update-track-seconds").value;
        const date = document.getElementById("update-track-date").value;
        const genre = document.getElementById("update-track-genre").value;
        const albumId = document.getElementById("update-track-album").value || null;

        fetch(`http://127.0.0.1:5000/api/artist-dashboard/${encodeURIComponent(userTag)}/update-track/${currentEditTrackId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                title,
                minutes,
                seconds,
                date_released: date,
                genre,
                album_id: albumId
            })
        })
        .then(res => res.json())
        .then(response => {
            if (response.error) {
                alert("Error: " + response.error);
                return;
            }
            alert("✅ Track updated!");
            updateModal.style.display = "none";
            loadAlbumsAndTracks();
        })
        .catch(err => {
            console.error("🚫 Update failed:", err);
            alert("Something went wrong while updating the track.");
        });
    });

    document.getElementById("submit-update-album-btn").addEventListener("click", () => {
        const title = document.getElementById("update-album-title").value;
        const date = document.getElementById("update-album-date").value;
    
        const removeTracks = [];
        document.querySelectorAll("#update-album-tracks input[type='checkbox']").forEach(cb => {
            if (!cb.checked) {
                removeTracks.push(parseInt(cb.value));
            }
        });
    
        fetch(`http://127.0.0.1:5000/api/artist-dashboard/${encodeURIComponent(userTag)}/update-album/${currentEditAlbumId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                title,
                date_released: date,
                remove_tracks: removeTracks
            })
        })
        .then(res => res.json())
        .then(response => {
            if (response.error) {
                alert("Error: " + response.error);
                return;
            }
            alert("✅ Album updated!");
            document.getElementById("update-album-modal").style.display = "none";
            loadAlbumsAndTracks();
        })
        .catch(err => {
            console.error("🚫 Failed to update album:", err);
            alert("Something went wrong while updating the album.");
        });
    });
    
    document.getElementById("close-update-album-modal").addEventListener("click", () => {
        document.getElementById("update-album-modal").style.display = "none";
    });

    document.getElementById("delete-user-btn").addEventListener("click", () => {
        if (confirm("Are you sure you want to permanently delete your account? This cannot be undone.")) {
            fetch(`http://127.0.0.1:5000/api/artist-dashboard/${encodeURIComponent(userTag)}/delete-user`, {
                method: "DELETE"
            })
            .then(res => res.json())
            .then(response => {
                if (response.error) {
                    alert("Error: " + response.error);
                    return;
                }
                alert("Your account has been deleted.");
                localStorage.removeItem("user_tag");
                window.location.href = "login.html";
            })
            .catch(err => {
                console.error("🚫 Failed to delete user:", err);
                alert("Something went wrong while deleting your account.");
            });
        }
    });
});


