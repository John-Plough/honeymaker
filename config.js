// config.js
const isDevelopment = window.location.hostname === "localhost";

const API_BASE = isDevelopment ? "http://localhost:3000" : "YOUR_RENDER_URL_HERE"; // Update this when you deploy to Render

// OAuth redirect URIs
const OAUTH_REDIRECT_URI = isDevelopment ? "http://localhost:5173" : "https://john-plough.github.io/honeymaker/"; // Production GitHub Pages URL - note trailing slash

// Export for use in other files
export { API_BASE, OAUTH_REDIRECT_URI };
