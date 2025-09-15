// Frontend configuration for API calls
// Auto-detect environment and set correct API base URL
if (typeof window !== 'undefined') {
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    // Local development - point to backend on port 3000
    window.__BACKEND_BASE_URL__ = "http://localhost:3000/api";
  } else {
    // Production (Vercel) - use relative path
    window.__BACKEND_BASE_URL__ = "/api";
  }
}

function apiUrl(path) {
  const base = window.__BACKEND_BASE_URL__ || "/api";
  return base.replace(/\/$/, '') + path;
}


