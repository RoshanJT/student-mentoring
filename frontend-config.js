// Set this to your deployed backend base URL (without trailing slash)
// Example for Vercel serverless: "https://your-backend.vercel.app/api"
// Example for Node server: "https://your-domain.com/api"
// Auto-detect environment and set correct API base URL
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
  // Local development - point to backend on port 3000
  window.__BACKEND_BASE_URL__ = "http://localhost:3000/api";
} else {
  // Production (Vercel) - use relative path
  window.__BACKEND_BASE_URL__ = "/api";
}

function apiUrl(path) {
  const base = window.__BACKEND_BASE_URL__ || "";
  if (!base) return path; // fallback for local dev proxy
  return base.replace(/\/$/, '') + path;
}


