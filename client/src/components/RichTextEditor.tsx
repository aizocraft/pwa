// src/components/RichTextEditor.tsx
'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import Placeholder from '@tiptap/extension-placeholder'
import TextAlign from '@tiptap/extension-text-align'
import Highlight from '@tiptap/extension-highlight'
import Typography from '@tiptap/extension-typography'
import Underline from '@tiptap/extension-underline'
import FontFamily from '@tiptap/extension-font-family'
import { TextStyle } from '@tiptap/extension-text-style'
import Color from '@tiptap/extension-color'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import {
  Bold,
  Italic,
  Strikethrough,
  Underline as UnderlineIcon,
  List,
  ListOrdered,
  Quote,
  Link as LinkIcon,
  Image as ImageIcon,
  Undo,
  Redo,
  Heading1,
  Heading2,
  Heading3,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Highlighter,
  Palette,
  Minus,
  Heading4,
  ListChecks,
} from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'

export interface RichTextEditorHandle {
  getHTML: () => string
  isEmpty: () => boolean
}

interface RichTextEditorProps {
  /** Initial HTML content for the editor */
  initialValue?: string
  /** Placeholder text when empty */
  placeholder?: string
  /** Additional CSS classes */
  className?: string
  /** Read-only mode */
  readOnly?: boolean
  /** Called when editor is ready */
  onReady?: (handle: RichTextEditorHandle) => void
  /** Called whenever content changes - for live preview */
  onChange?: (content: string, isEmpty: boolean) => void
}

interface ToolbarButtonProps {
  onClick: () => void
  isActive?: boolean
  children: React.ReactNode
  disabled?: boolean
  title?: string
}

const ToolbarButton = ({
  onClick,
  isActive = false,
  children,
  disabled = false,
  title = '',
}: ToolbarButtonProps) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    title={title}
    className={`p-1.5 rounded-md transition-all duration-150 ${
      isActive
        ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 shadow-sm'
        : 'hover:bg-gray-100 dark:hover:bg-gray-700/70 text-gray-700 dark:text-gray-300'
    } ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}`}
  >
    {children}
  </button>
)

