// Backend base URL. Set VITE_API_URL in frontend/.env (local) or in Vercel's project settings.
export const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:4000').replace(/\/+$/, '');
