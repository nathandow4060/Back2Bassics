
document.addEventListener("DOMContentLoaded", () => {
    const userTag = localStorage.getItem("user_tag");
    let currentEditingPlaylistId = null;
  
    if (!userTag) {
      alert("You must be logged in.");
      window.location.href = "login.html";
      return;
    }
  
    fetch(`http://127.0.0.1:5000/api/listener-dashboard/${encodeURIComponent(userTag)}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          alert("Dashboard error: " + data.error);
          return;
        }
        document.getElementById("username").textContent = data.username;
        document.getElementById("top-artist").textContent = data.top_artist || "None yet";
        document.getElementById("playlist-count").textContent = data.total_playlists;
        document.getElementById("listen-count").textContent = data.total_listens;
      });
  
    function loadListenerFollows() {
      fetch(`http://127.0.0.1:5000/api/listener-dashboard/${encodeURIComponent(userTag)}/follows`)
        .then(res => res.json())
        .then(data => {
          document.getElementById("listener-followers").textContent = `👥 Followers: ${data.followers}`;
          document.getElementById("listener-following").textContent = `👣 Following: ${data.following}`;
        });
    }
  
    loadListenerFollows();
  
    const input = document.getElementById("top-artist-input");
    const suggestionsBox = document.getElementById("artist-suggestions");
  
    input.addEventListener("input", () => {
      const query = input.value.trim();
      if (!query) {
        suggestionsBox.innerHTML = "";
        return;
      }
  
      fetch(`http://127.0.0.1:5000/api/search-artists?q=${encodeURIComponent(query)}`)
        .then(res => res.json())
        .then(results => {
          suggestionsBox.innerHTML = "";
          results.forEach(artist => {
            const option = document.createElement("div");
            option.textContent = `${artist.stage_name} (${artist.tag})`;
            option.style.padding = "8px";
            option.style.cursor = "pointer";
            option.addEventListener("click", () => {
              input.value = artist.tag;
              suggestionsBox.innerHTML = "";
            });
            suggestionsBox.appendChild(option);
          });
        });
    });
  
    document.addEventListener("click", e => {
      if (!document.getElementById("top-artist-edit").contains(e.target)) {
        suggestionsBox.innerHTML = "";
      }
    });
  
    document.getElementById("edit-top-artist-btn").addEventListener("click", () => {
      document.getElementById("top-artist-edit").style.display = "block";
      document.getElementById("top-artist-input").value = document.getElementById("top-artist").textContent;
    });
  
    document.getElementById("cancel-top-artist-btn").addEventListener("click", () => {
      document.getElementById("top-artist-edit").style.display = "none";
      suggestionsBox.innerHTML = "";
    });
  
    document.getElementById("save-top-artist-btn").addEventListener("click", () => {
      const newTopArtist = document.getElementById("top-artist-input").value;
      fetch(`http://127.0.0.1:5000/api/listener-dashboard/${encodeURIComponent(userTag)}/update-top-artist`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ top_artist: newTopArtist })
      })
        .then(res => res.json())
        .then(() => {
          document.getElementById("top-artist").textContent = newTopArtist;
          document.getElementById("top-artist-edit").style.display = "none";
          suggestionsBox.innerHTML = "";
        });
    });
  
    document.getElementById("logout-btn").addEventListener("click", () => {
      localStorage.removeItem("user_tag");
      window.location.href = "login.html";
    });
  
    document.getElementById("delete-user-btn").addEventListener("click", () => {
      if (confirm("Are you sure you want to delete your account?")) {
        fetch(`http://127.0.0.1:5000/api/artist-dashboard/${encodeURIComponent(userTag)}/delete-user`, {
          method: "DELETE"
        }).then(() => {
          localStorage.removeItem("user_tag");
          window.location.href = "login.html";
        });
      }
    });
  
    function loadPlaylists() {
      fetch(`http://127.0.0.1:5000/api/listener-dashboard/${encodeURIComponent(userTag)}/playlists`)
        .then(res => res.json())
        .then(playlists => {
          const container = document.getElementById("playlist-list");
          container.innerHTML = "";
          document.getElementById("playlist-count").textContent = playlists.length;
  
          if (playlists.length === 0) {
            container.textContent = "You haven't created any playlists yet.";
            return;
          }
  
          playlists.forEach(playlist => {
            const div = document.createElement("div");
            div.classList.add("card");
            div.innerHTML = `
              <strong>${playlist.name}</strong> (${playlist.track_count} songs)
              <div style="margin-top: 5px;">
                <button class="button button-gray edit-btn">✏️ Edit</button>
                <button class="button button-gray delete-btn">🗑️ Delete</button>
              </div>
            `;
  
            div.querySelector(".edit-btn").addEventListener("click", () => {
              openPlaylistEditor(playlist);
            });
  
            div.querySelector(".delete-btn").addEventListener("click", () => {
              if (!confirm(`Delete playlist "${playlist.name}"?`)) return;
              fetch(`http://127.0.0.1:5000/api/listener-dashboard/${encodeURIComponent(userTag)}/playlist/${playlist.playlist_id}`, {
                method: "DELETE"
              }).then(() => loadPlaylists());
            });
  
            container.appendChild(div);
          });
        });
    }
  
    loadPlaylists();
  
    const editModal = document.getElementById("edit-playlist-modal");
    const closeEditModal = document.getElementById("close-edit-modal");
    const editNameInput = document.getElementById("edit-playlist-name");
    const playlistTracksList = document.getElementById("playlist-tracks-list");
    const trackAddSelect = document.getElementById("track-add-select");
  
    closeEditModal.addEventListener("click", () => {
      editModal.style.display = "none";
    });
  
    document.getElementById("cancel-playlist-btn").addEventListener("click", () => {
      editModal.style.display = "none";
    });
  
    function openPlaylistEditor(playlist) {
      currentEditingPlaylistId = playlist.playlist_id;
      editNameInput.value = playlist.name;
      editModal.style.display = "block";
      loadTracksInPlaylist();
      loadAvailableTracks();
    }
  
    document.getElementById("save-playlist-btn").addEventListener("click", () => {
      const newName = editNameInput.value.trim();
      if (!newName) return;
  
      fetch(`http://127.0.0.1:5000/api/listener-dashboard/${encodeURIComponent(userTag)}/playlist/${currentEditingPlaylistId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ new_name: newName })
      }).then(() => {
        alert("✅ Playlist renamed.");
        editModal.style.display = "none";
        loadPlaylists();
      });
    });
  
    function loadTracksInPlaylist() {
      fetch(`http://127.0.0.1:5000/api/listener-dashboard/${encodeURIComponent(userTag)}/playlist/${currentEditingPlaylistId}/tracks`)
        .then(res => res.json())
        .then(tracks => {
          playlistTracksList.innerHTML = "";
          if (tracks.length === 0) {
            playlistTracksList.textContent = "This playlist is currently empty.";
            return;
          }
          tracks.forEach(track => {
            const div = document.createElement("div");
            div.innerHTML = `
              <strong>${track.Title}</strong> (${track.Length}) - ${track.Genre || "Unknown"}
              <button class="button button-gray" data-id="${track.Track_ID}">Remove</button>
            `;
            div.querySelector("button").addEventListener("click", () => {
              fetch(`http://127.0.0.1:5000/api/listener-dashboard/${encodeURIComponent(userTag)}/playlist/${currentEditingPlaylistId}/remove-track`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ track_id: track.Track_ID })
              }).then(() => loadTracksInPlaylist());
            });
            playlistTracksList.appendChild(div);
          });
        });
    }
  
    const trackSearchInput = document.getElementById("track-search-input");
    const trackSuggestionsBox = document.getElementById("track-suggestions");

    function loadAvailableTracks() {
    // no-op: not needed with predictive search
    }

    trackSearchInput.addEventListener("input", () => {
    const query = trackSearchInput.value.trim();
    if (!query) {
        trackSuggestionsBox.innerHTML = "";
        return;
    }

    fetch(`http://127.0.0.1:5000/api/search-tracks?q=${encodeURIComponent(query)}`)
        .then(res => res.json())
        .then(results => {
        trackSuggestionsBox.innerHTML = "";
        if (results.length === 0) return;

        results.forEach(track => {
            const option = document.createElement("div");
            option.style.padding = "8px";
            option.style.cursor = "pointer";
            option.textContent = `${track.Title} (${track.Length})`;
            option.addEventListener("click", () => {
            addTrackToPlaylist(track.Track_ID);
            createTrackSearchInput.value = "";
            createTrackSuggestionsBox.innerHTML = "";
            });
            createTrackSuggestionsBox.appendChild(option);
        });
        });
    });

    function addTrackToPlaylist(trackId) {
    fetch(`http://127.0.0.1:5000/api/listener-dashboard/${encodeURIComponent(userTag)}/playlist/${currentEditingPlaylistId}/add-track`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ track_id: trackId })
    }).then(() => loadTracksInPlaylist());
    }

    document.addEventListener("click", e => {
    if (!trackSearchInput.contains(e.target) && !trackSuggestionsBox.contains(e.target)) {
        trackSuggestionsBox.innerHTML = "";
    }
    });
  
    document.getElementById("add-track-btn").addEventListener("click", () => {
      const trackId = trackAddSelect.value;
      if (!trackId) return;
  
      fetch(`http://127.0.0.1:5000/api/listener-dashboard/${encodeURIComponent(userTag)}/playlist/${currentEditingPlaylistId}/add-track`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ track_id: trackId })
      }).then(() => loadTracksInPlaylist());
    });

    const createModal = document.getElementById("create-playlist-modal");
    const openCreateModal = document.getElementById("open-create-modal");
    const closeCreateModal = document.getElementById("close-create-modal");
    const cancelCreateModal = document.getElementById("cancel-create-playlist");
    const confirmCreateBtn = document.getElementById("confirm-create-playlist");
    const createTrackSearchInput = document.getElementById("create-track-search");
    const createTrackSuggestionsBox = document.getElementById("create-track-suggestions");
    const selectedTracksDisplay = document.getElementById("selected-tracks");
    const selectedTrackIds = [];

    openCreateModal.addEventListener("click", () => {
      createModal.style.display = "block";
      document.getElementById("create-playlist-name").value = "";
      createTrackSearchInput.value = "";
      createTrackSuggestionsBox.innerHTML = "";
      selectedTracksDisplay.innerHTML = "";
      selectedTrackIds.length = 0;
    });

    closeCreateModal.addEventListener("click", () => createModal.style.display = "none");
    cancelCreateModal.addEventListener("click", () => createModal.style.display = "none");

    createTrackSearchInput.addEventListener("input", () => {
      const query = createTrackSearchInput.value.trim();
      if (!query) {
        createTrackSuggestionsBox.innerHTML = "";
        return;
      }

      fetch(`http://127.0.0.1:5000/api/search-tracks?q=${encodeURIComponent(query)}`)
        .then(res => res.json())
        .then(results => {
          createTrackSuggestionsBox.innerHTML = "";
          results.forEach(track => {
            const option = document.createElement("div");
            option.textContent = `${track.Title} (${track.Length})`;
            option.style.padding = "8px";
            option.style.cursor = "pointer";
            option.addEventListener("click", () => {
              if (!selectedTrackIds.includes(track.Track_ID)) {
                selectedTrackIds.push(track.Track_ID);
                const tag = document.createElement("div");
                tag.textContent = `${track.Title} (${track.Length})`;
                tag.style.marginBottom = "5px";
                selectedTracksDisplay.appendChild(tag);
              }
              createTrackSuggestionsBox.innerHTML = "";
              createTrackSearchInput.value = "";
            });
            createTrackSuggestionsBox.appendChild(option);
          });
        });
    });

    document.addEventListener("click", e => {
      if (!createTrackSearchInput.contains(e.target) && !createTrackSuggestionsBox.contains(e.target)) {
        createTrackSuggestionsBox.innerHTML = "";
      }
    });

    confirmCreateBtn.addEventListener("click", () => {
      const name = document.getElementById("create-playlist-name").value.trim();
      if (!name) return alert("Please enter a name.");

      fetch(`http://127.0.0.1:5000/api/listener-dashboard/${encodeURIComponent(userTag)}/create-playlist`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, track_ids: selectedTrackIds })
      })
        .then(res => res.json())
        .then(response => {
          if (response.error) {
            alert("Error: " + response.error);
            return;
          }
          alert("✅ Playlist created.");
          createModal.style.display = "none";
          loadPlaylists();
        });
    });

    const homeBtn = document.getElementById("home-btn");
    if (homeBtn) {
      homeBtn.addEventListener("click", () => {
        window.location.href = "./landing.html";
      });
    }
});
  