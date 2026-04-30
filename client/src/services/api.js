import axios from "axios";

// Determine API base URL based on environment
const getBaseURL = () => {
  // Check if VITE_API_URL is explicitly set (for production/Vercel)
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // In production without explicit URL, try relative path (for same-domain deployments)
  if (import.meta.env.PROD) {
    return "/api";
  }
  
  // In development, default to localhost
  return "http://localhost:5000/api";
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
