import { describe, it, expect, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createMemoryHistory, createRouter } from 'vue-router'
import { h } from 'vue'
import router, { AucationLayout } from './index.js'

async function resetRouter() {
  localStorage.clear()
  sessionStorage.clear()

  await router.push('/halaman-reset-untuk-tes')
  await router.isReady()

  localStorage.clear()
  sessionStorage.clear()
}

describe('router', () => {
  beforeEach(async () => {
    await resetRouter()
  })

  it('mengalihkan halaman utama ke users ketika sudah login', async () => {
    localStorage.setItem('accessToken', 'test-token')

    await router.push('/')
    expect(router.currentRoute.value.name).toBe('users')
  })

  it('mengalihkan halaman terlindungi ke login jika belum login', async () => {
    localStorage.clear()
    sessionStorage.clear()

    await router.push('/users')
    expect(router.currentRoute.value.name).toBe('login')
  })

  it('mengizinkan pengguna login membuka daftar users', async () => {
    localStorage.setItem('accessToken', 'test-token')

    await router.push('/users')
    expect(router.currentRoute.value.name).toBe('users')
  })

  it('mengizinkan pengguna login membuka profil', async () => {
    localStorage.setItem('accessToken', 'test-token')

    await router.push('/profile')
    expect(router.currentRoute.value.name).toBe('profile')
  })

  it('mengalihkan login ke users jika pengguna sudah login', async () => {
    localStorage.setItem('accessToken', 'test-token')

    await router.push('/users')
    await router.push('/auth/login')

    expect(router.currentRoute.value.name).toBe('users')
  })

  it('mengalihkan register ke users jika pengguna sudah login', async () => {
    localStorage.setItem('accessToken', 'test-token')

    await router.push('/register')
    expect(router.currentRoute.value.name).toBe('users')
  })

  it('mengalihkan URL tidak dikenal ke login jika belum login', async () => {
    await router.push('/alamat-tidak-dikenal')

    expect(router.currentRoute.value.name).toBe('login')
  })

  it('membaca token dari sessionStorage', async () => {
    sessionStorage.setItem('accessToken', 'session-token')

    await router.push('/profile')
    expect(router.currentRoute.value.name).toBe('profile')
  })

  it('mengizinkan halaman login dibuka jika belum login', async () => {
    await router.push('/auth/login')

    expect(router.currentRoute.value.name).toBe('login')
  })

  it('mengizinkan halaman register dibuka jika belum login', async () => {
    await router.push('/auth/register')

    expect(router.currentRoute.value.name).toBe('register')
  })

  it('meneruskan parameter ID pada halaman detail lelang', async () => {
    localStorage.setItem('accessToken', 'test-token')

    await router.push('/aucations/123')

    expect(router.currentRoute.value.name).toBe('detail-aucation')
    expect(router.currentRoute.value.params.aucationId).toBe('123')
  })
})

describe('AucationLayout', () => {
  it('merender elemen layout dan slot default', () => {
    const wrapper = mount(AucationLayout, {
      slots: {
        default: '<p>Konten lelang</p>',
      },
    })

    expect(wrapper.find('.min-h-screen').exists()).toBe(true)
    expect(wrapper.text()).toContain('Konten lelang')

    wrapper.unmount()
  })

  it('tetap merender layout ketika slot default tidak tersedia', () => {
    const wrapper = mount(AucationLayout)

    expect(wrapper.find('.min-h-screen').exists()).toBe(true)
    expect(wrapper.text()).toBe('')

    wrapper.unmount()
  })
})