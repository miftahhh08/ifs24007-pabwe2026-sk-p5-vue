
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import HelloWorld from './HelloWorld.vue'

describe('HelloWorld.vue', () => {
  it('merender komponen dengan benar', () => {
    const wrapper = mount(HelloWorld)

    expect(wrapper.exists()).toBe(true)
    expect(wrapper.text()).toContain('Get started')
    expect(wrapper.text()).toContain('Documentation')
    expect(wrapper.text()).toContain('Connect with us')
    expect(wrapper.text()).toContain('Count is 0')
  })

  it('menambah nilai penghitung ketika tombol diklik', async () => {
    const wrapper = mount(HelloWorld)

    await wrapper.get('button.counter').trigger('click')

    expect(wrapper.get('button.counter').text()).toContain('Count is 1')

    await wrapper.get('button.counter').trigger('click')

    expect(wrapper.get('button.counter').text()).toContain('Count is 2')
  })
})