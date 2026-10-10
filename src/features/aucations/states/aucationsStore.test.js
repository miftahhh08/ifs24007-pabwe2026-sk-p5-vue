import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import * as api from '../api/aucationApi.js'
import { useAucationsStore } from './aucationsStore.js'

vi.mock('../api/aucationApi.js', () => ({
  getAucations: vi.fn(),
  getAucationById: vi.fn(),
  addAucation: vi.fn(),
  updateAucation: vi.fn(),
  uploadAucationCover: vi.fn(),
  deleteAucation: vi.fn(),
  addBid: vi.fn(),
  deleteBid: vi.fn(),
  deleteAllAucations: vi.fn(),
}))

describe('useAucationsStore', () => {
  let store

  beforeEach(() => {
    vi.clearAllMocks()
    setActivePinia(createPinia())
    store = useAucationsStore()
  })

  it('fetchAucations menyimpan daftar lelang', async () => {
    api.getAucations.mockResolvedValue({ data: { aucations: [{ id: 1 }] } })
    const result = await store.fetchAucations({ is_me: 1 })
    expect(api.getAucations).toHaveBeenCalledWith({ is_me: 1 })
    expect(result).toEqual([{ id: 1 }])
    expect(store.isAucation).toBe(false)
  })

  it('fetchAucations memakai array kosong bila data tidak ada', async () => {
    api.getAucations.mockResolvedValue({})
    await store.fetchAucations()
    expect(store.aucations).toEqual([])
  })

  it('fetchAucations menyimpan pesan error dan melempar ulang', async () => {
    api.getAucations.mockRejectedValue(new Error('gagal'))
    await expect(store.fetchAucations()).rejects.toThrow('gagal')
    expect(store.errorMessage).toBe('gagal')
    api.getAucations.mockRejectedValue({})
    await expect(store.fetchAucations()).rejects.toBeDefined()
    expect(store.errorMessage).toBe('Gagal mengambil daftar lelang.')
  })

  it('fetchAucation menyimpan detail lelang', async () => {
    api.getAucationById.mockResolvedValue({ data: { aucation: { id: 2 } } })
    await store.fetchAucation(2)
    expect(store.aucation).toEqual({ id: 2 })
    api.getAucationById.mockResolvedValue({})
    await store.fetchAucation(2)
    expect(store.aucation).toBeNull()
  })

  it('fetchAucation menangani error', async () => {
    api.getAucationById.mockRejectedValue(new Error('404'))
    await expect(store.fetchAucation(2)).rejects.toThrow('404')
    expect(store.errorMessage).toBe('404')
    api.getAucationById.mockRejectedValue({})
    await expect(store.fetchAucation(2)).rejects.toBeDefined()
    expect(store.errorMessage).toBe('Gagal mengambil detail lelang.')
  })

  const mutations = [
    ['addAucation', 'addAucation', [{ title: 'a' }], 'isAucationAdded', 'Gagal menambahkan lelang.'],
    ['changeAucation', 'updateAucation', [1, { title: 'a' }], 'isAucationChanged', 'Gagal memperbarui data lelang.'],
    ['changeAucationCover', 'uploadAucationCover', [1, 'file'], 'isAucationChangedCover', 'Gagal mengunggah cover lelang.'],
    ['addBid', 'addBid', [1, { bid: 5 }], 'isBidAdded', 'Gagal mengajukan penawaran.'],
    ['deleteBid', 'deleteBid', [1], 'isBidDeleted', 'Gagal membatalkan penawaran.'],
  ]

  it.each(mutations)('%s berhasil dan gagal', async (action, apiName, args, doneKey, fallback) => {
    api[apiName].mockResolvedValue({ status: 'success' })
    await expect(store[action](...args)).resolves.toEqual({ status: 'success' })
    expect(store[doneKey]).toBe(true)

    api[apiName].mockRejectedValue(new Error('ditolak'))
    await expect(store[action](...args)).rejects.toThrow('ditolak')
    expect(store.errorMessage).toBe('ditolak')
    expect(store[doneKey]).toBe(false)

    api[apiName].mockRejectedValue({})
    await expect(store[action](...args)).rejects.toBeDefined()
    expect(store.errorMessage).toBe(fallback)
  })

  it('deleteAucation menghapus item dari state', async () => {
    api.deleteAucation.mockResolvedValue({})
    store.aucations = [{ id: 1 }, { id: 2 }]
    store.aucation = { id: 1 }
    await store.deleteAucation(1)
    expect(store.aucations).toEqual([{ id: 2 }])
    expect(store.aucation).toBeNull()
    expect(store.isAucationDeleted).toBe(true)

    store.aucation = { id: 9 }
    await store.deleteAucation(2)
    expect(store.aucation).toEqual({ id: 9 })
  })

  it('deleteAucation tidak mengubah state saat gagal', async () => {
    api.deleteAucation.mockRejectedValue(new Error('x'))
    store.aucations = [{ id: 1 }]
    await expect(store.deleteAucation(1)).rejects.toThrow('x')
    expect(store.aucations).toHaveLength(1)
  })

  it('deleteAllAucations mengosongkan state', async () => {
    api.deleteAllAucations.mockResolvedValue({})
    store.aucations = [{ id: 1 }]
    store.aucation = { id: 1 }
    await store.deleteAllAucations()
    expect(store.aucations).toEqual([])
    expect(store.aucation).toBeNull()
    expect(store.isAucationDeletedAll).toBe(true)
  })
})
