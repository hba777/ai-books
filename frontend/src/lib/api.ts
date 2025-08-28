import axios from 'axios';
import { toast } from 'react-toastify';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL, // e.g., http://localhost:8000
  withCredentials: true, // if using cookies
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const data = error?.response?.data;
    const detail = (data && (data.detail || data.message)) || error?.message;

    // Heuristic for model loading/LLM issues or server-side failures
    const looksLikeModelIssue =
      /model|llm|openai|groq|anthropic|load|initializ|pipeline|weights/i.test(String(detail)) ||
      (typeof data === 'string' && /model|llm|openai|groq|anthropic|load/i.test(data));

    if (status >= 500 || looksLikeModelIssue) {
      toast.error(`Model or server error: ${detail || 'Unexpected error. Please try again.'}`);
    }

    return Promise.reject(error);
  }
);

export default api;