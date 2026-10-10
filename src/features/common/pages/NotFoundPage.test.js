import { afterEach, describe, expect, it } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import NotFoundPage from './NotFoundPage.vue'

const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    {
      path: '/',
      component: { template: '<div>Beranda</div>' },
    },
    {
      path: '/404',
      component: NotFoundPage,
    },
  ],
})

describe('NotFoundPage.vue', () => {
  let wrapper

  afterEach(() => {
    wrapper?.unmount()
    wrapper = undefined
  })

  it('menampilkan informasi halaman 404', async () => {
    await router.push('/404')
    await router.isReady()

    wrapper = mount(NotFoundPage, {
      global: {
        plugins: [router],
      },
    })

    expect(wrapper.text()).toContain('404')
    expect(wrapper.text()).toContain('Halaman Tidak Ditemukan')
    expect(wrapper.text()).toContain(
      'Maaf, halaman yang kamu cari tidak tersedia atau sudah dipindahkan.',
    )
  })

  it('mengarahkan pengguna ke beranda saat tombol diklik', async () => {
    await router.push('/404')
    await router.isReady()

    wrapper = mount(NotFoundPage, {
      global: {
        plugins: [router],
      },
    })

    await wrapper.get('button').trigger('click')
    await flushPromises()

    expect(router.currentRoute.value.path).toBe('/')
  })
})
