'use client'

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useDropzone } from 'react-dropzone';
import { toast } from 'react-hot-toast';
import { Loader2, Upload, Image as ImageIcon, Trash2, ArrowLeft } from 'lucide-react';
import { getBrands, createProduct, uploadProductImages } from '@/lib/api';
import type { Product } from '@/types/product';
import { cn } from '@/lib/utils';

interface AddProductFormData {
  name: string;
  slug: string;
  category: string;
  brand: string;
  type: string;
  price: number;
  compareAtPrice?: number;
  description: string;
  specs: Record<string, string>;
  stock: number;
  tags: string[];
  images: string[];
  featured: boolean;
  rating: number;
}

export default function AddProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [brandsLoading, setBrandsLoading] = useState(true);
  const [images, setImages] = useState<File[]>([]);
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [brands, setBrands] = useState<string[]>([]);
  const [formData, setFormData] = useState<AddProductFormData>({
    name: '',
    slug: '',
    category: '',
    brand: '',
    type: '',
    price: 0,
    compareAtPrice: undefined,
    description: '',
    specs: {},
    stock: 0,
    tags: [],
    images: [],
    featured: false,
    rating: 0,
  });



  const [newTag, setNewTag] = useState('');
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleNameChange = (name: string) => {
    setFormData(prev => ({
      ...prev,
      name,
      slug: generateSlug(name)
    }));
  };
  const [specKey, setSpecKey] = useState('');
  const [specValue, setSpecValue] = useState('');
  const [showImageUrls, setShowImageUrls] = useState(false);

  // Tag handlers
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
    toast.success('Tag removed');
  };

  // Spec handlers
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
      toast.success('Spec added');
    }
  };

  const removeSpec = useCallback((key: string) => {
    setFormData((prev) => {
      const newSpecs = { ...prev.specs };
      delete newSpecs[key];
      return { ...prev, specs: newSpecs };
    });
    toast.success('Spec removed');
  }, []);

  // Load brands
  useEffect(() => {
    getBrands()
      .then(setBrands)
      .catch(() => toast.error('Failed to load brands'))
      .finally(() => setBrandsLoading(false));
  }, []);

  // Image dropzone
  const onDrop = useCallback((acceptedFiles: File[]) => {
    setImages(prev => [...prev, ...acceptedFiles]);
    const newPreviews = acceptedFiles.map(file => URL.createObjectURL(file));
    setPreviewImages(prev => [...prev, ...newPreviews]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.webp', '.gif']
    },
    maxFiles: 6,
  });

  const handleImageRemove = (index: number) => {
    const file = images[index];
    if (file) URL.revokeObjectURL(previewImages[index]);
    setImages(prev => prev.filter((_, i) => i !== index));
    setPreviewImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const productData = {
        name: formData.name,
        slug: formData.slug,
        category: formData.category,
        brand: formData.brand,
        type: formData.type,
        price: Number(formData.price),
        compareAtPrice: formData.compareAtPrice ? Number(formData.compareAtPrice) : undefined,
        description: formData.description,
        specs: formData.specs,
        stock: Number(formData.stock),
        tags: formData.tags,
        featured: formData.featured,
        rating: Number(formData.rating),
      };

      // Upload images first
  let uploadedImages: any[] = [];
      if (images.length > 0) {
        uploadedImages = await uploadProductImages(null, images);
      }

      // Create product with images and rating
      const newProduct = await createProduct({ 
        ...productData, 
        images: uploadedImages
      });

      toast.success('Product created successfully!');
      router.push('/dashboard/products');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to create product');
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 rounded-xl bg-white hover:bg-gray-50 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-all hover:shadow-md"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Products
        </button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Add New Product</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Create a new product listing</p>
        </div>
      </div>

      {/* Main Form Card */}
      <div className="bg-white dark:bg-gray-800/50 shadow-xl rounded-2xl border border-gray-200/50 dark:border-gray-700 p-6 sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Product Details Section */}
          <div>
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <ImageIcon className="h-5 w-5 text-blue-600" />
              Product Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Product Name *
                </label>
                <input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm"
                  placeholder="e.g., 500W Solar Panel"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="slug" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Slug *
                </label>
                <input
                  id="slug"
                  type="text"
                  value={formData.slug}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, slug: e.target.value})}
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-800 font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm"
                  placeholder="auto-generated-from-name"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Category *
                </label>
                <input
                  id="category"
                  type="text"
                  value={formData.category}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, category: e.target.value})}
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm"
                  placeholder="e.g., Solar Panels"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="brand" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Brand *
                </label>
                <input
                  id="brand"
                  type="text"
                  value={formData.brand}
                  onChange={(e) => setFormData({...formData, brand: e.target.value})}
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm"
                  placeholder="e.g., Pedrollo"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Type *
                </label>
                <input
                  id="type"
                  type="text"
                  value={formData.type}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, type: e.target.value})}
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm"
                  placeholder="e.g., Monocrystalline"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="price" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Price (KSh) *
                </label>
                <input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, price: Number(e.target.value)})}
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="compareAtPrice" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Compare At Price (Optional)
                </label>
                <input
                  id="compareAtPrice"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.compareAtPrice ?? ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, compareAtPrice: Number(e.target.value) || undefined})}
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="stock" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Stock Quantity
                </label>
                <input
                  id="stock"
                  type="number"
                  min="0"
                  value={formData.stock}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, stock: Number(e.target.value)})}
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="rating" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Rating (0-5)
                </label>
                <input
                  id="rating"
                  type="number"
                  min="0"
                  max="5"
                  step="0.1"
                  value={formData.rating}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, rating: Number(e.target.value)})}
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm"
                />
              </div>
            </div>
          </div>

          {/* Description & Specs */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Description
                </label>
                <textarea
                  id="description"
                  rows={4}
                  value={formData.description}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm resize-vertical"
                  placeholder="Enter product description..."
                />
              </div>

              {/* Dynamic Tags */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tags
                </label>
              <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addTag()}
                    placeholder="Add tag..."
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-900"
                  />
                  <button type="button" onClick={addTag} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all">
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag, index) => (
                    <span key={index} className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                      {tag}
                      <button type="button" onClick={() => removeTag(tag)} className="ml-1 text-blue-600 hover:text-red-600">
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Dynamic Specs */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Specifications
                </label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={specKey}
                    onChange={(e) => setSpecKey(e.target.value)}
                    placeholder="Key (e.g., Power)"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    value={specValue}
                    onChange={(e) => setSpecValue(e.target.value)}
                    placeholder="Value (e.g., 500W)"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <button type="button" onClick={addSpec} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                    Add
                  </button>
                </div>
                <div className="space-y-2">
                  {Object.entries(formData.specs).map(([key, value]) => (
                    <div key={key} className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                      <span>{key}: {value}</span>
                      <button type="button" onClick={() => removeSpec(key)} className="text-red-600 hover:text-red-800">
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900/50">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={Boolean(formData.featured)}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, featured: e.target.checked})}
                    className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Feature this product</span>
                </label>
              </div>
            </div>
          </div>

          {/* Images Upload */}
          <div className="p-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-2xl text-center transition-colors">
            <div {...getRootProps()} className={cn(
              'p-8 border-2 border-dashed rounded-2xl transition-all cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-950/20',
              isDragActive && 'border-blue-500 bg-blue-50/80 dark:bg-blue-950/40 ring-4 ring-blue-200/50 dark:ring-blue-900/50'
            )}>
              <input {...getInputProps()} />
              <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <div>
                <p className="text-lg font-semibold mb-1 text-gray-900 dark:text-white">
                  {isDragActive ? 'Drop the images here ...' : 'Drag & drop images here, or click'}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  PNG, JPG, WebP up to 5MB • Max 6 images
                </p>
              </div>
            </div>

            {previewImages.length > 0 && (
              <div className="mt-6">
                <h3 className="text-sm font-semibold mb-3 text-gray-900 dark:text-white flex items-center gap-2">
                  <ImageIcon className="h-4 w-4" />
                  Preview ({previewImages.length})
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {previewImages.map((preview, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-24 object-cover rounded-xl shadow-md"
                      />
                      <button
                        type="button"
                        onClick={() => handleImageRemove(index)}
                        className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white p-1.5 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-200"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Submit Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-8 border-t border-gray-200 dark:border-gray-700">
            <button
              type="submit"
              disabled={loading || images.length === 0 || brandsLoading}
              className="flex-1 disabled:cursor-not-allowed disabled:opacity-50 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 font-medium text-sm"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating Product...
                </>
              ) : (
                <>
                  <ImageIcon className="w-4 h-4" />
                  Create Product
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-3 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 font-semibold rounded-xl shadow-sm hover:shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

