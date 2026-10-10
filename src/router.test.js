import { beforeEach, describe, expect, it } from 'vitest'
import router, { authGuard, routes } from './router.js'

describe('router', () => {
  beforeEach(() => localStorage.clear())

  it('mendefinisikan rute auth, lelang, dan 404', () => {
    const paths = router.getRoutes().map((r) => r.path)
    ;['/auth/login', '/auth/register', '/', '/aucations/:aucationId', '/users', '/profile'].forEach(
      (path) => expect(paths).toContain(path),
    )
    expect(routes.at(-1).path).toBe('/:pathMatch(.*)*')
  })

  it('mengarahkan pengguna belum login ke halaman login', () => {
    expect(authGuard({ meta: { requiresAuth: true } })).toEqual({ name: 'login' })
  })

  it('mengarahkan pengguna yang sudah login dari halaman auth ke beranda', () => {
    localStorage.setItem('accessToken', 'tok')
    expect(authGuard({ meta: { guestOnly: true } })).toEqual({ name: 'home' })
    expect(authGuard({ meta: { requiresAuth: true } })).toBe(true)
  })

  it('mengizinkan halaman publik', () => {
    expect(authGuard({ meta: {} })).toBe(true)
    expect(authGuard({ meta: { guestOnly: true } })).toBe(true)
  })

  it('menjalankan guard saat navigasi sebenarnya', async () => {
    await router.push('/profile')
    expect(router.currentRoute.value.name).toBe('login')

    localStorage.setItem('accessToken', 'tok')
    await router.push('/users')
    expect(router.currentRoute.value.name).toBe('users')
    await router.push('/auth/login')
    expect(router.currentRoute.value.name).toBe('home')
  })

  it('menampilkan 404 untuk rute tidak dikenal', async () => {
    await router.push('/tidak/ada')
    expect(router.currentRoute.value.name).toBe('not-found')
  })
})
