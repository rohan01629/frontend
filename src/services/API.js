// services/API.js
import axios from "axios";
const API_URL = process.env.REACT_APP_API_URL;

const API = axios.create({
  baseURL: API_URL, // Base URL of your backend
  timeout: 15000, // Timeout for requests (15 seconds)
});

// Interceptor to include the token in all requests
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token"); // Ensure you're using the correct token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Add Cache-Control header to avoid caching
    config.headers["Cache-Control"] = "no-cache, no-store, must-revalidate";
    config.headers["Pragma"] = "no-cache";
    config.headers["Expires"] = "0";

    return config;
  },
  (error) => {
    return Promise.reject(error); // Handle request errors
  }
);

// Response interceptor to handle errors globally
API.interceptors.response.use(
  (response) => {
    // Do something with the response data, if needed
    return response;
  },
  (error) => {
    // Handle response errors globally
    console.error("API request error:", error.response ? error.response.data : error);
    return Promise.reject(error); // Forward the error to the calling function
  }
);

export default API;
