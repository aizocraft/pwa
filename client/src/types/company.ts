// src/types/company.ts

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
  logo: CompanyLogo | null;
  favicon: CompanyFavicon | null;
  slogan: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  footerText: string;
  socialLinks: SocialLink[];
  taxRate: number;
  taxExemptCategories: string[]; 
  themeColors: {
    light: {
      primary: string;
      primaryForeground: string;
      primaryMid: string;
      primaryLight: string;
    };
    dark: {
      primary: string;
      primaryForeground: string;
      primaryMid: string;
      primaryLight: string;
    };
  };
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
  taxExemptCategories?: string[]; 
  themeColors?: {
    light?: {
      primary?: string;
      primaryForeground?: string;
      primaryMid?: string;
      primaryLight?: string;
    };
    dark?: {
      primary?: string;
      primaryForeground?: string;
      primaryMid?: string;
      primaryLight?: string;
    };
  };
}

export interface UploadLogoResponse {
  success: boolean;
  message: string;
  fileId: string;
  data: CompanySettings;
}