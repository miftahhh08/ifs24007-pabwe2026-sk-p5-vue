
import { beforeEach, describe, it, expect, vi } from 'vitest'
import Swal from 'sweetalert2'
import {
  showSuccessDialog,
  showErrorDialog,
  showConfirmDialog,
  formatRupiah,
  formatDate,
  toApiDateTime,
  toInputDateTime,
  isClosedAt,
  getCountdown,
  getHighestBid,
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

  it('toApiDateTime / toInputDateTime mengonversi format tanggal', () => {
    expect(toApiDateTime('')).toBe('')
    expect(toApiDateTime('2026-10-10T17:25')).toBe('2026-10-10 17:25:00')
    expect(toApiDateTime('2026-10-10T17:25:30')).toBe('2026-10-10 17:25:30')
    expect(toInputDateTime('')).toBe('')
    expect(toInputDateTime('2026-10-10 17:25:00')).toBe('2026-10-10T17:25')
  })

  it('isClosedAt menentukan status lelang ditutup', () => {
    const now = new Date('2026-10-10T12:00:00').getTime()
    expect(isClosedAt('', now)).toBe(false)
    expect(isClosedAt('bukan-tanggal', now)).toBe(false)
    expect(isClosedAt('2026-10-10 11:00:00', now)).toBe(true)
    expect(isClosedAt('2026-10-10 13:00:00', now)).toBe(false)
    expect(isClosedAt('2000-01-01 00:00:00')).toBe(true)
  })

  it('getCountdown menghasilkan teks sisa waktu', () => {
    const now = new Date('2026-10-10T12:00:00').getTime()
    expect(getCountdown('', now)).toBe('-')
    expect(getCountdown('x', now)).toBe('Lelang berakhir')
    expect(getCountdown('2026-10-10 11:00:00', now)).toBe('Lelang berakhir')
    expect(getCountdown('2026-10-12 15:00:00', now)).toBe('Sisa 2 hari 3 jam')
    expect(getCountdown('2026-10-10 14:30:00', now)).toBe('Sisa 2 jam 30 menit')
    expect(getCountdown('2999-01-01 00:00:00')).toMatch(/^Sisa/)
  })

  it('getHighestBid mengambil nominal tertinggi', () => {
    expect(getHighestBid(undefined)).toBeNull()
    expect(getHighestBid([1, 2])).toBeNull()
    expect(getHighestBid([{ bid: 100 }, { bid: 300 }, { bid: 200 }])).toBe(300)
  })
})
