
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

/**
 * Mengubah nilai input datetime-local menjadi format API (YYYY-MM-DD HH:mm:ss).
 */
export function toApiDateTime(value) {
  if (!value) {
    return ''
  }

  const normalized = String(value).replace('T', ' ')

  return normalized.length === 16 ? `${normalized}:00` : normalized
}

/**
 * Mengubah tanggal dari API menjadi nilai input datetime-local.
 */
export function toInputDateTime(value) {
  if (!value) {
    return ''
  }

  return String(value).replace(' ', 'T').slice(0, 16)
}

/**
 * Menentukan apakah waktu penutupan lelang sudah lewat.
 */
export function isClosedAt(closedAt, now = Date.now()) {
  if (!closedAt) {
    return false
  }

  const time = new Date(String(closedAt).replace(' ', 'T')).getTime()

  return !Number.isNaN(time) && time <= now
}

/**
 * Menghasilkan teks hitung mundur sebelum lelang ditutup.
 */
export function getCountdown(closedAt, now = Date.now()) {
  if (!closedAt) {
    return '-'
  }

  const time = new Date(String(closedAt).replace(' ', 'T')).getTime()

  if (Number.isNaN(time) || time <= now) {
    return 'Lelang berakhir'
  }

  const totalMinutes = Math.floor((time - now) / 60000)
  const days = Math.floor(totalMinutes / 1440)
  const hours = Math.floor((totalMinutes % 1440) / 60)
  const minutes = totalMinutes % 60

  if (days > 0) {
    return `Sisa ${days} hari ${hours} jam`
  }

  return `Sisa ${hours} jam ${minutes} menit`
}

/**
 * Mengambil nominal tawaran tertinggi dari daftar bid.
 * Mengembalikan null jika tidak ada bid berupa objek bernominal.
 */
export function getHighestBid(bids) {
  const amounts = (Array.isArray(bids) ? bids : [])
    .map((item) => Number(item?.bid))
    .filter((amount) => Number.isFinite(amount))

  return amounts.length > 0 ? Math.max(...amounts) : null
}
