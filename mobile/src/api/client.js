import axios from 'axios';
import Constants from 'expo-constants';

// --- CONFIGURATION ---
const getApiBaseUrl = () => {
  if (__DEV__) {
    const hostUri = Constants.expoConfig?.hostUri;
    if (hostUri) {
      const ip = hostUri.split(':')[0];
      return `http://${ip}:8001/api`;
    }
    return 'http://10.0.2.2:8001/api';
  }
  return 'https://api.businesstradecore.in/api';
};

const API_BASE_URL = getApiBaseUrl();

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10 seconds timeout
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

let unauthorizedCallback = null;

export const registerUnauthorizedCallback = (callback) => {
  unauthorizedCallback = callback;
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response && error.response.status === 401) {
      const isLogoutRequest = error.config?.url?.endsWith('/logout');
      const hasAuth = error.config?.headers?.['Authorization'] || error.config?.headers?.Authorization;
      if (hasAuth && !isLogoutRequest && unauthorizedCallback) {
        await unauthorizedCallback();
      }
    }
    return Promise.reject(error);
  }
);

export const setAuthToken = (token) => {
  if (token) {
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete apiClient.defaults.headers.common['Authorization'];
  }
};

export default apiClient;
