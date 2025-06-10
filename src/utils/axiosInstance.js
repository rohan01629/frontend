// src/utils/axiosInstance.js
import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:8080/api/v1', // ensure this is correct
  withCredentials: true,
});

export default axiosInstance;
