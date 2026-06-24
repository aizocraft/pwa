// src/components/RichTextRenderer.tsx
'use client'

interface RichTextRendererProps {
  content: string;
  className?: string;
}

export default function RichTextRenderer({ content, className = '' }: RichTextRendererProps) {
  if (!content) {
    return <p className="text-gray-500 dark:text-gray-400">No description available.</p>;
  }

  return (
    <div 
      className={`rich-text-renderer ${className}`}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}