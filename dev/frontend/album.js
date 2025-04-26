document.addEventListener("DOMContentLoaded", () => {
    const params = new URLSearchParams(window.location.search);
    const albumId = params.get("albumId");

    if (!albumId) {
        console.error("Missing albumId in URL");
        return;
    }

    const userTag = localStorage.getItem("user_tag");

    const Homebutton = document.getElementById("home-btn");
    if (Homebutton) {
        Homebutton.addEventListener("click", () => {
            console.log("🏠 Home button clicked!");
            window.location.href = "landing.html";
        });
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
            console.log("🎵 TRACKS RECEIVED:", tracks);


            const trackListContainer = document.querySelector("#track-list");
            trackListContainer.innerHTML = ""; // Clear existing placeholders

            tracks.forEach(track => {
                const trackEl = document.createElement("div");

                // Format length: "0:03:38.682000" → "3:39"
                let formattedLength = "N/A";
                if (track.Length) {
                    const parts = track.Length.split(":");
                    const minutes = parseInt(parts[1], 10);
                    const seconds = Math.round(parseFloat(parts[2]));
                    formattedLength = `${minutes}:${seconds.toString().padStart(2, '0')}`;
                }

                console.log(track);

                trackEl.innerHTML = /* html */ `
                <div style="margin-bottom: 10px;">
                    <a href="track.html?trackId=${track.Track_ID}" style="text-decoration: none; color: inherit;">
                    <strong>${track.Title}</strong>
                    </a> 
                    <span style="color: gray;">(${formattedLength})</span>
                </div>
                `;
                
                trackListContainer.appendChild(trackEl);
            });
        })
        .catch(err => console.error("Failed to fetch track list:", err));

    // Fetch and display reviews
    fetch(`http://127.0.0.1:5000/api/album/${albumId}/reviews`)
        .then(res => res.json())
        .then(reviews => {
            const reviewsContainer = document.querySelector("#review-list");
            reviewsContainer.innerHTML = "";

            if (reviews.length === 0) {
                reviewsContainer.textContent = "No reviews yet.";
                return;
            }

            reviews.forEach(review => {
                const div = document.createElement("div");
                div.style.marginBottom = "1em";
                div.innerHTML = `<strong>${review.tag}</strong>: ${review.text}`;
                reviewsContainer.appendChild(div);
            });
        })
        .catch(err => console.error("Failed to fetch reviews:", err));

    // ✅ Add event listener for album Like button
    const albumLikeButton = document.querySelector("#album-like-btn");
    if (albumLikeButton) {
        albumLikeButton.addEventListener("click", () => {
            fetch(`http://127.0.0.1:5000/api/album/${albumId}/like`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ tag: userTag })
            })
            .then(res => res.json())
            .then(response => {
                console.log("✅ Like added:", response);
                showNotification("Album liked!");
                setTimeout(() => window.location.reload(), 2000);
            })
            .catch(err => {
                console.error("Failed to like album:", err);
                alert("Something went wrong.");
            });
        });
    }

    // Open rating modal
    document.querySelector("#album-rate-btn").addEventListener("click", () => {
        document.getElementById("rating-modal").style.display = "block";
    });

    // Close modal
    document.querySelector("#close-rating").addEventListener("click", () => {
        document.getElementById("rating-modal").style.display = "none";
    });

    // Live update slider value
    document.querySelector("#rating-slider").addEventListener("input", (e) => {
        document.getElementById("rating-value").textContent = e.target.value;
    });

    // Submit rating
    document.querySelector("#submit-rating").addEventListener("click", () => {
        const rating = parseInt(document.getElementById("rating-slider").value);
        const albumId = new URLSearchParams(window.location.search).get("albumId");

        fetch(`http://127.0.0.1:5000/api/album/${albumId}/rate`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                tag: userTag,
                rating: rating
            }),
        })
        .then(res => res.json())
        .then(data => {
            showNotification("Album rated!");
            document.getElementById("rating-modal").style.display = "none";
            console.log("✅ Rated:", data);
            setTimeout(() => window.location.reload(), 2000);
        })
        .catch(err => {
            console.error("❌ Rating failed", err);
            showNotification("Error submitting rating.");
        });
    });


    function showNotification(message) {
        const notification = document.getElementById("notification");
        if (!notification) return;
    
        notification.textContent = message;
        notification.classList.add("show");
    
        setTimeout(() => {
            notification.classList.remove("show");
        }, 3000);
    }

    // Open review modal
    document.querySelector("#album-review-btn").addEventListener("click", () => {
        document.getElementById("review-modal").style.display = "block";
    });

    // Close review modal
    document.querySelector("#close-review").addEventListener("click", () => {
        document.getElementById("review-modal").style.display = "none";
    });

    // Submit review
    document.querySelector("#submit-review").addEventListener("click", () => {
        const reviewText = document.getElementById("review-text").value;
        fetch(`http://127.0.0.1:5000/api/album/${albumId}/review`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                tag: userTag,
                text: reviewText
            })
        })
        .then(res => res.json())
        .then(data => {
            showNotification("Review submitted!");
            document.getElementById("review-modal").style.display = "none";
            setTimeout(() => window.location.reload(), 2000);
        })
        .catch(err => {
            console.error("❌ Review failed", err);
            showNotification("Error submitting review.");
        });
    });

});
