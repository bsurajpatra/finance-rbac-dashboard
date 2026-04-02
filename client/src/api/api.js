import axios from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL;

if (!baseURL) {
  console.warn('VITE_API_BASE_URL is not defined in the environment. Defaulting to standard loopback.');
}

const api = axios.create({
  baseURL: `${(baseURL).replace(/\/$/, '')}/api/v1`,
});

// Interceptor intelligently catches every outgoing request and aggressively mounts the auth signature
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

    // Global API Interceptor handling asynchronous RBAC routing exceptions intelligently
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // 1. Identify context-specific bypass routes
    // We shouldn't force-redirect the user if they are already attempting to authenticate
    const isAuthRoute = error.config.url.includes('/auth/login') || 
                        error.config.url.includes('/auth/register') ||
                        error.config.url.includes('/auth/rotate-token');

    // 2. Session staleness or deletion causes native pipeline failures
    // Redirect is only applied to protected resource requests to prevent state-loss on forms
    if (error.response && error.response.status === 401 && !isAuthRoute) {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      // Execute strict hard-redirect breaking React Router constraints safely resolving session logic
      window.location.href = '/login';
    }
    // Note: 403 mapping handled natively inside each page component individually since it just means "Access Denied"
    return Promise.reject(error);
  }
);

export default api;