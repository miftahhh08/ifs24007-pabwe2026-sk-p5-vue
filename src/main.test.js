
import { describe, it, expect, vi, beforeEach } from 'vitest'

const mocks = vi.hoisted(() => ({
  mount: vi.fn(),
  use: vi.fn(),
  createApp: vi.fn(),
  createPinia: vi.fn(() => ({ name: 'pinia-plugin' })),
}))

vi.mock('vue', () => ({
  createApp: mocks.createApp,
}))

vi.mock('pinia', () => ({
  createPinia: mocks.createPinia,
  defineStore: vi.fn(() => vi.fn()),
}))

vi.mock('vue-router', () => ({
  createRouter: vi.fn(() => ({
    beforeEach: vi.fn(),
    install: vi.fn(),
  })),
  createWebHistory: vi.fn(),
  default: { name: 'router-plugin' },
}))

vi.mock('./App.vue', () => ({
  default: { name: 'App' },
}))

describe('main.js', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.clearAllMocks()

    mocks.use.mockReturnThis()
    mocks.createApp.mockReturnValue({
      use: mocks.use,
      mount: mocks.mount,
    })
  })

  it('mendaftarkan plugin dan memasang aplikasi ke elemen #app', async () => {
    await import('./main.js')

    expect(mocks.createApp).toHaveBeenCalledOnce()
    expect(mocks.use).toHaveBeenCalledTimes(2)
    expect(mocks.mount).toHaveBeenCalledWith('#app')
  })
})