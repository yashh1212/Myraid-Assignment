import axios from 'axios';
import { decrypt } from '../utils/crypto';


const apiURL = import.meta.env.VITE_API_URL || '';
const baseURL = apiURL.endsWith('/api') ? apiURL : `${apiURL}/api`;

const api = axios.create({
  baseURL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

// Response interceptor – decrypt payload if present
api.interceptors.response.use(
  (response) => {
    if (response.data && response.data.payload) {
      try {
        response.data = JSON.parse(decrypt(response.data.payload));
      } catch {
        // If decryption fails, use raw data
      }
    }
    return response;
  },
  (error) => {
    // If server sends encrypted error, decrypt it
    if (error.response?.data?.payload) {
      try {
        error.response.data = JSON.parse(decrypt(error.response.data.payload));
      } catch {
        // use raw error
      }
    }
    return Promise.reject(error);
  }
);

export default api;
