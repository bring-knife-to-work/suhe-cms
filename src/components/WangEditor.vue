<template>
  <div class="tip-tap-editor">
    <div class="editor-toolbar" v-if="!editor.isReadOnly">
      <button type="button" @click="editor.chain().focus().toggleBold().run()" :class="{ active: editor.isActive('bold') }">
        <strong>B</strong>
      </button>
      <button type="button" @click="editor.chain().focus().toggleItalic().run()" :class="{ active: editor.isActive('italic') }">
        <em>I</em>
      </button>
      <button type="button" @click="editor.chain().focus().toggleUnderline().run()" :class="{ active: editor.isActive('underline') }">
        <u>U</u>
      </button>
      <button type="button" @click="editor.chain().focus().toggleStrike().run()" :class="{ active: editor.isActive('strike') }">
        <s>S</s>
      </button>
      <span class="divider"></span>
      <button type="button" @click="editor.chain().focus().toggleHeading({ level: 1 }).run()" :class="{ active: editor.isActive('heading', { level: 1 }) }">H1</button>
      <button type="button" @click="editor.chain().focus().toggleHeading({ level: 2 }).run()" :class="{ active: editor.isActive('heading', { level: 2 }) }">H2</button>
      <button type="button" @click="editor.chain().focus().toggleHeading({ level: 3 }).run()" :class="{ active: editor.isActive('heading', { level: 3 }) }">H3</button>
      <span class="divider"></span>
      <button type="button" @click="editor.chain().focus().toggleBulletList().run()" :class="{ active: editor.isActive('bulletList') }">List</button>
      <button type="button" @click="editor.chain().focus().toggleOrderedList().run()" :class="{ active: editor.isActive('orderedList') }">1.List</button>
      <span class="divider"></span>
      <button type="button" @click="insertImage">Img</button>
      <button type="button" @click="insertLink">Link</button>
      <span class="divider"></span>
      <button type="button" @click="editor.chain().focus().undo().run()" :disabled="!editor.can().undo()">Undo</button>
      <button type="button" @click="editor.chain().focus().redo().run()" :disabled="!editor.can().redo()">Redo</button>
      <span class="divider"></span>
      <button type="button" @click="editor.chain().focus().clearNodes().unsetAllMarks().removeParagraph().run()">Clear</button>
    </div>
    <editor-content :editor="editor" class="editor-content" />
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeMount, onBeforeUnmount, ref } from 'vue'
import { Editor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'

const props = defineProps<{
  modelValue: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const editor = ref(null)
const content = computed(() => props.modelValue)

onBeforeMount(() => {
  editor.value = new Editor({
    extensions: [
      StarterKit,
      Image.configure({ inline: true }),
      Link.configure({ openOnClick: false }),
    ],
    content: content.value,
    onUpdate: ({ editor }) => {
      emit('update:modelValue', editor.getHTML())
    },
  })
})

onBeforeUnmount(() => {
  editor.value?.destroy()
})

function insertImage() {
  const url = prompt('Enter image URL:')
  if (url) {
    editor.value?.chain().focus().setImage({ src: url }).run()
  }
}

function insertLink() {
  const url = prompt('Enter link URL:')
  if (url) {
    editor.value?.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }
}

defineExpose({ editor })
</script>

<style scoped>
.tip-tap-editor { border: 1px solid var(--border-color, #dcdfe6); border-radius: 4px; overflow: hidden; }
.editor-toolbar { display: flex; flex-wrap: wrap; gap: 2px; padding: 8px; background: #fafafa; border-bottom: 1px solid var(--border-color, #dcdfe6); }
.editor-toolbar button { padding: 4px 10px; border: 1px solid transparent; border-radius: 3px; background: none; cursor: pointer; font-size: 13px; color: #606266; min-width: 32px; }
.editor-toolbar button:hover { background: #f0f0f0; border-color: #dcdfe6; }
.editor-toolbar button.active { background: #ecf5ff; border-color: #409eff; color: #409eff; }
.editor-toolbar button:disabled { opacity: 0.4; cursor: not-allowed; }
.editor-toolbar .divider { width: 1px; background: #e4e7ed; margin: 0 4px; }
.editor-content { min-height: 400px; padding: 16px; overflow-y: auto; }
.editor-content:deep(p.is-editor-empty:first-child)::before { content: attr(data-placeholder); float: left; color: #c0c4cc; pointer-events: none; height: 0; }
.editor-content:deep(img) { max-width: 100%; height: auto; }
</style>
