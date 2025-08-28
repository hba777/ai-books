import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL, // e.g., http://localhost:8000
  withCredentials: true, // if using cookies
});

export default api;