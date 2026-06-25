// src/components/RichTextEditor.tsx
'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import Placeholder from '@tiptap/extension-placeholder'
import { 
  Bold, Italic, Strikethrough, 
  List, ListOrdered, Quote, 
  Link as LinkIcon, Image as ImageIcon,
  Undo, Redo, Heading1, Heading2, Heading3,
  AlignLeft, AlignCenter, AlignRight
} from 'lucide-react'
import { useState, useEffect, useRef } from 'react'

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  readOnly?: boolean;
}

const ToolbarButton = ({ 
  onClick, 
  isActive = false, 
  children,
  disabled = false
}: { 
  onClick: () => void; 
  isActive?: boolean; 
  children: React.ReactNode;
  disabled?: boolean;
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`p-1.5 rounded transition-all ${
      isActive 
        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' 
        : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
    } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
  >
    {children}
  </button>
);

export default function RichTextEditor({ 
  value, 
  onChange, 
  placeholder = 'Write a detailed description...',
  className = '',
  readOnly = false
}: RichTextEditorProps) {
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const lastValueRef = useRef(value);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3]
        }
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 dark:text-blue-400 underline hover:text-blue-800'
        }
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full rounded-lg my-2'
        }
      }),
      Placeholder.configure({
        placeholder: placeholder
      })
    ],
    content: value,
    editable: !readOnly,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      lastValueRef.current = html;
      onChange(html);
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none min-h-[200px] p-4'
      }
    }
  });

  useEffect(() => {
    if (!editor) return;
    if (readOnly) return;
    if (value !== lastValueRef.current) {
      if (value !== editor.getHTML()) {
        editor.commands.setContent(value || '<p></p>');
        lastValueRef.current = value;
      }
    }
  }, [value, editor, readOnly]);

  if (!editor) {
    return (
      <div className={`min-h-[200px] bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse flex items-center justify-center ${className}`}>
        <span className="text-gray-400">Loading editor...</span>
      </div>
    );
  }

  const setLink = () => {
    if (linkUrl) {
      editor.chain().focus().setLink({ href: linkUrl }).run();
      setLinkUrl('');
      setIsLinkModalOpen(false);
    }
  };

  const addImage = () => {
    const url = window.prompt('Enter image URL:');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  return (
    <div className={`rich-text-editor border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden bg-white dark:bg-gray-900 ${className}`}>
      {/* Toolbar */}
      {!readOnly && (
        <div className="flex flex-wrap items-center gap-0.5 p-2 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
          {/* Headings */}
          <div className="flex items-center gap-0.5 mr-1 border-r border-gray-200 dark:border-gray-700 pr-1">
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
              isActive={editor.isActive('heading', { level: 1 })}
            >
              <Heading1 className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              isActive={editor.isActive('heading', { level: 2 })}
            >
              <Heading2 className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
              isActive={editor.isActive('heading', { level: 3 })}
            >
              <Heading3 className="w-4 h-4" />
            </ToolbarButton>
          </div>

          {/* Text formatting */}
          <div className="flex items-center gap-0.5 mr-1 border-r border-gray-200 dark:border-gray-700 pr-1">
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBold().run()}
              isActive={editor.isActive('bold')}
            >
              <Bold className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleItalic().run()}
              isActive={editor.isActive('italic')}
            >
              <Italic className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleStrike().run()}
              isActive={editor.isActive('strike')}
            >
              <Strikethrough className="w-4 h-4" />
            </ToolbarButton>
          </div>

          {/* Lists */}
          <div className="flex items-center gap-0.5 mr-1 border-r border-gray-200 dark:border-gray-700 pr-1">
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              isActive={editor.isActive('bulletList')}
            >
              <List className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              isActive={editor.isActive('orderedList')}
            >
              <ListOrdered className="w-4 h-4" />
            </ToolbarButton>
          </div>

          {/* Blockquote */}
          <div className="flex items-center gap-0.5 mr-1 border-r border-gray-200 dark:border-gray-700 pr-1">
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              isActive={editor.isActive('blockquote')}
            >
              <Quote className="w-4 h-4" />
            </ToolbarButton>
          </div>

          {/* Links & Images */}
          <div className="flex items-center gap-0.5 mr-1 border-r border-gray-200 dark:border-gray-700 pr-1">
            <ToolbarButton
              onClick={() => setIsLinkModalOpen(true)}
              isActive={editor.isActive('link')}
            >
              <LinkIcon className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton onClick={addImage}>
              <ImageIcon className="w-4 h-4" />
            </ToolbarButton>
          </div>

          {/* Align */}
          <div className="flex items-center gap-0.5 mr-1 border-r border-gray-200 dark:border-gray-700 pr-1">
            <ToolbarButton
              onClick={() => (editor as any).chain().focus().setTextAlign('left').run()}
              isActive={editor.isActive({ textAlign: 'left' })}
            >
              <AlignLeft className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => (editor as any).chain().focus().setTextAlign('center').run()}
              isActive={editor.isActive({ textAlign: 'center' })}
            >
              <AlignCenter className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => (editor as any).chain().focus().setTextAlign('right').run()}
              isActive={editor.isActive({ textAlign: 'right' })}
            >
              <AlignRight className="w-4 h-4" />
            </ToolbarButton>
          </div>

          {/* Undo/Redo */}
          <div className="flex items-center gap-0.5">
            <ToolbarButton onClick={() => editor.chain().focus().undo().run()}>
              <Undo className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().redo().run()}>
              <Redo className="w-4 h-4" />
            </ToolbarButton>
          </div>
        </div>
      )}

      {/* Link Modal */}
      {isLinkModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Insert Link</h3>
            <input
              type="url"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="https://example.com"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 mb-4"
            />
            <div className="flex gap-2">
              <button
                onClick={setLink}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Add Link
              </button>
              <button
                onClick={() => {
                  setIsLinkModalOpen(false);
                  setLinkUrl('');
                }}
                className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Editor Content */}
      <EditorContent editor={editor} className={readOnly ? 'bg-gray-50 dark:bg-gray-800/50' : ''} />

      <style jsx global>{`
        .rich-text-editor .ProseMirror {
          min-height: 200px;
          padding: 1rem;
          outline: none;
          font-family: 'Inter', sans-serif;
          line-height: 1.8;
        }
        .rich-text-editor .ProseMirror p {
          margin: 0.5rem 0;
        }
        .rich-text-editor .ProseMirror h1 {
          font-size: 2em;
          font-weight: 700;
          margin: 1rem 0 0.5rem;
        }
        .rich-text-editor .ProseMirror h2 {
          font-size: 1.5em;
          font-weight: 600;
          margin: 0.75rem 0 0.5rem;
        }
        .rich-text-editor .ProseMirror h3 {
          font-size: 1.17em;
          font-weight: 600;
          margin: 0.75rem 0 0.5rem;
        }
        .rich-text-editor .ProseMirror ul {
          padding-left: 1.5rem;
          list-style-type: disc;
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
        }
        .rich-text-editor .ProseMirror ol ol {
          list-style-type: lower-alpha;
        }
        .rich-text-editor .ProseMirror ol ol ol {
          list-style-type: lower-roman;
        }
        .rich-text-editor .ProseMirror blockquote {
          border-left: 4px solid #3b82f6;
          padding-left: 1rem;
          margin: 0.5rem 0;
          color: #64748b;
        }
        .dark .rich-text-editor .ProseMirror blockquote {
          color: #94a3b8;
        }
        .rich-text-editor .ProseMirror code {
          background: #f1f5f9;
          padding: 0.2rem 0.4rem;
          border-radius: 4px;
          font-family: 'Courier New', monospace;
          font-size: 0.9rem;
        }
        .dark .rich-text-editor .ProseMirror code {
          background: #1e293b;
        }
        .rich-text-editor .ProseMirror pre {
          background: #f1f5f9;
          padding: 1rem;
          border-radius: 8px;
          overflow-x: auto;
          font-family: 'Courier New', monospace;
          font-size: 0.9rem;
          margin: 0.5rem 0;
        }
        .dark .rich-text-editor .ProseMirror pre {
          background: #1e293b;
        }
        .rich-text-editor .ProseMirror img {
          max-width: 100%;
          border-radius: 8px;
          margin: 0.5rem 0;
        }
        .rich-text-editor .ProseMirror a {
          color: #3b82f6;
          text-decoration: underline;
        }
        .dark .rich-text-editor .ProseMirror a {
          color: #60a5fa;
        }
        .rich-text-editor .ProseMirror .is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: #94a3b8;
          pointer-events: none;
          height: 0;
        }
        .rich-text-editor .ProseMirror .ProseMirror-selectednode {
          outline: 2px solid #3b82f6;
        }
        .rich-text-editor .ProseMirror img.ProseMirror-selectednode {
          outline: 2px solid #3b82f6;
        }
        .dark .rich-text-editor .ProseMirror {
          color: #e2e8f0;
        }
        .dark .rich-text-editor .ProseMirror h1,
        .dark .rich-text-editor .ProseMirror h2,
        .dark .rich-text-editor .ProseMirror h3 {
          color: #f1f5f9;
        }
        .rich-text-editor .ProseMirror[contenteditable="false"] {
          cursor: default;
        }
      `}</style>
    </div>
  );
}
