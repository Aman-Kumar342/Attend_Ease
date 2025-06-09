import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// create axios instance 
const api =axios.create({
    baseURL: API_BASE_URL,
    headers:{
        'Content-Type': 'application/json'
    },

});

// add auth token to request

api.interceptors.request.use((config)=>{
    if(typeof window !== 'undefined') {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
});

// auth api calls

export const authAPI={
    login:(credentials)=>api.post('/users/login', credentials),
    register:(userData)=>api.post('/users/register', userData),
    getProfile:()=>api.get('/users/profile'),
};

export default api;


