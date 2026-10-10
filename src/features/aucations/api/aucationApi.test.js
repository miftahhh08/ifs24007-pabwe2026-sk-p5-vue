
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { fetchApi } from '../../../helpers/apiHelper.js'
import {
  getAucations,
  getAucationById,
  addAucation,
  updateAucation,
  uploadAucationCover,
  deleteAucation,
  addBid,
  deleteBid,
  deleteAllAucations,
} from './aucationApi.js'

vi.mock('../../../helpers/apiHelper.js', () => ({
  fetchApi: vi.fn(),
}))

describe('aucationApi', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    fetchApi.mockResolvedValue({ success: true })
  })

  describe('getAucations', () => {
    it('mengambil semua lelang tanpa filter', async () => {
      await getAucations()

      expect(fetchApi).toHaveBeenCalledWith('/aucations')
    })

    it('mengirim filter is_me', async () => {
      await getAucations({ is_me: true })

      expect(fetchApi).toHaveBeenCalledWith('/aucations?is_me=true')
    })

    it('mengirim filter is_closed', async () => {
      await getAucations({ is_closed: false })

      expect(fetchApi).toHaveBeenCalledWith('/aucations?is_closed=false')
    })

    it('mengirim kedua filter sekaligus', async () => {
      await getAucations({ is_me: true, is_closed: false })

      expect(fetchApi).toHaveBeenCalledWith(
        '/aucations?is_me=true&is_closed=false',
      )
    })

    it('mengabaikan filter null dan undefined', async () => {
      await getAucations({
        is_me: null,
        is_closed: undefined,
      })

      expect(fetchApi).toHaveBeenCalledWith('/aucations')
    })
  })

  describe('getAucationById', () => {
    it('mengambil detail lelang berdasarkan ID', async () => {
      await getAucationById(12)

      expect(fetchApi).toHaveBeenCalledWith('/aucations/12')
    })

    it('melakukan encoding pada ID', async () => {
      await getAucationById('item/12')

      expect(fetchApi).toHaveBeenCalledWith('/aucations/item%2F12')
    })
  })

  it('menambahkan lelang dengan metode POST', async () => {
    const payload = {
      title: 'Lelang Laptop',
      description: 'Laptop bekas',
      start_bid: 1000000,
      closed_at: '2026-12-31',
    }

    await addAucation(payload)

    expect(fetchApi).toHaveBeenCalledWith('/aucations', {
      method: 'POST',
      body: payload,
    })
  })

  it('memperbarui lelang dengan metode PUT', async () => {
    const payload = { title: 'Judul Baru' }

    await updateAucation(5, payload)

    expect(fetchApi).toHaveBeenCalledWith('/aucations/5', {
      method: 'PUT',
      body: payload,
    })
  })

  it('mengunggah cover menggunakan FormData', async () => {
    const file = new File(['gambar'], 'cover.png', {
      type: 'image/png',
    })

    await uploadAucationCover(7, file)

    const [endpoint, options] = fetchApi.mock.calls[0]

    expect(endpoint).toBe('/aucations/7/cover')
    expect(options.method).toBe('POST')
    expect(options.body).toBeInstanceOf(FormData)
    expect(options.body.get('cover')).toBe(file)
  })

  it('menghapus satu lelang', async () => {
    await deleteAucation(8)

    expect(fetchApi).toHaveBeenCalledWith('/aucations/8', {
      method: 'DELETE',
    })
  })

  it('menambahkan bid', async () => {
    const payload = { amount: 1500000 }

    await addBid(8, payload)

    expect(fetchApi).toHaveBeenCalledWith('/aucations/8/bids', {
      method: 'POST',
      body: payload,
    })
  })

  it('menghapus bid tanpa payload', async () => {
    await deleteBid(8)

    expect(fetchApi).toHaveBeenCalledWith('/aucations/8/bids', {
      method: 'DELETE',
    })
  })

  it('menghapus bid dengan payload', async () => {
    const payload = { bid_id: 20 }

    await deleteBid(8, payload)

    expect(fetchApi).toHaveBeenCalledWith('/aucations/8/bids', {
      method: 'DELETE',
      body: payload,
    })
  })

  it('menghapus seluruh lelang', async () => {
    await deleteAllAucations()

    expect(fetchApi).toHaveBeenCalledWith('/aucations', {
      method: 'DELETE',
    })
  })
})