import axios from 'axios';

const instance = axios.create({
  baseURL: 'http://localhost:5000/api',  // Updated to use port 5000
  withCredentials: true
});

export default instance;