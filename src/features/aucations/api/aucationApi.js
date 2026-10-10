import { fetchApi } from '../../../helpers/apiHelper.js'

/**
 * Mengambil daftar lelang.
 * GET /aucations
 * Filter: is_me (lelang milik saya) dan is_closed (status ditutup).
 */
export function getAucations(filters = {}) {
  return fetchApi('/aucations', {
    params: {
      is_me: filters.is_me,
      is_closed: filters.is_closed,
    },
  })
}

/**
 * Mengambil detail lelang berdasarkan ID.
 * GET /aucations/:id
 */
export function getAucationById(id) {
  return fetchApi(`/aucations/${id}`)
}

/**
 * Menambahkan lelang baru (title, description, start_bid, closed_at).
 * POST /aucations
 */
export function addAucation(aucationData) {
  return fetchApi('/aucations', { method: 'POST', body: aucationData })
}

/**
 * Memperbarui data lelang.
 * PUT /aucations/:id
 */
export function updateAucation(id, aucationData) {
  return fetchApi(`/aucations/${id}`, { method: 'PUT', body: aucationData })
}

/**
 * Mengunggah atau mengganti cover lelang (multipart, field: cover).
 * POST /aucations/:id/cover
 */
export function uploadAucationCover(id, file) {
  const formData = new FormData()
  formData.append('cover', file)

  return fetchApi(`/aucations/${id}/cover`, {
    method: 'POST',
    body: formData,
  })
}

/**
 * Menghapus satu lelang.
 * DELETE /aucations/:id
 */
export function deleteAucation(id) {
  return fetchApi(`/aucations/${id}`, { method: 'DELETE' })
}

/**
 * Mengajukan tawaran (body: { bid }).
 * POST /aucations/:id/bids
 */
export function addBid(id, bidData) {
  return fetchApi(`/aucations/${id}/bids`, { method: 'POST', body: bidData })
}

/**
 * Membatalkan tawaran milik pengguna.
 * DELETE /aucations/:id/bids
 */
export function deleteBid(id) {
  return fetchApi(`/aucations/${id}/bids`, { method: 'DELETE' })
}

/**
 * Menghapus seluruh lelang milik pengguna.
 * DELETE /aucations
 */
export function deleteAllAucations() {
  return fetchApi('/aucations', { method: 'DELETE' })
}
