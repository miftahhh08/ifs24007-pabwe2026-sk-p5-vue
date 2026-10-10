import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import SidebarComponent from './SidebarComponent.vue'

const { pushMock } = vi.hoisted(() => ({
  pushMock: vi.fn(),
}))

vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: pushMock,
  }),
}))

describe('SidebarComponent.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('menampilkan judul menu dan dua pilihan navigasi', () => {
    const wrapper = mount(SidebarComponent)

    expect(wrapper.find('aside').exists()).toBe(true)
    expect(wrapper.text()).toContain('Menu')
    expect(wrapper.text()).toContain('Daftar Lelang')
    expect(wrapper.text()).toContain('Lelang Saya')
    expect(wrapper.findAll('nav button')).toHaveLength(2)
  })

  it('mengirim event navigate dan menuju halaman daftar lelang', async () => {
    const wrapper = mount(SidebarComponent)

    await wrapper.findAll('nav button')[0].trigger('click')

    expect(wrapper.emitted('navigate')).toEqual([['/']])
    expect(pushMock).toHaveBeenCalledWith('/')
  })

  it('mengirim event navigate dan menuju halaman lelang saya', async () => {
    const wrapper = mount(SidebarComponent)

    await wrapper.findAll('nav button')[1].trigger('click')

    expect(wrapper.emitted('navigate')).toEqual([['/aucations/my']])
    expect(pushMock).toHaveBeenCalledWith('/aucations/my')
  })

  it('menavigasi ke route yang benar untuk setiap tombol', async () => {
    const wrapper = mount(SidebarComponent)
    const buttons = wrapper.findAll('nav button')

    await buttons[0].trigger('click')
    await buttons[1].trigger('click')

    expect(pushMock.mock.calls).toEqual([
      ['/'],
      ['/aucations/my'],
    ])
    expect(wrapper.emitted('navigate')).toHaveLength(2)
  })
})
