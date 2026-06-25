'use client'

import { useState, useEffect } from 'react'
import { 
  Building2, Edit3, Save, X, Phone, Mail, MapPin, Link2, 
  Plus, Trash2, Image as ImageIcon, Loader2, FileText, 
  Tag, Percent 
} from 'lucide-react'
import { useCompanySettings } from '@/lib/use-company-settings'
import { getLogoUrl, getFaviconUrl } from '@/lib/company'
import { settingsErrorToast, settingsSuccessToast } from '@/lib/settingsToast'

import BrandingTab from './BrandingTab'


export default function CompanySettings() {
  const { 
    data: company, 
    isLoading, 
    update, 
    uploadLogo: uploadLogoMutation, 
    updateLogoUrl, 
    deleteLogo: deleteLogoMutation,
    uploadFavicon: uploadFaviconMutation,
    updateFaviconUrl,
    deleteFavicon: deleteFaviconMutation
  } = useCompanySettings()
  
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState<any>({})
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('basic')
  const [newCategory, setNewCategory] = useState('')

  // Initialize form when company data loads
  useEffect(() => {
    if (company) {
      setFormData({
        companyName: company.companyName || '',
        slogan: company.slogan || '',
        description: company.description || '',
        address: company.address || '',
        phone: company.phone || '',
        email: company.email || '',
        website: company.website || '',
        footerText: company.footerText || '',
        taxRate: company.taxRate || 0.16,
        taxExemptCategories: company.taxExemptCategories || ['Solar Panels', 'Solar Lights', 'Inverters'],
        socialLinks: company.socialLinks || [],
        themeColors: company.themeColors || {
          light: {
            primary: '#000063',
            primaryForeground: '#ffffff',
            primaryMid: '#0043b3',
            primaryLight: '#009dff'
          },
          dark: {
            primary: '#000063',
            primaryForeground: '#ffffff',
            primaryMid: '#0043b3',
            primaryLight: '#009dff'
          }
        }
      })
    }
  }, [company])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const filteredSocialLinks = (formData.socialLinks || []).filter(
        (link: any) => link.platform?.trim() && link.url?.trim()
      )
      
      const filteredTaxExemptCategories = (formData.taxExemptCategories || [])
        .filter((cat: string) => cat.trim())
        .map((cat: string) => cat.trim());
      
      const data = {
        companyName: formData.companyName,

        slogan: formData.slogan || undefined,
        description: formData.description || undefined,
        address: formData.address || undefined,
        phone: formData.phone || undefined,
        email: formData.email || undefined,
        website: formData.website || undefined,
        footerText: formData.footerText || undefined,
        taxRate: formData.taxRate !== undefined ? formData.taxRate : undefined,
        taxExemptCategories: filteredTaxExemptCategories.length > 0 ? filteredTaxExemptCategories : undefined,
        socialLinks: filteredSocialLinks.length > 0 ? filteredSocialLinks : undefined,
        themeColors: formData.themeColors || undefined
      }
      
      await update.mutateAsync(data)

      setEditing(false)

    } catch (error: any) {
      console.error('Update error:', error)
      settingsErrorToast(error.message || 'Failed to update settings')
    } finally {
      setLoading(false)
    }

  }

  const addSocialLink = () => {
    setFormData({
      ...formData,
      socialLinks: [...(formData.socialLinks || []), { platform: '', url: '' }]
    })
  }
  
  const removeSocialLink = (index: number) => {
    const newLinks = [...(formData.socialLinks || [])]
    newLinks.splice(index, 1)
    setFormData({ ...formData, socialLinks: newLinks })
  }

  const updateSocialLink = (index: number, field: 'platform' | 'url', value: string) => {
    const newLinks = [...(formData.socialLinks || [])]
    newLinks[index][field] = value
    setFormData({ ...formData, socialLinks: newLinks })
  }

  const addTaxExemptCategory = () => {
    if (newCategory.trim()) {
      setFormData({
        ...formData,
        taxExemptCategories: [...(formData.taxExemptCategories || []), newCategory.trim()]
      })
      setNewCategory('')
    }
  }

  const removeTaxExemptCategory = (index: number) => {
    const newCategories = [...(formData.taxExemptCategories || [])]
    newCategories.splice(index, 1)
    setFormData({ ...formData, taxExemptCategories: newCategories })
  }

  const updateTaxExemptCategory = (index: number, value: string) => {
    const newCategories = [...(formData.taxExemptCategories || [])]
    newCategories[index] = value
    setFormData({ ...formData, taxExemptCategories: newCategories })
  }

  const tabs = [
    { id: 'basic', label: 'Basic Info', icon: Building2 },
    { id: 'tax', label: 'Tax', icon: Percent },
    { id: 'contact', label: 'Contact', icon: MapPin },
    { id: 'social', label: 'Social', icon: Link2 },
    { id: 'branding', label: 'Branding', icon: ImageIcon },
    { id: 'footer', label: 'Footer', icon: FileText }
  ]

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-12 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
      <div className="p-6 border-b border-gray-200 dark:border-gray-800 bg-gradient-to-r from-blue-50/30 to-indigo-50/30">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-600" />
              Company Settings
            </h2>
            <p className="text-sm text-gray-500 mt-1">Manage your store information and branding</p>
          </div>
          <button
            type="button"
            onClick={() => setEditing(!editing)}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-xl transition-colors disabled:opacity-50"
          >
            {editing ? (
              <>
                <Save className="w-4 h-4" />
                Edit Mode
              </>
            ) : (
              <>
                <Edit3 className="w-4 h-4" />
                Edit Mode
              </>
            )}
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="p-6 space-y-6">

          {/* Tabs */}
          <div className="flex border-b border-gray-200 dark:border-gray-800 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 -mb-px text-sm font-medium flex items-center gap-2 transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-b-2 border-blue-600 text-blue-600'
                      : 'border-b-2 border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              )
            })}
          </div>

          {/* Basic Tab */}
          {activeTab === 'basic' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Company Name *
                </label>
                <input
                  type="text"
                  value={formData.companyName || ''}
                  onChange={(e) => setFormData({...formData, companyName: e.target.value})}
                  disabled={!editing}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 disabled:bg-gray-100 dark:disabled:bg-gray-700 focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Slogan
                </label>
                <input
                  type="text"
                  value={formData.slogan || ''}
                  onChange={(e) => setFormData({...formData, slogan: e.target.value})}
                  disabled={!editing}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 disabled:bg-gray-100 dark:disabled:bg-gray-700 focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={formData.description || ''}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  disabled={!editing}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 disabled:bg-gray-100 dark:disabled:bg-gray-700 focus:ring-2 focus:ring-blue-500 resize-vertical"
                />
              </div>
            </div>
          )}

          {/* Tax Tab */}
          {activeTab === 'tax' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                  <Percent className="w-4 h-4" />
                  Tax Rate (%)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max="1"
                    step="0.01"
                    value={formData.taxRate || ''}
                    onChange={(e) => setFormData({...formData, taxRate: parseFloat(e.target.value) || 0})}
                    disabled={!editing}
                    className="w-full pl-10 pr-12 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 disabled:bg-gray-100 dark:disabled:bg-gray-700 focus:ring-2 focus:ring-blue-500"
                    placeholder="0.16"
                  />
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">%</span>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Enter as decimal (e.g., 16% = 0.16)
                </p>
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                  <Tag className="w-4 h-4" />
                  Tax-Exempt Categories
                </label>
                <p className="text-xs text-gray-500 mb-3">
                  Products in these categories will have 0% tax applied
                </p>

                <div className="space-y-3">
                  {(formData.taxExemptCategories || []).map((category: string, index: number) => (
                    <div key={index} className="flex gap-3 items-center">
                      <input
                        type="text"
                        value={category}
                        onChange={(e) => updateTaxExemptCategory(index, e.target.value)}
                        disabled={!editing}
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 disabled:bg-gray-100 dark:disabled:bg-gray-700 focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., Solar Panels"
                      />
                      {editing && (
                        <button
                          type="button"
                          onClick={() => removeTaxExemptCategory(index)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  
                  {editing && (
                    <div className="flex gap-3">
                      <input
                        type="text"
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500"
                        placeholder="New category name"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addTaxExemptCategory();
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={addTaxExemptCategory}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        Add
                      </button>
                    </div>
                  )}
                  
                  {(!formData.taxExemptCategories || formData.taxExemptCategories.length === 0) && !editing && (
                    <p className="text-gray-500 text-sm text-center py-2">
                      No tax-exempt categories defined.
                    </p>
                  )}
                </div>
                
                <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                  <p className="text-xs text-blue-700 dark:text-blue-300">
                    <strong>Note:</strong> Category matching is case-insensitive. Products with matching categories will have 0% tax.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Contact Tab */}
          {activeTab === 'contact' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Address
                </label>
                <input
                  type="text"
                  value={formData.address || ''}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  disabled={!editing}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 disabled:bg-gray-100 dark:disabled:bg-gray-700 focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Phone
                </label>
                <input
                  type="tel"
                  value={formData.phone || ''}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  disabled={!editing}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 disabled:bg-gray-100 dark:disabled:bg-gray-700 focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  disabled={!editing}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 disabled:bg-gray-100 dark:disabled:bg-gray-700 focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                  <Link2 className="w-4 h-4" />
                  Website
                </label>
                <input
                  type="url"
                  value={formData.website || ''}
                  onChange={(e) => setFormData({...formData, website: e.target.value})}
                  disabled={!editing}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 disabled:bg-gray-100 dark:disabled:bg-gray-700 focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          {/* Social Tab */}
          {activeTab === 'social' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Social Links</h4>
                {editing && (
                  <button
                    type="button"
                    onClick={addSocialLink}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Add Link
                  </button>
                )}
              </div>
              <div className="space-y-3">
                {(formData.socialLinks || []).map((link: any, index: number) => (
                  <div key={index} className="flex gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <input
                      type="text"
                      placeholder="Platform (e.g., Facebook, Twitter)"
                      value={link.platform}
                      onChange={(e) => updateSocialLink(index, 'platform', e.target.value)}
                      disabled={!editing}
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 disabled:bg-gray-100 dark:disabled:bg-gray-800 focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="url"
                      placeholder="URL (https://...)"
                      value={link.url}
                      onChange={(e) => updateSocialLink(index, 'url', e.target.value)}
                      disabled={!editing}
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 disabled:bg-gray-100 dark:disabled:bg-gray-800 focus:ring-2 focus:ring-blue-500"
                    />
                    {editing && (
                      <button
                        type="button"
                        onClick={() => removeSocialLink(index)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
                {(!formData.socialLinks || formData.socialLinks.length === 0) && (
                  <p className="text-gray-500 text-center py-4">No social links added</p>
                )}
              </div>
            </div>
          )}

          {/* Footer Tab */}
          {activeTab === 'footer' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Footer Text
              </label>
              <textarea
                rows={4}
                value={formData.footerText || ''}
                onChange={(e) => setFormData({...formData, footerText: e.target.value})}
                disabled={!editing}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 disabled:bg-gray-100 dark:disabled:bg-gray-700 focus:ring-2 focus:ring-blue-500 resize-vertical"
                placeholder="Copyright notice, disclaimers, etc."
              />
            </div>
          )}

          {/* Branding Tab */}
          {activeTab === 'branding' && (
            <BrandingTab
              company={company}
              editing={editing}
              formData={formData}
              setFormData={setFormData}
              uploadLogo={uploadLogoMutation.mutateAsync}
              updateLogoUrl={updateLogoUrl.mutateAsync}
              deleteLogo={deleteLogoMutation.mutateAsync}
              uploadFavicon={uploadFaviconMutation.mutateAsync}
              updateFaviconUrl={updateFaviconUrl.mutateAsync}
              deleteFavicon={deleteFaviconMutation.mutateAsync}
            />
          )}
        </div>

        {editing && (
          <div className="flex gap-3 p-6 pt-0">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Changes
            </button>
            <button
              type="button"
              onClick={() => {
                setEditing(false)
                if (company) {
                  setFormData({
                    companyName: company.companyName || '',
                    slogan: company.slogan || '',
                    description: company.description || '',
                    address: company.address || '',
                    phone: company.phone || '',
                    email: company.email || '',
                    website: company.website || '',
                    footerText: company.footerText || '',
                    taxRate: company.taxRate || 0.16,
                    taxExemptCategories: company.taxExemptCategories || ['Solar Panels', 'Solar Lights', 'Inverters'],
                    socialLinks: company.socialLinks || [],
                    themeColors: company.themeColors || {
                      light: {
                        primary: '#000063',
                        primaryForeground: '#ffffff',
                        primaryMid: '#0043b3',
                        primaryLight: '#009dff'
                      },
                      dark: {
                        primary: '#000063',
                        primaryForeground: '#ffffff',
                        primaryMid: '#0043b3',
                        primaryLight: '#009dff'
                      }
                    }
                  })
                }
              }}
              disabled={loading}
              className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 py-2 px-4 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
            >
              <X className="w-4 h-4 inline mr-2" />
              Cancel
            </button>
          </div>
        )}
      </form>
    </div>
  )
}