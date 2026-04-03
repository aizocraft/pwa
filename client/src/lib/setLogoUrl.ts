import api from './api';
import type { CompanySettings } from '@/types/company';

export async function setLogoUrl(url: string): Promise<CompanySettings> {
  const response = await api.post('/company/logo-url', { url });
  return response.data.data || response.data;
}

export async function setFaviconUrl(url: string): Promise<CompanySettings> {
  const response = await api.post('/company/favicon-url', { url });
  return response.data.data || response.data;
}
