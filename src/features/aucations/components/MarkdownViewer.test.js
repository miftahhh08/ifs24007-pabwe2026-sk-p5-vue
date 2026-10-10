import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import MarkdownViewer from './MarkdownViewer.vue'

describe('MarkdownViewer.vue', () => {
  it('menampilkan pesan ketika deskripsi kosong', () => {
    const wrapper = mount(MarkdownViewer, {
      props: { content: '' },
    })

    expect(wrapper.text()).toContain('Belum ada deskripsi.')
    expect(wrapper.find('.markdown-viewer').exists()).toBe(false)
  })

  it('menampilkan pesan ketika deskripsi hanya berisi spasi', () => {
    const wrapper = mount(MarkdownViewer, {
      props: { content: '   \n  ' },
    })

    expect(wrapper.text()).toContain('Belum ada deskripsi.')
  })

  it('merender heading level 1, 2, dan 3', () => {
    const wrapper = mount(MarkdownViewer, {
      props: { content: '# Judul 1\n## Judul 2\n### Judul 3' },
    })

    expect(wrapper.find('h1').text()).toBe('Judul 1')
    expect(wrapper.find('h2').text()).toBe('Judul 2')
    expect(wrapper.find('h3').text()).toBe('Judul 3')
  })

  it('merender format bold, italic, dan inline code', () => {
    const wrapper = mount(MarkdownViewer, {
      props: { content: '**tebal** dan *miring* serta `kode`' },
    })

    expect(wrapper.find('strong').text()).toBe('tebal')
    expect(wrapper.find('em').text()).toBe('miring')
    expect(wrapper.find('code').text()).toBe('kode')
  })

  it('merender daftar dengan tanda minus dan bintang', () => {
    const wrapper = mount(MarkdownViewer, {
      props: { content: '- Item satu\n* Item dua' },
    })

    expect(wrapper.findAll('ul')).toHaveLength(1)
    expect(wrapper.findAll('li')).toHaveLength(2)
    expect(wrapper.text()).toContain('Item satu')
    expect(wrapper.text()).toContain('Item dua')
  })

  it('merender baris kosong sebagai pemisah', () => {
    const wrapper = mount(MarkdownViewer, {
      props: { content: 'Baris pertama\n\nBaris kedua' },
    })

    expect(wrapper.findAll('br')).toHaveLength(1)
    expect(wrapper.findAll('p')).toHaveLength(2)
  })

  it('mengubah karakter HTML menjadi teks aman', () => {
    const wrapper = mount(MarkdownViewer, {
      props: { content: '<script>alert("test")</script>' },
    })

    expect(wrapper.find('script').exists()).toBe(false)
    expect(wrapper.html()).toContain('&lt;script&gt;')
  })

  it('menampilkan teks biasa sebagai paragraf', () => {
    const wrapper = mount(MarkdownViewer, {
      props: { content: 'Deskripsi lelang' },
    })

    expect(wrapper.find('.markdown-viewer').exists()).toBe(true)
    expect(wrapper.find('p').text()).toBe('Deskripsi lelang')
  })
})
