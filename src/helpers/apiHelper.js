const DEFAULT_API_BASE_URL = 'https://open-api.delcom.org/api/v1'

/**
 * Mengambil URL dasar API.
 */
export function getApiBaseUrl(baseUrl = DEFAULT_API_BASE_URL) {
  return baseUrl
}

const API_BASE_URL = getApiBaseUrl(DELCOM_BASEURL)

/**
 * Mengubah path aset relatif dari API (mis. foto/cover) menjadi URL absolut.
 */
export function getAssetUrl(path) {
  if (!path) {
    return ''
  }

  if (/^(https?:|data:|blob:)/.test(path)) {
    return path
  }

  return `${new URL(API_BASE_URL).origin}/${String(path).replace(/^\//, '')}`
}

/**
 * Mengambil access token dari localStorage.
 */
export function getAccessToken() {
  return localStorage.getItem('accessToken')
}

/**
 * Menyimpan access token ke localStorage.
 */
export function putAccessToken(token) {
  if (!token) {
    localStorage.removeItem('accessToken')
    return
  }

  localStorage.setItem('accessToken', token)
}

/**
 * Mengirim request HTTP ke REST API Delcom.
 */
export async function fetchApi(endpoint, options = {}) {
  const {
    method = 'GET',
    params,
    headers = {},
    body,
    ...restOptions
  } = options

  const url = new URL(
    `${API_BASE_URL.replace(/\/$/, '')}/${endpoint.replace(/^\//, '')}`,
  )

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.set(key, String(value))
      }
    })
  }

  const token = getAccessToken()

  const requestHeaders = {
    Accept: 'application/json',
    ...headers,
  }

  if (body !== undefined && !(body instanceof FormData)) {
    requestHeaders['Content-Type'] ??= 'application/json'
  }

  if (token) {
    requestHeaders.Authorization = `Bearer ${token}`
  }

  const response = await fetch(url, {
    ...restOptions,
    method,
    headers: requestHeaders,
    ...(body !== undefined
      ? {
          body:
            body instanceof FormData || typeof body === 'string'
              ? body
              : JSON.stringify(body),
        }
      : {}),
  })

  const contentType = response.headers.get('content-type') || ''

  const data = contentType.includes('application/json')
    ? await response.json()
    : await response.text()

  if (!response.ok) {
    const error = new Error(
      data?.message || `HTTP error: ${response.status}`,
    )

    error.status = response.status
    error.data = data

    throw error
  }

  return data
}
