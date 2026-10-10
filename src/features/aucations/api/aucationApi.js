
import { fetchApi } from '../../../helpers/apiHelper.js'

/**
 * Mengambil daftar lelang.
 * GET /aucations
 * Mendukung filter is_me dan is_closed.
 */
export function getAucations(filters = {}) {
  const params = new URLSearchParams()

  if (filters.is_me !== undefined && filters.is_me !== null) {
    params.set('is_me', String(filters.is_me))
  }

  if (filters.is_closed !== undefined && filters.is_closed !== null) {
    params.set('is_closed', String(filters.is_closed))
  }

  const query = params.toString()
  const endpoint = query ? `/aucations?${query}` : '/aucations'

  return fetchApi(endpoint)
}

/**
 * Mengambil detail lelang berdasarkan ID.
 * GET /aucations/:id
 */
export function getAucationById(id) {
  return fetchApi(`/aucations/${encodeURIComponent(id)}`)
}

/**
 * Menambahkan lelang baru.
 * POST /aucations
 */
export function addAucation(aucationData) {
  return fetchApi('/aucations', {
    method: 'POST',
    body: aucationData,
  })
}

/**
 * Memperbarui data lelang.
 * PUT /aucations/:id
 */
export function updateAucation(id, aucationData) {
  return fetchApi(`/aucations/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: aucationData,
  })
}

/**
 * Mengunggah atau mengganti cover lelang.
 * POST /aucations/:id/cover
 */
export function uploadAucationCover(id, file) {
  const formData = new FormData()
  formData.append('cover', file)

  return fetchApi(
    `/aucations/${encodeURIComponent(id)}/cover`,
    {
      method: 'POST',
      body: formData,
    },
  )
}

/**
 * Menghapus satu lelang.
 * DELETE /aucations/:id
 */
export function deleteAucation(id) {
  return fetchApi(`/aucations/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  })
}

/**
 * Mengajukan tawaran bid.
 * POST /aucations/:id/bids
 */
export function addBid(id, bidData) {
  return fetchApi(`/aucations/${encodeURIComponent(id)}/bids`, {
    method: 'POST',
    body: bidData,
  })
}

/**
 * Menghapus atau membatalkan tawaran bid.
 * DELETE /aucations/:id/bids
 */
export function deleteBid(id, bidData) {
  return fetchApi(`/aucations/${encodeURIComponent(id)}/bids`, {
    method: 'DELETE',
    ...(bidData === undefined ? {} : { body: bidData }),
  })
}

/**
 * Menghapus seluruh lelang milik pengguna.
 * DELETE /aucations
 */
export function deleteAllAucations() {
  return fetchApi('/aucations', {
    method: 'DELETE',
  })
}