import axios from "axios"

const token = sessionStorage.getItem("token")

const api = axios.create({
    baseURL: "http://localhost:5000",
    headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + token,
        "Auth-Token": token
    },
});

export default api;