
import Swal from 'sweetalert2'

/**
 * Menampilkan dialog sukses.
 */
export function showSuccessDialog(
  title = 'Berhasil!',
  text = '',
) {
  return Swal.fire({
    icon: 'success',
    title,
    text,
    confirmButtonText: 'OK',
  })
}

/**
 * Menampilkan dialog error.
 */
export function showErrorDialog(
  title = 'Terjadi Kesalahan!',
  text = '',
) {
  return Swal.fire({
    icon: 'error',
    title,
    text,
    confirmButtonText: 'OK',
  })
}

/**
 * Menampilkan dialog konfirmasi.
 * Mengembalikan true jika pengguna memilih konfirmasi.
 */
export async function showConfirmDialog(
  title = 'Apakah kamu yakin?',
  text = '',
  confirmButtonText = 'Ya',
) {
  const result = await Swal.fire({
    icon: 'warning',
    title,
    text,
    showCancelButton: true,
    confirmButtonText,
    cancelButtonText: 'Batal',
    reverseButtons: true,
  })

  return result.isConfirmed
}

/**
 * Memformat angka menjadi mata uang Rupiah.
 * Contoh: 15000 menjadi Rp15.000.
 */
export function formatRupiah(value) {
  const amount = Number(value)

  if (!Number.isFinite(amount)) {
    return 'Rp0'
  }

  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount)
}

/**
 * Memformat tanggal menjadi format Indonesia.
 * Contoh: 2026-10-09 menjadi 9 Oktober 2026.
 */
export function formatDate(value) {
  if (!value) {
    return '-'
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return '-'
  }

  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date)
}