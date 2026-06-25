import mongoose, { Schema, Document, Model } from 'mongoose';

import dotenv from 'dotenv';

dotenv.config();

const DEFAULT_LOGO_URL = process.env.DEFAULT_LOGO_URL || 'https://res.cloudinary.com/duxnsu61a/image/upload/v1775217946/logo_upxr11.png';

export interface ICompanySettings extends Document {
  companyName: string;
  logo: {
    type: 'url' | 'gridfs';
    url?: string;
    fileId?: mongoose.Types.ObjectId;
    filename?: string;
    mimeType?: string;
  };
  favicon: {
    type: 'url' | 'gridfs';
    url?: string;
    fileId?: mongoose.Types.ObjectId;
    filename?: string;
    mimeType?: string;
  } | null;
  slogan: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  footerText: string;
  socialLinks: Array<{
    platform: string;
    url: string;
  }>;
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
  createdAt: Date;
  updatedAt: Date;
}

interface ICompanySettingsModel extends Model<ICompanySettings> {
  getSingleton(): Promise<ICompanySettings>;
}

// Define sub-schemas to avoid nesting issues
const LogoSchema = new Schema({
  type: {
    type: String,
    enum: ['url', 'gridfs'],
    default: 'url'
  },
  url: {
    type: String,
    default: DEFAULT_LOGO_URL
  },
  fileId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'fs.files'
  },
  filename: String,
  mimeType: String
}, { _id: false });

const FaviconSchema = new Schema({
  type: {
    type: String,
    enum: ['url', 'gridfs']
  },
  url: String,
  fileId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'fs.files'
  },
  filename: String,
  mimeType: String
}, { _id: false });

const companySettingsSchema = new Schema<ICompanySettings>(
  {
    companyName: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
      maxlength: [100, 'Company name too long'],
      default: 'My Company'
    },
    slogan: { type: String, trim: true, default: '' },
    description: { type: String, trim: true, default: '' },
    address: { type: String, trim: true, default: '' },
    phone: { type: String, trim: true, default: '' },
    email: { type: String, trim: true, lowercase: true, default: '' },
    website: { type: String, trim: true, default: '' },
    footerText: { type: String, trim: true, default: '' },
    socialLinks: {
      type: [{
        platform: { type: String, required: true },
        url: { type: String, required: true }
      }],
      default: []
    },    taxRate: {
      type: Number,
      default: 0.16,
      min: [0, 'Tax rate cannot be negative'],
      max: [1, 'Tax rate cannot exceed 100%']
    },   
      taxExemptCategories: { type: [String], default: ['Solar Panels', 'Solar Lights', 'Inverters'] }, 
    logo: {
      type: LogoSchema,
      default: () => ({
        type: 'url',
        url: DEFAULT_LOGO_URL
      })
    },
    favicon: {
      type: FaviconSchema,
      default: null
    },
  themeColors: {
      light: {
        primary: { type: String, default: '#000063', trim: true },
        primaryForeground: { type: String, default: '#ffffff', trim: true },
        primaryMid: { type: String, default: '#0043b3', trim: true },
        primaryLight: { type: String, default: '#009dff', trim: true }
      },
      dark: {
        primary: { type: String, default: '#000063', trim: true },
        primaryForeground: { type: String, default: '#ffffff', trim: true },
        primaryMid: { type: String, default: '#0043b3', trim: true },
        primaryLight: { type: String, default: '#009dff', trim: true }
      }
    }
  },
  { 
    timestamps: true, 
    minimize: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

companySettingsSchema.index({ updatedAt: -1 });

companySettingsSchema.statics.getSingleton = async function(): Promise<ICompanySettings> {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({});
  }
  return settings;
};

// Clear existing model if in development to prevent conflicts
if (process.env.NODE_ENV !== 'production' && mongoose.models.CompanySettings) {
  delete mongoose.models.CompanySettings;
}

export const CompanySettings = (mongoose.models.CompanySettings || 
  mongoose.model<ICompanySettings, ICompanySettingsModel>('CompanySettings', companySettingsSchema));