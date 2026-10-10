import { describe, it, expect } from 'vitest'
import { renderWithProviders } from './test-utils'
import App from './App.vue'

describe('App.test.js - Integration Test Root App', () => {
  it('berhasil me-render komponen root App beserta RouterView', () => {
    const { container } = renderWithProviders(App)
    expect(container).toBeDefined()
  })

  it('mengarah ke rute default saat aplikasi pertama kali dimuat', async () => {
    const { router } = renderWithProviders(App, { initialRoute: '/' })
    await router.isReady()
    expect(router.currentRoute.value.path).toBe('/')
  })
})