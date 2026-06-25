// src/lib/company.ts
import api from './api';
import type { CompanySettings, UpdateCompanyRequest } from '@/types/company';

// Get company settings
export async function getCompanySettings(): Promise<CompanySettings> {
  const response = await api.get('/company');
  return response.data;
}

// Get tax rate
export async function getTaxRate(): Promise<number> {
  const response = await api.get('/company/tax-rate');
  return response.data.taxRate;
}

// Get tax-exempt categories
export async function getTaxExemptCategories(): Promise<string[]> {
  const response = await api.get('/company/tax-exempt-categories');
  return response.data.taxExemptCategories;
}

// Update tax-exempt categories
export async function updateTaxExemptCategories(categories: string[]): Promise<CompanySettings> {
  const response = await api.put('/company/tax-exempt-categories', { taxExemptCategories: categories });
  return response.data;
}

// Update company settings (all fields)
export async function updateCompanySettings(data: UpdateCompanyRequest): Promise<CompanySettings> {
  console.log('Sending update to backend:', JSON.stringify(data, null, 2));
  const response = await api.put('/company', data);
  console.log('Backend response:', response.data);
  
  if (response.data.data) {
    return response.data.data;
  }
  return response.data;
}

// Upload logo file
export async function uploadLogo(file: File): Promise<CompanySettings> {
  const formData = new FormData();
  formData.append('logo', file);
  
  const response = await api.post('/company/upload-logo', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  return response.data.data || response.data;
}

// Delete logo
export async function deleteLogo(): Promise<void> {
  await api.delete('/company/logo');
}

// Upload favicon file
export async function uploadFavicon(file: File): Promise<CompanySettings> {
  const formData = new FormData();
  formData.append('favicon', file);
  
  const response = await api.post('/company/upload-favicon', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  return response.data.data || response.data;
}

// Delete favicon
export async function deleteFavicon(): Promise<void> {
  await api.delete('/company/favicon');
}

// Set logo URL 
export async function setLogoUrl(url: string): Promise<CompanySettings> {
  console.log('Sending logo URL to backend:', { url });
  const response = await api.post('/company/logo-url', { url });
  console.log('Logo URL response:', response.data);
  return response.data.data || response.data;
}

// Set favicon URL
export async function setFaviconUrl(url: string): Promise<CompanySettings> {
  console.log('Sending favicon URL to backend:', { url });
  const response = await api.post('/company/favicon-url', { url });
  console.log('Favicon URL response:', response.data);
  return response.data.data || response.data;
}

// Helper to get logo URL
export function getLogoUrl(settings: any): string | null {
  if (!settings?.logo) return null;
  
  const logo = settings.logo;
  
  if (logo.type === 'url' && logo.url) {
    return logo.url;
  }
  if (logo.type === 'gridfs' && logo.fileId) {
    return `${process.env.NEXT_PUBLIC_API_URL}/company/logo/${logo.fileId}`;
  }
  
  return null;
}

// Get theme colors from settings
export function getCompanyThemeColors(settings: CompanySettings | null | undefined) {
  return settings?.themeColors ?? null;
}

// Helper to get favicon URL
export function getFaviconUrl(settings: any): string | null {
  if (!settings?.favicon) return null;
  
  const favicon = settings.favicon;
  
  if (favicon.type === 'url' && favicon.url) {
    return favicon.url;
  }
  if (favicon.type === 'gridfs' && favicon.fileId) {
    return `${process.env.NEXT_PUBLIC_API_URL}/company/favicon/${favicon.fileId}`;
  }
  
  return null;
}