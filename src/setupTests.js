import { vi } from 'vitest'
import '@testing-library/jest-dom'

const createStorageMock = () => {
let store = {}

return {
getItem: (key) => Object.prototype.hasOwnProperty.call(store, key) ? store[key] : null,
setItem: (key, value) => {
store[key] = String(value)
},
removeItem: (key) => {
delete store[key]
},
clear: () => {
store = {}
},
}
}

Object.defineProperty(window, 'localStorage', {
configurable: true,
value: createStorageMock(),
})

Object.defineProperty(window, 'sessionStorage', {
configurable: true,
value: createStorageMock(),
})

window.confirm = vi.fn(() => true)
window.alert = vi.fn()

globalThis.IntersectionObserver = vi.fn(() => ({
observe: vi.fn(),
unobserve: vi.fn(),
disconnect: vi.fn(),
}))

globalThis.ResizeObserver = vi.fn(() => ({
observe: vi.fn(),
unobserve: vi.fn(),
disconnect: vi.fn(),
}))
