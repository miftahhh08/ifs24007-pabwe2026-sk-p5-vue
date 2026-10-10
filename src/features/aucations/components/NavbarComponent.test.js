import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import NavbarComponent from './NavbarComponent.vue'

const { pushMock } = vi.hoisted(() => ({
  pushMock: vi.fn(),
}))

vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: pushMock,
  }),
}))

describe('NavbarComponent.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  it('menampilkan nama aplikasi dan tombol navigasi', () => {
    const wrapper = mount(NavbarComponent)

    expect(wrapper.text()).toContain('AuctionHub')
    expect(wrapper.text()).toContain('Beranda')
    expect(wrapper.text()).toContain('Keluar')
    expect(wrapper.find('header').exists()).toBe(true)
  })

  it('mengarahkan ke beranda saat tombol AuctionHub diklik', async () => {
    const wrapper = mount(NavbarComponent)

    await wrapper.find('button[aria-label="Beranda"]').trigger('click')

    expect(pushMock).toHaveBeenCalledWith('/')
  })

  it('mengarahkan ke beranda saat tombol Beranda diklik', async () => {
    const wrapper = mount(NavbarComponent)
    const buttons = wrapper.findAll('button')
    const homeButton = buttons.find((button) => button.text() === 'Beranda')

    await homeButton.trigger('click')

    expect(pushMock).toHaveBeenCalledWith('/')
  })

  it('menghapus accessToken dan mengarahkan ke login saat keluar', async () => {
    localStorage.setItem('accessToken', 'token-dummy')

    const wrapper = mount(NavbarComponent)
    const logoutButton = wrapper.findAll('button')
      .find((button) => button.text() === 'Keluar')

    await logoutButton.trigger('click')

    expect(localStorage.getItem('accessToken')).toBeNull()
    expect(pushMock).toHaveBeenCalledWith('/login')
  })

  it('tetap mengarahkan ke login jika accessToken tidak tersedia', async () => {
    const wrapper = mount(NavbarComponent)
    const logoutButton = wrapper.findAll('button')
      .find((button) => button.text() === 'Keluar')

    await logoutButton.trigger('click')

    expect(localStorage.getItem('accessToken')).toBeNull()
    expect(pushMock).toHaveBeenCalledWith('/login')
  })
})
