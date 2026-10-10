import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises } from '@vue/test-utils'
import Swal from 'sweetalert2'
import { renderWithProviders } from '../../../test-utils.js'
import NavbarComponent from './NavbarComponent.vue'
import { useAuthStore } from '../../auth/states/authStore.js'

vi.mock('sweetalert2', () => ({ default: { fire: vi.fn() } }))

describe('NavbarComponent', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  it('menampilkan nama pengguna aktif', async () => {
    localStorage.setItem('authUser', JSON.stringify({ name: 'Budi' }))
    const { wrapper, router } = renderWithProviders(NavbarComponent)
    await router.isReady()
    expect(wrapper.find('[data-testid="navbar-user"]').text()).toBe('Budi')
  })

  it('menyembunyikan nama bila belum ada user', async () => {
    const { wrapper, router } = renderWithProviders(NavbarComponent)
    await router.isReady()
    expect(wrapper.find('[data-testid="navbar-user"]').exists()).toBe(false)
  })

  it('mengirim event toggle-sidebar', async () => {
    const { wrapper } = renderWithProviders(NavbarComponent)
    await wrapper.find('button[aria-label="Buka menu"]').trigger('click')
    expect(wrapper.emitted('toggle-sidebar')).toHaveLength(1)
  })

  it('logout setelah konfirmasi lalu menuju halaman login', async () => {
    Swal.fire.mockResolvedValue({ isConfirmed: true })
    localStorage.setItem('accessToken', 'tok')
    const { wrapper, router } = renderWithProviders(NavbarComponent)
    await router.isReady()
    const auth = useAuthStore()
    auth.token = 'tok'

    await wrapper.findAll('button').at(-1).trigger('click')
    await flushPromises()

    expect(auth.token).toBe('')
    expect(localStorage.getItem('accessToken')).toBeNull()
    expect(router.currentRoute.value.name).toBe('login')
  })

  it('tidak logout bila konfirmasi dibatalkan', async () => {
    Swal.fire.mockResolvedValue({ isConfirmed: false })
    const { wrapper, router } = renderWithProviders(NavbarComponent)
    await router.isReady()
    await wrapper.findAll('button').at(-1).trigger('click')
    await flushPromises()
    expect(router.currentRoute.value.name).toBe('home')
  })
})
