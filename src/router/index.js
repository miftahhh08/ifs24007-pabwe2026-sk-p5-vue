
import { createRouter, createWebHistory } from 'vue-router'
import { defineComponent, h } from 'vue'
import AuthLayout from '../features/auth/layouts/AuthLayout.vue'
import LoginPage from '../features/auth/pages/LoginPage.vue'
import RegisterPage from '../features/auth/pages/RegisterPage.vue'
import HomePage from '../features/aucations/pages/HomePage.vue'
import DetailPage from '../features/aucations/pages/DetailPage.vue'
import UsersPage from '../features/users/pages/UsersPage.vue'
import ProfilePage from '../features/users/pages/ProfilePage.vue'
import NotFoundPage from '../features/common/pages/NotFoundPage.vue'

export const AucationLayout = {
  name: 'AucationLayout',
  setup(_, { slots }) {
    return () => h('div', { class: 'min-h-screen' }, slots.default?.())
  },
}

const routes = [
  {
    path: '/auth',
    component: AuthLayout,
    children: [
      { path: 'login', name: 'login', component: LoginPage },
      { path: 'register', name: 'register', component: RegisterPage },
    ],
  },
  {
    path: '/',
    component: AucationLayout,
    meta: { requiresAuth: true },
    children: [
      { path: '', name: 'home', component: HomePage },
      {
        path: 'aucations/:aucationId',
        name: 'detail-aucation',
        component: DetailPage,
        props: true,
      },
      { path: 'users', name: 'users', component: UsersPage },
      { path: 'profile', name: 'profile', component: ProfilePage },
    ],
  },
  { path: '/login', redirect: { name: 'login' } },
  { path: '/register', redirect: { name: 'register' } },
  { path: '/:pathMatch(.*)*', name: 'not-found', component: NotFoundPage },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

router.beforeEach((to) => {
  const token =
    localStorage.getItem('accessToken') ||
    sessionStorage.getItem('accessToken')

  const isAuthenticated = Boolean(token)
  const requiresAuth = to.matched.some(
    (record) => record.meta.requiresAuth,
  )

  if (to.path === '/' && isAuthenticated) {
    return { name: 'users' }
  }

  if (requiresAuth && !isAuthenticated) {
    return { name: 'login' }
  }

  if (
    isAuthenticated &&
    (to.path.startsWith('/auth') ||
      to.path === '/login' ||
      to.path === '/register')
  ) {
    return { name: 'users' }
  }

  if (to.name === 'not-found' && !isAuthenticated) {
    return { name: 'login' }
  }

  return true
})

export default router