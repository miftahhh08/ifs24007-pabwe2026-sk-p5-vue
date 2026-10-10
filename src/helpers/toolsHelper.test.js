
import { beforeEach, describe, it, expect, vi } from 'vitest'
import Swal from 'sweetalert2'
import {
  showSuccessDialog,
  showErrorDialog,
  showConfirmDialog,
  formatRupiah,
  formatDate,
} from './toolsHelper.js'

vi.mock('sweetalert2', () => ({
  default: {
    fire: vi.fn(),
  },
}))

describe('toolsHelper', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('menampilkan dialog sukses', () => {
    showSuccessDialog()

    expect(Swal.fire).toHaveBeenCalledWith({
      icon: 'success',
      title: 'Berhasil!',
      text: '',
      confirmButtonText: 'OK',
    })
  })

  it('menampilkan dialog error', () => {
    showErrorDialog()

    expect(Swal.fire).toHaveBeenCalledWith({
      icon: 'error',
      title: 'Terjadi Kesalahan!',
      text: '',
      confirmButtonText: 'OK',
    })
  })

  it('mengembalikan true jika pengguna mengonfirmasi', async () => {
    Swal.fire.mockResolvedValue({ isConfirmed: true })

    await expect(showConfirmDialog()).resolves.toBe(true)
  })

  it('mengembalikan false jika pengguna membatalkan', async () => {
    Swal.fire.mockResolvedValue({ isConfirmed: false })

    await expect(showConfirmDialog()).resolves.toBe(false)
  })

  it('memformat angka menjadi Rupiah', () => {
    expect(formatRupiah(15000)).toContain('15.000')
  })

  it('memformat string angka menjadi Rupiah', () => {
    expect(formatRupiah('25000')).toContain('25.000')
  })

  it('mengembalikan Rp0 untuk nilai tidak valid', () => {
    expect(formatRupiah('abc')).toBe('Rp0')
    expect(formatRupiah(Number.NaN)).toBe('Rp0')
    expect(formatRupiah(Number.POSITIVE_INFINITY)).toBe('Rp0')
  })

  it('memformat nilai nol dan negatif', () => {
    expect(formatRupiah(0)).toContain('0')
    expect(formatRupiah(-15000)).toContain('15.000')
  })

  it('memformat tanggal dalam bahasa Indonesia', () => {
    expect(formatDate('2026-01-15')).toContain('2026')
    expect(formatDate('2026-01-15')).toContain('Januari')
  })

  it('mengembalikan tanda strip jika tanggal kosong', () => {
    expect(formatDate('')).toBe('-')
    expect(formatDate(null)).toBe('-')
    expect(formatDate(undefined)).toBe('-')
  })

  it('mengembalikan tanda strip jika tanggal tidak valid', () => {
    expect(formatDate('tanggal-salah')).toBe('-')
  })
})