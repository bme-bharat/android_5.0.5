
import axios from 'axios';

const BASE_API_URL = 'https://h7l1568kga.execute-api.ap-south-1.amazonaws.com/dev';
const API_KEY = 'k1xuty5IpZ2oHOEOjgMz57wHfdFT8UQ16DxCFkzk';

const apiClient = axios.create({
    baseURL: BASE_API_URL,
    headers: {
        'x-api-key': API_KEY,
    },
});

export default apiClient;