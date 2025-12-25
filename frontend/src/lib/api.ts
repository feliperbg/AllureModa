import axios from "axios";

// Create axios instance with base configuration
export const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",
    withCredentials: true, // Important: send cookies with every request
    headers: {
        "Content-Type": "application/json",
    },
});

// Response interceptor for global error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Handle 401 Unauthorized globally
        if (error.response?.status === 401) {
            // Optional: Redirect to login or clear client-side auth state if needed
            // window.location.href = "/login";
        }
        return Promise.reject(error);
    }
);
