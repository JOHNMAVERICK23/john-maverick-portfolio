import axios from 'axios'

const api = axios.create({ baseURL: '/api', withCredentials: true })

// If the admin session expires mid-use, send the admin back to the login page.
api.interceptors.response.use(
  (res) => res,
  (error) => {
    const url = error.config?.url || ''
    const { pathname } = window.location
    if (
      error.response?.status === 401 &&
      !url.startsWith('/auth/') &&
      pathname.startsWith('/admin') &&
      pathname !== '/admin/login'
    ) {
      window.location.assign('/admin/login')
    }
    return Promise.reject(error)
  },
)

export const errMsg = (e) => e.response?.data?.message || 'Something went wrong'
export default api
