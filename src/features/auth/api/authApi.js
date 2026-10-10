
import { fetchApi } from '../../../helpers/apiHelper.js'

/**
 * Mengirim data login ke API Delcom.
 * Endpoint: POST /auth/login
 */
export function loginRequest(credentials) {
  return fetchApi('/auth/login', {
    method: 'POST',
    body: credentials,
  })
}

/**
 * Mengirim data registrasi ke API Delcom.
 * Endpoint: POST /auth/register
 */
export function registerRequest(userData) {
  return fetchApi('/auth/register', {
    method: 'POST',
    body: userData,
  })
}