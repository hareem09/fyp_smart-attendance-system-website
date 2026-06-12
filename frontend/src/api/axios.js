
import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:3000/api',
  withCredentials: true
});

// ───────────────── REQUEST INTERCEPTOR ─────────────────
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// ───────────────── RESPONSE INTERCEPTOR ─────────────────
API.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;

    // Safety guard
    if (!originalRequest) {
      return Promise.reject(error);
    }

    // Prevent infinite retry loop
    if (originalRequest._retry) {
      return Promise.reject(error);
    }

    // Skip refresh endpoints
    const skipUrls = [
      '/auth/login/student',
      '/auth/login/admin'
    ];

    const shouldSkip = skipUrls.some((url) =>
      originalRequest.url?.includes(url)
    );

    if (shouldSkip) {
      return Promise.reject(error);
    }

    // Only refresh on 401
    if (status !== 401) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      console.log('🔁 Refreshing token...');

      // IMPORTANT
      // Use plain axios here, NOT API instance
      const response = await axios.post(
        'http://localhost:3000/api/auth/refresh-token',
        {},
        {
          withCredentials: true
        }
      );

      
        const newAccessToken = response.data.accessToken;

      if (!newAccessToken) {
        throw new Error('No access token returned');
      }

      // Save new token
      localStorage.setItem('token', newAccessToken);

      // Update headers
      API.defaults.headers.common[
        'Authorization'
      ] = `Bearer ${newAccessToken}`;

      originalRequest.headers[
        'Authorization'
      ] = `Bearer ${newAccessToken}`;

      console.log('✅ Token refreshed');

      // Retry original request
      return API(originalRequest);

    } catch (refreshError) {
      console.log('❌ Refresh failed');

      // READ USER BEFORE REMOVING
      const user = JSON.parse(
        localStorage.getItem('user') || '{}'
      );

      // Clear storage
      localStorage.removeItem('token');
      localStorage.removeItem('user');

      // Redirect
      if (
        user.role === 'admin' ||
        user.role === 'teacher'
      ) {
        window.location.href = '/login/admin';
      } else {
        window.location.href = '/login';
      }

      return Promise.reject(refreshError);
    }
  }
);

export default API;