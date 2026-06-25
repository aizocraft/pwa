'use client'

import { useState, useEffect, useCallback, useRef, Dispatch, SetStateAction } from 'react'
import { Image as ImageIcon, Loader2, ImagePlus, UploadCloud, Trash, CheckCircle2, X, ExternalLink } from 'lucide-react'
import toast from 'react-hot-toast'
import { settingsErrorToast, settingsSuccessToast } from '@/lib/settingsToast'


import { getLogoUrl, getFaviconUrl } from '@/lib/company'
import { motion, AnimatePresence } from 'framer-motion'

interface BrandingTabProps {
  company: any
  editing: boolean
  formData: any
  setFormData: Dispatch<SetStateAction<any>>
  uploadLogo: (file: File) => Promise<any>
  updateLogoUrl: (url: string) => Promise<any>
  deleteLogo: () => Promise<any>
  uploadFavicon: (file: File) => Promise<any>
  updateFaviconUrl: (url: string) => Promise<any>
  deleteFavicon: () => Promise<any>
}

export default function BrandingTab({
  company,
  editing,
  formData,
  setFormData,
  uploadLogo,
  updateLogoUrl,
  deleteLogo,
  uploadFavicon,
  updateFaviconUrl,
  deleteFavicon,
}: BrandingTabProps) {
  const [logoPreviewUrl, setLogoPreviewUrl] = useState<string | null>(null)
  const [faviconPreviewUrl, setFaviconPreviewUrl] = useState<string | null>(null)
  const [logoUrlInput, setLogoUrlInput] = useState('')
  const [faviconUrlInput, setFaviconUrlInput] = useState('')
  const [logoLoading, setLogoLoading] = useState(false)
  const [faviconLoading, setFaviconLoading] = useState(false)
  const [logoDragActive, setLogoDragActive] = useState(false)
  const [faviconDragActive, setFaviconDragActive] = useState(false)
  
  const logoFileInputRef = useRef<HTMLInputElement>(null)
  const faviconFileInputRef = useRef<HTMLInputElement>(null)

  // Update previews when company data changes
  useEffect(() => {
    if (company) {
      setLogoPreviewUrl(getLogoUrl(company))
      setFaviconPreviewUrl(getFaviconUrl(company))
    }
  }, [company])

  const handleLogoUpload = async (file: File) => {
    // Validate file size
    if (file.size > 5 * 1024 * 1024) {
      settingsErrorToast('File size must be less than 5MB')
      return
    }
    
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please upload JPEG, PNG, WebP, or SVG file')
      return
    }
    
    setLogoLoading(true)
    const tempPreview = URL.createObjectURL(file)
    setLogoPreviewUrl(tempPreview)
    
    try {
      await uploadLogo(file)
      toast.success('Logo uploaded successfully!')
    } catch (err: any) {
      console.error('Upload error:', err)
      toast.error(err.message || 'Failed to upload logo')
      setLogoPreviewUrl(getLogoUrl(company))
    } finally {
      setLogoLoading(false)
      URL.revokeObjectURL(tempPreview)
    }
  }

  const handleLogoUrlUpdate = async () => {
    if (!logoUrlInput) {
      toast.error('Please enter a valid URL')
      return
    }
    
    // Validate URL format
    try {
      new URL(logoUrlInput)
    } catch {
      toast.error('Please enter a valid URL (include http:// or https://)')
      return
    }
    
    setLogoLoading(true)
    try {
      await updateLogoUrl(logoUrlInput)
      setLogoPreviewUrl(logoUrlInput)
      toast.success('Logo URL updated successfully!')
      setLogoUrlInput('')
    } catch (err: any) {
      console.error('Logo URL update error:', err)
      toast.error(err.response?.data?.error || err.message || 'Failed to update logo URL')
    } finally {
      setLogoLoading(false)
    }
  }

  const handleLogoDelete = async () => {
    setLogoLoading(true)
    try {
      await deleteLogo()
      setLogoPreviewUrl(null)
      toast.success('Logo reset to default')
    } catch (err: any) {
      console.error('Delete error:', err)
      toast.error(err.message || 'Failed to delete logo')
    } finally {
      setLogoLoading(false)
    }
  }

  const handleFaviconUpload = async (file: File) => {
    // Validate file size
    if (file.size > 1 * 1024 * 1024) {
      toast.error('Favicon size must be less than 1MB')
      return
    }
    
    setFaviconLoading(true)
    const tempPreview = URL.createObjectURL(file)
    setFaviconPreviewUrl(tempPreview)
    
    try {
      await uploadFavicon(file)
      toast.success('Favicon uploaded successfully!')
    } catch (err: any) {
      console.error('Upload error:', err)
      toast.error(err.message || 'Failed to upload favicon')
      setFaviconPreviewUrl(getFaviconUrl(company))
    } finally {
      setFaviconLoading(false)
      URL.revokeObjectURL(tempPreview)
    }
  }

  const handleFaviconUrlUpdate = async () => {
    if (!faviconUrlInput) {
      toast.error('Please enter a valid URL')
      return
    }
    
    // Validate URL format
    try {
      new URL(faviconUrlInput)
    } catch {
      toast.error('Please enter a valid URL (include http:// or https://)')
      return
    }
    
    setFaviconLoading(true)
    try {
      await updateFaviconUrl(faviconUrlInput)
      setFaviconPreviewUrl(faviconUrlInput)
      toast.success('Favicon URL updated successfully!')
      setFaviconUrlInput('')
    } catch (err: any) {
      console.error('Favicon URL update error:', err)
      toast.error(err.response?.data?.error || err.message || 'Failed to update favicon URL')
    } finally {
      setFaviconLoading(false)
    }
  }

  const handleFaviconDelete = async () => {
    setFaviconLoading(true)
    try {
      await deleteFavicon()
      setFaviconPreviewUrl(null)
      toast.success('Favicon deleted successfully!')
    } catch (err: any) {
      console.error('Delete error:', err)
      toast.error(err.message || 'Failed to delete favicon')
    } finally {
      setFaviconLoading(false)
    }
  }

  const updateThemeColor = (
    theme: 'light' | 'dark',
    key: 'primary' | 'primaryForeground' | 'primaryMid' | 'primaryLight',
    value: string
  ) => {
    setFormData({
      ...formData,
      themeColors: {
        ...formData.themeColors,
        [theme]: {
          ...formData.themeColors?.[theme],
          [key]: value
        }
      }
    })
  }

  const handleDragOver = (e: React.DragEvent, type: 'logo' | 'favicon') => {
    e.preventDefault()
    e.stopPropagation()
    if (type === 'logo') {
      setLogoDragActive(true)
    } else {
      setFaviconDragActive(true)
    }
  }

  const handleDragLeave = (e: React.DragEvent, type: 'logo' | 'favicon') => {
    e.preventDefault()
    e.stopPropagation()
    if (type === 'logo') {
      setLogoDragActive(false)
    } else {
      setFaviconDragActive(false)
    }
  }

  const handleDrop = async (e: React.DragEvent, type: 'logo' | 'favicon') => {
    e.preventDefault()
    e.stopPropagation()
    
    if (type === 'logo') {
      setLogoDragActive(false)
    } else {
      setFaviconDragActive(false)
    }
    
    const files = e.dataTransfer.files
    if (files && files[0]) {
      const file = files[0]
      if (type === 'logo') {
        await handleLogoUpload(file)
      } else {
        await handleFaviconUpload(file)
      }
    }
  }

  return (
    <div className="space-y-8">
      {/* Logo Section */}
      <section className="bg-white dark:bg-gray-900 rounded-xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-blue-600" />
              Company Logo
            </h4>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Recommended size: 200x200px. Max file size: 5MB
            </p>
          </div>
          {logoPreviewUrl && !editing && (
            <a 
              href={logoPreviewUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <ExternalLink className="w-3 h-3" />
              View full size
            </a>
          )}
        </div>
        
        <div className="mb-6 p-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl border-2 border-dashed transition-all duration-200"
          style={{
            borderColor: logoDragActive ? '#3B82F6' : (logoPreviewUrl ? '#10B981' : '#D1D5DB'),
            backgroundColor: logoDragActive ? 'rgba(59, 130, 246, 0.05)' : undefined
          }}
        >
          <AnimatePresence mode="wait">
            {logoPreviewUrl ? (
              <motion.div
                key="preview"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex flex-col sm:flex-row gap-6 items-center"
              >
                <div className="relative group">
                  <img 
                    src={logoPreviewUrl} 
                    alt="Company logo preview"
                    className="w-28 h-28 sm:w-32 sm:h-32 object-contain bg-white dark:bg-gray-800 rounded-xl shadow-md transition-transform group-hover:scale-105"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none'
                      toast.error('Failed to load logo image')
                    }}
                  />
                  <div className="absolute inset-0 bg-black/50 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <CheckCircle2 className="w-8 h-8 text-green-400" />
                  </div>
                </div>
                <div className="flex-1 text-center sm:text-left">
                  <div className="flex items-center gap-2 justify-center sm:justify-start">
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                    <span className="text-sm font-medium text-green-600 dark:text-green-400">
                      Logo loaded successfully
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Click delete to reset to default logo
                  </p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-8 text-gray-500"
              >
                <ImageIcon className="w-16 h-16 mb-3 opacity-30" />
                <p className="text-sm font-medium">No logo set</p>
                <p className="text-xs mt-1">Upload a logo or set a URL below</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {editing && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* File Upload Section */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Upload Logo File
                </label>
                <div
                  className={`relative border-2 border-dashed rounded-xl p-6 transition-all duration-200 cursor-pointer
                    ${logoDragActive 
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20' 
                      : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500 bg-gray-50 dark:bg-gray-800'
                    }
                    ${logoLoading ? 'opacity-50 cursor-not-allowed' : ''}
                  `}
                  onDragOver={(e) => handleDragOver(e, 'logo')}
                  onDragLeave={(e) => handleDragLeave(e, 'logo')}
                  onDrop={(e) => handleDrop(e, 'logo')}
                  onClick={() => !logoLoading && logoFileInputRef.current?.click()}
                >
                  <input
                    ref={logoFileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/svg+xml"
                    onChange={async (e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        await handleLogoUpload(file)
                      }
                    }}
                    className="hidden"
                    disabled={logoLoading}
                  />
                  <div className="flex flex-col items-center gap-3">
                    <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/30">
                      <UploadCloud className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {logoDragActive ? 'Drop your logo here' : 'Click or drag logo image'}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        JPEG, PNG, WebP, SVG • Max 5MB
                      </p>
                    </div>
                  </div>
                  {logoLoading && (
                    <div className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 rounded-xl flex items-center justify-center">
                      <div className="flex flex-col items-center gap-2">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                        <span className="text-sm font-medium text-blue-600">Uploading...</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* URL Input Section */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Logo URL
                </label>
                <div className="relative">
                  <input
                    type="url"
                    value={logoUrlInput}
                    onChange={(e) => setLogoUrlInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleLogoUrlUpdate()}
                    placeholder="https://example.com/logo.png"
                    className="w-full px-4 py-2.5 pr-24 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    disabled={logoLoading}
                  />
                  <button
                    type="button"
                    onClick={handleLogoUrlUpdate}
                    disabled={!logoUrlInput || logoLoading}
                    className="absolute right-1 top-1 bottom-1 px-3 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 disabled:opacity-50 transition-all flex items-center gap-1"
                  >
                    {logoLoading ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <ImagePlus className="w-3 h-3" />
                    )}
                    <span className="hidden sm:inline">Update</span>
                  </button>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Enter a direct image URL from Cloudinary, Imgur, etc.
                </p>
              </div>
            </div>

            {logoPreviewUrl && (
              <div className="flex justify-center sm:justify-end">
                <button
                  type="button"
                  onClick={handleLogoDelete}
                  disabled={logoLoading}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-all flex items-center gap-2 disabled:opacity-50 shadow-sm hover:shadow"
                >
                  <Trash className="w-4 h-4" />
                  Reset to Default Logo
                </button>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Theme Colors Section */}
      <section className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
          <div>
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-blue-600" />
              Theme Colors
            </h4>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Set your brand palette for light and dark mode.
            </p>
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Use the color pickers or enter hex values directly.
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {['light', 'dark'].map((theme) => {
            const themeLabel = theme === 'light' ? 'Light Mode' : 'Dark Mode'
            const themeValues = formData.themeColors?.[theme] || {}
            return (
              <div key={theme} className="rounded-2xl border border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-950">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{themeLabel}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Brand colors for {themeLabel.toLowerCase()}</p>
                  </div>
                </div>

                <div className="grid gap-4">
                  {[
                    { key: 'primary', label: 'Primary' },
                    { key: 'primaryForeground', label: 'Primary text' },
                    { key: 'primaryMid', label: 'Primary mid' },
                    { key: 'primaryLight', label: 'Primary light' }
                  ].map(({ key, label }) => (
                    <label key={key} className="block text-sm text-gray-700 dark:text-gray-300">
                      <span className="mb-2 block font-medium">{label}</span>
                      <div className="flex items-center gap-3">
                        <input
                          type="color"
                          value={themeValues[key] || '#000063'}
                          disabled={!editing}
                          onChange={(e) => updateThemeColor(theme as 'light' | 'dark', key as any, e.target.value)}
                          className="w-14 h-10 rounded-lg border border-gray-300 dark:border-gray-600 cursor-pointer"
                        />
                        <input
                          type="text"
                          value={themeValues[key] || '#000063'}
                          disabled={!editing}
                          onChange={(e) => updateThemeColor(theme as 'light' | 'dark', key as any, e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* Favicon Section */}
      <section className="bg-white dark:bg-gray-900 rounded-xl pt-6 border-t border-gray-200 dark:border-gray-800">
        <div className="mb-6">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-blue-600" />
            Favicon
          </h4>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Browser tab icon. Recommended size: 32x32px. Max file size: 1MB
          </p>
        </div>
        
        <div className="mb-6 p-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl border-2 border-dashed transition-all duration-200"
          style={{
            borderColor: faviconDragActive ? '#3B82F6' : (faviconPreviewUrl ? '#10B981' : '#D1D5DB'),
            backgroundColor: faviconDragActive ? 'rgba(59, 130, 246, 0.05)' : undefined
          }}
        >
          <AnimatePresence mode="wait">
            {faviconPreviewUrl ? (
              <motion.div
                key="preview"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex flex-col sm:flex-row gap-6 items-center"
              >
                <div className="relative group">
                  <img 
                    src={faviconPreviewUrl} 
                    alt="Favicon preview"
                    className="w-20 h-20 object-contain bg-white dark:bg-gray-800 rounded-xl shadow-md transition-transform group-hover:scale-105"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none'
                      toast.error('Failed to load favicon image')
                    }}
                  />
                </div>
                <div className="flex-1 text-center sm:text-left">
                  <div className="flex items-center gap-2 justify-center sm:justify-start">
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                    <span className="text-sm font-medium text-green-600 dark:text-green-400">
                      Favicon loaded successfully
                    </span>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-8 text-gray-500"
              >
                <ImageIcon className="w-12 h-12 mb-3 opacity-30" />
                <p className="text-sm font-medium">No favicon set</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {editing && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* File Upload Section */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Upload Favicon
                </label>
                <div
                  className={`relative border-2 border-dashed rounded-xl p-6 transition-all duration-200 cursor-pointer
                    ${faviconDragActive 
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20' 
                      : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500 bg-gray-50 dark:bg-gray-800'
                    }
                    ${faviconLoading ? 'opacity-50 cursor-not-allowed' : ''}
                  `}
                  onDragOver={(e) => handleDragOver(e, 'favicon')}
                  onDragLeave={(e) => handleDragLeave(e, 'favicon')}
                  onDrop={(e) => handleDrop(e, 'favicon')}
                  onClick={() => !faviconLoading && faviconFileInputRef.current?.click()}
                >
                  <input
                    ref={faviconFileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/x-icon,.ico"
                    onChange={async (e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        await handleFaviconUpload(file)
                      }
                    }}
                    className="hidden"
                    disabled={faviconLoading}
                  />
                  <div className="flex flex-col items-center gap-3">
                    <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/30">
                      <UploadCloud className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {faviconDragActive ? 'Drop your favicon here' : 'Click or drag favicon'}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        ICO, JPEG, PNG, WebP • Max 1MB
                      </p>
                    </div>
                  </div>
                  {faviconLoading && (
                    <div className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 rounded-xl flex items-center justify-center">
                      <div className="flex flex-col items-center gap-2">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                        <span className="text-sm font-medium text-blue-600">Uploading...</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* URL Input Section */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Favicon URL
                </label>
                <div className="relative">
                  <input
                    type="url"
                    value={faviconUrlInput}
                    onChange={(e) => setFaviconUrlInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleFaviconUrlUpdate()}
                    placeholder="https://example.com/favicon.ico"
                    className="w-full px-4 py-2.5 pr-24 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    disabled={faviconLoading}
                  />
                  <button
                    type="button"
                    onClick={handleFaviconUrlUpdate}
                    disabled={!faviconUrlInput || faviconLoading}
                    className="absolute right-1 top-1 bottom-1 px-3 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 disabled:opacity-50 transition-all flex items-center gap-1"
                  >
                    {faviconLoading ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <ImagePlus className="w-3 h-3" />
                    )}
                    <span className="hidden sm:inline">Update</span>
                  </button>
                </div>
              </div>
            </div>

            {faviconPreviewUrl && (
              <div className="flex justify-center sm:justify-end">
                <button
                  type="button"
                  onClick={handleFaviconDelete}
                  disabled={faviconLoading}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-all flex items-center gap-2 disabled:opacity-50 shadow-sm hover:shadow"
                >
                  <Trash className="w-4 h-4" />
                  Delete Favicon
                </button>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  )
}