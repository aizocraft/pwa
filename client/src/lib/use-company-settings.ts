// src/lib/use-company-settings.ts
'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { 
  getCompanySettings, 
  updateCompanySettings, 
  uploadLogo, 
  deleteLogo, 
  uploadFavicon, 
  deleteFavicon,
  setLogoUrl,      
  setFaviconUrl    
} from './company'
import { CompanySettings, UpdateCompanyRequest } from '@/types/company'
import toast from 'react-hot-toast'

export function useCompanySettings() {
  const queryClient = useQueryClient()

  const companyQuery = useQuery<CompanySettings>({
    queryKey: ['companySettings'],
    queryFn: getCompanySettings,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  })

  const updateMutation = useMutation({
    mutationFn: async (data: UpdateCompanyRequest) => {
      const result = await updateCompanySettings(data)
      return result
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['companySettings'], data)
      queryClient.invalidateQueries({ queryKey: ['companySettings'] })
      toast.success('Company settings updated successfully')
    },
    onError: (error: any) => {
      console.error('Update error details:', error.response?.data || error.message)
      const errorMsg = error.response?.data?.error || error.response?.data?.message || 'Failed to update company settings'
      toast.error(errorMsg)
    },
  })

  const uploadLogoMutation = useMutation({
    mutationFn: (file: File) => uploadLogo(file),
    onSuccess: (data) => {
      queryClient.setQueryData(['companySettings'], data)
      queryClient.invalidateQueries({ queryKey: ['companySettings'] })
      toast.success('Logo uploaded successfully')
    },
    onError: (error: any) => {
      const errorMsg = error.response?.data?.error || error.response?.data?.message || 'Failed to upload logo'
      toast.error(errorMsg)
    },
  })

  // Dedicated setLogoUrl endpoint
  const updateLogoUrlMutation = useMutation({
    mutationFn: async (logoUrl: string) => {
      return await setLogoUrl(logoUrl)  // Use the correct endpoint!
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['companySettings'], data)
      queryClient.invalidateQueries({ queryKey: ['companySettings'] })
      toast.success('Logo URL updated successfully')
    },
    onError: (error: any) => {
      const errorMsg = error.response?.data?.error || error.response?.data?.message || 'Failed to update logo URL'
      toast.error(errorMsg)
    },
  })

  const deleteLogoMutation = useMutation({
    mutationFn: () => deleteLogo(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companySettings'] })
      toast.success('Logo removed successfully')
    },
    onError: (error: any) => {
      const errorMsg = error.response?.data?.error || error.response?.data?.message || 'Failed to remove logo'
      toast.error(errorMsg)
    },
  })

  const uploadFaviconMutation = useMutation({
    mutationFn: (file: File) => uploadFavicon(file),
    onSuccess: (data) => {
      queryClient.setQueryData(['companySettings'], data)
      queryClient.invalidateQueries({ queryKey: ['companySettings'] })
      toast.success('Favicon uploaded successfully')
    },
    onError: (error: any) => {
      const errorMsg = error.response?.data?.error || error.response?.data?.message || 'Failed to upload favicon'
      toast.error(errorMsg)
    },
  })

  // FIXED: Use the dedicated setFaviconUrl endpoint
  const updateFaviconUrlMutation = useMutation({
    mutationFn: async (faviconUrl: string) => {
      return await setFaviconUrl(faviconUrl)  // Use the correct endpoint!
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['companySettings'], data)
      queryClient.invalidateQueries({ queryKey: ['companySettings'] })
      toast.success('Favicon URL updated successfully')
    },
    onError: (error: any) => {
      const errorMsg = error.response?.data?.error || error.response?.data?.message || 'Failed to update favicon URL'
      toast.error(errorMsg)
    },
  })

  const deleteFaviconMutation = useMutation({
    mutationFn: () => deleteFavicon(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companySettings'] })
      toast.success('Favicon removed successfully')
    },
    onError: (error: any) => {
      const errorMsg = error.response?.data?.error || error.response?.data?.message || 'Failed to remove favicon'
      toast.error(errorMsg)
    },
  })

  return {
    data: companyQuery.data,
    isLoading: companyQuery.isLoading,
    error: companyQuery.error,
    refetch: companyQuery.refetch,
    update: updateMutation,
    uploadLogo: uploadLogoMutation,
    updateLogoUrl: updateLogoUrlMutation,
    deleteLogo: deleteLogoMutation,
    uploadFavicon: uploadFaviconMutation,
    updateFaviconUrl: updateFaviconUrlMutation,
    deleteFavicon: deleteFaviconMutation,
  }
}