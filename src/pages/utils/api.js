import axios from 'axios';
import axiosRetry from 'axios-retry';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL + '/api',
});

axiosRetry(api, { retries: 3, retryDelay: axiosRetry.exponentialDelay });

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  res => res,
  err => {
    if (err.response && err.response.data && err.response.data.message) {
      return Promise.reject(new Error(err.response.data.message));
    }
    return Promise.reject(err);
  }
);

export default api; 