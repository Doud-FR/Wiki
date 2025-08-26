import axios from 'axios'

const API_BASE_URL = process.env.VUE_APP_API_URL || 'http://localhost:3000/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('auth_token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getProfile: () => api.get('/auth/me'),
  updateProfile: (userData) => api.put('/auth/profile', userData),
  changePassword: (passwordData) => api.put('/auth/password', passwordData),
  getAdminStatus: () => api.get('/auth/admin-status')
}

// Documents API
export const documentsAPI = {
  getAll: (params = {}) => api.get('/documents', { params }),
  create: (documentData) => api.post('/documents/document', documentData),
  getById: (id) => api.get(`/documents/document/${id}`),
  update: (id, documentData) => api.put(`/documents/document/${id}`, documentData),
  delete: (id) => api.delete(`/documents/document/${id}`)
}

// Folders API
export const foldersAPI = {
  create: (folderData) => api.post('/documents/folder', folderData),
  delete: (id) => api.delete(`/documents/folder/${id}`)
}

// Groups API
export const groupsAPI = {
  getAll: () => api.get('/groups'),
  create: (groupData) => api.post('/groups', groupData),
  getById: (id) => api.get(`/groups/${id}`),
  update: (id, groupData) => api.put(`/groups/${id}`, groupData),
  delete: (id) => api.delete(`/groups/${id}`),
  addMember: (groupId, userId) => api.post(`/groups/${groupId}/members`, { userId }),
  removeMember: (groupId, userId) => api.delete(`/groups/${groupId}/members/${userId}`)
}

// Users API
export const usersAPI = {
  getAll: () => api.get('/users'),
  create: (userData) => api.post('/users', userData),
  getById: (id) => api.get(`/users/${id}`),
  update: (id, userData) => api.put(`/users/${id}`, userData),
  delete: (id) => api.delete(`/users/${id}`)
}

export default api
