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

const { value: email, onInput: onEmailInput } = useInput('')
const { value: password, onInput: onPasswordInput } = useInput('')
const isPasswordVisible = ref(false)
const validationMessage = ref('')

async function handleLogin() {
  validationMessage.value = ''

  if (!email.value.trim() || !password.value) {
    validationMessage.value = 'Email dan kata sandi wajib diisi.'
    return
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
    validationMessage.value = 'Masukkan alamat email yang valid.'
    return
  }

  try {
    await authStore.login({
      email: email.value.trim(),
      password: password.value,
    })

    await showSuccessDialog('Login berhasil', 'Kamu berhasil masuk ke akun.')

    await router.push({ name: 'home' })
  } catch (error) {
    await showErrorDialog(
      'Login gagal',
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

    <h1 class="mt-3 text-3xl font-bold text-slate-900">
      Masuk ke akun
    </h1>

    <p class="mt-2 text-sm leading-6 text-slate-600">
      Masukkan email dan kata sandi untuk melanjutkan.
    </p>

    <form class="mt-8 space-y-5" @submit.prevent="handleLogin">
      <div>
        <label for="login-email-input" class="mb-2 block text-sm font-medium text-slate-700">
          Email
        </label>

        <input
          id="login-email-input"
          :value="email"
          @input="onEmailInput"
          type="email"
          autocomplete="email"
          placeholder="nama@email.com"
          class="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100"
        />
      </div>

      <div>
        <label for="login-password-input" class="mb-2 block text-sm font-medium text-slate-700">
          Kata sandi
        </label>

        <div class="flex overflow-hidden rounded-xl border border-slate-300 focus-within:border-indigo-600 focus-within:ring-2 focus-within:ring-indigo-100">
          <input
            id="login-password-input"
            :value="password"
            @input="onPasswordInput"
            :type="isPasswordVisible ? 'text' : 'password'"
            autocomplete="current-password"
            placeholder="Masukkan kata sandi"
            class="min-w-0 flex-1 px-4 py-3 outline-none"
          />

          <button
            type="button"
            class="px-4 text-sm font-medium text-indigo-700"
            @click="isPasswordVisible = !isPasswordVisible"
          >
            {{ isPasswordVisible ? 'Sembunyikan' : 'Lihat' }}
          </button>
        </div>
      </div>

      <p
        v-if="validationMessage"
        role="alert"
        class="rounded-lg bg-red-50 p-3 text-sm text-red-700"
      >
        {{ validationMessage }}
      </p>

      <button
        id="login-submit-button"
        type="submit"
        :disabled="authStore.isAuthLogin"
        class="w-full rounded-xl bg-indigo-700 px-4 py-3 font-semibold text-white transition hover:bg-indigo-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {{ authStore.isAuthLogin ? 'Sedang masuk...' : 'Masuk' }}
      </button>
    </form>

    <p class="mt-6 text-center text-sm text-slate-600">
      Belum punya akun?
      <RouterLink
        to="/auth/register"
        class="font-semibold text-indigo-700 hover:underline"
      >
        Daftar sekarang
      </RouterLink>
    </p>
  </div>
</template>
