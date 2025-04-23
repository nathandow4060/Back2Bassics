// Wait for the DOM to load
document.addEventListener("DOMContentLoaded", () => {
    const albumLinks = document.querySelectorAll("h2:nth-of-type(1) + ul li a");
    const songLinks = document.querySelectorAll("h2:nth-of-type(2) + ul li a");

    // Highlight clicked link and log it
    function setupLinkHandlers(links, type) {
        links.forEach(link => {
            link.addEventListener("click", (e) => {
                console.log(`${type} clicked: ${link.textContent}`);
                e.preventDefault(); // Prevent default for demo purposes

                // Remove existing highlights
                links.forEach(l => l.classList.remove("highlight"));
                // Highlight current one
                link.classList.add("highlight");
            });
        });
    }

    setupLinkHandlers(albumLinks, "Album");
    setupLinkHandlers(songLinks, "Song");
});