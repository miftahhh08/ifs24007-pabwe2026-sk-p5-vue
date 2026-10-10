import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { createRouter, createMemoryHistory } from 'vue-router'
import AucationLayout from './AucationLayout.vue'

describe('AucationLayout', () => {
  it('menampilkan navbar, sidebar, dan konten rute', async () => {
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/', component: { template: '<p>Isi Halaman</p>' } },
        { path: '/auth/login', name: 'login', component: { template: '<i />' } },
        { path: '/users', component: { template: '<i />' } },
        { path: '/profile', component: { template: '<i />' } },
      ],
    })
    router.push('/')
    await router.isReady()

    const wrapper = mount(AucationLayout, { global: { plugins: [createPinia(), router] } })
    expect(wrapper.text()).toContain('Isi Halaman')
    expect(wrapper.find('header').exists()).toBe(true)
    expect(wrapper.find('[data-testid="sidebar"]').exists()).toBe(true)

    await wrapper.find('button[aria-label="Buka menu"]').trigger('click')
    expect(wrapper.find('[data-testid="sidebar-overlay"]').exists()).toBe(true)

    await wrapper.find('[data-testid="sidebar-overlay"]').trigger('click')
    expect(wrapper.find('[data-testid="sidebar-overlay"]').exists()).toBe(false)
  })
})
