const rawApiBaseUrl = process.env.REACT_APP_API_URL?.trim();

if (!rawApiBaseUrl) {
  throw new Error(
    'Missing REACT_APP_API_URL. Set it in frontend/.env.local for development and in Netlify environment variables for production.'
  );
}

const apiBaseUrl = rawApiBaseUrl.replace(/\/+$/, '');

export default apiBaseUrl;
