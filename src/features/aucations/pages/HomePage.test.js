import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createMemoryHistory } from 'vue-router'
import { nextTick } from 'vue'
import HomePage from './HomePage.vue'
import AddModal from '../modals/AddModal.vue'
import { useAucationsStore } from '../states/aucationsStore.js'

const routes = [
  { path: '/', name: 'home', component: { template: '<div>Home</div>' } },
  {
    path: '/aucations/:id',
    name: 'detail-aucation',
    component: { template: '<div>Detail</div>' },
  },
]

const makeAucations = () => [
  {
    id: 'auc-1',
    title: 'Laptop Gaming ASUS',
    description: 'Laptop spesifikasi tinggi',
    start_bid: 15000000,
    is_closed: false,
    cover_url: 'https://example.com/laptop.jpg',
    closed_at: new Date(Date.now() + 86400000).toISOString(),
  },
  {
    id: 'auc-2',
    title: 'Kamera Mirrorless',
    description: 'Kamera bekas kondisi mulus',
    start_bid: 8000000,
    is_closed: true,
    cover_url: null,
  },
  {
    id: 'auc-3',
    title: 'Meja Belajar',
    description: '',
    start_bid: null,
    is_closed: false,
    cover: 'https://example.com/meja.jpg',
  },
  {
    id: 'auc-4',
    title: 'Jam Tangan',
    description: 'Barang lelang lama',
    start_bid: 250000,
    is_closed: false,
    closed_at: new Date(Date.now() - 86400000).toISOString(),
  },
]