export default function RichTextEditor({
  initialValue = '',
  placeholder = 'Write a detailed description...',
  className = '',
  readOnly = false,
  onReady,
  onChange,
}: RichTextEditorProps) {
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false)
  const [linkUrl, setLinkUrl] = useState('')
  const [linkText, setLinkText] = useState('')
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false)
  const [selectedColor, setSelectedColor] = useState('#000000')

  const didInitRef = useRef(false)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4],
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
        alignments: ['left', 'center', 'right', 'justify'],
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class:
            'text-blue-600 dark:text-blue-400 underline hover:text-blue-800 dark:hover:text-blue-300 transition-colors',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full rounded-lg my-2 shadow-md',
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
      Highlight.configure({
        multicolor: true,
        HTMLAttributes: {
          class: 'bg-yellow-200 dark:bg-yellow-800/50 px-0.5 rounded',
        },
      }),
      Typography,
      Underline,
      TextStyle,
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      FontFamily.configure({
        types: ['textStyle'],
      }),
      Color.configure({
        types: ['textStyle'],
      }),
    ],
    editable: !readOnly,
    content: initialValue || '<p></p>',
    onUpdate: ({ editor }) => {
      const html = editor.getHTML()
      const isEmpty = !html || html.trim() === '' || html.trim() === '<p></p>'
      
      // Always trigger onChange for live preview - parent decides when to save
      onChange?.(html, isEmpty)
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none min-h-[200px] p-4',
      },
    },
  })

  // Initialize editor
  useEffect(() => {
    if (!editor) return
    if (didInitRef.current) return
    
    didInitRef.current = true

    const handle = {
      getHTML: () => editor.getHTML(),
      isEmpty: () => {
        const html = editor.getHTML().trim()
        return !html || html === '<p></p>'
      },
    }

    onReady?.(handle)
    const isEmpty = handle.isEmpty()
    onChange?.(editor.getHTML(), isEmpty)
  }, [editor, onReady, onChange])

  // Update content when initialValue changes (for loading existing product)
  useEffect(() => {
    if (!editor) return
    if (readOnly) return
    if (!didInitRef.current) return

    const currentHTML = editor.getHTML()
    const isCurrentlyEmpty = !currentHTML || currentHTML.trim() === '' || currentHTML.trim() === '<p></p>'

    // Only update if editor is empty and initialValue is provided
    if (isCurrentlyEmpty && initialValue && initialValue !== currentHTML) {
      editor.commands.setContent(initialValue)
    }
  }, [initialValue, editor, readOnly])

  const colors = useMemo(
    () => [
      '#000000', '#e74c3c', '#e67e22', '#f1c40f', '#2ecc71',
      '#3498db', '#9b59b6', '#1abc9c', '#e84393', '#6c5ce7',
      '#00b894', '#fdcb6e', '#e17055', '#0984e3', '#00cec9', '#fd79a8',
    ],
    []
  )

  const fontFamilies = useMemo(
    () => [
      { label: 'Default', value: 'inherit' },
      { label: 'Inter', value: 'Inter, sans-serif' },
      { label: 'Georgia', value: 'Georgia, serif' },
      { label: 'Arial', value: 'Arial, sans-serif' },
      { label: 'Times New Roman', value: 'Times New Roman, serif' },
      { label: 'Courier New', value: 'Courier New, monospace' },
    ],
    []
  )

  if (!editor) {
    return (
      <div
        className={`min-h-[200px] bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse flex items-center justify-center ${className}`}
      >
        <span className="text-gray-400">Loading editor...</span>
      </div>
    )
  }

  const setLink = () => {
    if (!linkUrl) return

    if (linkText) {
      editor
        .chain()
        .focus()
        .insertContent({
          type: 'text',
          text: linkText,
          marks: [
            {
              type: 'link',
              attrs: { href: linkUrl },
            },
          ],
        })
        .run()
    } else {
      editor.chain().focus().setLink({ href: linkUrl }).run()
    }

    setLinkUrl('')
    setLinkText('')
    setIsLinkModalOpen(false)
  }

  const addImage = () => {
    const url = window.prompt('Enter image URL:')
    if (url) {
      editor.chain().focus().setImage({ src: url }).run()
    }
  }

  return (
    <div
      className={`rich-text-editor border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden bg-white dark:bg-gray-900 shadow-sm ${className}`}
    >
      {/* Toolbar */}
      {!readOnly && (
        <div className="flex flex-wrap items-center gap-0.5 p-2 bg-gray-50/80 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10 backdrop-blur-sm">
          {/* Headings */}
          <div className="flex items-center gap-0.5 mr-1 border-r border-gray-200 dark:border-gray-700 pr-1.5">
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
              isActive={editor.isActive('heading', { level: 1 })}
              title="Heading 1"
            >
              <Heading1 className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              isActive={editor.isActive('heading', { level: 2 })}
              title="Heading 2"
            >
              <Heading2 className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
              isActive={editor.isActive('heading', { level: 3 })}
              title="Heading 3"
            >
              <Heading3 className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}
              isActive={editor.isActive('heading', { level: 4 })}
              title="Heading 4"
            >
              <Heading4 className="w-4 h-4" />
            </ToolbarButton>
          </div>

          {/* Text formatting */}
          <div className="flex items-center gap-0.5 mr-1 border-r border-gray-200 dark:border-gray-700 pr-1.5">
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBold().run()}
              isActive={editor.isActive('bold')}
              title="Bold"
            >
              <Bold className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleItalic().run()}
              isActive={editor.isActive('italic')}
              title="Italic"
            >
              <Italic className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              isActive={editor.isActive('underline')}
              title="Underline"
            >
              <UnderlineIcon className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleStrike().run()}
              isActive={editor.isActive('strike')}
              title="Strikethrough"
            >
              <Strikethrough className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleHighlight().run()}
              isActive={editor.isActive('highlight')}
              title="Highlight"
            >
              <Highlighter className="w-4 h-4" />
            </ToolbarButton>
          </div>

          {/* Font & Color */}
          <div className="flex items-center gap-0.5 mr-1 border-r border-gray-200 dark:border-gray-700 pr-1.5">
            <div className="relative">
              <select
                onChange={(e) => {
                  const value = e.target.value
                  if (value === 'inherit') {
                    editor.chain().focus().unsetFontFamily().run()
                  } else {
                    editor.chain().focus().setFontFamily(value).run()
                  }
                }}
                className="px-2 py-1 text-xs bg-transparent border border-gray-200 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer"
                title="Font Family"
              >
                {fontFamilies.map((font) => (
                  <option key={font.value} value={font.value}>
                    {font.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="relative">
              <ToolbarButton
                onClick={() => setIsColorPickerOpen(!isColorPickerOpen)}
                isActive={isColorPickerOpen}
                title="Text Color"
              >
                <div className="relative">
                  <Palette className="w-4 h-4" />
                  <div
                    className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3 h-1 rounded-full"
                    style={{ backgroundColor: selectedColor }}
                  />
                </div>
              </ToolbarButton>

              {isColorPickerOpen && (
                <div className="absolute top-full left-0 mt-1 p-2 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-20 w-[160px]">
                  <div className="grid grid-cols-4 gap-1">
                    {colors.map((color) => (
                      <button
                        type="button"
                        key={color}
                        onClick={() => {
                          setSelectedColor(color)
                          editor.chain().focus().setColor(color).run()
                          setIsColorPickerOpen(false)
                        }}
                        className="w-8 h-8 rounded-full hover:scale-110 transition-transform border-2 border-transparent hover:border-gray-300 dark:hover:border-gray-600"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      editor.chain().focus().unsetColor().run()
                      setIsColorPickerOpen(false)
                    }}
                    className="mt-2 w-full text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                  >
                    Remove color
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Lists */}
          <div className="flex items-center gap-0.5 mr-1 border-r border-gray-200 dark:border-gray-700 pr-1.5">
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              isActive={editor.isActive('bulletList')}
              title="Bullet List"
            >
              <List className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              isActive={editor.isActive('orderedList')}
              title="Numbered List"
            >
              <ListOrdered className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleTaskList().run()}
              isActive={editor.isActive('taskList')}
              title="Task List"
            >
              <ListChecks className="w-4 h-4" />
            </ToolbarButton>
          </div>

          {/* Block elements */}
          <div className="flex items-center gap-0.5 mr-1 border-r border-gray-200 dark:border-gray-700 pr-1.5">
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              isActive={editor.isActive('blockquote')}
              title="Blockquote"
            >
              <Quote className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().setHorizontalRule().run()}
              title="Divider"
            >
              <Minus className="w-4 h-4" />
            </ToolbarButton>
          </div>

          {/* Links & Images */}
          <div className="flex items-center gap-0.5 mr-1 border-r border-gray-200 dark:border-gray-700 pr-1.5">
            <ToolbarButton
              onClick={() => setIsLinkModalOpen(true)}
              isActive={editor.isActive('link')}
              title="Insert Link"
            >
              <LinkIcon className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton onClick={addImage} title="Insert Image">
              <ImageIcon className="w-4 h-4" />
            </ToolbarButton>
          </div>

          {/* Alignment */}
          <div className="flex items-center gap-0.5 mr-1 border-r border-gray-200 dark:border-gray-700 pr-1.5">
            <ToolbarButton
              onClick={() => editor.chain().focus().setTextAlign('left').run()}
              isActive={editor.isActive({ textAlign: 'left' })}
              title="Align Left"
            >
              <AlignLeft className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().setTextAlign('center').run()}
              isActive={editor.isActive({ textAlign: 'center' })}
              title="Align Center"
            >
              <AlignCenter className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().setTextAlign('right').run()}
              isActive={editor.isActive({ textAlign: 'right' })}
              title="Align Right"
            >
              <AlignRight className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().setTextAlign('justify').run()}
              isActive={editor.isActive({ textAlign: 'justify' })}
              title="Justify"
            >
              <AlignJustify className="w-4 h-4" />
            </ToolbarButton>
          </div>

          {/* Undo/Redo */}
          <div className="flex items-center gap-0.5">
            <ToolbarButton onClick={() => editor.chain().focus().undo().run()} title="Undo">
              <Undo className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().redo().run()} title="Redo">
              <Redo className="w-4 h-4" />
            </ToolbarButton>
          </div>
        </div>
      )}

      {/* Link Modal */}
      {isLinkModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Insert Link
            </h3>
            <div className="space-y-3">
              <input
                type="text"
                value={linkText}
                onChange={(e) => setLinkText(e.target.value)}
                placeholder="Link text (optional)"
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              />
              <input
                type="url"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://example.com"
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') setLink()
                }}
              />
            </div>
            <div className="flex gap-2 mt-4">
              <button
                type="button"
                onClick={setLink}
                className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all hover:shadow-lg"
              >
                Add Link
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsLinkModalOpen(false)
                  setLinkUrl('')
                  setLinkText('')
                }}
                className="flex-1 px-4 py-2.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Editor Content */}
      <EditorContent editor={editor} className={readOnly ? 'bg-gray-50/50 dark:bg-gray-800/30' : ''} />

      <style jsx global>{`
        .rich-text-editor .ProseMirror {
          min-height: 200px;
          padding: 1rem;
          outline: none;
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
          line-height: 1.8;
        }

        .rich-text-editor .ProseMirror p {
          margin: 0.5rem 0;
        }

        .rich-text-editor .ProseMirror h1 {
          font-size: 2em;
          font-weight: 700;
          margin: 1.2rem 0 0.5rem;
          letter-spacing: -0.02em;
        }

        .rich-text-editor .ProseMirror h2 {
          font-size: 1.5em;
          font-weight: 600;
          margin: 1rem 0 0.5rem;
          letter-spacing: -0.01em;
        }

        .rich-text-editor .ProseMirror h3 {
          font-size: 1.25em;
          font-weight: 600;
          margin: 0.8rem 0 0.4rem;
        }

        .rich-text-editor .ProseMirror h4 {
          font-size: 1.1em;
          font-weight: 600;
          margin: 0.6rem 0 0.3rem;
        }

        .rich-text-editor .ProseMirror ul {
          padding-left: 1.5rem;
          list-style-type: disc;
          margin: 0.5rem 0;
        }

        .rich-text-editor .ProseMirror ul ul {
          list-style-type: circle;
        }

        .rich-text-editor .ProseMirror ul ul ul {
          list-style-type: square;
        }

        .rich-text-editor .ProseMirror ol {
          padding-left: 1.5rem;
          list-style-type: decimal;
          margin: 0.5rem 0;
        }

        .rich-text-editor .ProseMirror ol ol {
          list-style-type: lower-alpha;
        }

        .rich-text-editor .ProseMirror ol ol ol {
          list-style-type: lower-roman;
        }

        .rich-text-editor .ProseMirror ul[data-type='taskList'] {
          list-style: none;
          padding-left: 0;
        }

        .rich-text-editor .ProseMirror ul[data-type='taskList'] li {
          display: flex;
          align-items: flex-start;
          gap: 0.5rem;
          margin: 0.25rem 0;
        }

        .rich-text-editor .ProseMirror ul[data-type='taskList'] li > label {
          flex-shrink: 0;
          margin-top: 0.2rem;
        }

        .rich-text-editor .ProseMirror ul[data-type='taskList'] li > label input[type='checkbox'] {
          width: 1.2rem;
          height: 1.2rem;
          cursor: pointer;
          accent-color: #3b82f6;
          border-radius: 4px;
        }

        .rich-text-editor .ProseMirror blockquote {
          border-left: 4px solid #3b82f6;
          padding: 0.5rem 0 0.5rem 1rem;
          margin: 0.5rem 0;
          color: #64748b;
          background: rgba(59, 130, 246, 0.05);
          border-radius: 0 4px 4px 0;
          font-style: italic;
        }

        .dark .rich-text-editor .ProseMirror blockquote {
          color: #94a3b8;
          background: rgba(59, 130, 246, 0.1);
        }

        .rich-text-editor .ProseMirror code {
          background: #f1f5f9;
          padding: 0.15rem 0.4rem;
          border-radius: 4px;
          font-family: 'Courier New', monospace;
          font-size: 0.9rem;
          color: #e74c3c;
        }

        .dark .rich-text-editor .ProseMirror code {
          background: #1e293b;
          color: #f87171;
        }

        .rich-text-editor .ProseMirror pre {
          background: #f1f5f9;
          padding: 1rem;
          border-radius: 8px;
          overflow-x: auto;
          font-family: 'Courier New', monospace;
          font-size: 0.9rem;
          margin: 0.5rem 0;
          border: 1px solid #e2e8f0;
        }

        .dark .rich-text-editor .ProseMirror pre {
          background: #1e293b;
          border-color: #334155;
        }

        .rich-text-editor .ProseMirror pre code {
          background: transparent;
          padding: 0;
          color: inherit;
        }

        .rich-text-editor .ProseMirror img {
          max-width: 100%;
          border-radius: 8px;
          margin: 0.75rem 0;
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06);
        }

        .rich-text-editor .ProseMirror a {
          color: #3b82f6;
          text-decoration: underline;
          text-underline-offset: 2px;
          transition: color 0.2s;
        }

        .rich-text-editor .ProseMirror a:hover {
          color: #1d4ed8;
        }

        .dark .rich-text-editor .ProseMirror a {
          color: #60a5fa;
        }

        .dark .rich-text-editor .ProseMirror a:hover {
          color: #93bbfc;
        }

        .rich-text-editor .ProseMirror hr {
          border: none;
          border-top: 2px solid #e2e8f0;
          margin: 1.5rem 0;
        }

        .dark .rich-text-editor .ProseMirror hr {
          border-color: #334155;
        }

        .rich-text-editor .ProseMirror .is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: #94a3b8;
          pointer-events: none;
          height: 0;
          font-style: italic;
        }

        .rich-text-editor .ProseMirror .ProseMirror-selectednode {
          outline: 2px solid #3b82f6;
          outline-offset: 2px;
        }

        .dark .rich-text-editor .ProseMirror {
          color: #e2e8f0;
        }

        .dark .rich-text-editor .ProseMirror h1,
        .dark .rich-text-editor .ProseMirror h2,
        .dark .rich-text-editor .ProseMirror h3,
        .dark .rich-text-editor .ProseMirror h4 {
          color: #f1f5f9;
        }

        .rich-text-editor .ProseMirror[contenteditable='false'] {
          cursor: default;
        }

        .rich-text-editor .ProseMirror ::selection {
          background: rgba(59, 130, 246, 0.3);
        }

        @media (max-width: 640px) {
          .rich-text-editor .flex-wrap {
            gap: 0.25rem;
          }
          .rich-text-editor .border-r {
            border-right: none !important;
            padding-right: 0 !important;
            margin-right: 0 !important;
          }
        }
      `}</style>
    </div>
  )
}