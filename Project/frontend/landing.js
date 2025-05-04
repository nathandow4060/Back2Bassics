// Base URLs
const API_BASE   = "http://127.0.0.1:5000/api/landing";
const API_SEARCH = "http://127.0.0.1:5000/api/search";

document.addEventListener("DOMContentLoaded", () => {
  // ─── Profile Button Routing ─────────────────────────────────────────────
  document.getElementById("profile-btn").addEventListener("click", () => {
    const role = localStorage.getItem("user_role");
    window.location.href = role === "artist"
      ? "artist_dashboard.html"
      : "listener_dashboard.html";
  });

  // ─── Fetch Top 50 Songs ─────────────────────────────────────────────────
  fetch(`${API_BASE}/top-songs`)
    .then(res => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    })
    .then(data => {
      const list = document.getElementById("top-songs");
      if (data.error) {
        console.error("API Error:", data.error);
        list.innerHTML = "<li>Error loading songs</li>";
        return;
      }
      list.innerHTML = "";
      data.forEach((song, i) => {
        const li = document.createElement("li");
        const a = document.createElement("a");
      
        a.href = `track.html?trackId=${song.track_id}`;
        a.textContent = `${i + 1}. ${song.track_name} — ${song.artist_name} (${song.likes} likes)`;
      
        li.appendChild(a);
        list.appendChild(li);
      });
    })
    .catch(err => {
      console.error("Failed to fetch top songs:", err);
      document.getElementById("top-songs")
              .innerHTML = "<li>Failed to load songs</li>";
    });

  // ─── Fetch Top 50 Artists ────────────────────────────────────────────────
  fetch(`${API_BASE}/top-artists`)
    .then(res => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    })
    .then(data => {
      const list = document.getElementById("top-artists");
      if (data.error) {
        console.error("API Error:", data.error);
        list.innerHTML = "<li>Error loading artists</li>";
        return;
      }
      list.innerHTML = "";
      data.forEach((artist, i) => {
        const li = document.createElement("li");
        const a = document.createElement("a");
      
        a.href = `artist_view.html?tag=${artist.artist_id}`;
        a.textContent = `${i + 1}. ${artist.artist_name} (${artist.followers} followers)`;
      
        li.appendChild(a);
        list.appendChild(li);
      });
    })
    .catch(err => {
      console.error("Failed to fetch top artists:", err);
      document.getElementById("top-artists")
              .innerHTML = "<li>Failed to load artists</li>";
    });

  // ─── Live Search Suggestions ─────────────────────────────────────────────
  const input = document.getElementById("search-input");
  const box   = document.getElementById("suggestions");
  let   timer = null;

  input.addEventListener("input", () => {
    clearTimeout(timer);
    const q = input.value.trim();
    if (q.length < 2) {
      box.style.display = "none";
      return;
    }
    timer = setTimeout(() => {
      fetch(`${API_SEARCH}?q=${encodeURIComponent(q)}`)
        .then(res => {
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          return res.json();
        })
        .then(renderSuggestions)
        .catch(err => {
          console.error("Search API error:", err);
          box.style.display = "none";
        });
    }, 250);
  });

  input.addEventListener("blur", () => {
    // hide suggestions shortly after losing focus
    setTimeout(() => { box.style.display = "none"; }, 200);
  });

  function renderSuggestions(data) {
    box.innerHTML = "";
    const categories = ["tracks", "albums", "artists", "users"];

    categories.forEach(cat => {
      if (data[cat] && data[cat].length) {
        const heading = document.createElement("h4");
        heading.textContent = cat.charAt(0).toUpperCase() + cat.slice(1);
        box.appendChild(heading);

        const ul = document.createElement("ul");
        data[cat].forEach(item => {
          const li = document.createElement("li");
          li.textContent = item.name;
          li.onclick = () => {
            switch(cat) {
              case "tracks":
                window.location.href = `track.html?trackId=${item.id}`;
                break;
              case "albums":
                window.location.href = `album.html?albumId=${item.id}`;
                break;
              case "artists":
                window.location.href = `artist_view.html?tag=${item.id}`;
                break;
              case "users":
                window.location.href = `listener_view.html?user=${item.id}`;
                break;
            }
          };
          ul.appendChild(li);
        });
        box.appendChild(ul);
      }
    });

    box.style.display = box.childElementCount ? "block" : "none";
  }
});
