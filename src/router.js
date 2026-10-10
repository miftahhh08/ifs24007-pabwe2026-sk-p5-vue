import { createRouter, createWebHistory } from 'vue-router'
import { getAccessToken } from './helpers/apiHelper.js'
import AuthLayout from './features/auth/layouts/AuthLayout.vue'
import LoginPage from './features/auth/pages/LoginPage.vue'
import RegisterPage from './features/auth/pages/RegisterPage.vue'
import AucationLayout from './features/aucations/layouts/AucationLayout.vue'
import HomePage from './features/aucations/pages/HomePage.vue'
import DetailPage from './features/aucations/pages/DetailPage.vue'
import UsersPage from './features/users/pages/UsersPage.vue'
import ProfilePage from './features/users/pages/ProfilePage.vue'
import NotFoundPage from './features/common/pages/NotFoundPage.vue'

export const routes = [
  {
    path: '/auth',
    component: AuthLayout,
    meta: { guestOnly: true },
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
  { path: '/:pathMatch(.*)*', name: 'not-found', component: NotFoundPage },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

export function authGuard(to) {
  const isAuthenticated = Boolean(getAccessToken())

  if (to.meta.requiresAuth && !isAuthenticated) {
    return { name: 'login' }
  }

  if (to.meta.guestOnly && isAuthenticated) {
    return { name: 'home' }
  }

  return true
}

router.beforeEach(authGuard)

export default router
