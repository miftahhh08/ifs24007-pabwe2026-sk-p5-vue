<script setup>
import { ref } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import { useAuthStore } from '../states/authStore.js'
import { useInput } from '../../../hooks/useInput.js'
import {
  showErrorDialog,
  showSuccessDialog,
} from '../../../helpers/toolsHelper.js'

const router = useRouter()
const authStore = useAuthStore()

const { value: name, onInput: onNameInput } = useInput('')
const { value: email, onInput: onEmailInput } = useInput('')
const { value: password, onInput: onPasswordInput } = useInput('')
const { value: confirmPassword, onInput: onConfirmInput } = useInput('')
const validationMessage = ref('')

async function handleRegister() {
  validationMessage.value = ''

  if (
    !name.value.trim() ||
    !email.value.trim() ||
    !password.value ||
    !confirmPassword.value
  ) {
    validationMessage.value = 'Semua kolom wajib diisi.'
    return
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
    validationMessage.value = 'Masukkan alamat email yang valid.'
    return
  }

  if (password.value.length < 8) {
    validationMessage.value = 'Kata sandi harus terdiri dari minimal 8 karakter.'
    return
  }

  if (password.value !== confirmPassword.value) {
    validationMessage.value = 'Konfirmasi kata sandi tidak cocok.'
    return
  }

  try {
    await authStore.register({
      name: name.value.trim(),
      email: email.value.trim(),
      password: password.value,
    })

    await showSuccessDialog(
      'Registrasi berhasil',
      'Akun berhasil dibuat. Silakan masuk menggunakan akunmu.',
    )

    await router.push({ name: 'login' })
  } catch (error) {
    await showErrorDialog(
      'Registrasi gagal',
      error?.message || authStore.errorMessage,
    )
  }
}
</script>

<template>
  <div>
    <p class="text-sm font-semibold uppercase tracking-widest text-indigo-700">
      Delcom Auction
    </p>

    <h2 class="mt-3 text-3xl font-bold text-slate-900">
      Buat akun baru
    </h2>

    <p class="mt-2 text-sm leading-6 text-slate-500">
      Isi data berikut untuk membuat akun.
    </p>

    <form class="mt-7 space-y-4" @submit.prevent="handleRegister">
      <div>
        <label for="register-name" class="mb-2 block text-sm font-medium text-slate-700">
          Nama lengkap
        </label>

        <input
          id="register-name"
          :value="name"
          @input="onNameInput"
          type="text"
          autocomplete="name"
          placeholder="Nama lengkap"
          class="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100"
        />
      </div>

      <div>
        <label for="register-email" class="mb-2 block text-sm font-medium text-slate-700">
          Email
        </label>

        <input
          id="register-email"
          :value="email"
          @input="onEmailInput"
          type="email"
          autocomplete="email"
          placeholder="nama@email.com"
          class="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100"
        />
      </div>

      <div>
        <label for="register-password" class="mb-2 block text-sm font-medium text-slate-700">
          Kata sandi
        </label>

        <input
          id="register-password"
          :value="password"
          @input="onPasswordInput"
          type="password"
          autocomplete="new-password"
          placeholder="Minimal 8 karakter"
          class="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100"
        />
      </div>

      <div>
        <label for="register-confirm-password" class="mb-2 block text-sm font-medium text-slate-700">
          Konfirmasi kata sandi
        </label>

        <input
          id="register-confirm-password"
          :value="confirmPassword"
          @input="onConfirmInput"
          type="password"
          autocomplete="new-password"
          placeholder="Ulangi kata sandi"
          class="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100"
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
        :disabled="authStore.isAuthRegister"
        class="w-full rounded-xl bg-indigo-700 px-4 py-3 font-semibold text-white transition hover:bg-indigo-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {{ authStore.isAuthRegister ? 'Sedang mendaftar...' : 'Buat akun' }}
      </button>
    </form>

    <p class="mt-5 text-center text-sm text-slate-600">
      Sudah punya akun?
      <RouterLink
        to="/auth/login"
        class="font-semibold text-indigo-700 hover:underline"
      >
        Masuk
      </RouterLink>
    </p>
  </div>
</template>
