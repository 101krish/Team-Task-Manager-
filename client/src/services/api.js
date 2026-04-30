import axios from "axios";

// Determine API base URL based on environment
const getBaseURL = () => {
  // In production (Railway), use relative path so the same domain is used
  if (import.meta.env.PROD) {
    return "/api";
  }
  // In development, use VITE_API_URL or default to localhost
  return import.meta.env.VITE_API_URL || "http://localhost:5000/api";
};

const api = axios.create({
  baseURL: getBaseURL(),
  headers: {
    "Content-Type": "application/json"
  }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("taskflow_token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle network errors
    if (!error.response) {
      return Promise.reject(new Error("Network error. Please check your connection."));
    }

    // Extract error message from response
    const message = error.response?.data?.message || error.message || "Something went wrong";
    
    // Handle 401 Unauthorized - clear storage and redirect
    if (error.response?.status === 401) {
      localStorage.removeItem("taskflow_token");
      localStorage.removeItem("taskflow_user");
      // Optional: Force redirect to login (can be handled by app routing)
    }

    return Promise.reject(new Error(message));
  }
);

export default api;
