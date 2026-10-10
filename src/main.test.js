import { describe, expect, it } from 'vitest'
import { nextTick } from 'vue'

describe('main.js', () => {
  it('memasang aplikasi Vue ke elemen #app', async () => {
    document.body.innerHTML = '<div id="app"></div>'
    const { default: router } = await import('./router.js')
    await import('./main.js')
    await router.isReady()
    await nextTick()
    expect(document.querySelector('#app').innerHTML).toContain('Delcom Auction')
  })
})
