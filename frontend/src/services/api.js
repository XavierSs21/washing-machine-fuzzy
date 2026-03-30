import axios from 'axios'

const api = axios.create({
  // En .env pon: VITE_API_URL=http://localhost:8000
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
})

// Interceptor para ver errores claros en consola
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.status, error.response?.data)
    return Promise.reject(error)
  }
)

export default api