describe('HomePage.vue', () => {
  let wrapper
  let store
  let router
  let pinia

  const mountPage = async () => {
    await router.push('/')
    await router.isReady()

    wrapper = mount(HomePage, {
      global: {
        plugins: [pinia, router],
        stubs: {
          NavbarComponent: true,
          SidebarComponent: true,
          AddModal: true,
        },
      },
    })

    await flushPromises()
    await nextTick()
  }

  beforeEach(async () => {
    pinia = createPinia()
    setActivePinia(pinia)

    router = createRouter({
      history: createMemoryHistory(),
      routes,
    })

    store = useAucationsStore()
    store.aucations = makeAucations()
    store.isAucation = false
    store.isAucationAdd = false
    store.errorMessage = ''
    store.fetchAucations = vi.fn().mockResolvedValue()
    store.addAucation = vi.fn().mockResolvedValue()

    await mountPage()
  })

  afterEach(() => {
    wrapper?.unmount()
    vi.restoreAllMocks()
  })

  it('memuat daftar lelang ketika halaman dibuka', () => {
    expect(store.fetchAucations).toHaveBeenCalledOnce()
    expect(wrapper.text()).toContain('Daftar Lelang')
    expect(wrapper.text()).toContain('Laptop Gaming ASUS')
    expect(wrapper.text()).toContain('Kamera Mirrorless')
  })

  it('menampilkan harga dan cover lelang', () => {
    expect(wrapper.text()).toContain('15.000.000')
    expect(wrapper.text()).toContain('8.000.000')
    expect(wrapper.find('img').exists()).toBe(true)
    expect(wrapper.find('img').attributes('src')).toBe(
      'https://example.com/laptop.jpg',
    )
  })

  it('menampilkan deskripsi default jika kosong', () => {
    expect(wrapper.text()).toContain('Tidak ada deskripsi.')
  })

  it('menampilkan status aktif dan ditutup', () => {
    expect(wrapper.text()).toContain('Aktif')
    expect(wrapper.text()).toContain('Ditutup')
  })

  it('mencari lelang berdasarkan judul', async () => {
    await wrapper.get('input[aria-label="Cari lelang"]').setValue('Laptop')

    expect(wrapper.text()).toContain('Laptop Gaming ASUS')
    expect(wrapper.text()).not.toContain('Kamera Mirrorless')
  })

  it('mencari lelang berdasarkan deskripsi', async () => {
    await wrapper.get('input[aria-label="Cari lelang"]').setValue('kondisi mulus')

    expect(wrapper.text()).toContain('Kamera Mirrorless')
    expect(wrapper.text()).not.toContain('Laptop Gaming ASUS')
  })

  it('melakukan pencarian tanpa membedakan huruf besar dan kecil', async () => {
    await wrapper.get('input[aria-label="Cari lelang"]').setValue('LAPTOP')

    expect(wrapper.text()).toContain('Laptop Gaming ASUS')
  })

  it('menampilkan semua lelang saat filter all dipilih', async () => {
    await wrapper.get('select[aria-label="Filter lelang"]').setValue('all')

    expect(wrapper.text()).toContain('Laptop Gaming ASUS')
    expect(wrapper.text()).toContain('Kamera Mirrorless')
  })

  it('hanya menampilkan lelang aktif', async () => {
    await wrapper.get('select[aria-label="Filter lelang"]').setValue('active')

    expect(wrapper.text()).toContain('Laptop Gaming ASUS')
    expect(wrapper.text()).not.toContain('Kamera Mirrorless')
    expect(wrapper.text()).not.toContain('Jam Tangan')
  })

  it('hanya menampilkan lelang yang ditutup', async () => {
    await wrapper.get('select[aria-label="Filter lelang"]').setValue('closed')

    expect(wrapper.text()).toContain('Kamera Mirrorless')
    expect(wrapper.text()).toContain('Jam Tangan')
    expect(wrapper.text()).not.toContain('Laptop Gaming ASUS')
  })

  it('menampilkan kondisi kosong jika pencarian tidak cocok', async () => {
    await wrapper.get('input[aria-label="Cari lelang"]').setValue('TidakAda')

    expect(wrapper.text()).toContain('Belum ada lelang')
  })

  it('menampilkan kondisi kosong jika daftar lelang kosong', async () => {
    store.aucations = []
    await nextTick()

    expect(wrapper.text()).toContain('Belum ada lelang')
  })

  it('menampilkan indikator loading', async () => {
    store.isAucation = true
    await nextTick()

    expect(wrapper.text()).toContain('Memuat daftar lelang')
  })

  it('membuka modal tambah lelang', async () => {
    await wrapper.get('button').trigger('click')
    await nextTick()

    expect(wrapper.exists()).toBe(true)
  })

  it('berhasil membuat lelang', async () => {
    const data = { title: 'Lelang Baru', start_bid: 100000 }

    await wrapper.vm.$.setupState.createAucation(data)

    expect(store.addAucation).toHaveBeenCalledWith(data)
  })

  it('menampilkan error store jika pembuatan lelang gagal', async () => {
    store.addAucation.mockRejectedValueOnce(new Error('Gagal'))
    store.errorMessage = 'Tidak dapat membuat lelang'

    await wrapper.vm.$.setupState.createAucation({ title: 'Baru' })
    await nextTick()

    expect(wrapper.text()).toContain('Tidak dapat membuat lelang')
  })

  it('menampilkan pesan default jika pembuatan lelang gagal tanpa error store', async () => {
    store.addAucation.mockRejectedValueOnce(new Error('Gagal'))
    store.errorMessage = ''

    await wrapper.vm.$.setupState.createAucation({ title: 'Baru' })
    await nextTick()

    expect(wrapper.text()).toContain('Gagal membuat lelang.')
  })

  it('menampilkan error store jika pemuatan daftar gagal', async () => {
    store.fetchAucations.mockRejectedValueOnce(new Error('Gagal'))
    store.errorMessage = 'Daftar gagal dimuat'

    await wrapper.vm.$.setupState.loadAucations()
    await nextTick()

    expect(wrapper.text()).toContain('Daftar gagal dimuat')
  })

  it('menampilkan pesan default jika pemuatan daftar gagal tanpa error store', async () => {
    store.fetchAucations.mockRejectedValueOnce(new Error('Gagal'))
    store.errorMessage = ''

    await wrapper.vm.$.setupState.loadAucations()
    await nextTick()

    expect(wrapper.text()).toContain('Gagal memuat daftar lelang.')
  })

  it('membuka halaman detail lelang saat tombol diklik', async () => {
    const buttons = wrapper.findAll('button')
    const detailButton = buttons.find(button =>
      button.text().includes('Lihat Detail'),
    )

    expect(detailButton).toBeDefined()

    await detailButton.trigger('click')
    await flushPromises()

    expect(router.currentRoute.value.path).toBe('/aucations/auc-1')
  })

  it('menggabungkan filter pencarian dan status', async () => {
    await wrapper.get('input[aria-label="Cari lelang"]').setValue('Laptop')
    await wrapper.get('select[aria-label="Filter lelang"]').setValue('active')

    expect(wrapper.text()).toContain('Laptop Gaming ASUS')
    expect(wrapper.text()).not.toContain('Kamera Mirrorless')
  })

  it('menangani harga awal bernilai nol', async () => {
    store.aucations = [
      {
        id: 'auc-zero',
        title: 'Lelang Gratis',
        description: 'Contoh',
        start_bid: 0,
        is_closed: false,
      },
    ]
    await nextTick()

    expect(wrapper.text()).toContain('Rp0')
  })

  it('menutup modal tambah lelang ketika modal mengirim event close', async () => {
    const modal = wrapper.findComponent(AddModal)
    expect(modal.props('show')).toBe(false)

    const addButton = wrapper
      .findAll('button')
      .find((button) => button.text().includes('Buat Lelang'))

    await addButton.trigger('click')
    expect(modal.props('show')).toBe(true)

    modal.vm.$emit('close')
    await nextTick()

    expect(modal.props('show')).toBe(false)
  })

  it('menangani lelang tanpa judul dan deskripsi saat memfilter', async () => {
    store.aucations = [
      { id: 'auc-kosong', start_bid: 1000, is_closed: false },
    ]
    await nextTick()

    expect(wrapper.text()).not.toContain('Belum ada lelang')
    expect(wrapper.text()).toContain('Tidak ada deskripsi.')

    await wrapper.get('input[aria-label="Cari lelang"]').setValue('apa saja')

    expect(wrapper.text()).toContain('Belum ada lelang')
  })
})