import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises } from '@vue/test-utils'
import Swal from 'sweetalert2'
import { renderWithProviders } from '../../../test-utils.js'
import HomePage from './HomePage.vue'
import * as api from '../api/aucationApi.js'

vi.mock('sweetalert2', () => ({ default: { fire: vi.fn() } }))
vi.mock('../api/aucationApi.js', () => ({
  getAucations: vi.fn(),
  deleteAucation: vi.fn(),
  deleteAllAucations: vi.fn(),
  addAucation: vi.fn(),
}))

const future = '2999-01-01 10:00:00'
const past = '2000-01-01 10:00:00'

const items = [
  { id: 1, title: 'Laptop', description: 'Gaming', start_bid: 1000, closed_at: future, cover: 'img/a.png', bids: [{ id: 1, bid: 3000 }] },
  { id: 2, title: 'Kamera', description: 'Mirrorless', start_bid: 500, closed_at: past, bids: [5, 6] },
  { id: 3, title: 'Jam', description: null, start_bid: 200, closed_at: future },
  { id: 4, title: null, description: 'Tanpa judul', start_bid: 100, closed_at: future },
]

const routes = [
  { path: '/', name: 'home', component: HomePage },
  { path: '/aucations/:aucationId', name: 'detail-aucation', component: { template: '<div />' } },
]

async function setup(initialRoute = '/') {
  const result = renderWithProviders(HomePage, {
    routes,
    initialRoute,
    props: {},
  })
  await result.router.isReady()
  if (initialRoute !== '/') {
    await result.router.push(initialRoute)
  }
  await flushPromises()
  return result
}

const cards = (wrapper) => wrapper.findAll('[data-testid="aucation-card"]')

