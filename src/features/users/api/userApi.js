import { fetchApi } from '../../../helpers/apiHelper.js'

/**
 * Mengambil daftar pengguna.
 * GET /users
 */
export function getUsers() {
  return fetchApi('/users')
}

/**
 * Mengambil profil pengguna yang sedang login.
 * GET /users/me
 */
export function getMyProfile() {
  return fetchApi('/users/me')
}

/**
 * Memperbarui profil pengguna yang sedang login.
 * PUT /users/me
 */
export function updateMyProfile(profileData) {
  return fetchApi('/users/me', {
    method: 'PUT',
    body: profileData,
  })
}

/**
 * Mengunggah foto profil pengguna.
 * POST /users/me/photo
 */
export function uploadMyPhoto(file) {
  const formData = new FormData()
  formData.append('photo', file)

  return fetchApi('/users/me/photo', {
    method: 'POST',
    body: formData,
  })
}

/**
 * Mengubah kata sandi pengguna.
 * PUT /users/me/password
 * Body: password, new_password, new_password_confirmation
 */
export function updateMyPassword(passwordData) {
  return fetchApi('/users/me/password', {
    method: 'PUT',
    body: passwordData,
  })
}
