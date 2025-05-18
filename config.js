// config.js
const isDevelopment = window.location.hostname === "localhost";

const API_BASE = isDevelopment ? "http://localhost:3000" : "https://honeymaker-api.onrender.com"; // Render deployment URL
console.log("Current API_BASE:", API_BASE);

// OAuth redirect URIs
const OAUTH_REDIRECT_URI = isDevelopment ? "http://localhost:5173" : "https://john-plough.github.io/honeymaker/"; // Production GitHub Pages URL

// Export for use in other files
export { API_BASE, OAUTH_REDIRECT_URI, isDevelopment };
