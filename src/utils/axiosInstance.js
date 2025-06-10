// src/utils/axiosInstance.js
import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'https://backend-rohan.onrender.com/api/v1', // ensure this is correct
  withCredentials: true,
});

export default axiosInstance;
