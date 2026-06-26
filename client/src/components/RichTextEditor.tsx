// src/components/RichTextEditor.tsx
'use client'

/**
 * Rich Text Editor Component
 * 
 * A full-featured WYSIWYG editor built on TipTap with extensive formatting options.
 * Supports rich text editing, media embedding, tables, code blocks, and more.
 */

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
import { Table } from '@tiptap/extension-table'
import TableRow from '@tiptap/extension-table-row'
import TableCell from '@tiptap/extension-table-cell'
import TableHeader from '@tiptap/extension-table-header'
import Youtube from '@tiptap/extension-youtube'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import { createLowlight } from 'lowlight'
import Mention from '@tiptap/extension-mention'
import Subscript from '@tiptap/extension-subscript'
import Superscript from '@tiptap/extension-superscript'
import { debounce } from 'lodash'
import EmojiPicker, { Theme } from 'emoji-picker-react'

// ----------------------------------------------------------------------------
// Syntax Highlighting Setup
// ----------------------------------------------------------------------------

const lowlight = createLowlight()

// Import and register languages for code highlighting
import javascript from 'highlight.js/lib/languages/javascript'
import python from 'highlight.js/lib/languages/python'
import css from 'highlight.js/lib/languages/css'
import html from 'highlight.js/lib/languages/xml'
import json from 'highlight.js/lib/languages/json'
import typescript from 'highlight.js/lib/languages/typescript'
import bash from 'highlight.js/lib/languages/bash'
import sql from 'highlight.js/lib/languages/sql'

lowlight.register('javascript', javascript)
lowlight.register('python', python)
lowlight.register('css', css)
lowlight.register('html', html)
lowlight.register('json', json)
lowlight.register('typescript', typescript)
lowlight.register('bash', bash)
lowlight.register('sql', sql)

// ----------------------------------------------------------------------------
// Icon Imports
// ----------------------------------------------------------------------------

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
  Table as TableIcon,
  Video,
  Code2,
  ChevronDown,
  Smile,
  Upload,
  Maximize,
  Minimize,
  FileDown,
  Eraser,
  IndentIncrease,
  IndentDecrease,
  Subscript as SubscriptIcon,
  Superscript as SuperscriptIcon,
  X,
  Check,
  Type,
} from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'react-hot-toast'

// ----------------------------------------------------------------------------
// Type Definitions
// ----------------------------------------------------------------------------

export interface RichTextEditorHandle {
  getHTML: () => string
  isEmpty: () => boolean
}

interface RichTextEditorProps {
  initialValue?: string
  placeholder?: string
  className?: string
  readOnly?: boolean
  onReady?: (handle: RichTextEditorHandle) => void
  onChange?: (content: string, isEmpty: boolean) => void
  maxChars?: number
  showCount?: boolean
  autoSave?: boolean
  autoSaveKey?: string
  enableFullscreen?: boolean
  enableEmoji?: boolean
  enableMentions?: boolean
  mentionSuggestions?: string[]
}

interface ToolbarButtonProps {
  onClick: () => void
  isActive?: boolean
  children: React.ReactNode
  disabled?: boolean
  title?: string
  className?: string
}

// ----------------------------------------------------------------------------
// Sub-Components
// ----------------------------------------------------------------------------

const ToolbarButton = ({
  onClick,
  isActive = false,
  children,
  disabled = false,
  title = '',
  className = '',
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
    } ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'} ${className}`}
  >
    {children}
  </button>
)

