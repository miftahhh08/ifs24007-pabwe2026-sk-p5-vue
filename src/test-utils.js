import { mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { createRouter, createMemoryHistory } from 'vue-router'

export function createMockPinia(initialState = {}) {
  const pinia = createPinia()
  if (initialState && typeof initialState === 'object') {
    pinia.state.value = initialState
  }
  return pinia
}

export function renderWithProviders(component, options = {}) {
  const {
    initialState = {},
    routes = [
      { path: '/', name: 'home', component: { template: '<div>Home</div>' } },
      { path: '/auth/login', name: 'login', component: { template: '<div>Login</div>' } },
      { path: '/aucations/:aucationId', name: 'detail-aucation', component: { template: '<div>Detail</div>' } },
    ],
    initialRoute = '/',
    pinia = createMockPinia(initialState),
    props = {},
    slots = {},
  } = options

  const router = createRouter({
    history: createMemoryHistory(),
    routes,
  })

  router.push(initialRoute)

  const wrapper = mount(component, {
    global: {
      plugins: [pinia, router],
      stubs: {
        NavbarComponent: true,
        SidebarComponent: true,
        MarkdownEditor: true,
        MarkdownViewer: true,
      },
    },
    props,
    slots,
  })

  return {
    wrapper,
    container: wrapper.element,
    router,
    pinia,
  }
}