// API configuration
// In production, this MUST be set by Netlify/Vercel environment variable VITE_API_URL
// It should be your Railway backend URL (e.g., https://your-app.up.railway.app)
// In development, it uses the Vite proxy (see vite.config.js)
export const API_BASE_URL = import.meta.env.VITE_API_URL || '/api'

// Log API URL in development to help debug
if (import.meta.env.DEV) {
  console.log('API_BASE_URL:', API_BASE_URL)
}
