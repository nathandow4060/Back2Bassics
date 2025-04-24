// Get the albumId from the URL
const urlParams = new URLSearchParams(window.location.search);
const albumId = urlParams.get('albumId');

// Now, you can use this albumId to fetch data, load content, etc.
console.log(albumId);  // Output: album1, album2, etc.

// add more if needed