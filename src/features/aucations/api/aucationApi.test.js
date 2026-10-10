import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fetchApi } from '../../../helpers/apiHelper.js'
import * as api from './aucationApi.js'

vi.mock('../../../helpers/apiHelper.js', () => ({
  fetchApi: vi.fn(() => Promise.resolve({ status: 'success' })),
}))

describe('aucationApi', () => {
  beforeEach(() => vi.clearAllMocks())

  it('getAucations mengirim filter is_me dan is_closed', async () => {
    await api.getAucations({ is_me: 1, is_closed: 0 })
    expect(fetchApi).toHaveBeenCalledWith('/aucations', {
      params: { is_me: 1, is_closed: 0 },
    })
    await api.getAucations()
    expect(fetchApi).toHaveBeenLastCalledWith('/aucations', {
      params: { is_me: undefined, is_closed: undefined },
    })
  })

  it('getAucationById memanggil GET /aucations/:id', async () => {
    await api.getAucationById(7)
    expect(fetchApi).toHaveBeenCalledWith('/aucations/7')
  })

  it('addAucation memanggil POST /aucations', async () => {
    const body = { title: 'a', description: 'b', start_bid: 1, closed_at: 'x' }
    await api.addAucation(body)
    expect(fetchApi).toHaveBeenCalledWith('/aucations', { method: 'POST', body })
  })

  it('updateAucation memanggil PUT /aucations/:id', async () => {
    await api.updateAucation(3, { title: 'z' })
    expect(fetchApi).toHaveBeenCalledWith('/aucations/3', {
      method: 'PUT',
      body: { title: 'z' },
    })
  })

  it('uploadAucationCover mengirim FormData berisi field cover', async () => {
    const file = new File(['x'], 'c.png', { type: 'image/png' })
    await api.uploadAucationCover(3, file)
    const [endpoint, options] = fetchApi.mock.calls[0]
    expect(endpoint).toBe('/aucations/3/cover')
    expect(options.method).toBe('POST')
    expect(options.body.get('cover')).toBe(file)
  })

  it('deleteAucation memanggil DELETE /aucations/:id', async () => {
    await api.deleteAucation(3)
    expect(fetchApi).toHaveBeenCalledWith('/aucations/3', { method: 'DELETE' })
  })

  it('addBid memanggil POST /aucations/:id/bids', async () => {
    await api.addBid(3, { bid: 500 })
    expect(fetchApi).toHaveBeenCalledWith('/aucations/3/bids', {
      method: 'POST',
      body: { bid: 500 },
    })
  })

  it('deleteBid memanggil DELETE /aucations/:id/bids', async () => {
    await api.deleteBid(3)
    expect(fetchApi).toHaveBeenCalledWith('/aucations/3/bids', {
      method: 'DELETE',
    })
  })

  it('deleteAllAucations memanggil DELETE /aucations', async () => {
    await api.deleteAllAucations()
    expect(fetchApi).toHaveBeenCalledWith('/aucations', { method: 'DELETE' })
  })
})
