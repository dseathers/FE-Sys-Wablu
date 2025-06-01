'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import TextAlign from '@tiptap/extension-text-align'
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Link as LinkIcon,
  Image as ImageIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
} from 'lucide-react'

export default function TiptapEditor({ content, onChange }) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({ openOnClick: false }),
      Image,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
    ],
    content,
    onUpdate({ editor }) {
      onChange(editor.getHTML())
    }
  })

  if (!editor) return null

  const iconBtn = (isActive, onClick, Icon, title) => (
    <button
      onClick={onClick}
      title={title}
      type="button"
      className={`p-2 rounded-md border ${isActive ? 'bg-blue-500 text-white' : 'bg-white text-black'}`}
    >
      <Icon size={18} />
    </button>
  )

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-4 bg-gray-100 p-2 rounded-md shadow-sm">
        {iconBtn(editor.isActive('bold'), () => editor.chain().focus().toggleBold().run(), Bold, 'Bold')}
        {iconBtn(editor.isActive('italic'), () => editor.chain().focus().toggleItalic().run(), Italic, 'Italic')}
        {iconBtn(editor.isActive('underline'), () => editor.chain().focus().toggleUnderline().run(), UnderlineIcon, 'Underline')}
        {iconBtn(editor.isActive('link'), () => {
          const url = prompt('Masukkan URL link')
          if (url) editor.chain().focus().setLink({ href: url }).run()
        }, LinkIcon, 'Link')}

        {iconBtn(false, () => {
          const input = document.createElement('input')
          input.type = 'file'
          input.accept = 'image/*'
          input.onchange = async () => {
            const file = input.files[0]
            if (file) {
              const reader = new FileReader()
              reader.onload = () => {
                const base64 = reader.result
                editor.chain().focus().setImage({ src: base64 }).run()
              }
              reader.readAsDataURL(file)
            }
          }
          input.click()
        }, ImageIcon, 'Upload Gambar')}

        {iconBtn(editor.isActive({ textAlign: 'left' }), () => editor.chain().focus().setTextAlign('left').run(), AlignLeft, 'Left')}
        {iconBtn(editor.isActive({ textAlign: 'center' }), () => editor.chain().focus().setTextAlign('center').run(), AlignCenter, 'Center')}
        {iconBtn(editor.isActive({ textAlign: 'right' }), () => editor.chain().focus().setTextAlign('right').run(), AlignRight, 'Right')}
      </div>

      <div className="border rounded-md p-4 shadow-sm min-h-[200px] bg-white">
        <EditorContent editor={editor} className="m-4"/>
      </div>
    </div>
  )
}