describe('HomePage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    api.getAucations.mockResolvedValue({ data: { aucations: items } })
    Swal.fire.mockResolvedValue({ isConfirmed: true })
  })

  afterEach(() => vi.useRealTimers())

  it('memuat dan menampilkan kartu lelang', async () => {
    const { wrapper } = await setup()
    expect(api.getAucations).toHaveBeenCalledWith({})
    expect(cards(wrapper)).toHaveLength(4)
    const text = wrapper.text()
    expect(text).toContain('Laptop')
    expect(text).toContain('Tawaran tertinggi')
    expect(text).toContain('2 tawaran')
    expect(text).toContain('0 tawaran')
    expect(text).toContain('Belum ada cover')
    expect(text).toContain('Tidak ada deskripsi.')
    expect(wrapper.find('img').attributes('src')).toBe('https://open-api.delcom.org/img/a.png')
  })

  it('menampilkan status berlangsung dan ditutup', async () => {
    const { wrapper } = await setup()
    expect(cards(wrapper)[0].text()).toContain('Berlangsung')
    expect(cards(wrapper)[1].text()).toContain('Ditutup')
  })

  it('menampilkan dialog error saat gagal memuat', async () => {
    api.getAucations.mockRejectedValue(new Error('Server error'))
    await setup()
    expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ icon: 'error', text: 'Server error' }))
  })

  it('menampilkan state kosong', async () => {
    api.getAucations.mockResolvedValue({ data: { aucations: [] } })
    const { wrapper } = await setup()
    expect(wrapper.text()).toContain('Belum ada lelang')
  })

  it('menampilkan indikator loading', async () => {
    api.getAucations.mockReturnValue(new Promise(() => {}))
    const { wrapper } = renderWithProviders(HomePage, { routes })
    await wrapper.vm.$nextTick()
    expect(wrapper.text()).toContain('Memuat daftar lelang')
  })

  it('live search memfilter judul dan deskripsi', async () => {
    const { wrapper } = await setup()
    await wrapper.find('input[type="search"]').setValue('mirror')
    expect(cards(wrapper)).toHaveLength(1)
    expect(cards(wrapper)[0].text()).toContain('Kamera')
    await wrapper.find('input[type="search"]').setValue('lap')
    expect(cards(wrapper)[0].text()).toContain('Laptop')
  })

  it('tab berlangsung dan ditutup memfilter secara lokal', async () => {
    const { wrapper, router } = await setup()
    const tabs = wrapper.findAll('[role="tab"]')
    expect(tabs).toHaveLength(4)

    await tabs[2].trigger('click')
    await flushPromises()
    expect(router.currentRoute.value.query.filter).toBe('active')
    expect(cards(wrapper)).toHaveLength(3)

    await tabs[3].trigger('click')
    await flushPromises()
    expect(cards(wrapper)).toHaveLength(1)
    expect(cards(wrapper)[0].text()).toContain('Kamera')

    await tabs[0].trigger('click')
    await flushPromises()
    expect(router.currentRoute.value.query.filter).toBeUndefined()
    expect(cards(wrapper)).toHaveLength(4)
  })

  it('tab Lelang Saya meminta is_me=1 dan menampilkan aksi cepat', async () => {
    const { wrapper } = await setup('/?filter=mine')
    expect(api.getAucations).toHaveBeenLastCalledWith({ is_me: 1 })
    expect(wrapper.text()).toContain('Hapus Semua Lelang Saya')
    expect(wrapper.find('button[aria-label="Hapus Laptop"]').exists()).toBe(true)
  })

  it('query tidak valid jatuh ke tab semua', async () => {
    const { wrapper } = await setup('/?filter=ngawur')
    expect(wrapper.find('[role="tab"][aria-selected="true"]').text()).toBe('Semua Lelang')
  })

  it('mengikuti perubahan query dari sidebar', async () => {
    const { wrapper, router } = await setup()
    await router.push('/?filter=mine')
    await flushPromises()
    expect(api.getAucations).toHaveBeenLastCalledWith({ is_me: 1 })
    expect(wrapper.find('[role="tab"][aria-selected="true"]').text()).toBe('Lelang Saya')
  })

  it('membuka halaman detail', async () => {
    const { wrapper, router } = await setup()
    await cards(wrapper)[0].find('button').trigger('click')
    await flushPromises()
    expect(router.currentRoute.value.path).toBe('/aucations/1')
  })

  it('membuat lelang baru lalu memuat ulang', async () => {
    api.addAucation.mockResolvedValue({})
    const { wrapper } = await setup()
    await wrapper.findAll('button').find((b) => b.text().includes('Buat Lelang')).trigger('click')
    const modal = wrapper.findComponent({ name: 'AddModal' })
    expect(modal.props('show')).toBe(true)

    modal.vm.$emit('submit', { title: 'Baru' })
    await flushPromises()
    expect(api.addAucation).toHaveBeenCalledWith({ title: 'Baru' })
    expect(api.getAucations).toHaveBeenCalledTimes(2)
    expect(modal.props('show')).toBe(false)

    modal.vm.$emit('close')
  })

  it('menampilkan error saat gagal membuat lelang', async () => {
    api.addAucation.mockRejectedValue(new Error('Judul wajib'))
    const { wrapper } = await setup()
    wrapper.findComponent({ name: 'AddModal' }).vm.$emit('submit', {})
    await flushPromises()
    expect(Swal.fire).toHaveBeenLastCalledWith(expect.objectContaining({ text: 'Judul wajib' }))
  })

  it('menutup modal tambah', async () => {
    const { wrapper } = await setup()
    await wrapper.findAll('button').find((b) => b.text().includes('Buat Lelang')).trigger('click')
    wrapper.findComponent({ name: 'AddModal' }).vm.$emit('close')
    await wrapper.vm.$nextTick()
    expect(wrapper.findComponent({ name: 'AddModal' }).props('show')).toBe(false)
  })

  it('menghapus satu lelang setelah konfirmasi', async () => {
    api.deleteAucation.mockResolvedValue({})
    const { wrapper } = await setup('/?filter=mine')
    await wrapper.find('button[aria-label="Hapus Laptop"]').trigger('click')
    await flushPromises()
    expect(api.deleteAucation).toHaveBeenCalledWith(1)
    expect(cards(wrapper)).toHaveLength(3)
  })

  it('tidak menghapus bila dibatalkan atau gagal', async () => {
    const { wrapper } = await setup('/?filter=mine')
    Swal.fire.mockResolvedValueOnce({ isConfirmed: false })
    await wrapper.find('button[aria-label="Hapus Laptop"]').trigger('click')
    await flushPromises()
    expect(api.deleteAucation).not.toHaveBeenCalled()

    api.deleteAucation.mockRejectedValue(new Error('Tidak bisa'))
    await wrapper.find('button[aria-label="Hapus Laptop"]').trigger('click')
    await flushPromises()
    expect(Swal.fire).toHaveBeenLastCalledWith(expect.objectContaining({ text: 'Tidak bisa' }))
  })

  it('menghapus seluruh lelang milik pengguna', async () => {
    api.deleteAllAucations.mockResolvedValue({})
    const { wrapper } = await setup('/?filter=mine')
    const button = wrapper.findAll('button').find((b) => b.text().includes('Hapus Semua'))
    await button.trigger('click')
    await flushPromises()
    expect(api.deleteAllAucations).toHaveBeenCalled()
    expect(cards(wrapper)).toHaveLength(0)
  })

  it('hapus semua: batal dan gagal', async () => {
    const { wrapper } = await setup('/?filter=mine')
    const button = () => wrapper.findAll('button').find((b) => b.text().includes('Hapus Semua'))
    Swal.fire.mockResolvedValueOnce({ isConfirmed: false })
    await button().trigger('click')
    await flushPromises()
    expect(api.deleteAllAucations).not.toHaveBeenCalled()

    api.deleteAllAucations.mockRejectedValue(new Error('Gagal total'))
    await button().trigger('click')
    await flushPromises()
    expect(Swal.fire).toHaveBeenLastCalledWith(expect.objectContaining({ text: 'Gagal total' }))
  })

  it('memperbarui status countdown berkala dan membersihkan timer', async () => {
    vi.useFakeTimers()
    const spy = vi.spyOn(globalThis, 'clearInterval')
    const { wrapper } = renderWithProviders(HomePage, { routes })
    await vi.advanceTimersByTimeAsync(31000)
    wrapper.unmount()
    expect(spy).toHaveBeenCalled()
  })
})
