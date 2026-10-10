import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises } from '@vue/test-utils'
import Swal from 'sweetalert2'
import { renderWithProviders } from '../../../test-utils.js'
import DetailPage from './DetailPage.vue'
import * as api from '../api/aucationApi.js'
import * as userApi from '../../users/api/userApi.js'

vi.mock('sweetalert2', () => ({ default: { fire: vi.fn() } }))
vi.mock('@toast-ui/editor', () => ({
  default: vi.fn(function () {
    return { getMarkdown: () => '', setMarkdown: vi.fn(), destroy: vi.fn() }
  }),
}))
vi.mock('@toast-ui/editor/dist/toastui-editor-viewer', () => ({
  default: vi.fn(function () {
    return { setMarkdown: vi.fn(), destroy: vi.fn() }
  }),
}))
vi.mock('@toast-ui/editor/dist/toastui-editor.css', () => ({}))
vi.mock('@toast-ui/editor/dist/toastui-editor-viewer.css', () => ({}))
vi.mock('../api/aucationApi.js', () => ({
  getAucationById: vi.fn(),
  updateAucation: vi.fn(),
  uploadAucationCover: vi.fn(),
  deleteAucation: vi.fn(),
  addBid: vi.fn(),
  deleteBid: vi.fn(),
}))
vi.mock('../../users/api/userApi.js', () => ({ getMyProfile: vi.fn() }))

const detail = (overrides = {}) => ({
  data: {
    aucation: {
      id: 5,
      user_id: 10,
      title: 'Laptop',
      description: 'Bagus',
      cover: 'img/c.png',
      start_bid: 1000,
      closed_at: '2999-01-01 10:00:00',
      author: { name: 'Budi' },
      bids: [
        { id: 1, bid: 1500, created_at: '2026-01-01' },
        { id: 2, bid: 2500, created_at: '2026-01-02' },
      ],
      my_bid: null,
      ...overrides,
    },
  },
})

const routes = [
  { path: '/', name: 'home', component: { template: '<div />' } },
  { path: '/aucations/:aucationId', name: 'detail-aucation', component: DetailPage, props: true },
]

async function setup({ aucation = {}, user = { id: 99 } } = {}) {
  api.getAucationById.mockResolvedValue(detail(aucation))
  localStorage.clear()
  if (user) localStorage.setItem('authUser', JSON.stringify(user))
  const result = renderWithProviders(DetailPage, {
    routes,
    props: { aucationId: '5' },
  })
  await result.router.isReady()
  await flushPromises()
  return result
}

const button = (wrapper, label) => wrapper.findAll('button').find((b) => b.text().includes(label))

