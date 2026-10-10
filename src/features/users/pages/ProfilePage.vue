
<script setup>
import { onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import Swal from 'sweetalert2'
import { useUsersStore } from '../states/usersStore.js'
import { useAuthStore } from '../../auth/states/authStore.js'

const router = useRouter()
const usersStore = useUsersStore()
const authStore = useAuthStore()

const name = ref('')
const email = ref('')
const photoFile = ref(null)

const currentPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')

const validationMessage = ref('')

function fillProfile(profile) {
  name.value = profile?.name ?? profile?.fullName ?? ''
  email.value = profile?.email ?? ''
}

watch(
  () => usersStore.profile,
  (profile) => {
    if (profile) {
      fillProfile(profile)
    }
  },
)

onMounted(async () => {
  try {
    await usersStore.fetchMyProfile()
  } catch {
    // Pesan error disediakan oleh store.
  }
})

function handlePhotoChange(event) {
  photoFile.value = event.target.files?.[0] ?? null
}

async function showSuccess(title, text) {
  await Swal.fire({
    icon: 'success',
    title,
    text,
    confirmButtonText: 'Mengerti',
  })
}

async function showError(error, fallback) {
  await Swal.fire({
    icon: 'error',
    title: 'Terjadi kesalahan',
    text: error?.message || fallback,
    confirmButtonText: 'Mengerti',
  })
}

async function handleProfileUpdate() {
  validationMessage.value = ''

  if (!name.value.trim() || !email.value.trim()) {
    validationMessage.value = 'Nama dan email wajib diisi.'
    return
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
    validationMessage.value = 'Masukkan alamat email yang valid.'
    return
  }

  try {
    await usersStore.saveProfile({
      name: name.value.trim(),
      email: email.value.trim(),
    })

    await showSuccess('Profil diperbarui', 'Data profil berhasil disimpan.')
  } catch (error) {
    await showError(error, 'Profil gagal diperbarui.')
  }
}

async function handlePhotoUpload() {
  if (!photoFile.value) {
    validationMessage.value = 'Pilih foto terlebih dahulu.'
    return
  }

  if (!photoFile.value.type.startsWith('image/')) {
    validationMessage.value = 'File harus berupa gambar.'
    return
  }

  validationMessage.value = ''

  try {
    await usersStore.savePhoto(photoFile.value)
    photoFile.value = null

    await showSuccess('Foto diperbarui', 'Foto profil berhasil diunggah.')
    await usersStore.fetchMyProfile()
  } catch (error) {
    await showError(error, 'Foto profil gagal diunggah.')
  }
}

async function handlePasswordUpdate() {
  validationMessage.value = ''

  if (!currentPassword.value || !newPassword.value || !confirmPassword.value) {
    validationMessage.value = 'Semua kolom kata sandi wajib diisi.'
    return
  }

  if (newPassword.value.length < 8) {
    validationMessage.value = 'Kata sandi baru minimal 8 karakter.'
    return
  }

  if (newPassword.value !== confirmPassword.value) {
    validationMessage.value = 'Konfirmasi kata sandi tidak cocok.'
    return
  }

  try {
    await usersStore.savePassword({
      old_password: currentPassword.value,
      new_password: newPassword.value,
    })

    currentPassword.value = ''
    newPassword.value = ''
    confirmPassword.value = ''

    await showSuccess('Kata sandi diubah', 'Kata sandi berhasil diperbarui.')
  } catch (error) {
    await showError(error, 'Kata sandi gagal diubah.')
  }
}

async function handleLogout() {
  const result = await Swal.fire({
    icon: 'question',
    title: 'Keluar dari akun?',
    text: 'Kamu perlu login kembali untuk mengakses fitur pengguna.',
    showCancelButton: true,
    confirmButtonText: 'Keluar',
    cancelButtonText: 'Batal',
  })

  if (!result.isConfirmed) {
    return
  }

  await authStore.logout()
  await router.push('/login')
}
</script>

<template>
  <main class="min-h-screen bg-slate-100 p-4 sm:p-8">
    <section class="mx-auto max-w-4xl">
      <header class="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p class="text-sm font-semibold uppercase tracking-widest text-blue-700">
            Student Portal
          </p>
          <h1 class="mt-2 text-3xl font-bold text-slate-900">
            Profil Saya
          </h1>
          <p class="mt-2 text-slate-600">
            Kelola informasi dan keamanan akunmu.
          </p>
        </div>

        <div class="flex gap-3">
          <RouterLink
            to="/users"
            class="rounded-xl border border-slate-300 bg-white px-4 py-3 font-semibold text-slate-700 hover:bg-slate-50"
          >
            Daftar Pengguna
          </RouterLink>

          <button
            type="button"
            class="rounded-xl bg-red-600 px-4 py-3 font-semibold text-white hover:bg-red-700"
            @click="handleLogout"
          >
            Keluar
          </button>
        </div>
      </header>

      <div
        v-if="usersStore.isLoadingProfile"
        class="rounded-2xl bg-white p-6 text-slate-600 shadow-sm"
        role="status"
      >
        Memuat profil...
      </div>

      <div
        v-else-if="usersStore.errorMessage && !usersStore.profile"
        class="rounded-2xl bg-white p-6 shadow-sm"
      >
        <p class="text-red-700" role="alert">
          {{ usersStore.errorMessage }}
        </p>

        <button
          type="button"
          class="mt-4 rounded-xl bg-blue-700 px-4 py-2 font-semibold text-white"
          @click="usersStore.fetchMyProfile().catch(() => {})"
        >
          Coba lagi
        </button>
      </div>

      <template v-else>
        <section class="mb-6 rounded-2xl bg-white p-6 shadow-sm sm:p-8">
          <h2 class="text-xl font-bold text-slate-900">
            Informasi profil
          </h2>

          <form class="mt-6 space-y-5" @submit.prevent="handleProfileUpdate">
            <div>
              <label for="profile-name" class="mb-2 block text-sm font-medium text-slate-700">
                Nama lengkap
              </label>
              <input
                id="profile-name"
                v-model="name"
                type="text"
                autocomplete="name"
                class="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label for="profile-email" class="mb-2 block text-sm font-medium text-slate-700">
                Email
              </label>
              <input
                id="profile-email"
                v-model="email"
                type="email"
                autocomplete="email"
                class="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <button
              type="submit"
              :disabled="usersStore.isUpdatingProfile"
              class="rounded-xl bg-blue-700 px-5 py-3 font-semibold text-white hover:bg-blue-800 disabled:opacity-60"
            >
              {{ usersStore.isUpdatingProfile ? 'Menyimpan...' : 'Simpan Profil' }}
            </button>
          </form>
        </section>

        <section class="mb-6 rounded-2xl bg-white p-6 shadow-sm sm:p-8">
          <h2 class="text-xl font-bold text-slate-900">
            Foto profil
          </h2>

          <p class="mt-2 text-sm text-slate-500">
            Pilih gambar untuk memperbarui foto akun.
          </p>

          <form class="mt-5 space-y-4" @submit.prevent="handlePhotoUpload">
            <div>
              <label for="profile-photo" class="mb-2 block text-sm font-medium text-slate-700">
                Pilih gambar
              </label>
              <input
                id="profile-photo"
                type="file"
                accept="image/*"
                class="block w-full text-sm text-slate-600 file:mr-4 file:rounded-lg file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:font-semibold file:text-blue-700"
                @change="handlePhotoChange"
              />
            </div>

            <button
              type="submit"
              :disabled="usersStore.isUploadingPhoto"
              class="rounded-xl bg-blue-700 px-5 py-3 font-semibold text-white hover:bg-blue-800 disabled:opacity-60"
            >
              {{ usersStore.isUploadingPhoto ? 'Mengunggah...' : 'Unggah Foto' }}
            </button>
          </form>
        </section>

        <section class="rounded-2xl bg-white p-6 shadow-sm sm:p-8">
          <h2 class="text-xl font-bold text-slate-900">
            Ganti kata sandi
          </h2>

          <form class="mt-6 space-y-5" @submit.prevent="handlePasswordUpdate">
            <div>
              <label for="current-password" class="mb-2 block text-sm font-medium text-slate-700">
                Kata sandi saat ini
              </label>
              <input
                id="current-password"
                v-model="currentPassword"
                type="password"
                autocomplete="current-password"
                class="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label for="new-password" class="mb-2 block text-sm font-medium text-slate-700">
                Kata sandi baru
              </label>
              <input
                id="new-password"
                v-model="newPassword"
                type="password"
                autocomplete="new-password"
                class="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label for="confirm-password" class="mb-2 block text-sm font-medium text-slate-700">
                Konfirmasi kata sandi baru
              </label>
              <input
                id="confirm-password"
                v-model="confirmPassword"
                type="password"
                autocomplete="new-password"
                class="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <p
              v-if="validationMessage"
              role="alert"
              class="rounded-lg bg-red-50 p-3 text-sm text-red-700"
            >
              {{ validationMessage }}
            </p>

            <button
              type="submit"
              :disabled="usersStore.isUpdatingPassword"
              class="rounded-xl bg-blue-700 px-5 py-3 font-semibold text-white hover:bg-blue-800 disabled:opacity-60"
            >
              {{ usersStore.isUpdatingPassword ? 'Memperbarui...' : 'Ganti Kata Sandi' }}
            </button>
          </form>
        </section>
      </template>
    </section>
  </main>
</template>