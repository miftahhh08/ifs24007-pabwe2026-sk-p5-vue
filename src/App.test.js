import { describe, expect, it } from 'vitest'
import { renderWithProviders } from './test-utils.js'
import App from './App.vue'

const routes = [{ path: '/', component: { template: '<p>Halaman Awal</p>' } }]

describe('App', () => {
  it('merender RouterView dengan rute aktif', async () => {
    const { wrapper, router } = renderWithProviders(App, { routes })
    await router.isReady()
    expect(wrapper.text()).toContain('Halaman Awal')
  })
})