describe('DetailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    Swal.fire.mockResolvedValue({ isConfirmed: true })
  })

  it('memuat detail memakai prop aucationId dan menampilkan datanya', async () => {
    const { wrapper } = await setup()
    expect(api.getAucationById).toHaveBeenCalledWith('5')
    const text = wrapper.text()
    expect(text).toContain('Laptop')
    expect(text).toContain('Oleh Budi')
    expect(text).toContain('Berlangsung')
    expect(wrapper.find('img').attributes('src')).toBe('https://open-api.delcom.org/img/c.png')
  })

  it('menampilkan riwayat bid terurut dari tertinggi', async () => {
    const { wrapper } = await setup()
    const rows = wrapper.findAll('[data-testid="bid-item"]')
    expect(rows).toHaveLength(2)
    expect(rows[0].text()).toContain('2.500')
    expect(wrapper.text()).toContain('Tawaran tertinggi')
  })

  it('menampilkan pesan saat belum ada bid, tanpa cover/author', async () => {
    const { wrapper } = await setup({ aucation: { bids: [], cover: null, author: null } })
    expect(wrapper.text()).toContain('Belum ada penawaran.')
    expect(wrapper.text()).toContain('Belum ada')
    expect(wrapper.find('img').exists()).toBe(false)
  })

  it('menangani deskripsi null', async () => {
    const { wrapper } = await setup({ aucation: { description: null } })
    expect(wrapper.findComponent({ name: 'MarkdownViewer' }).props('content')).toBe('')
  })

  it('menangani bids undefined', async () => {
    const { wrapper } = await setup({ aucation: { bids: undefined } })
    expect(wrapper.text()).toContain('Belum ada penawaran.')
  })

  it('menampilkan loading dan state tidak ditemukan', async () => {
    api.getAucationById.mockReturnValue(new Promise(() => {}))
    const loading = renderWithProviders(DetailPage, { routes, props: { aucationId: '5' } })
    await loading.wrapper.vm.$nextTick()
    expect(loading.wrapper.text()).toContain('Memuat detail lelang')

    api.getAucationById.mockRejectedValue(new Error('Tidak ada'))
    const { wrapper } = renderWithProviders(DetailPage, { routes, props: { aucationId: '5' } })
    await flushPromises()
    expect(wrapper.text()).toContain('Lelang tidak ditemukan')
    expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ text: 'Tidak ada' }))
  })

  it('peserta lelang dapat mengajukan bid', async () => {
    api.addBid.mockResolvedValue({})
    const { wrapper } = await setup()
    expect(button(wrapper, 'Ubah Lelang')).toBeUndefined()

    await button(wrapper, 'Ajukan Penawaran').trigger('click')
    const modal = wrapper.findComponent({ name: 'BidModal' })
    expect(modal.props('show')).toBe(true)
    expect(modal.props('currentBid')).toBe(2500)

    modal.vm.$emit('submit', { bid: 3000 })
    await flushPromises()
    expect(api.addBid).toHaveBeenCalledWith('5', { bid: 3000 })
    expect(api.getAucationById).toHaveBeenCalledTimes(2)
    expect(modal.props('show')).toBe(false)
  })

  it('currentBid memakai harga awal bila belum ada bid', async () => {
    const { wrapper } = await setup({ aucation: { bids: [] } })
    expect(wrapper.findComponent({ name: 'BidModal' }).props('currentBid')).toBe(1000)
  })

  it('currentBid bernilai 0 saat detail belum tersedia', async () => {
    api.getAucationById.mockRejectedValue(new Error('x'))
    const { wrapper } = renderWithProviders(DetailPage, { routes, props: { aucationId: '5' } })
    await flushPromises()
    expect(wrapper.findComponent({ name: 'BidModal' }).props('currentBid')).toBe(0)
  })

  it('menampilkan error saat bid gagal dan modal tetap terbuka', async () => {
    api.addBid.mockRejectedValue(new Error('Bid ditolak'))
    const { wrapper } = await setup()
    await button(wrapper, 'Ajukan Penawaran').trigger('click')
    wrapper.findComponent({ name: 'BidModal' }).vm.$emit('submit', { bid: 1 })
    await flushPromises()
    expect(Swal.fire).toHaveBeenLastCalledWith(expect.objectContaining({ text: 'Bid ditolak' }))
    expect(wrapper.findComponent({ name: 'BidModal' }).props('show')).toBe(true)
    wrapper.findComponent({ name: 'BidModal' }).vm.$emit('close')
    await wrapper.vm.$nextTick()
    expect(wrapper.findComponent({ name: 'BidModal' }).props('show')).toBe(false)
  })

  it('peserta dapat membatalkan bid miliknya', async () => {
    api.deleteBid.mockResolvedValue({})
    const { wrapper } = await setup({ aucation: { my_bid: { id: 2, bid: 2500 } } })
    expect(wrapper.text()).toContain('Penawaran kamu')

    await button(wrapper, 'Batalkan Penawaran').trigger('click')
    await flushPromises()
    expect(api.deleteBid).toHaveBeenCalledWith('5')
    expect(api.getAucationById).toHaveBeenCalledTimes(2)
  })

  it('pembatalan bid dibatalkan pengguna atau gagal', async () => {
    const { wrapper } = await setup({ aucation: { my_bid: { id: 2, bid: 2500 } } })
    Swal.fire.mockResolvedValueOnce({ isConfirmed: false })
    await button(wrapper, 'Batalkan Penawaran').trigger('click')
    await flushPromises()
    expect(api.deleteBid).not.toHaveBeenCalled()

    api.deleteBid.mockRejectedValue(new Error('Gagal batal'))
    await button(wrapper, 'Batalkan Penawaran').trigger('click')
    await flushPromises()
    expect(api.getAucationById).toHaveBeenCalledTimes(1)
  })

  it('lelang ditutup tidak menampilkan tombol bid', async () => {
    const { wrapper } = await setup({ aucation: { closed_at: '2000-01-01 10:00:00' } })
    expect(wrapper.text()).toContain('Ditutup')
    expect(button(wrapper, 'Ajukan Penawaran')).toBeUndefined()
  })

  it('pemilik melihat aksi ubah, cover, dan hapus', async () => {
    const { wrapper } = await setup({ user: { id: 10 } })
    expect(button(wrapper, 'Ubah Lelang')).toBeDefined()
    expect(button(wrapper, 'Ubah Cover')).toBeDefined()
    expect(button(wrapper, 'Hapus Lelang')).toBeDefined()
    expect(button(wrapper, 'Ajukan Penawaran')).toBeUndefined()
  })

  it('pemilik dikenali dari profil bila authUser belum tersimpan', async () => {
    userApi.getMyProfile.mockResolvedValue({ data: { user: { id: 10 } } })
    const { wrapper } = await setup({ user: null })
    expect(userApi.getMyProfile).toHaveBeenCalled()
    expect(button(wrapper, 'Ubah Lelang')).toBeDefined()
  })

  it('tetap berjalan sebagai peserta bila profil gagal dimuat', async () => {
    userApi.getMyProfile.mockRejectedValue(new Error('x'))
    const { wrapper } = await setup({ user: null })
    expect(button(wrapper, 'Ajukan Penawaran')).toBeDefined()
  })

  it('pemilik memperbarui data lelang', async () => {
    api.updateAucation.mockResolvedValue({})
    const { wrapper } = await setup({ user: { id: 10 } })
    await button(wrapper, 'Ubah Lelang').trigger('click')
    const modal = wrapper.findComponent({ name: 'ChangeModal' })
    expect(modal.props('show')).toBe(true)

    modal.vm.$emit('submit', { title: 'Baru' })
    await flushPromises()
    expect(api.updateAucation).toHaveBeenCalledWith('5', { title: 'Baru' })
    expect(modal.props('show')).toBe(false)
  })

  it('error saat memperbarui data lelang', async () => {
    api.updateAucation.mockRejectedValue(new Error('Gagal ubah'))
    const { wrapper } = await setup({ user: { id: 10 } })
    await button(wrapper, 'Ubah Lelang').trigger('click')
    const modal = wrapper.findComponent({ name: 'ChangeModal' })
    modal.vm.$emit('submit', {})
    await flushPromises()
    expect(modal.props('show')).toBe(true)
    modal.vm.$emit('close')
    await wrapper.vm.$nextTick()
    expect(modal.props('show')).toBe(false)
  })

  it('pemilik mengganti cover', async () => {
    api.uploadAucationCover.mockResolvedValue({})
    const { wrapper } = await setup({ user: { id: 10 } })
    await button(wrapper, 'Ubah Cover').trigger('click')
    const modal = wrapper.findComponent({ name: 'ChangeCoverModal' })
    const file = new File(['x'], 'a.png', { type: 'image/png' })
    modal.vm.$emit('submit', file)
    await flushPromises()
    expect(api.uploadAucationCover).toHaveBeenCalledWith('5', file)
    expect(modal.props('show')).toBe(false)
  })

  it('error saat mengganti cover', async () => {
    api.uploadAucationCover.mockRejectedValue(new Error('Cover gagal'))
    const { wrapper } = await setup({ user: { id: 10 } })
    await button(wrapper, 'Ubah Cover').trigger('click')
    const modal = wrapper.findComponent({ name: 'ChangeCoverModal' })
    modal.vm.$emit('submit', new File(['x'], 'a.png'))
    await flushPromises()
    expect(modal.props('show')).toBe(true)
    modal.vm.$emit('close')
    await wrapper.vm.$nextTick()
    expect(modal.props('show')).toBe(false)
  })

  it('pemilik menghapus lelang lalu kembali ke beranda', async () => {
    api.deleteAucation.mockResolvedValue({})
    const { wrapper, router } = await setup({ user: { id: 10 } })
    await router.push('/aucations/5')
    await button(wrapper, 'Hapus Lelang').trigger('click')
    await flushPromises()
    expect(api.deleteAucation).toHaveBeenCalledWith('5')
    expect(router.currentRoute.value.name).toBe('home')
  })

  it('hapus lelang dibatalkan atau gagal', async () => {
    const { wrapper, router } = await setup({ user: { id: 10 } })
    await router.push('/aucations/5')
    Swal.fire.mockResolvedValueOnce({ isConfirmed: false })
    await button(wrapper, 'Hapus Lelang').trigger('click')
    await flushPromises()
    expect(api.deleteAucation).not.toHaveBeenCalled()

    api.deleteAucation.mockRejectedValue(new Error('Gagal hapus'))
    await button(wrapper, 'Hapus Lelang').trigger('click')
    await flushPromises()
    expect(router.currentRoute.value.name).not.toBe('home')
  })

  it('tombol kembali menuju beranda', async () => {
    const { wrapper, router } = await setup()
    await router.push('/aucations/5')
    await button(wrapper, 'Kembali').trigger('click')
    await flushPromises()
    expect(router.currentRoute.value.name).toBe('home')
  })

  it('memuat ulang saat prop aucationId berubah', async () => {
    const { wrapper } = await setup()
    await wrapper.setProps({ aucationId: '6' })
    await flushPromises()
    expect(api.getAucationById).toHaveBeenLastCalledWith('6')
  })
})
