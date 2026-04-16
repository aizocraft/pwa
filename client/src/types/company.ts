// src/types/company.ts

// ✅ Correct structure matching backend
export interface CompanyLogo {
  type: 'url' | 'gridfs';
  url?: string;
  fileId?: string;
  filename?: string;
  mimeType?: string;
}

export interface CompanyFavicon {
  type: 'url' | 'gridfs';
  url?: string;
  fileId?: string;
  filename?: string;
  mimeType?: string;
}

export interface SocialLink {
  platform: string;
  url: string;
}

export interface CompanySettings {
  _id: string;
  companyName: string;
  logo: CompanyLogo | null;  // ✅ Direct object, not nested
  favicon: CompanyFavicon | null;  // ✅ Direct object, not nested
  slogan: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  footerText: string;
  socialLinks: SocialLink[];
  taxRate: number;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateCompanyRequest {
  companyName?: string;
  slogan?: string;
  description?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  footerText?: string;
  socialLinks?: SocialLink[];
  taxRate?: number;
}

export interface UploadLogoResponse {
  success: boolean;
  message: string;
  fileId: string;
  data: CompanySettings;
}