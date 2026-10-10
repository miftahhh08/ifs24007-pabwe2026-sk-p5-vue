import { defineStore } from 'pinia'
import {
  loginRequest,
  registerRequest,
} from '../api/authApi.js'
import {
  getAccessToken,
  putAccessToken,
} from '../../../helpers/apiHelper.js'

function getStoredUser() {
  const storedUser = localStorage.getItem('authUser')

  if (!storedUser) {
    return null
  }

  try {
    return JSON.parse(storedUser)
  } catch {
    localStorage.removeItem('authUser')
    return null
  }
}

function extractResponseData(response) {
  return response?.data ?? response
}

function extractToken(response) {
  const data = extractResponseData(response)

  return (
    data?.accessToken ??
    data?.access_token ??
    data?.token ??
    response?.accessToken ??
    response?.access_token ??
    response?.token ??
    ''
  )
}

function extractUser(response) {
  const data = extractResponseData(response)

  return data?.user ?? data?.profile ?? data?.me ?? null
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: getAccessToken(),
    user: getStoredUser(),
    isAuthLogin: false,
    isAuthRegister: false,
    isAuthLogout: false,
    errorMessage: '',
  }),

  getters: {
    isAuthenticated: (state) => Boolean(state.token),
  },

  actions: {
    async login(credentials) {
      this.isAuthLogin = true
      this.errorMessage = ''

      let response
      try {
        response = await loginRequest(credentials)
        const token = extractToken(response)

        if (!token) {
          throw new Error(
            'Login berhasil diproses, tetapi token tidak ditemukan pada respons API.',
          )
        }

        this.token = token
        putAccessToken(token)

        this.user = extractUser(response)

        if (this.user) {
          localStorage.setItem('authUser', JSON.stringify(this.user))
        } else {
          localStorage.removeItem('authUser')
        }
      } catch (error) {
        this.errorMessage =
          error?.message || 'Login gagal. Silakan coba kembali.'

        throw error
      } finally {
        this.isAuthLogin = false
      }

      return response
    },

    async register(userData) {
      this.isAuthRegister = true
      this.errorMessage = ''

      let result
      try {
        result = await registerRequest(userData)
      } catch (error) {
        this.errorMessage =
          error?.message || 'Registrasi gagal. Silakan coba kembali.'

        throw error
      } finally {
        this.isAuthRegister = false
      }

      return result
    },

    async logout() {
      this.isAuthLogout = true

      try {
        this.token = ''
        this.user = null
        this.errorMessage = ''

        putAccessToken(null)
        localStorage.removeItem('authUser')
      } finally {
        this.isAuthLogout = false
      }
    },
  },
})