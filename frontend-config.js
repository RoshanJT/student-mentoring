// Set this to your deployed backend base URL (without trailing slash)
// Example for Vercel serverless: "https://your-backend.vercel.app/api"
// Example for Node server: "https://your-domain.com/api"
window.__BACKEND_BASE_URL__ = "https://student-mentoring-backend.vercel.app/api";

function apiUrl(path) {
  const base = window.__BACKEND_BASE_URL__ || "";
  if (!base) return path; // fallback for local dev proxy
  return base.replace(/\/$/, '') + path;
}


