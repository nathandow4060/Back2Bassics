document.addEventListener("DOMContentLoaded", () => {
    const params = new URLSearchParams(window.location.search);
    //const albumId = params.get("albumID");
    const trackId = params.get("id");

    if (!trackId) {
        console.error("Missing trackId in URL");
        return;
    }

    // Fetch track details
    fetch(`http://127.0.0.1:5000/api/track/${trackId}`)
        .then(res => res.json())
        .then(data => {
            if (data.error) {
                console.error("API Error:", data.error);
                return;
            }

            // Update the header title
            document.querySelector("h1").textContent = data.Title || "Track";

            // Update track info section
            document.querySelector("#track-info").innerHTML = `
                <li><strong>Track:</strong> ${data.Title}</li>
                <li><strong>Artist:</strong> ${data.Artist_Tag || 'Unknown'}</li>
                <li><strong>Release:</strong> ${data.Date_Released}</li>
                <li><strong>Likes:</strong> ${data.Like_Count}</li>
                <li><strong>Avg Rating:</strong> ${data.Avg_Rating || 'N/A'}</li>
            `;
        })
        .catch(err => console.error("Failed to fetch track info:", err));

        /*
    // Fetch track tracks
    fetch(`http://127.0.0.1:5000/api/track/${trackId}/tracks`)
        .then(res => res.json())
        .then(tracks => {
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

                trackEl.innerHTML = `
                    <div style="margin-bottom: 10px;">
                        <strong>${track.Title}</strong> <span style="color: gray;">(${formattedLength})</span>
                    </div>
                `;
                trackListContainer.appendChild(trackEl);
            });
        })
        .catch(err => console.error("Failed to fetch track list:", err));
        */

    // Fetch and display reviews
    // fetch(`http://127.0.0.1:5000/api/track/${trackId}/reviews`) old version for copying in if needed
    fetch(`http://127.0.0.1:5000/api/track/${trackId}/reviews`)
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

    // ✅ Add event listener for track Like button
    const trackLikeButton = document.querySelector("#track-like-btn");
    if (trackLikeButton) {
        trackLikeButton.addEventListener("click", () => {
            fetch(`http://127.0.0.1:5000/api/track/${trackId}/like`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ tag: "@silly_cat" }) // Replace with real user logic later
            })
            .then(res => res.json())
            .then(response => {
                console.log("✅ Like added:", response);
                showNotification("Track liked!");
                // Wait 2 seconds before refreshing
                setTimeout(() => {
                    window.location.reload();
                }, 2000);
            })
            .catch(err => {
                console.error("Failed to like track:", err);
                alert("Something went wrong.");
            });
        });
    }

    // Open rating modal
    document.querySelector("#track-rate-btn").addEventListener("click", () => {
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
        const trackId = new URLSearchParams(window.location.search).get("trackId");

        fetch(`http://127.0.0.1:5000/api/track/${trackId}/rate`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                tag: "@silly_cat",
                rating: rating
            }),
        })
        .then(res => res.json())
        .then(data => {
            showNotification("Track rated!");
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
    document.querySelector("#track-review-btn").addEventListener("click", () => {
        document.getElementById("review-modal").style.display = "block";
    });

    // Close review modal
    document.querySelector("#close-review").addEventListener("click", () => {
        document.getElementById("review-modal").style.display = "none";
    });

    // Submit review
    document.querySelector("#submit-review").addEventListener("click", () => {
        const reviewText = document.getElementById("review-text").value;
        const trackId = new URLSearchParams(window.location.search).get("trackId");

        fetch(`http://127.0.0.1:5000/api/track/${trackId}/review`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                tag: "@silly_cat",
                text: reviewText
            }),
        })
        .then(res => res.json())
        .then(data => {
            showNotification("Review submitted!");
            document.getElementById("review-modal").style.display = "none";
            console.log("✅ Review posted:", data);
            setTimeout(() => window.location.reload(), 2000);
        })
        .catch(err => {
            console.error("❌ Review failed", err);
            showNotification("Error submitting review.");
        });
    });

    const homeBtn = document.getElementById("home-btn");
        if (homeBtn) {
        homeBtn.addEventListener("click", () => {
        window.location.href = "./landing.html";
      });
    }
});