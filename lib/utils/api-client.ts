// API Client utility for making requests to the backend

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || ''

export class ApiError extends Error {
  constructor(public status: number, message: string, public details?: any) {
    super(message)
    this.name = 'ApiError'
  }
}

interface RequestOptions extends RequestInit {
  token?: string
  data?: any
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { token, data, ...fetchOptions } = options
  
  const config: RequestInit = {
    ...fetchOptions,
    headers: {
      ...fetchOptions.headers,
    }
  }
  
  // Add authorization header if token is provided
  if (token) {
    (config.headers as any)['Authorization'] = `Bearer ${token}`
  }
  
  // Add body if data is provided
  if (data) {
    (config.headers as any)['Content-Type'] = 'application/json'
    config.body = JSON.stringify(data)
  }
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, config)
  
  const responseData = await response.json().catch(() => null)
  
  if (!response.ok) {
    throw new ApiError(
      response.status,
      responseData?.error || `Request failed with status ${response.status}`,
      responseData?.details
    )
  }
  
  return responseData as T
}

// Auth API
export const authApi = {
  register: (data: { email: string; username: string; password: string; name?: string }) =>
    request('/api/auth/register', { method: 'POST', data }),
    
  login: (data: { emailOrUsername: string; password: string }) =>
    request('/api/auth/login', { method: 'POST', data }),
    
  logout: () =>
    request('/api/auth/logout', { method: 'POST' }),
    
  getMe: (token: string) =>
    request('/api/auth/me', { token }),
}

// Models API
export const modelsApi = {
  getAll: (params?: { page?: number; limit?: number; search?: string; userId?: string }) => {
    const searchParams = new URLSearchParams()
    if (params?.page) searchParams.set('page', params.page.toString())
    if (params?.limit) searchParams.set('limit', params.limit.toString())
    if (params?.search) searchParams.set('search', params.search)
    if (params?.userId) searchParams.set('userId', params.userId)
    
    return request(`/api/models?${searchParams.toString()}`)
  },
  
  getOne: (id: string) =>
    request(`/api/models/${id}`),
    
  create: (data: any, token: string) =>
    request('/api/models', { method: 'POST', data, token }),
    
  update: (id: string, data: any, token: string) =>
    request(`/api/models/${id}`, { method: 'PATCH', data, token }),
    
  delete: (id: string, token: string) =>
    request(`/api/models/${id}`, { method: 'DELETE', token }),
    
  like: (id: string, token: string) =>
    request(`/api/models/${id}/like`, { method: 'POST', token }),
    
  comment: (id: string, content: string, token: string) =>
    request(`/api/models/${id}/comments`, { method: 'POST', data: { content }, token }),
}

// Users API
export const usersApi = {
  getProfile: (username: string) =>
    request(`/api/users/${username}`),
    
  updateProfile: (data: any, token: string) =>
    request('/api/users/profile', { method: 'PATCH', data, token }),
    
  deleteAccount: (token: string) =>
    request('/api/users/profile', { method: 'DELETE', token }),
}

// Upload API
export const uploadApi = {
  uploadFile: async (file: File, thumbnail: File | null, token: string) => {
    const formData = new FormData()
    formData.append('file', file)
    if (thumbnail) {
      formData.append('thumbnail', thumbnail)
    }
    
    const response = await fetch(`${API_BASE_URL}/api/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    })
    
    const data = await response.json()
    
    if (!response.ok) {
      throw new ApiError(response.status, data.error || 'Upload failed')
    }
    
    return data
  }
}
