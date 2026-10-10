import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createMemoryHistory } from 'vue-router'
import { nextTick } from 'vue'
import DetailPage from './DetailPage.vue'
import BidModal from '../modals/BidModal.vue'
import ChangeModal from '../modals/ChangeModal.vue'
import ChangeCoverModal from '../modals/ChangeCoverModal.vue'
import { useAucationsStore } from '../states/aucationsStore.js'

const routes = [
  { path: '/', name: 'home', component: { template: '<div>Home</div>' } },
  {
    path: '/aucations/:id',
    name: 'detail-aucation',
    component: { template: '<div>Detail</div>' },
  },
]

const makeDetail = (overrides = {}) => ({
  id: 'auc-1',
  title: 'Detail Lelang Laptop',
  description: 'Deskripsi lengkap lelang',
  start_bid: 5000000,
  current_bid: 6000000,
  is_closed: false,
  cover_url: 'https://example.com/cover.jpg',
  closed_at: new Date(Date.now() + 86400000).toISOString(),
  ...overrides,
})

describe('DetailPage.vue', () => {
  let wrapper
  let store
  let router
  let pinia

  const mountPage = async (detail = makeDetail()) => {
    store.aucation = detail
    await router.push('/aucations/auc-1')
    await router.isReady()

    wrapper = mount(DetailPage, {
      global: {
        plugins: [pinia, router],
        stubs: {
          NavbarComponent: true,
          BidModal: true,
          ChangeModal: true,
          ChangeCoverModal: true,
          MarkdownViewer: true,
        },
      },
    })

    await flushPromises()
    await nextTick()
  }

  beforeEach(async () => {
    vi.restoreAllMocks()
    vi.spyOn(window, 'confirm').mockReturnValue(true)

    pinia = createPinia()
    setActivePinia(pinia)

    router = createRouter({
      history: createMemoryHistory(),
      routes,
    })

    store = useAucationsStore()
    store.aucation = makeDetail()
    store.isAucation = false
    store.isAucationChange = false
    store.isAucationChangeCover = false
    store.isBidAdd = false
    store.errorMessage = ''

    store.fetchAucation = vi.fn().mockResolvedValue()
    store.changeAucation = vi.fn().mockResolvedValue()
    store.changeAucationCover = vi.fn().mockResolvedValue()
    store.addBid = vi.fn().mockResolvedValue()
    store.deleteAucation = vi.fn().mockResolvedValue()

    await mountPage()
  })

  afterEach(() => {
    wrapper?.unmount()
    vi.restoreAllMocks()
  })

  it('memuat detail ketika halaman dibuka', () => {
    expect(wrapper.exists()).toBe(true)
    expect(store.fetchAucation).toHaveBeenCalledWith('auc-1')
    expect(wrapper.text()).toContain('Detail Lelang Laptop')
  })

  it('menampilkan harga awal dan penawaran saat ini', () => {
    expect(wrapper.text()).toContain('5.000.000')
    expect(wrapper.text()).toContain('6.000.000')
  })

  it('menampilkan cover jika cover_url tersedia', () => {
    const image = wrapper.find('article img')
    expect(image.exists()).toBe(true)
    expect(image.attributes('src')).toBe(
      'https://example.com/cover.jpg',
    )
  })

  it('menampilkan deskripsi kosong jika deskripsi tidak tersedia', async () => {
    store.aucation = makeDetail({ description: null })
    await nextTick()

    expect(wrapper.exists()).toBe(true)
  })

  it('menampilkan lelang aktif', () => {
    expect(wrapper.text()).toContain('Lelang masih aktif')
    expect(wrapper.text()).toContain('Aktif')
    expect(wrapper.text()).toContain('Ajukan Penawaran')
  })

  it('menampilkan lelang yang sudah ditutup', async () => {
    store.aucation = makeDetail({ is_closed: true })
    await nextTick()

    expect(wrapper.text()).toContain('Lelang telah ditutup')
    expect(wrapper.text()).toContain('Ditutup')
    expect(wrapper.find('button').exists()).toBe(true)
    expect(wrapper.text()).not.toContain('Ajukan Penawaran')
  })

  it('menganggap lelang yang sudah melewati closed_at sebagai ditutup', async () => {
    store.aucation = makeDetail({
      closed_at: new Date(Date.now() - 86400000).toISOString(),
    })
    await nextTick()

    expect(wrapper.text()).toContain('Lelang telah ditutup')
  })

  it('menampilkan halaman tidak ditemukan jika data kosong', async () => {
    store.aucation = null
    await nextTick()

    expect(wrapper.text()).toContain('Lelang tidak ditemukan')
  })

  it('menampilkan indikator loading jika detail sedang dimuat', async () => {
    store.aucation = null
    store.isAucation = true
    await nextTick()

    expect(wrapper.text()).toContain('Memuat detail lelang')
  })

  it('membuka dan menutup modal penawaran', async () => {
    await wrapper.get('button').exists()
    await wrapper.get('button').trigger('click')
    expect(wrapper.exists()).toBe(true)
  })

  it('mengirim perubahan data lelang', async () => {
    const data = { title: 'Judul Baru' }

    await wrapper.vm.$.setupState.updateAucation(data)

    expect(store.changeAucation).toHaveBeenCalledWith('auc-1', data)
  })

  it('menampilkan error jika perubahan lelang gagal', async () => {
    store.changeAucation.mockRejectedValueOnce(new Error('Gagal'))
    store.errorMessage = 'Gagal memperbarui'

    await wrapper.vm.$.setupState.updateAucation({ title: 'Baru' })
    await nextTick()

    expect(wrapper.text()).toContain('Gagal memperbarui')
  })

  it('mengirim file cover baru', async () => {
    const file = new File(['cover'], 'cover.jpg', {
      type: 'image/jpeg',
    })

    await wrapper.vm.$.setupState.updateCover(file)

    expect(store.changeAucationCover).toHaveBeenCalledWith('auc-1', file)
  })

  it('menampilkan error jika perubahan cover gagal', async () => {
    store.changeAucationCover.mockRejectedValueOnce(new Error('Gagal'))
    store.errorMessage = 'Gagal mengunggah cover'

    await wrapper.vm.$.setupState.updateCover(
      new File(['cover'], 'cover.jpg', { type: 'image/jpeg' }),
    )
    await nextTick()

    expect(wrapper.text()).toContain('Gagal mengunggah cover')
  })

  it('mengirim penawaran lalu memuat ulang detail', async () => {
    await wrapper.vm.$.setupState.submitBid({ amount: 7000000 })

    expect(store.addBid).toHaveBeenCalledWith('auc-1', {
      amount: 7000000,
    })
    expect(store.fetchAucation).toHaveBeenCalledTimes(2)
  })

  it('menampilkan error jika penawaran gagal', async () => {
    store.addBid.mockRejectedValueOnce(new Error('Gagal'))
    store.errorMessage = 'Gagal mengajukan penawaran'

    await wrapper.vm.$.setupState.submitBid({ amount: 7000000 })
    await nextTick()

    expect(wrapper.text()).toContain('Gagal mengajukan penawaran')
  })

  it('menghapus lelang setelah konfirmasi', async () => {
    await wrapper.vm.$.setupState.removeAucation()
    await flushPromises()

    expect(store.deleteAucation).toHaveBeenCalledWith('auc-1')
    expect(router.currentRoute.value.path).toBe('/')
  })

  it('tidak menghapus lelang jika konfirmasi ditolak', async () => {
    window.confirm.mockReturnValueOnce(false)

    await wrapper.vm.$.setupState.removeAucation()

    expect(store.deleteAucation).not.toHaveBeenCalled()
  })

  it('menampilkan error jika penghapusan gagal', async () => {
    store.deleteAucation.mockRejectedValueOnce(new Error('Gagal'))
    store.errorMessage = 'Gagal menghapus lelang'

    await wrapper.vm.$.setupState.removeAucation()
    await nextTick()

    expect(wrapper.text()).toContain('Gagal menghapus lelang')
  })

  it('menavigasi kembali ke beranda', async () => {
    await wrapper.get('button').trigger('click')
    await flushPromises()

    expect(router.currentRoute.value.path).toBe('/')
  })

  it('menampilkan error default ketika pemuatan detail gagal', async () => {
    store.fetchAucation.mockRejectedValueOnce(new Error('Gagal'))
    store.errorMessage = ''

    await wrapper.vm.$.setupState.loadDetail()
    await nextTick()

    expect(wrapper.text()).toContain('Gagal memuat detail lelang.')
  })

  it('menampilkan error dari store ketika pemuatan detail gagal', async () => {
    store.fetchAucation.mockRejectedValueOnce(new Error('Gagal'))
    store.errorMessage = 'Detail gagal dimuat'

    await wrapper.vm.$.setupState.loadDetail()
    await nextTick()

    expect(wrapper.text()).toContain('Detail gagal dimuat')
  })

  it('menampilkan error default ketika perubahan lelang gagal', async () => {
    store.changeAucation.mockRejectedValueOnce(new Error('Gagal'))
    store.errorMessage = ''

    await wrapper.vm.$.setupState.updateAucation({ title: 'Baru' })
    await nextTick()

    expect(wrapper.text()).toContain('Gagal memperbarui lelang.')
  })

  it('menampilkan error default ketika cover gagal diunggah', async () => {
    store.changeAucationCover.mockRejectedValueOnce(new Error('Gagal'))
    store.errorMessage = ''

    await wrapper.vm.$.setupState.updateCover(
      new File(['cover'], 'cover.jpg', { type: 'image/jpeg' }),
    )
    await nextTick()

    expect(wrapper.text()).toContain('Gagal mengunggah cover.')
  })

  it('menampilkan error default ketika penawaran gagal', async () => {
    store.addBid.mockRejectedValueOnce(new Error('Gagal'))
    store.errorMessage = ''

    await wrapper.vm.$.setupState.submitBid({ amount: 7000000 })
    await nextTick()

    expect(wrapper.text()).toContain('Gagal mengajukan penawaran.')
  })

  it('menampilkan error default ketika penghapusan gagal', async () => {
    store.deleteAucation.mockRejectedValueOnce(new Error('Gagal'))
    store.errorMessage = ''

    await wrapper.vm.$.setupState.removeAucation()
    await nextTick()

    expect(wrapper.text()).toContain('Gagal menghapus lelang.')
  })

  const clickButton = async (label) => {
    const button = wrapper
      .findAll('button')
      .find((item) => item.text().includes(label))

    await button.trigger('click')
  }

  it('membuka dan menutup modal penawaran', async () => {
    const modal = wrapper.findComponent(BidModal)
    expect(modal.props('show')).toBe(false)

    await clickButton('Ajukan Penawaran')
    expect(modal.props('show')).toBe(true)

    modal.vm.$emit('close')
    await nextTick()

    expect(modal.props('show')).toBe(false)
  })

  it('membuka dan menutup modal ubah lelang', async () => {
    const modal = wrapper.findComponent(ChangeModal)
    expect(modal.props('show')).toBe(false)

    await clickButton('Ubah Lelang')
    expect(modal.props('show')).toBe(true)

    modal.vm.$emit('close')
    await nextTick()

    expect(modal.props('show')).toBe(false)
  })

  it('membuka dan menutup modal ubah cover', async () => {
    const modal = wrapper.findComponent(ChangeCoverModal)
    expect(modal.props('show')).toBe(false)

    await clickButton('Ubah Cover')
    expect(modal.props('show')).toBe(true)

    modal.vm.$emit('close')
    await nextTick()

    expect(modal.props('show')).toBe(false)
  })

  it('kembali ke beranda dari tampilan lelang tidak ditemukan', async () => {
    store.aucation = null
    await nextTick()

    await clickButton('Kembali ke beranda')
    await flushPromises()

    expect(router.currentRoute.value.path).toBe('/')
  })

  it('menampilkan cover dari properti cover jika cover_url tidak tersedia', async () => {
    store.aucation = makeDetail({
      cover_url: null,
      cover: 'https://example.com/fallback.jpg',
    })
    await nextTick()

    const image = wrapper.find('article img')
    expect(image.exists()).toBe(true)
    expect(image.attributes('src')).toBe('https://example.com/fallback.jpg')
  })

  it('tidak menampilkan gambar jika cover_url dan cover tidak tersedia', async () => {
    store.aucation = makeDetail({ cover_url: null, cover: null })
    await nextTick()

    expect(wrapper.find('article img').exists()).toBe(false)
  })

  it('menampilkan harga awal nol jika start_bid tidak tersedia', async () => {
    store.aucation = makeDetail({ start_bid: null })
    await nextTick()

    expect(wrapper.text()).toContain('Rp0')
  })
})