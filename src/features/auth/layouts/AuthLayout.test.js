import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import AuthLayout from './AuthLayout.vue'

describe('AuthLayout', () => {
  it('menampilkan banner dan konten rute anak', async () => {
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [{ path: '/', component: { template: '<p>Form</p>' } }],
    })
    router.push('/')
    await router.isReady()
    const wrapper = mount(AuthLayout, { global: { plugins: [router] } })
    expect(wrapper.find('[data-testid="auth-banner"]').text()).toContain('Delcom Auction')
    expect(wrapper.text()).toContain('Form')
  })
})
