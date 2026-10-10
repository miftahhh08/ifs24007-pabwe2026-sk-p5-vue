import { describe, expect, it } from 'vitest'
import { flushPromises } from '@vue/test-utils'
import { renderWithProviders } from '../../../test-utils.js'
import SidebarComponent from './SidebarComponent.vue'

const routes = [
  { path: '/', name: 'home', component: { template: '<div />' } },
  { path: '/users', component: { template: '<div />' } },
  { path: '/profile', component: { template: '<div />' } },
]

describe('SidebarComponent', () => {
  it('menampilkan empat menu navigasi', async () => {
    const { wrapper, router } = renderWithProviders(SidebarComponent, { routes })
    await router.isReady()
    const text = wrapper.text()
    ;['Dashboard Lelang', 'Lelang Saya', 'Daftar Pengguna', 'Profil Saya'].forEach(
      (label) => expect(text).toContain(label),
    )
  })

  it('menandai menu aktif sesuai rute dan query', async () => {
    const { wrapper, router } = renderWithProviders(SidebarComponent, { routes })
    await router.isReady()
    const links = wrapper.findAll('a')
    expect(links[0].classes()).toContain('bg-indigo-50')
    expect(links[1].classes()).not.toContain('bg-indigo-50')

    await router.push('/?filter=mine')
    expect(links[1].classes()).toContain('bg-indigo-50')

    await router.push('/users')
    expect(links[2].classes()).toContain('bg-indigo-50')
    expect(links[0].classes()).not.toContain('bg-indigo-50')
  })

  it('mengirim event close saat menu diklik, overlay, atau tombol tutup', async () => {
    const { wrapper, router } = renderWithProviders(SidebarComponent, {
      routes,
      props: { open: true },
    })
    await router.isReady()

    await wrapper.findAll('a')[2].trigger('click')
    await flushPromises()
    expect(router.currentRoute.value.path).toBe('/users')

    await wrapper.find('[data-testid="sidebar-overlay"]').trigger('click')
    await wrapper.find('button[aria-label="Tutup menu"]').trigger('click')
    expect(wrapper.emitted('close')).toHaveLength(3)
  })

  it('menyembunyikan overlay dan menggeser drawer saat tertutup', async () => {
    const { wrapper, router } = renderWithProviders(SidebarComponent, { routes })
    await router.isReady()
    expect(wrapper.find('[data-testid="sidebar-overlay"]').exists()).toBe(false)
    expect(wrapper.find('[data-testid="sidebar"]').classes()).toContain('-translate-x-full')
  })
})
