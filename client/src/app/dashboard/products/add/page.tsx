// src/app/dashboard/products/add/page.tsx
'use client'

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useDropzone } from 'react-dropzone';
import { toast } from 'react-hot-toast';
import { 
  Loader2, 
  Upload, 
  Image as ImageIcon, 
  Trash2, 
  ArrowLeft,
  Plus,
  X,
  Tag,
  Settings,
  Info,
  DollarSign,
  Layers,
  Building2,
  Package,
  Star,
  Sparkles,
  Link as LinkIcon,
  Grid3x3,
  ChevronDown,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { getBrands, createProduct, uploadProductImages } from '@/lib/api';
import type { Product, ProductImage } from '@/types/product';
import { cn, formatCurrency } from '@/lib/utils';
import RichTextEditor from '@/components/RichTextEditor';

// ==================== TYPES ====================
interface AddProductFormData {
  name: string;
  slug: string;
  sku: string;
  category: string;
  brand: string;
  type: string;
  price: number;
  buyingPrice: number;
  compareAtPrice?: number;
  description: string;
  specs: Record<string, string>;
  stock: number;
  tags: string[];
  images: ProductImage[];
  featured: boolean;
  rating: number;
  supplier?: string;
  supplierName?: string;
}

// ==================== MAIN COMPONENT ====================
export default function AddProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [brands, setBrands] = useState<string[]>([]);
  const [brandsLoading, setBrandsLoading] = useState(true);
  
  // Image handling
  const [uploadImages, setUploadImages] = useState<File[]>([]);
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [urlImages, setUrlImages] = useState<string[]>([]);
  const [imageInputType, setImageInputType] = useState<'upload' | 'url'>('upload');
  
  // Form state
  const [formData, setFormData] = useState<AddProductFormData>({
    name: '',
    slug: '',
    sku: '',
    category: '',
    brand: '',
    type: '',
    price: 0,
    buyingPrice: 0,
    compareAtPrice: undefined,
    description: '',
    specs: {},
    stock: 0,
    tags: [],
    images: [],
    featured: false,
    rating: 0,
  });

  // Rich text description - stores HTML content for live preview, only saved on submit
  const [descriptionHTML, setDescriptionHTML] = useState<string>(formData.description || '');

  // Helper states
  const [newTag, setNewTag] = useState('');
  const [specKey, setSpecKey] = useState('');
  const [specValue, setSpecValue] = useState('');
  const [newUrlImage, setNewUrlImage] = useState('');
  const [isSlugEdited, setIsSlugEdited] = useState(false);

  // Calculate profit metrics
  const profitAmount = formData.price - formData.buyingPrice;
  const profitMargin = formData.price > 0 ? (profitAmount / formData.price) * 100 : 0;
  const markup = formData.buyingPrice > 0 ? (profitAmount / formData.buyingPrice) * 100 : 0;

  // ==================== HELPERS ====================
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const generateSKU = (category: string) => {
    const prefix = category.substring(0, 3).toUpperCase().padEnd(3, 'X');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${prefix}-${random}`;
  };

  // ==================== HANDLERS ====================
  const handleNameChange = (name: string) => {
    setFormData(prev => ({
      ...prev,
      name,
      slug: isSlugEdited ? prev.slug : generateSlug(name)
    }));
  };

  const handleCategoryChange = (category: string) => {
    setFormData(prev => ({
      ...prev,
      category,
      sku: prev.sku || generateSKU(category)
    }));
  };

  // Handle description changes from editor - live preview, no save
  const handleDescriptionChange = (content: string, isEmpty: boolean) => {
    setDescriptionHTML(content);
    // Update character count display
  };

  // ==================== BRANDS ====================
  useEffect(() => {
    getBrands()
      .then(setBrands)
      .catch(() => toast.error('Failed to load brands'))
      .finally(() => setBrandsLoading(false));
  }, []);

  // ==================== IMAGE DROPZONE ====================
  const onDrop = useCallback((acceptedFiles: File[]) => {
    setUploadImages(prev => [...prev, ...acceptedFiles]);
    const newPreviews = acceptedFiles.map(file => URL.createObjectURL(file));
    setPreviewImages(prev => [...prev, ...newPreviews]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.webp', '.gif'] },
    maxFiles: 6,
    maxSize: 5 * 1024 * 1024,
  });

  const handleUploadImageRemove = (index: number) => {
    const file = uploadImages[index];
    if (file) URL.revokeObjectURL(previewImages[index]);
    setUploadImages(prev => prev.filter((_, i) => i !== index));
    setPreviewImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleUrlImageAdd = () => {
    if (newUrlImage.trim() && !urlImages.includes(newUrlImage.trim())) {
      setUrlImages(prev => [...prev, newUrlImage.trim()]);
      setNewUrlImage('');
      toast.success('Image URL added');
    }
  };

  const handleUrlImageRemove = (index: number) => {
    setUrlImages(prev => prev.filter((_, i) => i !== index));
  };

  // ==================== TAGS ====================
  const addTag = () => {
    const trimmed = newTag.trim();
    if (trimmed && !formData.tags.includes(trimmed)) {
      setFormData(prev => ({ ...prev, tags: [...prev.tags, trimmed] }));
      setNewTag('');
      toast.success('Tag added');
    }
  };

  const removeTag = (tag: string) => {
    setFormData(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }));
  };

  // ==================== SPECIFICATIONS ====================
  const addSpec = () => {
    const keyTrim = specKey.trim();
    const valTrim = specValue.trim();
    if (keyTrim && valTrim && !formData.specs[keyTrim]) {
      setFormData(prev => ({
        ...prev,
        specs: { ...prev.specs, [keyTrim]: valTrim }
      }));
      setSpecKey('');
      setSpecValue('');
      toast.success('Specification added');
    }
  };

  const removeSpec = (key: string) => {
    setFormData(prev => {
      const newSpecs = { ...prev.specs };
      delete newSpecs[key];
      return { ...prev, specs: newSpecs };
    });
  };

  // ==================== SUBMIT ====================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let allImages: ProductImage[] = [];

      // Upload file images
      if (uploadImages.length > 0) {
        const uploaded = await uploadProductImages(null, uploadImages);
        allImages.push(...uploaded);
      }

      // Add URL images
      urlImages.forEach(url => {
        allImages.push({ type: 'url', url });
      });

      // Validate at least one image
      if (allImages.length === 0) {
        toast.error('Please add at least one product image');
        setLoading(false);
        return;
      }

      // Auto-generate SKU if not provided
      let finalSku = formData.sku;
      if (!finalSku || finalSku.trim() === '') {
        const prefix = formData.category.substring(0, 3).toUpperCase().padEnd(3, 'X');
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        finalSku = `${prefix}-${random}`;
      }

      // Build product data
      const productData = {
        name: formData.name,
        slug: formData.slug,
        sku: finalSku,
        category: formData.category,
        brand: formData.brand,
        type: formData.type,
        price: Number(formData.price),
        buyingPrice: Number(formData.buyingPrice),
        compareAtPrice: formData.compareAtPrice ? Number(formData.compareAtPrice) : undefined,
        description: descriptionHTML, // ✅ Only saved on submit
        specs: formData.specs,
        stock: Number(formData.stock),
        tags: formData.tags,
        images: allImages,
        featured: formData.featured,
        rating: Number(formData.rating),
      };

      await createProduct(productData);
      router.push('/dashboard/products');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to create product');
    } finally {
      setLoading(false);
    }
  };

  // ==================== RENDER ====================
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900">
      <div className="max-w-6xl mx-auto py-6 sm:py-8 px-4 sm:px-6 lg:px-8">
        
        {/* ==================== HEADER ==================== */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="group p-2 hover:bg-white dark:hover:bg-gray-800 rounded-xl transition-all duration-200"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            </button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                Add New Product
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Create a new product listing
              </p>
            </div>
          </div>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="group flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 group-hover:scale-110 transition-transform" />
                Create Product
              </>
            )}
          </button>
        </div>

        {/* ==================== FORM ==================== */}
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* ==================== BASIC INFORMATION ==================== */}
          <div className="bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-700 shadow-lg overflow-hidden">
            <div className="border-b border-gray-200 dark:border-gray-700 p-5 sm:p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-950/50 rounded-xl">
                  <Info className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Basic Information</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Essential product details</p>
                </div>
              </div>
            </div>
            
            <div className="p-5 sm:p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Product Name */}
                <div className="md:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Product Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    placeholder="e.g., 500W Solar Panel"
                    required
                  />
                </div>
                
                {/* Slug */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Slug (SEO)
                  </label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => {
                      setIsSlugEdited(true);
                      setFormData(prev => ({ ...prev, slug: e.target.value }));
                    }}
                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-800 font-mono text-sm"
                    placeholder="auto-generated"
                  />
                </div>

                {/* SKU */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    SKU
                  </label>
                  <input
                    type="text"
                    value={formData.sku}
                    onChange={(e) => setFormData(prev => ({ ...prev, sku: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-900 font-mono text-sm"
                    placeholder="Auto-generated from category"
                  />
                  <p className="text-xs text-gray-500 mt-1">Leave empty to auto-generate</p>
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={formData.category}
                      onChange={(e) => handleCategoryChange(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 appearance-none"
                      required
                    >
                      <option value="">Select a category</option>
                      <option value="Solar Panels">Solar Panels</option>
                      <option value="Inverters">Inverters</option>
                      <option value="Batteries">Batteries</option>
                      <option value="Water Pumps">Water Pumps</option>
                      <option value="Cables & Connectors">Cables & Connectors</option>
                      <option value="Solar Lights">Solar Lights</option>
                      <option value="Solar Water Heaters">Solar Water Heaters</option>
                      <option value="Generators">Generators</option>
                      <option value="Accessories">Accessories</option>
                      <option value="Labour">Labour</option>
                      <option value="Other">Other</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                {/* Brand */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Brand <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={formData.brand}
                      onChange={(e) => setFormData(prev => ({ ...prev, brand: e.target.value }))}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-900 focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., SolarTech"
                      required
                    />
                  </div>
                </div>

                {/* Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Type <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Layers className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={formData.type}
                      onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-900 focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Monocrystalline"
                      required
                    />
                  </div>
                </div>

                {/* Selling Price */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Selling Price (KES) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="number"
                      step="10"
                      min="0"
                      value={formData.price}
                      onChange={(e) => setFormData(prev => ({ ...prev, price: Number(e.target.value) }))}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-900 focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                {/* Buying Price */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Buying Price (KES)
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="number"
                      step="10"
                      min="0"
                      value={formData.buyingPrice}
                      onChange={(e) => setFormData(prev => ({ ...prev, buyingPrice: Number(e.target.value) }))}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-900 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Profit Analysis */}
              {(formData.price > 0 || formData.buyingPrice > 0) && (
                <div className={`mt-4 p-4 rounded-xl ${profitAmount >= 0 ? 'bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800' : 'bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800'}`}>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-center gap-2">
                      {profitAmount >= 0 ? (
                        <TrendingUp className="w-5 h-5 text-green-600" />
                      ) : (
                        <TrendingDown className="w-5 h-5 text-red-600" />
                      )}
                      <span className="font-semibold">Profit Analysis</span>
                    </div>
                    <div className="flex flex-wrap gap-4">
                      <div>
                        <span className="text-sm text-gray-500">Profit Amount:</span>
                        <span className={`ml-2 font-semibold ${profitAmount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {profitAmount >= 0 ? '+' : ''}KES {profitAmount.toLocaleString()}
                        </span>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">Profit Margin:</span>
                        <span className={`ml-2 font-semibold ${profitMargin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {profitMargin.toFixed(1)}%
                        </span>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">Markup:</span>
                        <span className={`ml-2 font-semibold ${markup >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {markup.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Additional Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                {/* Compare at Price */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Compare at Price (Optional)
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.compareAtPrice ?? ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, compareAtPrice: e.target.value ? Number(e.target.value) : undefined }))}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-900 focus:ring-2 focus:ring-blue-500"
                      placeholder="Original price before discount"
                    />
                  </div>
                </div>

                {/* Stock */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Stock Quantity
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.stock}
                    onChange={(e) => setFormData(prev => ({ ...prev, stock: Number(e.target.value) }))}
                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-900 focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Rating */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Rating (0-5)
                  </label>
                  <div className="relative">
                    <Star className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-yellow-400" />
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="5"
                      value={formData.rating}
                      onChange={(e) => setFormData(prev => ({ ...prev, rating: Number(e.target.value) }))}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-900 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Featured */}
                <div className="flex items-center">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={formData.featured}
                      onChange={(e) => setFormData(prev => ({ ...prev, featured: e.target.checked }))}
                      className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-blue-600 transition-colors">
                      ⭐ Feature this product
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* ==================== DESCRIPTION ==================== */}
          <div className="bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-700 shadow-lg overflow-hidden">
            <div className="border-b border-gray-200 dark:border-gray-700 p-5 sm:p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-950/50 rounded-xl">
                  <Package className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Description</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Detailed product information</p>
                </div>
              </div>
            </div>
            <div className="p-5 sm:p-6">
              {/* Rich Text Editor - Live preview, no auto-save */}
              <RichTextEditor
                initialValue={descriptionHTML}
                placeholder="Write a detailed description with rich formatting..."
                onChange={handleDescriptionChange}
              />
              <p className="text-xs text-gray-500 mt-2">
                {descriptionHTML.length} characters
              </p>
            </div>
          </div>

          {/* ==================== IMAGES ==================== */}
          <div className="bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-700 shadow-lg overflow-hidden">
            <div className="border-b border-gray-200 dark:border-gray-700 p-5 sm:p-6">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 dark:bg-green-950/50 rounded-xl">
                    <ImageIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Product Images</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Add product photos</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setImageInputType('upload')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                      imageInputType === 'upload'
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200'
                    }`}
                  >
                    <Upload className="w-4 h-4" />
                    Upload Files
                  </button>
                  <button
                    type="button"
                    onClick={() => setImageInputType('url')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                      imageInputType === 'url'
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200'
                    }`}
                  >
                    <LinkIcon className="w-4 h-4" />
                    Add URLs
                  </button>
                </div>
              </div>
            </div>
            
            <div className="p-5 sm:p-6">
              {imageInputType === 'upload' ? (
                <>
                  {/* Upload Dropzone */}
                  <div
                    {...getRootProps()}
                    className={cn(
                      'p-8 border-2 border-dashed rounded-xl text-center cursor-pointer transition-all',
                      isDragActive
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20'
                        : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-950/10'
                    )}
                  >
                    <input {...getInputProps()} />
                    <Upload className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {isDragActive ? 'Drop the images here...' : 'Drag & drop or click to upload'}
                    </p>
                    <p className="text-xs text-gray-400 mt-2">PNG, JPG, WebP, GIF up to 5MB • Max 6 images</p>
                  </div>

                  {/* Upload Previews */}
                  {previewImages.length > 0 && (
                    <div className="mt-6">
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                        <ImageIcon className="w-4 h-4" />
                        Preview ({previewImages.length})
                      </h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                        {previewImages.map((preview, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={preview}
                              alt={`Preview ${index + 1}`}
                              className="w-full h-24 object-cover rounded-lg shadow-md"
                            />
                            <button
                              type="button"
                              onClick={() => handleUploadImageRemove(index)}
                              className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white p-1.5 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-200"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="space-y-4">
                  {/* URL Input */}
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={newUrlImage}
                      onChange={(e) => setNewUrlImage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleUrlImageAdd()}
                      placeholder="https://example.com/image.jpg"
                      className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-900 focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="button"
                      onClick={handleUrlImageAdd}
                      className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  {/* URL Images */}
                  {urlImages.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {urlImages.map((url, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={url}
                            alt={`Image ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg shadow-md"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/placeholder-product.jpg';
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => handleUrlImageRemove(index)}
                            className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white p-1.5 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-200"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Image Count */}
              {(previewImages.length > 0 || urlImages.length > 0) && (
                <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                  <p className="text-sm text-blue-700 dark:text-blue-400">
                    Total images: {previewImages.length + urlImages.length}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* ==================== TAGS ==================== */}
          <div className="bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-700 shadow-lg overflow-hidden">
            <div className="border-b border-gray-200 dark:border-gray-700 p-5 sm:p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-100 dark:bg-yellow-950/50 rounded-xl">
                  <Tag className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Tags</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Help customers find your product</p>
                </div>
              </div>
            </div>
            <div className="p-5 sm:p-6">
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addTag()}
                  placeholder="Add a tag..."
                  className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-900 focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.tags.map(tag => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 rounded-full text-sm font-medium"
                  >
                    <Tag className="w-3 h-3" />
                    #{tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="text-gray-500 hover:text-red-500 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              {formData.tags.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">No tags added yet</p>
              )}
            </div>
          </div>

          {/* ==================== SPECIFICATIONS ==================== */}
          <div className="bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-700 shadow-lg overflow-hidden">
            <div className="border-b border-gray-200 dark:border-gray-700 p-5 sm:p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 dark:bg-orange-950/50 rounded-xl">
                  <Settings className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Specifications</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Technical details and features</p>
                </div>
              </div>
            </div>
            <div className="p-5 sm:p-6">
              <div className="flex flex-col sm:flex-row gap-3 mb-4">
                <input
                  type="text"
                  value={specKey}
                  onChange={(e) => setSpecKey(e.target.value)}
                  placeholder="Specification name (e.g., Wattage)"
                  className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-900 focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  value={specValue}
                  onChange={(e) => setSpecValue(e.target.value)}
                  placeholder="Value (e.g., 500W)"
                  className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-900 focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={addSpec}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-all"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-2">
                {Object.entries(formData.specs).map(([key, value]) => (
                  <div key={key} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
                    <div>
                      <span className="font-semibold text-gray-900 dark:text-white">{key}:</span>
                      <span className="ml-2 text-gray-600 dark:text-gray-400">{value}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeSpec(key)}
                      className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-lg transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
              {Object.keys(formData.specs).length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">No specifications added yet</p>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}