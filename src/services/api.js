import axios from 'axios';

// Cambia el '192.168.X.X' por la IP real de tu Mac en tu red local
const API_URL = 'http://localhost:3000/api'; //192.168.100.200 

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export default api;