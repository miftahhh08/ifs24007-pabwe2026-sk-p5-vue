
import {
  beforeEach,
  afterEach,
  describe,
  it,
  expect,
  vi,
} from 'vitest'

import {
  getAccessToken,
  putAccessToken,
  fetchApi,
  fetchAPI,
  getApiBaseUrl,
} from './apiHelper.js'

describe('apiHelper', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.resetModules()
  })

  it('menggunakan URL dasar yang diberikan', () => {
    expect(getApiBaseUrl('https://example.com/api')).toBe(
      'https://example.com/api',
    )
  })

  it('menggunakan URL default jika parameter tidak diberikan', () => {
    expect(getApiBaseUrl()).toBe(
      'https://open-api.delcom.org/api/v1',
    )
  })

  it('menggunakan URL dasar kosong jika string kosong diberikan', () => {
    expect(getApiBaseUrl('')).toBe('')
  })

  it('mengambil access token dari localStorage', () => {
    localStorage.setItem('accessToken', 'token-test')
    expect(getAccessToken()).toBe('token-test')
  })

  it('mengembalikan null jika access token belum tersedia', () => {
    expect(getAccessToken()).toBeNull()
  })

  it('menyimpan access token ke localStorage', () => {
    putAccessToken('token-baru')
    expect(localStorage.getItem('accessToken')).toBe('token-baru')
  })

  it('menghapus access token jika token kosong', () => {
    localStorage.setItem('accessToken', 'token-lama')
    putAccessToken('')
    expect(localStorage.getItem('accessToken')).toBeNull()
  })

  it('menghapus access token jika token tidak diberikan', () => {
    localStorage.setItem('accessToken', 'token-lama')
    putAccessToken()
    expect(localStorage.getItem('accessToken')).toBeNull()
  })

  it('mengirim query parameters dan bearer token', async () => {
    localStorage.setItem('accessToken', 'token-test')

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      headers: { get: () => 'application/json' },
      json: async () => ({ success: true }),
    })

    vi.stubGlobal('fetch', fetchMock)

    const result = await fetchApi('/posts', {
      params: {
        page: 2,
        keyword: 'vue',
        ignored: null,
        missing: undefined,
      },
    })

    expect(result).toEqual({ success: true })
    expect(fetchMock).toHaveBeenCalledOnce()

    const [url, options] = fetchMock.mock.calls[0]
    const parsedUrl = new URL(url)

    expect(parsedUrl.pathname).toBe('/api/v1/posts')
    expect(parsedUrl.searchParams.get('page')).toBe('2')
    expect(parsedUrl.searchParams.get('keyword')).toBe('vue')
    expect(parsedUrl.searchParams.has('ignored')).toBe(false)
    expect(parsedUrl.searchParams.has('missing')).toBe(false)
    expect(options.headers.Authorization).toBe('Bearer token-test')
    expect(options.headers.Accept).toBe('application/json')
    expect(options.method).toBe('GET')
  })

  it('mengirim request tanpa bearer token jika belum login', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      headers: { get: () => 'application/json' },
      json: async () => ({ success: true }),
    })

    vi.stubGlobal('fetch', fetchMock)
    await fetchApi('/posts')

    const [, options] = fetchMock.mock.calls[0]
    expect(options.headers.Authorization).toBeUndefined()
  })

  it('mengubah object body menjadi JSON', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      headers: { get: () => 'application/json' },
      json: async () => ({ success: true }),
    })

    vi.stubGlobal('fetch', fetchMock)

    await fetchApi('/auth/login', {
      method: 'POST',
      body: {
        email: 'test@example.com',
        password: 'rahasia',
      },
    })

    const [, options] = fetchMock.mock.calls[0]

    expect(options.method).toBe('POST')
    expect(options.headers['Content-Type']).toBe('application/json')
    expect(options.body).toBe(
      JSON.stringify({
        email: 'test@example.com',
        password: 'rahasia',
      }),
    )
  })

  it('mengirim body string tanpa mengubahnya', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      headers: { get: () => 'application/json' },
      json: async () => ({ success: true }),
    })

    vi.stubGlobal('fetch', fetchMock)

    await fetchApi('/posts', {
      method: 'POST',
      body: '{"title":"Tes"}',
    })

    expect(fetchMock.mock.calls[0][1].body).toBe('{"title":"Tes"}')
  })

  it('menangani respons HTTP error', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        headers: { get: () => 'application/json' },
        json: async () => ({ message: 'Request tidak valid' }),
      }),
    )

    await expect(fetchApi('/posts')).rejects.toMatchObject({
      message: 'Request tidak valid',
      status: 400,
      data: { message: 'Request tidak valid' },
    })
  })

  it('menangani HTTP error tanpa pesan dari server', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        headers: { get: () => 'application/json' },
        json: async () => ({}),
      }),
    )

    await expect(fetchApi('/posts')).rejects.toMatchObject({
      message: 'HTTP error: 500',
      status: 500,
    })
  })

  it('membaca respons non-JSON sebagai teks', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        headers: { get: () => 'text/plain' },
        text: async () => 'Berhasil',
      }),
    )

    await expect(fetchApi('/health')).resolves.toBe('Berhasil')
  })

  it('tidak menambahkan Content-Type untuk FormData', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      headers: { get: () => 'application/json' },
      json: async () => ({ success: true }),
    })

    vi.stubGlobal('fetch', fetchMock)

    const formData = new FormData()
    formData.append('title', 'Tes')

    await fetchApi('/upload', {
      method: 'POST',
      body: formData,
    })

    const [, options] = fetchMock.mock.calls[0]

    expect(options.body).toBe(formData)
    expect(options.headers['Content-Type']).toBeUndefined()
  })

  it('menggunakan headers khusus dari pemanggil', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      headers: { get: () => 'application/json' },
      json: async () => ({ success: true }),
    })

    vi.stubGlobal('fetch', fetchMock)

    await fetchApi('/posts', {
      headers: { 'X-Custom-Header': 'tes' },
    })

    const [, options] = fetchMock.mock.calls[0]

    expect(options.headers['X-Custom-Header']).toBe('tes')
    expect(options.headers.Accept).toBe('application/json')
  })

  it('mempertahankan Content-Type yang ditentukan pemanggil', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      headers: { get: () => 'application/json' },
      json: async () => ({ success: true }),
    })

    vi.stubGlobal('fetch', fetchMock)

    await fetchApi('/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: 'tes',
    })

    const [, options] = fetchMock.mock.calls[0]
    expect(options.headers['Content-Type']).toBe('text/plain')
  })

  it('mengirim opsi tambahan ke fetch', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      headers: { get: () => 'application/json' },
      json: async () => ({ success: true }),
    })

    vi.stubGlobal('fetch', fetchMock)

    await fetchApi('/posts', { credentials: 'include' })

    const [, options] = fetchMock.mock.calls[0]
    expect(options.credentials).toBe('include')
  })

  it('menggunakan alias fetchAPI', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      headers: { get: () => 'application/json' },
      json: async () => ({ success: true }),
    })

    vi.stubGlobal('fetch', fetchMock)

    await expect(fetchAPI('/posts')).resolves.toEqual({
      success: true,
    })
  })

  it('membaca respons teks jika content-type tidak tersedia', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      headers: { get: () => null },
      text: async () => 'OK',
    })

    vi.stubGlobal('fetch', fetchMock)

    await expect(fetchApi('/health')).resolves.toBe('OK')
  })
})