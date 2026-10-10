import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises } from '@vue/test-utils'
import { renderWithProviders } from '../../../test-utils.js'
import UsersPage from './UsersPage.vue'
import * as userApi from '../api/userApi.js'

vi.mock('../api/userApi.js', () => ({ getUsers: vi.fn() }))

async function setup() {
  const result = renderWithProviders(UsersPage)
  await result.router.isReady()
  await flushPromises()
  return result
}

describe('UsersPage', () => {
  beforeEach(() => vi.clearAllMocks())

  it('menampilkan daftar pengguna', async () => {
    userApi.getUsers.mockResolvedValue({
      data: {
        users: [
          { id: 1, name: 'Budi', email: 'b@x.com', photo: 'img/b.png', email_verified_at: '2026-01-01' },
          { id: 2, name: '', email: '', photo: null, email_verified_at: null },
        ],
      },
    })
    const { wrapper } = await setup()
    const text = wrapper.text()
    expect(text).toContain('Budi')
    expect(text).toContain('Email terverifikasi')
    expect(text).toContain('Nama tidak tersedia')
    expect(text).toContain('Email tidak tersedia')
    expect(text).toContain('Pengguna terdaftar')
    expect(wrapper.find('img').attributes('src')).toBe('https://open-api.delcom.org/img/b.png')
    expect(wrapper.text()).toContain('U')
  })

  it('menampilkan loading', async () => {
    userApi.getUsers.mockReturnValue(new Promise(() => {}))
    const { wrapper } = renderWithProviders(UsersPage)
    await wrapper.vm.$nextTick()
    expect(wrapper.text()).toContain('Memuat daftar pengguna')
  })

  it('menampilkan state kosong', async () => {
    userApi.getUsers.mockResolvedValue({ data: { users: [] } })
    const { wrapper } = await setup()
    expect(wrapper.text()).toContain('Belum ada data pengguna')
  })

  it('menampilkan error dan dapat mencoba lagi', async () => {
    userApi.getUsers.mockRejectedValue(new Error('Gagal jaringan'))
    const { wrapper } = await setup()
    expect(wrapper.find('[role="alert"]').text()).toBe('Gagal jaringan')

    userApi.getUsers.mockResolvedValue({ data: { users: [{ id: 1, name: 'A' }] } })
    await wrapper.find('button').trigger('click')
    await flushPromises()
    expect(wrapper.text()).toContain('A')

    userApi.getUsers.mockRejectedValue(new Error('lagi'))
    await wrapper.vm.$nextTick()
  })

  it('retry yang gagal lagi tidak melempar error', async () => {
    userApi.getUsers.mockRejectedValue(new Error('x'))
    const { wrapper } = await setup()
    await wrapper.find('button').trigger('click')
    await flushPromises()
    expect(wrapper.find('[role="alert"]').text()).toBe('x')
  })
})