const FontSizeDropdown = ({ editor }: { editor: any }) => {
  const [isOpen, setIsOpen] = useState(false)

  const sizes = [
    { label: 'Small', value: '12px' },
    { label: 'Normal', value: '16px' },
    { label: 'Medium', value: '18px' },
    { label: 'Large', value: '24px' },
    { label: 'XL', value: '32px' },
    { label: 'XXL', value: '48px' },
  ]

  const setFontSize = (size: string) => {
    editor.chain().focus().setMark('textStyle', { fontSize: size }).run()
    setIsOpen(false)
  }

  const getCurrentSize = () => {
    const attrs = editor.getAttributes('textStyle')
    return attrs.fontSize || '16px'
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="px-2 py-1 text-xs bg-transparent border border-gray-200 dark:border-gray-600 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-1 min-w-[60px] justify-between"
      >
        <span className="hidden sm:inline">Size</span>
        <span className="text-[10px] opacity-50 truncate">{getCurrentSize()}</span>
        <ChevronDown className="w-3 h-3 opacity-50" />
      </button>
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-20 min-w-[120px] py-1">
          {sizes.map((size) => (
            <button
              key={size.value}
              type="button"
              onClick={() => setFontSize(size.value)}
              className="w-full px-3 py-1.5 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-sm"
              style={{ fontSize: size.value }}
            >
              {size.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ----------------------------------------------------------------------------
// Main Component
// ----------------------------------------------------------------------------

export default function RichTextEditor({
  initialValue = '',
  placeholder = 'Write a detailed description...',
  className = '',
  readOnly = false,
  onReady,
  onChange,
  maxChars = 10000,
  showCount = true,
  autoSave = false,
  autoSaveKey = 'editor-content',
  enableFullscreen = true,
  enableEmoji = true,
  enableMentions = true,
  mentionSuggestions = ['John Doe', 'Jane Smith', 'Admin', 'Team', 'Support'],
}: RichTextEditorProps) {
  // --------------------------------------------------------------------------
  // State Management
  // --------------------------------------------------------------------------

  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false)
  const [linkUrl, setLinkUrl] = useState('')
  const [linkText, setLinkText] = useState('')
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false)
  const [selectedColor, setSelectedColor] = useState('#000000')
  const [wordCount, setWordCount] = useState(0)
  const [charCount, setCharCount] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [showFindReplace, setShowFindReplace] = useState(false)
  const [findText, setFindText] = useState('')
  const [replaceText, setReplaceText] = useState('')
  const [showTableModal, setShowTableModal] = useState(false)
  const [tableRows, setTableRows] = useState(3)
  const [tableCols, setTableCols] = useState(3)
  const [showCodeBlock, setShowCodeBlock] = useState(false)
  const [selectedLanguage, setSelectedLanguage] = useState('javascript')

  const didInitRef = useRef(false)
  const editorRef = useRef<HTMLDivElement>(null)

  // --------------------------------------------------------------------------
  // Editor Configuration - FIXED: No duplicate extensions
  // --------------------------------------------------------------------------

  const editorExtensions = useMemo(() => {
    const extensions: any[] = [
      // StarterKit includes: bold, italic, code, blockquote, heading, horizontalRule, 
      // listItem, orderedList, bulletList, codeBlock, paragraph, text, strike, hardBreak
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4, 5, 6],
        },
        // CodeBlock is included in StarterKit, no need to add separately
        codeBlock: {
          HTMLAttributes: {
            class: 'rounded-lg overflow-hidden',
          },
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
      // Underline is included in StarterKit with the correct configuration
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
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: 'border-collapse border border-gray-300 dark:border-gray-600',
        },
      }),
      TableRow,
      TableCell,
      TableHeader,
      Youtube.configure({
        width: 640,
        height: 480,
        inline: false,
        HTMLAttributes: {
          class: 'rounded-lg shadow-lg my-4',
        },
      }),
      // CodeBlockLowlight is NOT needed if using StarterKit's codeBlock
      // But we keep it for enhanced syntax highlighting
      CodeBlockLowlight.configure({
        lowlight,
        HTMLAttributes: {
          class: 'rounded-lg overflow-hidden',
        },
      }),
      Subscript,
      Superscript,
    ]

    if (enableMentions) {
      extensions.push(
        Mention.configure({
          HTMLAttributes: {
            class: 'mention bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 px-1 rounded font-medium',
          },
          suggestion: {
            char: '@',
            items: ({ query }: { query: string }) => {
              return mentionSuggestions.filter(item =>
                item.toLowerCase().startsWith(query.toLowerCase())
              )
            },
          },
        })
      )
    }

    return extensions
  }, [placeholder, enableMentions, mentionSuggestions])

  const editor = useEditor({
    extensions: editorExtensions,
    editable: !readOnly,
    content: initialValue || '<p></p>',
    onUpdate: ({ editor }) => {
      const html = editor.getHTML()
      const text = editor.getText()
      const words = text.trim() ? text.trim().split(/\s+/).length : 0
      const chars = text.length
      
      setWordCount(words)
      setCharCount(chars)

      if (chars > maxChars) {
        toast.error(`Character limit exceeded (${maxChars})`)
        const truncated = text.slice(0, maxChars)
        editor.commands.setContent(truncated)
        return
      }

      const isEmpty = !html || html.trim() === '' || html.trim() === '<p></p>'
      
      if (autoSave && !isEmpty) {
        debounce(() => {
          localStorage.setItem(autoSaveKey, html)
        }, 1000)()
      }

      onChange?.(html, isEmpty)
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none min-h-[200px] p-4',
      },
    },
  })

  // --------------------------------------------------------------------------
  // Effects
  // --------------------------------------------------------------------------

  useEffect(() => {
    if (!editor || !autoSave || readOnly) return
    
    const saved = localStorage.getItem(autoSaveKey)
    if (saved && !initialValue) {
      editor.commands.setContent(saved)
    }
  }, [editor, autoSave, autoSaveKey, initialValue, readOnly])

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

    const text = editor.getText()
    setWordCount(text.trim() ? text.trim().split(/\s+/).length : 0)
    setCharCount(text.length)
  }, [editor, onReady, onChange])

  useEffect(() => {
    if (!editor) return
    if (readOnly) return
    if (!didInitRef.current) return

    const currentHTML = editor.getHTML()
    const isCurrentlyEmpty = !currentHTML || currentHTML.trim() === '' || currentHTML.trim() === '<p></p>'

    if (isCurrentlyEmpty && initialValue && initialValue !== currentHTML) {
      editor.commands.setContent(initialValue)
    }
  }, [initialValue, editor, readOnly])

  useEffect(() => {
    if (!enableFullscreen) return
    
    if (isFullscreen) {
      document.documentElement.requestFullscreen?.().catch(() => {})
    } else {
      document.exitFullscreen?.().catch(() => {})
    }
  }, [isFullscreen, enableFullscreen])

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  // --------------------------------------------------------------------------
  // Memoized Data
  // --------------------------------------------------------------------------

  const fontFamilies = useMemo(
    () => [
      { label: 'Default', value: 'inherit' },
      { label: 'Inter', value: 'Inter, system-ui, -apple-system, sans-serif' },
      { label: 'Georgia', value: 'Georgia, serif' },
      { label: 'Arial', value: 'Arial, Helvetica, sans-serif' },
      { label: 'Times New Roman', value: 'Times New Roman, serif' },
      { label: 'Courier New', value: 'Courier New, monospace' },
      { label: 'Verdana', value: 'Verdana, Geneva, sans-serif' },
      { label: 'Tahoma', value: 'Tahoma, Geneva, sans-serif' },
      { label: 'Trebuchet MS', value: 'Trebuchet MS, sans-serif' },
      { label: 'Impact', value: 'Impact, sans-serif' },
      { label: 'Comic Sans MS', value: 'Comic Sans MS, cursive' },
      { label: 'Roboto', value: 'Roboto, sans-serif' },
      { label: 'Open Sans', value: 'Open Sans, sans-serif' },
      { label: 'Lato', value: 'Lato, sans-serif' },
      { label: 'Montserrat', value: 'Montserrat, sans-serif' },
      { label: 'Playfair Display', value: 'Playfair Display, serif' },
      { label: 'Merriweather', value: 'Merriweather, serif' },
      { label: 'Pacifico', value: 'Pacifico, cursive' },
    ],
    []
  )

  const colors = useMemo(
    () => [
      '#000000', '#1a1a1a', '#333333', '#4d4d4d', '#666666',
      '#e74c3c', '#e67e22', '#f39c12', '#f1c40f', '#2ecc71',
      '#27ae60', '#1abc9c', '#3498db', '#2980b9', '#9b59b6',
      '#8e44ad', '#e84393', '#6c5ce7', '#00b894', '#fdcb6e',
      '#e17055', '#0984e3', '#00cec9', '#fd79a8', '#a29bfe',
    ],
    []
  )

  const codeLanguages = [
    'javascript', 'typescript', 'python', 'html', 'css', 
    'json', 'bash', 'sql', 'markdown', 'yaml', 'xml', 'php',
    'java', 'csharp', 'go', 'ruby', 'rust', 'swift'
  ]

  // --------------------------------------------------------------------------
  // Editor Actions
  // --------------------------------------------------------------------------

  const setLink = () => {
    if (!linkUrl) return

    if (linkText) {
      editor
        ?.chain()
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
      editor?.chain().focus().setLink({ href: linkUrl }).run()
    }

    setLinkUrl('')
    setLinkText('')
    setIsLinkModalOpen(false)
  }

  const addImage = () => {
    const url = window.prompt('Enter image URL:')
    if (url) {
      editor?.chain().focus().setImage({ src: url }).run()
    }
  }

  const addVideo = () => {
    const url = window.prompt('Enter YouTube or Vimeo URL:')
    if (url) {
      editor?.chain().focus().setYoutubeVideo({ src: url }).run()
    }
  }

  const insertTable = () => {
    if (tableRows < 1 || tableCols < 1) return
    editor?.chain().focus().insertTable({ rows: tableRows, cols: tableCols, withHeaderRow: true }).run()
    setShowTableModal(false)
  }

  const addCodeBlock = () => {
    editor
      ?.chain()
      .focus()
      .setCodeBlock({ language: selectedLanguage })
      .run()
    setShowCodeBlock(false)
  }

  const handleClearFormatting = () => {
    editor?.chain().focus().clearNodes().unsetAllMarks().run()
    toast.success('Formatting cleared')
  }

  const handleFindReplace = () => {
    const content = editor?.getText() || ''
    if (!findText) {
      toast.error('Please enter text to find')
      return
    }
    const newContent = content.replace(new RegExp(findText, 'g'), replaceText)
    editor?.commands.setContent(newContent)
    setShowFindReplace(false)
    toast.success(`Replaced all occurrences of "${findText}"`)
  }

  const handleFileUpload = (file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const base64 = e.target?.result as string
      if (file.type.startsWith('image/')) {
        editor?.chain().focus().setImage({ src: base64 }).run()
      } else {
        const link = `<a href="${base64}" target="_blank" rel="noopener noreferrer">${file.name}</a>`
        editor?.chain().focus().insertContent(link).run()
      }
      toast.success(`Uploaded ${file.name}`)
    }
    reader.readAsDataURL(file)
  }

  const exportHTML = () => {
    const html = editor?.getHTML() || ''
    navigator.clipboard.writeText(html)
    toast.success('HTML copied to clipboard!')
  }

  const toggleEmojiPicker = () => {
    setShowEmojiPicker(!showEmojiPicker)
  }

  const insertEmoji = (emojiData: any) => {
    editor?.chain().focus().insertContent(emojiData.emoji).run()
    setShowEmojiPicker(false)
  }

  // --------------------------------------------------------------------------
  // Render Helpers - ✅ FIXED: Proper null check
  // --------------------------------------------------------------------------

  const getEditorContent = (): string => {
    if (!editor) return '<p></p>'
    try {
      return editor.getHTML() || '<p></p>'
    } catch {
      return '<p></p>'
    }
  }

  const editorContent = getEditorContent()
  const isContentEmpty = !editorContent || editorContent.trim() === '' || editorContent.trim() === '<p></p>'

  // Show loading state while editor initializes
  if (!editor) {
    return (
      <div
        className={`min-h-[200px] bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse flex items-center justify-center ${className}`}
      >
        <span className="text-gray-400">Loading editor...</span>
      </div>
    )
  }

  // --------------------------------------------------------------------------
  // Main Render
  // --------------------------------------------------------------------------

  return (
    <div
      ref={editorRef}
      className={`rich-text-editor border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden bg-white dark:bg-gray-900 shadow-sm ${isFullscreen ? 'fixed inset-0 z-50 rounded-none' : ''} ${className}`}
    >
      {/* TOOLBAR */}
      {!readOnly && (
        <div className="flex flex-wrap items-center gap-0.5 p-2 bg-gray-50/80 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10 backdrop-blur-sm max-h-[200px] overflow-y-auto">
          
          {/* Heading Levels */}
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
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleHeading({ level: 5 }).run()}
              isActive={editor.isActive('heading', { level: 5 })}
              title="Heading 5"
            >
              <span className="text-xs font-bold">H5</span>
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleHeading({ level: 6 }).run()}
              isActive={editor.isActive('heading', { level: 6 })}
              title="Heading 6"
            >
              <span className="text-xs font-bold">H6</span>
            </ToolbarButton>
          </div>

          {/* Text Formatting */}
          <div className="flex items-center gap-0.5 mr-1 border-r border-gray-200 dark:border-gray-700 pr-1.5">
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBold().run()}
              isActive={editor.isActive('bold')}
              title="Bold (Ctrl+B)"
            >
              <Bold className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleItalic().run()}
              isActive={editor.isActive('italic')}
              title="Italic (Ctrl+I)"
            >
              <Italic className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              isActive={editor.isActive('underline')}
              title="Underline (Ctrl+U)"
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
              onClick={() => editor.chain().focus().toggleSubscript().run()}
              isActive={editor.isActive('subscript')}
              title="Subscript"
            >
              <SubscriptIcon className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleSuperscript().run()}
              isActive={editor.isActive('superscript')}
              title="Superscript"
            >
              <SuperscriptIcon className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleHighlight().run()}
              isActive={editor.isActive('highlight')}
              title="Highlight"
            >
              <Highlighter className="w-4 h-4" />
            </ToolbarButton>
          </div>

          {/* Font Family & Size */}
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
                className="px-2 py-1 text-xs bg-transparent border border-gray-200 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer max-w-[120px] truncate"
                title="Font Family"
              >
                {fontFamilies.map((font) => (
                  <option key={font.value} value={font.value}>
                    {font.label}
                  </option>
                ))}
              </select>
            </div>

            <FontSizeDropdown editor={editor} />

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
                <div className="absolute top-full left-0 mt-1 p-2 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-20 w-[180px]">
                  <div className="grid grid-cols-5 gap-1">
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
              title="Task List (Checkbox)"
            >
              <ListChecks className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().sinkListItem('listItem').run()}
              title="Increase Indent"
            >
              <IndentIncrease className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().liftListItem('listItem').run()}
              title="Decrease Indent"
            >
              <IndentDecrease className="w-4 h-4" />
            </ToolbarButton>
          </div>

          {/* Block Elements */}
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

          {/* Tables */}
          <div className="flex items-center gap-0.5 mr-1 border-r border-gray-200 dark:border-gray-700 pr-1.5">
            <ToolbarButton
              onClick={() => setShowTableModal(true)}
              title="Insert Table"
            >
              <TableIcon className="w-4 h-4" />
            </ToolbarButton>
            {editor.isActive('table') && (
              <>
                <ToolbarButton
                  onClick={() => editor.chain().focus().addColumnBefore().run()}
                  title="Add Column Before"
                >
                  <span className="text-xs font-bold">+C</span>
                </ToolbarButton>
                <ToolbarButton
                  onClick={() => editor.chain().focus().addColumnAfter().run()}
                  title="Add Column After"
                >
                  <span className="text-xs font-bold">C+</span>
                </ToolbarButton>
                <ToolbarButton
                  onClick={() => editor.chain().focus().addRowBefore().run()}
                  title="Add Row Before"
                >
                  <span className="text-xs font-bold">+R</span>
                </ToolbarButton>
                <ToolbarButton
                  onClick={() => editor.chain().focus().addRowAfter().run()}
                  title="Add Row After"
                >
                  <span className="text-xs font-bold">R+</span>
                </ToolbarButton>
                <ToolbarButton
                  onClick={() => editor.chain().focus().deleteTable().run()}
                  title="Delete Table"
                  className="text-red-500 hover:text-red-600"
                >
                  <X className="w-4 h-4" />
                </ToolbarButton>
              </>
            )}
          </div>

          {/* Links, Images, Videos, Files */}
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
            <ToolbarButton onClick={addVideo} title="Insert Video (YouTube/Vimeo)">
              <Video className="w-4 h-4" />
            </ToolbarButton>
            <div className="relative">
              <input
                type="file"
                accept="image/*,.pdf,.doc,.docx,.txt,.csv"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handleFileUpload(file)
                  e.target.value = ''
                }}
                className="hidden"
                id="file-upload"
              />
              <ToolbarButton
                onClick={() => document.getElementById('file-upload')?.click()}
                title="Upload File"
              >
                <Upload className="w-4 h-4" />
              </ToolbarButton>
            </div>
          </div>

          {/* Code */}
          <div className="flex items-center gap-0.5 mr-1 border-r border-gray-200 dark:border-gray-700 pr-1.5">
            <ToolbarButton
              onClick={() => setShowCodeBlock(!showCodeBlock)}
              isActive={showCodeBlock}
              title="Code Block"
            >
              <Code2 className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleCode().run()}
              isActive={editor.isActive('code')}
              title="Inline Code"
            >
              <span className="text-xs font-mono font-bold">&lt;/&gt;</span>
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

          {/* Extra Tools */}
          <div className="flex items-center gap-0.5 mr-1 border-r border-gray-200 dark:border-gray-700 pr-1.5">
            <ToolbarButton
              onClick={handleClearFormatting}
              title="Clear Formatting"
            >
              <Eraser className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => setShowFindReplace(!showFindReplace)}
              isActive={showFindReplace}
              title="Find & Replace"
            >
              <Type className="w-4 h-4" />
            </ToolbarButton>
            {enableEmoji && (
              <ToolbarButton
                onClick={toggleEmojiPicker}
                isActive={showEmojiPicker}
                title="Insert Emoji"
              >
                <Smile className="w-4 h-4" />
              </ToolbarButton>
            )}
            <ToolbarButton onClick={exportHTML} title="Export HTML">
              <FileDown className="w-4 h-4" />
            </ToolbarButton>
          </div>

          {/* Undo/Redo */}
          <div className="flex items-center gap-0.5 mr-1 border-r border-gray-200 dark:border-gray-700 pr-1.5">
            <ToolbarButton onClick={() => editor.chain().focus().undo().run()} title="Undo (Ctrl+Z)">
              <Undo className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().redo().run()} title="Redo (Ctrl+Y)">
              <Redo className="w-4 h-4" />
            </ToolbarButton>
          </div>

          {/* Fullscreen */}
          {enableFullscreen && (
            <ToolbarButton
              onClick={() => setIsFullscreen(!isFullscreen)}
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
            </ToolbarButton>
          )}
        </div>
      )}

      {/* EMOJI PICKER */}
      {enableEmoji && showEmojiPicker && (
        <div className="absolute z-30 mt-1" style={{ right: '1rem', top: '3.5rem' }}>
          <div className="relative">
            <button
              onClick={toggleEmojiPicker}
              className="absolute -top-2 -right-2 p-1 bg-gray-200 dark:bg-gray-700 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors z-10"
              aria-label="Close emoji picker"
            >
              <X className="w-4 h-4" />
            </button>
            <EmojiPicker
              onEmojiClick={insertEmoji}
              theme={document.documentElement.classList.contains('dark') ? Theme.DARK : Theme.LIGHT}
              width={320}
              height={400}
              previewConfig={{ showPreview: false }}
            />
          </div>
        </div>
      )}

      {/* MODALS - Link, Table, Code Block, Find & Replace */}
      {isLinkModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Insert Link</h3>
            <div className="space-y-3">
              <input
                type="text"
                value={linkText}
                onChange={(e) => setLinkText(e.target.value)}
                placeholder="Link text (optional)"
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="url"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://example.com"
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 focus:ring-2 focus:ring-blue-500"
                onKeyDown={(e) => { if (e.key === 'Enter') setLink() }}
              />
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={setLink} className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg">Add Link</button>
              <button onClick={() => { setIsLinkModalOpen(false); setLinkUrl(''); setLinkText(''); }} className="flex-1 px-4 py-2.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {showTableModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-sm w-full shadow-2xl">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Insert Table</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <label className="text-sm text-gray-700 dark:text-gray-300">Rows:</label>
                <input type="number" value={tableRows} onChange={(e) => setTableRows(Math.max(1, parseInt(e.target.value) || 1))} min="1" max="10" className="w-20 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900" />
              </div>
              <div className="flex items-center gap-3">
                <label className="text-sm text-gray-700 dark:text-gray-300">Columns:</label>
                <input type="number" value={tableCols} onChange={(e) => setTableCols(Math.max(1, parseInt(e.target.value) || 1))} min="1" max="10" className="w-20 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900" />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={insertTable} className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg">Insert</button>
              <button onClick={() => setShowTableModal(false)} className="flex-1 px-4 py-2.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {showCodeBlock && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-sm w-full shadow-2xl">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Insert Code Block</h3>
            <select value={selectedLanguage} onChange={(e) => setSelectedLanguage(e.target.value)} className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900">
              {codeLanguages.map((lang) => (<option key={lang} value={lang}>{lang.charAt(0).toUpperCase() + lang.slice(1)}</option>))}
            </select>
            <div className="flex gap-2 mt-4">
              <button onClick={addCodeBlock} className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg">Insert</button>
              <button onClick={() => setShowCodeBlock(false)} className="flex-1 px-4 py-2.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {showFindReplace && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Find & Replace</h3>
            <div className="space-y-3">
              <input type="text" value={findText} onChange={(e) => setFindText(e.target.value)} placeholder="Find..." className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900" />
              <input type="text" value={replaceText} onChange={(e) => setReplaceText(e.target.value)} placeholder="Replace with..." className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900" onKeyDown={(e) => { if (e.key === 'Enter') handleFindReplace() }} />
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={handleFindReplace} className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg">Replace All</button>
              <button onClick={() => { setShowFindReplace(false); setFindText(''); setReplaceText(''); }} className="flex-1 px-4 py-2.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* EDITOR CONTENT */}
      <EditorContent editor={editor} className={readOnly ? 'bg-gray-50/50 dark:bg-gray-800/30' : ''} />

      {/* FOOTER */}
      {showCount && !readOnly && (
        <div className="flex justify-between items-center px-4 py-2 border-t border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/30 text-xs text-gray-400 dark:text-gray-500">
          <div className="flex items-center gap-4">
            <span>{wordCount} words</span>
            <span>{charCount} characters</span>
            {maxChars && <span className={charCount > maxChars * 0.9 ? 'text-yellow-500' : ''}>{charCount}/{maxChars}</span>}
          </div>
          {autoSave && <span className="flex items-center gap-1"><Check className="w-3 h-3 text-green-500" />Auto-saved</span>}
          {isContentEmpty && <span className="text-gray-400 italic">Empty content</span>}
        </div>
      )}

      {/* GLOBAL STYLES */}
      <style jsx global>{`
        .rich-text-editor .ProseMirror {
          min-height: 200px;
          padding: 1rem;
          outline: none;
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
          line-height: 1.8;
        }
        .rich-text-editor .ProseMirror p { margin: 0.5rem 0; }
        .rich-text-editor .ProseMirror h1 { font-size: 2em; font-weight: 700; margin: 1.2rem 0 0.5rem; }
        .rich-text-editor .ProseMirror h2 { font-size: 1.5em; font-weight: 600; margin: 1rem 0 0.5rem; }
        .rich-text-editor .ProseMirror h3 { font-size: 1.25em; font-weight: 600; margin: 0.8rem 0 0.4rem; }
        .rich-text-editor .ProseMirror h4 { font-size: 1.1em; font-weight: 600; margin: 0.6rem 0 0.3rem; }
        .rich-text-editor .ProseMirror h5 { font-size: 1em; font-weight: 600; margin: 0.5rem 0 0.2rem; }
        .rich-text-editor .ProseMirror h6 { font-size: 0.9em; font-weight: 600; margin: 0.4rem 0 0.2rem; text-transform: uppercase; letter-spacing: 0.05em; }
        .rich-text-editor .ProseMirror ul { padding-left: 1.5rem; list-style-type: disc; margin: 0.5rem 0; }
        .rich-text-editor .ProseMirror ul ul { list-style-type: circle; }
        .rich-text-editor .ProseMirror ul ul ul { list-style-type: square; }
        .rich-text-editor .ProseMirror ol { padding-left: 1.5rem; list-style-type: decimal; margin: 0.5rem 0; }
        .rich-text-editor .ProseMirror ol ol { list-style-type: lower-alpha; }
        .rich-text-editor .ProseMirror ol ol ol { list-style-type: lower-roman; }
        .rich-text-editor .ProseMirror ul[data-type='taskList'] { list-style: none; padding-left: 0; }
        .rich-text-editor .ProseMirror ul[data-type='taskList'] li { display: flex; align-items: flex-start; gap: 0.5rem; margin: 0.25rem 0; }
        .rich-text-editor .ProseMirror ul[data-type='taskList'] li > label { flex-shrink: 0; margin-top: 0.2rem; }
        .rich-text-editor .ProseMirror ul[data-type='taskList'] li > label input[type='checkbox'] { width: 1.2rem; height: 1.2rem; cursor: pointer; accent-color: #3b82f6; border-radius: 4px; }
        .rich-text-editor .ProseMirror blockquote { border-left: 4px solid #3b82f6; padding: 0.5rem 0 0.5rem 1rem; margin: 0.5rem 0; color: #64748b; background: rgba(59, 130, 246, 0.05); border-radius: 0 4px 4px 0; font-style: italic; }
        .dark .rich-text-editor .ProseMirror blockquote { color: #94a3b8; background: rgba(59, 130, 246, 0.1); }
        .rich-text-editor .ProseMirror table { border-collapse: collapse; margin: 1rem 0; width: 100%; }
        .rich-text-editor .ProseMirror table td, .rich-text-editor .ProseMirror table th { border: 1px solid #e2e8f0; padding: 0.5rem 0.75rem; text-align: left; }
        .dark .rich-text-editor .ProseMirror table td, .dark .rich-text-editor .ProseMirror table th { border-color: #334155; }
        .rich-text-editor .ProseMirror table th { background: #f1f5f9; font-weight: 600; }
        .dark .rich-text-editor .ProseMirror table th { background: #1e293b; }
        .rich-text-editor .ProseMirror code { background: #f1f5f9; padding: 0.15rem 0.4rem; border-radius: 4px; font-family: 'Courier New', monospace; font-size: 0.9rem; color: #e74c3c; }
        .dark .rich-text-editor .ProseMirror code { background: #1e293b; color: #f87171; }
        .rich-text-editor .ProseMirror pre { background: #1e293b; padding: 1rem; border-radius: 8px; overflow-x: auto; font-family: 'Courier New', monospace; font-size: 0.9rem; margin: 0.5rem 0; border: 1px solid #334155; }
        .rich-text-editor .ProseMirror pre code { background: transparent; padding: 0; color: #e2e8f0; }
        .rich-text-editor .ProseMirror img { max-width: 100%; border-radius: 8px; margin: 0.75rem 0; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
        .rich-text-editor .ProseMirror a { color: #3b82f6; text-decoration: underline; text-underline-offset: 2px; transition: color 0.2s; }
        .rich-text-editor .ProseMirror a:hover { color: #1d4ed8; }
        .dark .rich-text-editor .ProseMirror a { color: #60a5fa; }
        .dark .rich-text-editor .ProseMirror a:hover { color: #93bbfc; }
        .rich-text-editor .ProseMirror hr { border: none; border-top: 2px solid #e2e8f0; margin: 1.5rem 0; }
        .dark .rich-text-editor .ProseMirror hr { border-color: #334155; }
        .rich-text-editor .ProseMirror .mention { background: #dbeafe; color: #1d4ed8; padding: 0.1rem 0.3rem; border-radius: 4px; font-weight: 500; }
        .dark .rich-text-editor .ProseMirror .mention { background: #1e3a5f; color: #60a5fa; }
        .rich-text-editor .ProseMirror .is-editor-empty:first-child::before { content: attr(data-placeholder); float: left; color: #94a3b8; pointer-events: none; height: 0; font-style: italic; }
        .rich-text-editor .ProseMirror .ProseMirror-selectednode { outline: 2px solid #3b82f6; outline-offset: 2px; }
        .dark .rich-text-editor .ProseMirror { color: #e2e8f0; }
        .dark .rich-text-editor .ProseMirror h1, .dark .rich-text-editor .ProseMirror h2, .dark .rich-text-editor .ProseMirror h3, .dark .rich-text-editor .ProseMirror h4, .dark .rich-text-editor .ProseMirror h5, .dark .rich-text-editor .ProseMirror h6 { color: #f1f5f9; }
        .rich-text-editor .ProseMirror[contenteditable='false'] { cursor: default; }
        .rich-text-editor .ProseMirror ::selection { background: rgba(59, 130, 246, 0.3); }
        .rich-text-editor .ProseMirror .youtube { border-radius: 12px; overflow: hidden; box-shadow: 0 8px 25px rgba(0,0,0,0.15); margin: 1rem 0; }
        @media (max-width: 640px) {
          .rich-text-editor .flex-wrap { gap: 0.25rem; }
          .rich-text-editor .border-r { border-right: none !important; padding-right: 0 !important; margin-right: 0 !important; }
          .rich-text-editor .ProseMirror { padding: 0.75rem; min-height: 150px; }
          .rich-text-editor .absolute.z-30 { right: 0.5rem !important; left: 0.5rem !important; }
          .rich-text-editor .absolute.z-30 .emoji-picker-react { width: 100% !important; }
        }
        .rich-text-editor .emoji-picker-react { box-shadow: 0 8px 30px rgba(0,0,0,0.2) !important; }
      `}</style>
    </div>
  )
}