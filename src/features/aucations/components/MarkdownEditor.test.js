import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import MarkdownEditor from './MarkdownEditor.vue'

const instance = vi.hoisted(() => ({
  markdown: '',
  options: null,
  getMarkdown: vi.fn(),
  setMarkdown: vi.fn(),
  destroy: vi.fn(),
}))

vi.mock('@toast-ui/editor', () => ({
  default: vi.fn(function (options) {
    instance.options = options
    return instance
  }),
}))
vi.mock('@toast-ui/editor/dist/toastui-editor.css', () => ({}))

describe('MarkdownEditor', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    instance.markdown = ''
    instance.getMarkdown.mockImplementation(() => instance.markdown)
  })

  it('membuat editor Toast UI dengan nilai awal', () => {
    const wrapper = mount(MarkdownEditor, { props: { modelValue: '# Hai' } })
    expect(instance.options.initialValue).toBe('# Hai')
    expect(instance.options.el).toBe(wrapper.find('[data-testid="markdown-editor"]').element)
    expect(wrapper.text()).toContain('Deskripsi')
  })

  it('mengirim update:modelValue saat isi berubah', () => {
    const wrapper = mount(MarkdownEditor)
    instance.markdown = 'baru'
    instance.options.events.change()
    expect(wrapper.emitted('update:modelValue')[0]).toEqual(['baru'])
  })

  it('menyinkronkan perubahan modelValue dari luar', async () => {
    const wrapper = mount(MarkdownEditor, { props: { modelValue: 'a' } })
    instance.markdown = 'a'
    await wrapper.setProps({ modelValue: 'b' })
    expect(instance.setMarkdown).toHaveBeenCalledWith('b')

    instance.markdown = 'c'
    instance.setMarkdown.mockClear()
    await wrapper.setProps({ modelValue: 'c' })
    expect(instance.setMarkdown).not.toHaveBeenCalled()
  })

  it('tidak melakukan sinkronisasi setelah editor dihancurkan', async () => {
    const wrapper = mount(MarkdownEditor, { props: { modelValue: 'a' } })
    const props = wrapper.vm.$props
    wrapper.unmount()
    expect(instance.destroy).toHaveBeenCalled()
    expect(props).toBeDefined()
  })
})
