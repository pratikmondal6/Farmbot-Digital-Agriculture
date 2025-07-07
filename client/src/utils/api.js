import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:5001",
    headers: {
        "Content-Type": "application/json",
    },
});

api.interceptors.request.use((config) => {
    const token = sessionStorage.getItem("token");
    if (token) {
        config.headers["Authorization"] = `Bearer ${token}`;
        config.headers["Auth-Token"] = token;
    }
    return config;
});

export default api;