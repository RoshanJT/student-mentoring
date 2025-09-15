if (typeof window !== 'undefined') {
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    // Local development
    window.__BACKEND_BASE_URL__ = "http://localhost:3000/api";
  } else {
    // Production (Vercel)
    window.__BACKEND_BASE_URL__ = "https://student-mentoring-backend.vercel.app/api";
  }
}

function apiUrl(path) {
  const base = window.__BACKEND_BASE_URL__ || "";
  if (!base) return path; // fallback for local dev proxy
  return `${base.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
}

// Example usage:
console.log(apiUrl("/users")); // "http://localhost:3000/api/users" or production URL
