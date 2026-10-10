import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import MarkdownViewer from './MarkdownViewer.vue'

const instance = vi.hoisted(() => ({
  options: null,
  setMarkdown: vi.fn(),
  destroy: vi.fn(),
}))

vi.mock('@toast-ui/editor/dist/toastui-editor-viewer', () => ({
  default: vi.fn(function (options) {
    instance.options = options
    return instance
  }),
}))
vi.mock('@toast-ui/editor/dist/toastui-editor-viewer.css', () => ({}))

describe('MarkdownViewer', () => {
  beforeEach(() => vi.clearAllMocks())

  it('membuat viewer dengan konten markdown', () => {
    const wrapper = mount(MarkdownViewer, { props: { content: '**tebal**' } })
    expect(instance.options.initialValue).toBe('**tebal**')
    expect(wrapper.text()).not.toContain('Belum ada deskripsi')
  })

  it('menampilkan pesan kosong bila tidak ada konten', () => {
    const wrapper = mount(MarkdownViewer)
    expect(wrapper.text()).toContain('Belum ada deskripsi.')
  })

  it('memperbarui viewer saat konten berubah dan menghancurkannya saat unmount', async () => {
    const wrapper = mount(MarkdownViewer, { props: { content: 'a' } })
    await wrapper.setProps({ content: 'b' })
    expect(instance.setMarkdown).toHaveBeenCalledWith('b')
    wrapper.unmount()
    expect(instance.destroy).toHaveBeenCalled()
  })
})
