import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useAucationsStore } from './aucationsStore.js'

const apiMocks = vi.hoisted(() => ({
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

vi.mock('../api/aucationApi.js', () => apiMocks)

beforeEach(() => {
  setActivePinia(createPinia())
  vi.resetAllMocks()
})

describe('useAucationsStore', () => {
  it('menginisialisasi state', () => {
    const store = useAucationsStore()
    expect(store.aucations).toEqual([])
    expect(store.aucation).toBeNull()
    expect(store.errorMessage).toBe('')
  })

  describe('fetchAucations', () => {
    it.each([
      [[{ id: 1 }], [{ id: 1 }]],
      [{ data: [{ id: 2 }] }, [{ id: 2 }]],
      [{ aucations: [{ id: 3 }] }, [{ id: 3 }]],
      [{ auctions: [{ id: 4 }] }, [{ id: 4 }]],
      [{ list: [{ id: 5 }] }, [{ id: 5 }]],
      [null, []],
      [{ data: null }, []],
      [{ other: [] }, []],
    ])('memproses respons API %j', async (response, expected) => {
      apiMocks.getAucations.mockResolvedValueOnce(response)
      const store = useAucationsStore()
      await expect(store.fetchAucations()).resolves.toEqual(expected)
      expect(store.isAucation).toBe(false)
    })

    it('mengirim filter ke API', async () => {
      const filters = { search: 'laptop', page: 2 }
      apiMocks.getAucations.mockResolvedValueOnce([])
      await useAucationsStore().fetchAucations(filters)
      expect(apiMocks.getAucations).toHaveBeenCalledWith(filters)
    })

    it('menangani error dengan pesan', async () => {
      apiMocks.getAucations.mockRejectedValueOnce(new Error('Gagal API'))
      const store = useAucationsStore()
      await expect(store.fetchAucations()).rejects.toThrow('Gagal API')
      expect(store.errorMessage).toBe('Gagal API')
      expect(store.isAucation).toBe(false)
    })

    it('menangani error tanpa pesan', async () => {
      apiMocks.getAucations.mockRejectedValueOnce({})
      const store = useAucationsStore()
      await expect(store.fetchAucations()).rejects.toEqual({})
      expect(store.errorMessage).toBe('Gagal mengambil daftar lelang.')
    })
  })

  describe('fetchAucation', () => {
    it.each([
      [{ aucation: { id: 1 } }, { id: 1 }],
      [{ auction: { id: 2 } }, { id: 2 }],
      [{ item: { id: 3 } }, { id: 3 }],
      [{ data: { id: 4 } }, { id: 4 }],
      [null, null],
    ])('memproses respons detail %j', async (response, expected) => {
      apiMocks.getAucationById.mockResolvedValueOnce(response)
      const store = useAucationsStore()
      await expect(store.fetchAucation(1)).resolves.toEqual(expected)
      expect(store.aucation).toEqual(expected)
      expect(store.isAucation).toBe(false)
    })

    it('menangani error dengan pesan', async () => {
      apiMocks.getAucationById.mockRejectedValueOnce(new Error('Detail gagal'))
      const store = useAucationsStore()
      await expect(store.fetchAucation(1)).rejects.toThrow('Detail gagal')
      expect(store.errorMessage).toBe('Detail gagal')
      expect(store.isAucation).toBe(false)
    })

    it('menangani error tanpa pesan', async () => {
      apiMocks.getAucationById.mockRejectedValueOnce({})
      const store = useAucationsStore()
      await expect(store.fetchAucation(1)).rejects.toEqual({})
      expect(store.errorMessage).toBe('Gagal mengambil detail lelang.')
    })
  })

  describe('addAucation', () => {
    it('menambahkan objek lelang ke awal daftar', async () => {
      const created = { id: 2, title: 'Baru' }
      apiMocks.addAucation.mockResolvedValueOnce({ data: { aucation: created } })
      const store = useAucationsStore()
      store.aucations = [{ id: 1 }]
      await store.addAucation({ title: 'Baru' })
      expect(store.aucations).toEqual([created, { id: 1 }])
      expect(store.isAucationAdded).toBe(true)
      expect(store.isAucationAdd).toBe(false)
    })

    it.each([null, 'respons'])('tidak menambahkan respons nonobjek %j', async (response) => {
      apiMocks.addAucation.mockResolvedValueOnce(response)
      const store = useAucationsStore()
      store.aucations = [{ id: 1 }]
      await store.addAucation({})
      expect(store.aucations).toEqual([{ id: 1 }])
      expect(store.isAucationAdded).toBe(true)
    })

    it('menangani error', async () => {
      apiMocks.addAucation.mockRejectedValueOnce(new Error('Tambah gagal'))
      const store = useAucationsStore()
      await expect(store.addAucation({})).rejects.toThrow('Tambah gagal')
      expect(store.errorMessage).toBe('Tambah gagal')
      expect(store.isAucationAdd).toBe(false)
    })

    it('menggunakan pesan error default', async () => {
      apiMocks.addAucation.mockRejectedValueOnce({})
      const store = useAucationsStore()
      await expect(store.addAucation({})).rejects.toEqual({})
      expect(store.errorMessage).toBe('Gagal menambahkan lelang.')
    })
  })

  describe('changeAucation', () => {
    it('memperbarui daftar dan detail dengan ID yang sama', async () => {
      const updated = { id: 1, title: 'Baru' }
      apiMocks.updateAucation.mockResolvedValueOnce({ data: { aucation: updated } })
      const store = useAucationsStore()
      store.aucations = [{ id: '1', title: 'Lama' }, { id: 2 }]
      store.aucation = { id: 1, title: 'Lama' }
      await store.changeAucation(1, { title: 'Baru' })
      expect(store.aucations[0].title).toBe('Baru')
      expect(store.aucation.title).toBe('Baru')
      expect(store.isAucationChange).toBe(false)
    })

    it('tidak mengubah detail jika ID berbeda', async () => {
      apiMocks.updateAucation.mockResolvedValueOnce({ data: { aucation: { id: 2, title: 'Baru' } } })
      const store = useAucationsStore()
      store.aucations = [{ id: 2, title: 'Lama' }]
      store.aucation = { id: 3, title: 'Detail' }
      await store.changeAucation(2, {})
      expect(store.aucations[0].title).toBe('Baru')
      expect(store.aucation.title).toBe('Detail')
    })

    it.each([null, 'teks'])('mengabaikan hasil yang bukan objek %j', async (response) => {
      apiMocks.updateAucation.mockResolvedValueOnce(response)
      const store = useAucationsStore()
      store.aucations = [{ id: 1 }]
      await store.changeAucation(1, {})
      expect(store.aucations).toEqual([{ id: 1 }])
      expect(store.isAucationChanged).toBe(true)
    })

    it('menangani error', async () => {
      apiMocks.updateAucation.mockRejectedValueOnce(new Error('Ubah gagal'))
      const store = useAucationsStore()
      await expect(store.changeAucation(1, {})).rejects.toThrow('Ubah gagal')
      expect(store.errorMessage).toBe('Ubah gagal')
      expect(store.isAucationChange).toBe(false)
    })

    it('menggunakan pesan error default', async () => {
      apiMocks.updateAucation.mockRejectedValueOnce({})
      const store = useAucationsStore()
      await expect(store.changeAucation(1, {})).rejects.toEqual({})
      expect(store.errorMessage).toBe('Gagal memperbarui data lelang.')
    })
  })

  describe('changeAucationCover', () => {
    it('menolak file kosong', async () => {
      const store = useAucationsStore()
      await expect(store.changeAucationCover(1, null)).rejects.toThrow('Pilih file cover terlebih dahulu.')
      expect(apiMocks.uploadAucationCover).not.toHaveBeenCalled()
    })

    it('memperbarui daftar dan detail cover', async () => {
      const file = new File(['gambar'], 'cover.png', { type: 'image/png' })
      apiMocks.uploadAucationCover.mockResolvedValueOnce({ data: { aucation: { id: 1, cover: 'baru.png' } } })
      const store = useAucationsStore()
      store.aucations = [{ id: 1 }]
      store.aucation = { id: 1 }
      await store.changeAucationCover(1, file)
      expect(store.aucations[0].cover).toBe('baru.png')
      expect(store.aucation.cover).toBe('baru.png')
      expect(store.isAucationChangeCover).toBe(false)
    })

    it('tidak mengubah detail jika ID berbeda', async () => {
      const file = new File(['gambar'], 'cover.png', { type: 'image/png' })
      apiMocks.uploadAucationCover.mockResolvedValueOnce({ data: { aucation: { id: 1, cover: 'baru.png' } } })
      const store = useAucationsStore()
      store.aucation = { id: 2, cover: 'lama.png' }
      await store.changeAucationCover(1, file)
      expect(store.aucation.cover).toBe('lama.png')
    })

    it.each([null, 'teks'])('mengabaikan hasil nonobjek %j', async (response) => {
      const file = new File(['gambar'], 'cover.png', { type: 'image/png' })
      apiMocks.uploadAucationCover.mockResolvedValueOnce(response)
      const store = useAucationsStore()
      await store.changeAucationCover(1, file)
      expect(store.isAucationChangedCover).toBe(true)
    })

    it('menangani error', async () => {
      const file = new File(['gambar'], 'cover.png', { type: 'image/png' })
      apiMocks.uploadAucationCover.mockRejectedValueOnce(new Error('Cover gagal'))
      const store = useAucationsStore()
      await expect(store.changeAucationCover(1, file)).rejects.toThrow('Cover gagal')
      expect(store.errorMessage).toBe('Cover gagal')
      expect(store.isAucationChangeCover).toBe(false)
    })

    it('menggunakan pesan error default', async () => {
      const file = new File(['gambar'], 'cover.png', { type: 'image/png' })
      apiMocks.uploadAucationCover.mockRejectedValueOnce({})
      const store = useAucationsStore()
      await expect(store.changeAucationCover(1, file)).rejects.toEqual({})
      expect(store.errorMessage).toBe('Gagal mengunggah cover lelang.')
    })
  })

  describe('deleteAucation', () => {
    it('menghapus item dan detail dengan ID sama', async () => {
      apiMocks.deleteAucation.mockResolvedValueOnce({ message: 'OK' })
      const store = useAucationsStore()
      store.aucations = [{ id: 1 }, { id: 2 }]
      store.aucation = { id: 1 }
      await store.deleteAucation(1)
      expect(store.aucations).toEqual([{ id: 2 }])
      expect(store.aucation).toBeNull()
      expect(store.isAucationDelete).toBe(false)
    })

    it('mempertahankan detail dengan ID berbeda', async () => {
      apiMocks.deleteAucation.mockResolvedValueOnce({})
      const store = useAucationsStore()
      store.aucations = [{ id: 1 }, { id: 2 }]
      store.aucation = { id: 2 }
      await store.deleteAucation(1)
      expect(store.aucations).toEqual([{ id: 2 }])
      expect(store.aucation).toEqual({ id: 2 })
    })

    it('menangani error', async () => {
      apiMocks.deleteAucation.mockRejectedValueOnce(new Error('Hapus gagal'))
      const store = useAucationsStore()
      await expect(store.deleteAucation(1)).rejects.toThrow('Hapus gagal')
      expect(store.errorMessage).toBe('Hapus gagal')
      expect(store.isAucationDelete).toBe(false)
    })

    it('menggunakan pesan error default', async () => {
      apiMocks.deleteAucation.mockRejectedValueOnce({})
      const store = useAucationsStore()
      await expect(store.deleteAucation(1)).rejects.toEqual({})
      expect(store.errorMessage).toBe('Gagal menghapus lelang.')
    })
  })

  describe('addBid', () => {
    it('berhasil menambahkan penawaran', async () => {
      apiMocks.addBid.mockResolvedValueOnce({ message: 'OK' })
      const store = useAucationsStore()
      await store.addBid(1, { amount: 100 })
      expect(apiMocks.addBid).toHaveBeenCalledWith(1, { amount: 100 })
      expect(store.isBidAdded).toBe(true)
      expect(store.isBidAdd).toBe(false)
    })

    it('menangani error', async () => {
      apiMocks.addBid.mockRejectedValueOnce(new Error('Bid gagal'))
      const store = useAucationsStore()
      await expect(store.addBid(1, {})).rejects.toThrow('Bid gagal')
      expect(store.errorMessage).toBe('Bid gagal')
      expect(store.isBidAdd).toBe(false)
    })

    it('menggunakan pesan error default', async () => {
      apiMocks.addBid.mockRejectedValueOnce({})
      const store = useAucationsStore()
      await expect(store.addBid(1, {})).rejects.toEqual({})
      expect(store.errorMessage).toBe('Gagal mengajukan penawaran.')
    })
  })

  describe('deleteBid', () => {
    it('berhasil menghapus penawaran', async () => {
      apiMocks.deleteBid.mockResolvedValueOnce({ message: 'OK' })
      const store = useAucationsStore()
      await store.deleteBid(1, { bidId: 2 })
      expect(apiMocks.deleteBid).toHaveBeenCalledWith(1, { bidId: 2 })
      expect(store.isBidDeleted).toBe(true)
      expect(store.isBidDelete).toBe(false)
    })

    it('menangani error', async () => {
      apiMocks.deleteBid.mockRejectedValueOnce(new Error('Hapus bid gagal'))
      const store = useAucationsStore()
      await expect(store.deleteBid(1, {})).rejects.toThrow('Hapus bid gagal')
      expect(store.errorMessage).toBe('Hapus bid gagal')
      expect(store.isBidDelete).toBe(false)
    })

    it('menggunakan pesan error default', async () => {
      apiMocks.deleteBid.mockRejectedValueOnce({})
      const store = useAucationsStore()
      await expect(store.deleteBid(1, {})).rejects.toEqual({})
      expect(store.errorMessage).toBe('Gagal menghapus penawaran.')
    })
  })

  describe('deleteAllAucations', () => {
    it('menghapus seluruh daftar dan detail', async () => {
      apiMocks.deleteAllAucations.mockResolvedValueOnce({ message: 'OK' })
      const store = useAucationsStore()
      store.aucations = [{ id: 1 }]
      store.aucation = { id: 1 }
      await store.deleteAllAucations()
      expect(store.aucations).toEqual([])
      expect(store.aucation).toBeNull()
      expect(store.isAucationDeletedAll).toBe(true)
      expect(store.isAucationDeleteAll).toBe(false)
    })

    it('menangani error', async () => {
      apiMocks.deleteAllAucations.mockRejectedValueOnce(new Error('Hapus semua gagal'))
      const store = useAucationsStore()
      await expect(store.deleteAllAucations()).rejects.toThrow('Hapus semua gagal')
      expect(store.errorMessage).toBe('Hapus semua gagal')
      expect(store.isAucationDeleteAll).toBe(false)
    })

    it('menggunakan pesan error default', async () => {
      apiMocks.deleteAllAucations.mockRejectedValueOnce({})
      const store = useAucationsStore()
      await expect(store.deleteAllAucations()).rejects.toEqual({})
      expect(store.errorMessage).toBe('Gagal menghapus seluruh lelang.')
    })
  })
})

describe('cabang tambahan untuk coverage', () => {
  it('menggunakan response langsung ketika data tidak tersedia', async () => {
    const response = [{ id: 1, title: 'Laptop' }]

    apiMocks.getAucations.mockResolvedValueOnce(response)

    const store = useAucationsStore()

    await expect(store.fetchAucations()).resolves.toEqual(response)
  })

  it('mengembalikan daftar kosong ketika properti daftar bukan array', async () => {
    apiMocks.getAucations.mockResolvedValueOnce({
      data: {
        aucations: {},
        auctions: null,
        list: 'bukan array',
      },
    })

    const store = useAucationsStore()

    await expect(store.fetchAucations()).resolves.toEqual([])
  })

  it('menggunakan objek respons ketika detail tidak memiliki pembungkus valid', async () => {
    const response = {
      data: {
        aucation: null,
        auction: null,
        item: null,
        id: 10,
        title: 'Laptop',
      },
    }

    apiMocks.getAucationById.mockResolvedValueOnce(response)

    const store = useAucationsStore()

    await expect(store.fetchAucation(10)).resolves.toEqual({
      aucation: null,
      auction: null,
      item: null,
      id: 10,
      title: 'Laptop',
    })
  })

  it('menambahkan objek hasil respons langsung ke daftar lelang', async () => {
    const created = [{ id: 11, title: 'Kamera' }]

    apiMocks.addAucation.mockResolvedValueOnce(created)

    const store = useAucationsStore()

    await store.addAucation({ title: 'Kamera' })

    expect(store.aucations[0]).toEqual(created)
  })

  it('tidak memperbarui detail ketika detail lelang belum tersedia', async () => {
    apiMocks.updateAucation.mockResolvedValueOnce({
      data: { aucation: { id: 1, title: 'Laptop Baru' } },
    })

    const store = useAucationsStore()
    store.aucations = [{ id: 1, title: 'Laptop' }]
    store.aucation = null

    await store.changeAucation(1, { title: 'Laptop Baru' })

    expect(store.aucations[0].title).toBe('Laptop Baru')
    expect(store.aucation).toBeNull()
  })

  it('tidak memperbarui detail ketika detail belum tersedia saat cover diganti', async () => {
    apiMocks.uploadAucationCover.mockResolvedValueOnce({
      data: { aucation: { id: 1, cover: 'cover-baru.jpg' } },
    })

    const store = useAucationsStore()
    store.aucations = [{ id: 1, cover: 'cover-lama.jpg' }]
    store.aucation = null

    await store.changeAucationCover(1, new File(['cover'], 'cover.jpg'))

    expect(store.aucations[0].cover).toBe('cover-baru.jpg')
    expect(store.aucation).toBeNull()
  })

  it('tetap menghapus lelang ketika detail aktif tidak tersedia', async () => {
    apiMocks.deleteAucation.mockResolvedValueOnce({ success: true })

    const store = useAucationsStore()
    store.aucations = [
      { id: 1, title: 'Laptop' },
      { id: 2, title: 'Kamera' },
    ]
    store.aucation = null

    await store.deleteAucation(1)

    expect(store.aucations).toEqual([{ id: 2, title: 'Kamera' }])
    expect(store.aucation).toBeNull()
  })
})

describe('pengujian cabang pencocokan ID', () => {
  it('mempertahankan item lain ketika ID lelang tidak cocok saat update', async () => {
    apiMocks.updateAucation.mockResolvedValueOnce({
      data: { aucation: { id: 99, title: 'Hasil API' } },
    })

    const store = useAucationsStore()
    store.aucations = [
      { id: 1, title: 'Laptop' },
      { id: 2, title: 'Kamera' },
    ]
    store.aucation = { id: 2, title: 'Kamera detail' }

    await store.changeAucation(1, { title: 'Laptop baru' })

    expect(store.aucations).toEqual([
      { id: 99, title: 'Hasil API' },
      { id: 2, title: 'Kamera' },
    ])
  })

  it('mempertahankan item lain ketika ID tidak cocok saat update cover', async () => {
    apiMocks.uploadAucationCover.mockResolvedValueOnce({
      data: { aucation: { id: 99, cover: 'cover-baru.jpg' } },
    })

    const store = useAucationsStore()
    store.aucations = [
      { id: 1, cover: 'cover-lama.jpg' },
      { id: 2, cover: 'kamera.jpg' },
    ]
    store.aucation = { id: 2, cover: 'kamera.jpg' }

    await store.changeAucationCover(
      1,
      new File(['cover'], 'cover.jpg'),
    )

    expect(store.aucations).toHaveLength(2)
    expect(store.aucations[1]).toEqual({
      id: 2,
      cover: 'kamera.jpg',
    })
  })

  it('tidak mengubah daftar jika respons update bukan objek', async () => {
    apiMocks.updateAucation.mockResolvedValueOnce(null)

    const store = useAucationsStore()
    store.aucations = [{ id: 1, title: 'Laptop' }]

    await store.changeAucation(1, { title: 'Laptop baru' })

    expect(store.aucations).toEqual([
      { id: 1, title: 'Laptop' },
    ])
    expect(store.isAucationChanged).toBe(true)
  })

  it('tidak mengubah daftar jika respons update cover bukan objek', async () => {
    apiMocks.uploadAucationCover.mockResolvedValueOnce({
      data: 'ok',
    })

    const store = useAucationsStore()
    store.aucations = [{ id: 1, cover: 'cover-lama.jpg' }]

    await store.changeAucationCover(
      1,
      new File(['cover'], 'cover.jpg'),
    )

    expect(store.aucations).toEqual([
      { id: 1, cover: 'cover-lama.jpg' },
    ])
    expect(store.isAucationChangedCover).toBe(true)
  })
})