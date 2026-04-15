import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

// Định nghĩa base URL, bạn có thể thay bằng env variable
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

const apiClient: AxiosInstance = axios.create({
    baseURL: BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request Interceptor: Tự động đính kèm X-Platform-ID và X-Bot-ID
apiClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        if (typeof window !== 'undefined') {
            const platformId = localStorage.getItem('platform_id');
            const botId = localStorage.getItem('bot_id');
            
            if (platformId) {
                config.headers.set('X-Platform-ID', platformId);
            }
            if (botId) {
                config.headers.set('X-Bot-ID', botId);
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response Interceptor: Xử lý lỗi chung toàn cục
apiClient.interceptors.response.use(
    (response: AxiosResponse) => response.data,
    (error) => {
        // Có thể handle unauth (401) hoặc server error (500) ở đây
        console.error('API Error:', error?.response?.data || error.message);
        return Promise.reject(error);
    }
);

// Một API Adapter để gọi cho dễ (CRUD helpers)
export const api = {
    get: <T>(url: string, config?: AxiosRequestConfig) =>
        apiClient.get<T, T>(url, config),

    post: <T>(url: string, data?: any, config?: AxiosRequestConfig) =>
        apiClient.post<T, T>(url, data, config),

    put: <T>(url: string, data?: any, config?: AxiosRequestConfig) =>
        apiClient.put<T, T>(url, data, config),

    patch: <T>(url: string, data?: any, config?: AxiosRequestConfig) =>
        apiClient.patch<T, T>(url, data, config),

    delete: <T>(url: string, config?: AxiosRequestConfig) =>
        apiClient.delete<T, T>(url, config),
};

export default apiClient;
