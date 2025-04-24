document.addEventListener("DOMContentLoaded", () => {
    const params = new URLSearchParams(window.location.search);
    const albumId = params.get("albumId");

    if (!albumId) {
        console.error("Missing albumId in URL");
        return;
    }

    // Fetch album details
    fetch(`http://127.0.0.1:5000/api/album/${albumId}`)
        .then(res => res.json())
        .then(data => {
            if (data.error) {
                console.error("API Error:", data.error);
                return;
            }

            // Update the header title
            document.querySelector("h1").textContent = data.Title || "Album";

            // Update album info section
            document.querySelector("#album-info").innerHTML = `
                <li><strong>Album:</strong> ${data.Title}</li>
                <li><strong>Artist:</strong> ${data.Artist_Tag || 'Unknown'}</li>
                <li><strong>Release:</strong> ${data.Date_Released}</li>
                <li><strong>Likes:</strong> ${data.Like_Count}</li>
                <li><strong>Avg Rating:</strong> ${data.Avg_Rating || 'N/A'}</li>
            `;
        })
        .catch(err => console.error("Failed to fetch album info:", err));

    // Fetch album tracks
    fetch(`http://127.0.0.1:5000/api/album/${albumId}/tracks`)
        .then(res => res.json())
        .then(tracks => {
            const trackListContainer = document.querySelector("#track-list");
            trackListContainer.innerHTML = ""; // Clear existing placeholders

            tracks.forEach(track => {
                const trackEl = document.createElement("div");
                trackEl.innerHTML = `
                    <div style="margin-bottom: 10px;">
                        <strong>${track.Title}</strong>
                        <button class="button">Rate</button>
                        <button class="button">Like</button>
                        <button class="button-gray">Review</button>
                    </div>
                `;
                trackListContainer.appendChild(trackEl);
            });
        })
        .catch(err => console.error("Failed to fetch track list:", err));
});
