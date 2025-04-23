document.addEventListener("DOMContentLoaded", () => {
    // Log artist and album clicks
    const artistLinks = document.querySelectorAll("div.section:nth-of-type(4) .card a");
    const albumLinks = document.querySelectorAll("div.section:nth-of-type(5) .card a");

    artistLinks.forEach(link => {
        link.addEventListener("click", (e) => {
            console.log(`Artist clicked: ${link.textContent}`);
            // Add custom behavior here if needed
        });
    });

    albumLinks.forEach(link => {
        link.addEventListener("click", (e) => {
            console.log(`Album clicked: ${link.textContent}`);
        });
    });

    // Handle "Create New" playlist click
    const createNewCard = document.querySelector(".section:nth-of-type(3) .card:last-child");

    if (createNewCard) {
        createNewCard.style.cursor = "pointer";

        createNewCard.addEventListener("mouseover", () => {
            createNewCard.style.backgroundColor = "#f0f0f0";
        });

        createNewCard.addEventListener("mouseout", () => {
            createNewCard.style.backgroundColor = "";
        });

        createNewCard.addEventListener("click", () => {
            alert("Opening playlist creation...");
            console.log("Create New Playlist clicked");
            // Navigate or open modal functionality can be added here
        });
    }
});