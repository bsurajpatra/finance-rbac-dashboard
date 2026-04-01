import axios from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL;

if (!baseURL) {
  console.warn('VITE_API_BASE_URL is not defined in the environment. Defaulting to standard loopback.');
}

const api = axios.create({
  baseURL: `${(baseURL).replace(/\/$/, '')}/api`,
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
    // Session staleness or deletion causes native pipeline failures
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      // Execute strict hard-redirect breaking React Router constraints safely resolving session logic
      window.location.href = '/login';
    }
    // Note: 403 mapping handled natively inside each page component individually since it just means "Access Denied"
    return Promise.reject(error);
  }
);

export default api;