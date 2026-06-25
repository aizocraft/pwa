'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  Plus,
  Search,
  Eye,
  Edit,
  Trash2,
  Send,
  Printer,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  FileText,
  Calendar,
  User,
  Package,
  Truck,
  X,
  Save,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Tag,
  Users,
  DollarSign,
  Percent,
  Shield,
  Download,
  EyeOff,
  Eye as EyeIcon,
  Image as ImageIcon,
  Upload,
  Link as LinkIcon,
  Filter,
  ChevronDown,
  TrendingUp,
  TrendingDown,
  MinusCircle,
  PlusCircle,
  AlertCircle,
  Building2,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  Calendar as CalendarIcon,
  Receipt,
  Settings,
  ToggleLeft,
  ToggleRight,
  FileSpreadsheet,
  RotateCcw,
  Moon,
  Sun,
} from 'lucide-react';
import {
  listSalesQuotations,
  createSalesQuotation,
  updateSalesQuotation,
  deleteSalesQuotation,
  sendQuotationEmail,
  acceptQuotation,
  listSalesCustomers,
  type Quotation,
  type SalesCustomer,
} from '@/lib/sales';
import { listProducts } from '@/lib/sales';
import { useAuth } from '@/lib/auth';
import { useCompanySettings } from '@/lib/use-company-settings';
import { getLogoUrl, getTaxRate } from '@/lib/company';
import { toast } from 'react-hot-toast';
import { generateQuotationPDF } from './components/QuotationPDF';
import api from '@/lib/api';
import { debounce } from 'lodash';

// Types
interface Category {
  _id: string;
  name: string;
  slug: string;
}

interface ProductWithStock {
  _id: string;
  name: string;
  slug: string;
  price: number;
  buyingPrice: number;
  stock: number;
  category?: string;
  categoryId?: string;
  categoryName?: string;
  images?: Array<{ url: string; type?: string; fileId?: string }>;
  description?: string;
  sku?: string;
}

interface QuotationItemWithTax {
  productId: string;
  qty: number;
  customPrice?: number;
  taxable: boolean;
  name: string;
}

type DateFilterPeriod = 'all' | 'today' | 'yesterday' | '7d' | '30d' | 'month' | 'year' | 'custom';

// ==================== CREATE PRODUCT MODAL ====================
function CreateProductModal({ isOpen, onClose, onProductCreated, categories }: any) {
  const [loading, setLoading] = useState(false);
  const [imageType, setImageType] = useState<'url' | 'upload'>('url');
  const [imageUrl, setImageUrl] = useState('');
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    category: '',
    price: 0,
    buyingPrice: 0,
    description: '',
    stock: 0,
    sku: '',
  });
  const [profitDisplay, setProfitDisplay] = useState({ amount: 0, percent: 0 });

  const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  };

  const calculateProfit = (price: number, buyingPrice: number) => {
    const amount = price - buyingPrice;
    const percent = price > 0 ? (amount / price) * 100 : 0;
    setProfitDisplay({ amount, percent });
  };

  useEffect(() => {
    calculateProfit(formData.price, formData.buyingPrice);
  }, [formData.price, formData.buyingPrice]);

  const handleImageFiles = (files: FileList | null) => {
    if (!files) return;
    const newFiles = Array.from(files);
    setImageFiles(prev => [...prev, ...newFiles]);
    newFiles.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.category || formData.price <= 0) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      let uploadedImages = [];
      
      if (imageType === 'url' && imageUrl) {
        uploadedImages = [{ type: 'url', url: imageUrl }];
      } else if (imageFiles.length > 0) {
        const formDataImg = new FormData();
        imageFiles.forEach(file => formDataImg.append('images', file));
        const uploadResponse = await api.post('/products/upload-images', formDataImg);
        uploadedImages = uploadResponse.data.images || [];
      }

      const response = await api.post('/products', {
        ...formData,
        slug: formData.slug || generateSlug(formData.name),
        images: uploadedImages,
      });

      const formattedProduct: ProductWithStock = {
        _id: response.data._id,
        name: response.data.name,
        slug: response.data.slug,
        price: response.data.price,
        buyingPrice: response.data.buyingPrice,
        stock: response.data.stock,
        category: response.data.category,
        categoryId: response.data.category,
        categoryName: categories.find((c: any) => c._id === response.data.category)?.name || response.data.category,
        description: response.data.description,
        sku: response.data.sku,
        images: response.data.images,
      };

      onProductCreated(formattedProduct);
      toast.success('Product created successfully');
      onClose();
      setFormData({ name: '', slug: '', category: '', price: 0, buyingPrice: 0, description: '', stock: 0, sku: '' });
      setImageFiles([]);
      setImagePreviews([]);
      setImageUrl('');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to create product');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-[70] p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl dark:shadow-gray-950/50">
        <div className="p-6 border-b border-gray-200 dark:border-gray-800 sticky top-0 bg-white dark:bg-gray-900 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Create New Product</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-500 dark:text-gray-400">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Product Name *</label>
            <input 
              type="text" 
              value={formData.name} 
              onChange={(e) => setFormData({ ...formData, name: e.target.value, slug: generateSlug(e.target.value) })} 
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent" 
              required 
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Slug (SEO Friendly)</label>
            <input 
              type="text" 
              value={formData.slug} 
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })} 
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-mono text-sm focus:ring-2 focus:ring-cyan-500" 
              placeholder="auto-generated-from-name" 
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">SKU</label>
            <input 
              type="text" 
              value={formData.sku} 
              onChange={(e) => setFormData({ ...formData, sku: e.target.value })} 
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-cyan-500" 
              placeholder="Auto-generated if empty" 
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category *</label>
            <select 
              value={formData.category} 
              onChange={(e) => setFormData({ ...formData, category: e.target.value })} 
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-cyan-500" 
              required
            >
              <option value="">Select a category</option>
              <option value="Solar Panels">Solar Panels</option>
              <option value="Inverters">Inverters</option>
              <option value="Batteries">Batteries</option>
              <option value="Water Pumps">Water Pumps</option>
              <option value="Cables & Connectors">Cables & Connectors</option>
              <option value="Solar Lights">Solar Lights</option>
              <option value="Generators">Generators</option>
              <option value="Accessories">Accessories</option>
              <option value="Labour">Labour</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Selling Price (KES) *</label>
              <input 
                type="number" 
                value={formData.price} 
                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })} 
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-cyan-500" 
                required 
                step="10"
                min="0"  
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Buying Price (KES)</label>
              <input 
                type="number" 
                value={formData.buyingPrice} 
                onChange={(e) => setFormData({ ...formData, buyingPrice: Number(e.target.value) })} 
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-cyan-500" 
                step="10" 
                min="0" 
              />
            </div>
          </div>

          {formData.price > 0 && (
            <div className={`p-3 rounded-lg ${profitDisplay.amount >= 0 ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'}`}>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Profit</span>
                <div className="flex items-center gap-3">
                  <span className={`font-semibold ${profitDisplay.amount >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {profitDisplay.amount >= 0 ? '+' : ''}KES {profitDisplay.amount.toLocaleString()}
                  </span>
                  <span className={`text-sm ${profitDisplay.percent >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    ({profitDisplay.percent.toFixed(1)}% margin)
                  </span>
                </div>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Stock Quantity</label>
            <input 
              type="number" 
              value={formData.stock} 
              onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })} 
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-cyan-500" 
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
            <textarea 
              rows={3} 
              value={formData.description} 
              onChange={(e) => setFormData({ ...formData, description: e.target.value })} 
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-cyan-500" 
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Product Images</label>
            <div className="flex gap-2 mb-3">
              <button 
                type="button" 
                onClick={() => setImageType('url')} 
                className={`px-3 py-1 rounded-lg text-sm transition-colors ${imageType === 'url' ? 'bg-cyan-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
              >
                <LinkIcon className="w-4 h-4 inline mr-1" /> URL
              </button>
              <button 
                type="button" 
                onClick={() => setImageType('upload')} 
                className={`px-3 py-1 rounded-lg text-sm transition-colors ${imageType === 'upload' ? 'bg-cyan-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
              >
                <Upload className="w-4 h-4 inline mr-1" /> Upload
              </button>
            </div>
            
            {imageType === 'url' ? (
              <input 
                type="url" 
                placeholder="https://example.com/image.jpg" 
                value={imageUrl} 
                onChange={(e) => setImageUrl(e.target.value)} 
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-cyan-500" 
              />
            ) : (
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-4 text-center">
                <input 
                  type="file" 
                  accept="image/*" 
                  multiple 
                  onChange={(e) => handleImageFiles(e.target.files)} 
                  className="hidden" 
                  id="product-images" 
                />
                <label htmlFor="product-images" className="cursor-pointer">
                  <Upload className="w-8 h-8 mx-auto text-gray-400 dark:text-gray-500 mb-2" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">Click to upload images</p>
                </label>
                {imagePreviews.length > 0 && (
                  <div className="flex gap-2 mt-3 flex-wrap">
                    {imagePreviews.map((preview, idx) => (
                      <div key={idx} className="relative w-16 h-16">
                        <img src={preview} alt="Preview" className="w-full h-full object-cover rounded border border-gray-200 dark:border-gray-700" />
                        <button 
                          type="button" 
                          onClick={() => removeImage(idx)} 
                          className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <button 
              type="submit" 
              disabled={loading} 
              className="flex-1 py-3 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin inline mr-2" /> : null} Create Product
            </button>
            <button 
              type="button" 
              onClick={onClose} 
              className="flex-1 py-3 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-gray-700 dark:text-gray-300"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ==================== MAIN COMPONENT ====================
export default function QuotationsPage() {
  const { user } = useAuth();
  const { data: settings } = useCompanySettings();
  const logoUrl = getLogoUrl(settings || null);
  
  const [taxRate, setTaxRate] = useState<number>(0.16);
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [customers, setCustomers] = useState<SalesCustomer[]>([]);
  const [products, setProducts] = useState<ProductWithStock[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [showModal, setShowModal] = useState(false);
  const [editingQuote, setEditingQuote] = useState<Quotation | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingQuote, setViewingQuote] = useState<Quotation | null>(null);
  const [viewingCustomer, setViewingCustomer] = useState<SalesCustomer | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalQuotations, setTotalQuotations] = useState(0);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);
  const [creatingCustomer, setCreatingCustomer] = useState(false);
  const [showTransport, setShowTransport] = useState(false);
  const [showCreateProductModal, setShowCreateProductModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportStartDate, setReportStartDate] = useState('');
  const [reportEndDate, setReportEndDate] = useState('');
  const [quoteDateFilterPeriod, setQuoteDateFilterPeriod] = useState<DateFilterPeriod>('all');
  const [quoteStartDate, setQuoteStartDate] = useState('');
  const [quoteEndDate, setQuoteEndDate] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [creatingNewInvoiceId, setCreatingNewInvoiceId] = useState<string | null>(null);
  const [exportType, setExportType] = useState<'filtered' | 'all' | 'dateRange'>('filtered');
  const [exportStatusFilter, setExportStatusFilter] = useState<string>('');
  const [exportLoading, setExportLoading] = useState(false);
  
  const itemsPerPage = 10;
  
  // Refs for debounce
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const productSearchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isSearchingRef = useRef(false);

  // Debounced search
  const debouncedSearch = useMemo(
    () => debounce((value: string) => {
      setSearchTerm(value);
      setCurrentPage(1);
    }, 400),
    []
  );

  // State for form
  const [productSearchTerm, setProductSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [showProductDropdown, setShowProductDropdown] = useState(false);
  const [customerSearchTerm, setCustomerSearchTerm] = useState('');
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [showAddCustomerForm, setShowAddCustomerForm] = useState(false);
  const [newCustomer, setNewCustomer] = useState({ name: '', email: '', phone: '', location: '' });
  const [selectedCustomer, setSelectedCustomer] = useState<SalesCustomer | null>(null);

  const [formData, setFormData] = useState({
    customerId: '',
    items: [] as QuotationItemWithTax[],
    discount: 0,
    discountType: 'fixed' as 'percentage' | 'fixed',
    notes: '',
    terms: '',
    validUntil: '',
    transportCost: 0,
    transportDescription: '',
    estimatedDelivery: '',
    taxPerItem: false,
  });

  const [tempItem, setTempItem] = useState({
    productId: '',
    qty: 1,
    customPrice: null as number | null,
    taxable: true,
    name: '',
  });

  // Clean up debounce on unmount
  useEffect(() => {
    return () => debouncedSearch.cancel();
  }, [debouncedSearch]);

  // ==================== HELPERS ====================
  const escapeCSV = (value: any) => {
    if (value === null || value === undefined) return '""';
    const str = String(value);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return `"${str}"`;
  };

  const formatCurrencyCSV = (amount: number) => {
    return `"KES ${amount.toLocaleString()}"`;
  };

  const getDateString = (date: Date) => date.toISOString().split('T')[0];

  // ==================== DATE FILTER FUNCTIONS ====================
  
  const isDateFilterActive = (period: DateFilterPeriod): boolean => {
    if (period === 'all') return !quoteStartDate && !quoteEndDate;
    
    const now = new Date();
    const today = getDateString(now);
    
    switch(period) {
      case 'today':
        return quoteStartDate === today && quoteEndDate === today;
      case 'yesterday': {
        const yesterday = new Date(now);
        yesterday.setDate(now.getDate() - 1);
        const yStr = getDateString(yesterday);
        return quoteStartDate === yStr && quoteEndDate === yStr;
      }
      case '7d': {
        const weekAgo = new Date(now);
        weekAgo.setDate(now.getDate() - 6);
        return quoteStartDate === getDateString(weekAgo) && quoteEndDate === today;
      }
      case '30d': {
        const monthAgo = new Date(now);
        monthAgo.setDate(now.getDate() - 29);
        return quoteStartDate === getDateString(monthAgo) && quoteEndDate === today;
      }
      case 'month': {
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        return quoteStartDate === getDateString(monthStart) && quoteEndDate === today;
      }
      case 'year': {
        const yearStart = new Date(now.getFullYear(), 0, 1);
        return quoteStartDate === getDateString(yearStart) && quoteEndDate === today;
      }
      default:
        return false;
    }
  };

  const applyQuoteDateFilter = (period: DateFilterPeriod) => {
    const now = new Date();
    let start = '';
    let end = '';

    switch (period) {
      case 'today':
        start = getDateString(now);
        end = getDateString(now);
        break;
      case 'yesterday': {
        const yesterday = new Date(now);
        yesterday.setDate(now.getDate() - 1);
        start = getDateString(yesterday);
        end = getDateString(yesterday);
        break;
      }
      case '7d': {
        const weekAgo = new Date(now);
        weekAgo.setDate(now.getDate() - 6);
        start = getDateString(weekAgo);
        end = getDateString(now);
        break;
      }
      case '30d': {
        const monthAgo = new Date(now);
        monthAgo.setDate(now.getDate() - 29);
        start = getDateString(monthAgo);
        end = getDateString(now);
        break;
      }
      case 'month': {
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        start = getDateString(monthStart);
        end = getDateString(now);
        break;
      }
      case 'year': {
        const yearStart = new Date(now.getFullYear(), 0, 1);
        start = getDateString(yearStart);
        end = getDateString(now);
        break;
      }
      default:
        start = '';
        end = '';
    }

    setQuoteDateFilterPeriod(period);
    setQuoteStartDate(start);
    setQuoteEndDate(end);
    setCurrentPage(1);
  };

  const clearQuoteDateFilters = () => {
    setQuoteDateFilterPeriod('all');
    setQuoteStartDate('');
    setQuoteEndDate('');
    setCurrentPage(1);
  };

  const handleCustomDateChange = (type: 'start' | 'end', value: string) => {
    if (type === 'start') {
      setQuoteStartDate(value);
    } else {
      setQuoteEndDate(value);
    }
    setQuoteDateFilterPeriod('custom');
    // Only fetch if both dates are set
    if ((type === 'start' && value && quoteEndDate) || (type === 'end' && value && quoteStartDate)) {
      setCurrentPage(1);
    } else if (type === 'start' && !value) {
      clearQuoteDateFilters();
    }
  };

  // ==================== EXPORT ====================
  const handleExportQuotations = async () => {
    setExportLoading(true);
    try {
      let quotesToExport: Quotation[] = [];
      
      if (exportType === 'all') {
        let allQuotes: Quotation[] = [];
        let page = 1;
        let hasMore = true;
        
        while (hasMore) {
          const response = await api.get('/sales/quotations', {
            params: {
              limit: 100,
              page: page,
              status: exportStatusFilter || undefined,
              startDate: reportStartDate || undefined,
              endDate: reportEndDate || undefined,
            }
          });
          
          const data = response.data.quotations || [];
          allQuotes = [...allQuotes, ...data];
          
          if (response.data.pagination && page >= response.data.pagination.pages) {
            hasMore = false;
          } else {
            page++;
          }
        }
        quotesToExport = allQuotes;
      } else if (exportType === 'dateRange') {
        const response = await api.get('/sales/quotations', {
          params: {
            limit: 1000,
            page: 1,
            startDate: reportStartDate || undefined,
            endDate: reportEndDate || undefined,
            status: exportStatusFilter || undefined,
          }
        });
        quotesToExport = response.data.quotations || [];
      } else {
        quotesToExport = quotations;
      }

      if (quotesToExport.length === 0) {
        toast.error('No quotations to export');
        return;
      }

      const headers = [
        'Quote Number', 'Customer Name', 'Customer Email', 'Customer Phone', 'Customer Location',
        'Items Count', 'Subtotal (KES)', 'Tax (KES)', 'Discount (KES)', 'Transport Cost (KES)',
        'Total (KES)', 'Status', 'Valid Until', 'Created Date', 'Sent Date', 'Accepted Date',
        'Invoice Number', 'Profit (KES)', 'Profit Margin (%)', 'Created By'
      ];

      const rows = quotesToExport.map((q) => [
        escapeCSV(q.quoteNumber),
        escapeCSV(q.customerName),
        escapeCSV(q.customerEmail || 'N/A'),
        escapeCSV(q.customerPhone || 'N/A'),
        escapeCSV(q.customerLocation || 'N/A'),
        q.items.length,
        formatCurrencyCSV(q.subtotal || 0),
        formatCurrencyCSV(q.tax || 0),
        formatCurrencyCSV(q.discount || 0),
        formatCurrencyCSV((q as any).transportCost || 0),
        formatCurrencyCSV(q.total || 0),
        escapeCSV(q.status),
        escapeCSV(q.validUntil ? new Date(q.validUntil).toLocaleDateString() : 'N/A'),
        escapeCSV(new Date(q.createdAt).toLocaleString()),
        escapeCSV(q.sentAt ? new Date(q.sentAt).toLocaleString() : 'N/A'),
        escapeCSV(q.acceptedAt ? new Date(q.acceptedAt).toLocaleString() : 'N/A'),
        escapeCSV((q as any).invoiceNumber || 'N/A'),
        formatCurrencyCSV((q as any).totalProfit || 0),
        ((q as any).totalProfit && q.total) ? (((q as any).totalProfit / q.total) * 100).toFixed(2) + '%' : '0%',
        escapeCSV((q as any).createdByName || 'N/A')
      ]);

      const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
      const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      let filename = 'quotations';
      if (exportType === 'all') {
        filename += '-all';
      } else if (exportType === 'dateRange' && reportStartDate && reportEndDate) {
        filename += `-${reportStartDate}-to-${reportEndDate}`;
      } else if (quoteStartDate && quoteEndDate) {
        filename += `-${quoteStartDate}-to-${quoteEndDate}`;
      } else {
        filename += `-${new Date().toISOString().split('T')[0]}`;
      }
      
      if (exportStatusFilter) {
        filename += `-${exportStatusFilter}`;
      }
      
      link.download = `${filename}.csv`;
      link.click();
      URL.revokeObjectURL(url);
      toast.success(`Exported ${quotesToExport.length} quotations successfully`);
      setShowReportModal(false);
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Failed to export quotations');
    } finally {
      setExportLoading(false);
    }
  };

  // ==================== DATA FETCHING ====================
  const fetchData = useCallback(async () => {
    if (isSearchingRef.current) return;
    
    isSearchingRef.current = true;
    try {
      setLoading(true);
      const [quotesRes, customersRes] = await Promise.all([
        listSalesQuotations({ 
          search: searchTerm || undefined, 
          status: statusFilter || undefined, 
          startDate: quoteStartDate || undefined,
          endDate: quoteEndDate || undefined,
          page: currentPage, 
          limit: itemsPerPage 
        }),
        listSalesCustomers({ limit: 100 }),
      ]);
      setQuotations(quotesRes.quotations);
      setTotalPages(quotesRes.pagination?.pages || 1);
      setTotalQuotations(quotesRes.pagination?.total || 0);
      setCustomers(customersRes.customers);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
      isSearchingRef.current = false;
    }
  }, [searchTerm, statusFilter, currentPage, quoteStartDate, quoteEndDate]);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories?limit=100');
      setCategories(response.data.categories || response.data.data || []);
    } catch (error) {
      setCategories([
        { _id: 'solar-panels', name: 'Solar Panels', slug: 'solar-panels' },
        { _id: 'inverters', name: 'Inverters', slug: 'inverters' },
        { _id: 'batteries', name: 'Batteries', slug: 'batteries' },
        { _id: 'water-pumps', name: 'Water Pumps', slug: 'water-pumps' },
        { _id: 'cables-and-connectors', name: 'Cables & Connectors', slug: 'cables-and-connectors' },
        { _id: 'solar-lights', name: 'Solar Lights', slug: 'solar-lights' },
        { _id: 'generators', name: 'Generators', slug: 'generators' },
        { _id: 'accessories', name: 'Accessories', slug: 'accessories' },
      ]);
    }
  };

  const fetchProducts = async () => {
    try {
      const params: any = { limit: 100 };
      if (productSearchTerm) params.search = productSearchTerm;
      if (selectedCategory) params.category = selectedCategory;
      const response = await listProducts(params);
      const productsList = response.products || [];
      const enhancedProducts = productsList.map((p: any) => ({
        ...p,
        categoryName: p.category ? (categories.find(c => c._id === p.category)?.name || p.category) : 'Uncategorized'
      }));
      setProducts(enhancedProducts);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    }
  };

  // ==================== EFFECTS ====================
  useEffect(() => {
    fetchData();
    fetchCategories();
  }, [fetchData]);

  useEffect(() => {
    if (showModal) fetchProducts();
  }, [showModal, productSearchTerm, selectedCategory]);

  useEffect(() => {
    const fetchTaxRate = async () => {
      try {
        const rate = await getTaxRate();
        setTaxRate(rate);
      } catch (error) {
        console.error('Failed to fetch tax rate:', error);
      }
    };
    fetchTaxRate();
  }, []);

  // Clean up timeouts
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
      if (productSearchTimeoutRef.current) clearTimeout(productSearchTimeoutRef.current);
    };
  }, []);

  // ==================== HANDLERS ====================
  const handleSearchChange = (value: string) => {
    debouncedSearch(value);
  };

  const handleProductSearchChange = (value: string) => {
    setProductSearchTerm(value);
    setShowProductDropdown(true);
    if (productSearchTimeoutRef.current) clearTimeout(productSearchTimeoutRef.current);
    productSearchTimeoutRef.current = setTimeout(() => fetchProducts(), 300);
  };

  const filteredCustomers = useMemo(() => {
    if (!customerSearchTerm) return customers;
    const term = customerSearchTerm.toLowerCase();
    return customers.filter(c => 
      c.name.toLowerCase().includes(term) || 
      (c.email?.toLowerCase().includes(term)) || 
      (c.phone?.includes(term))
    );
  }, [customers, customerSearchTerm]);

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(productSearchTerm.toLowerCase()) || 
                           (product.sku?.toLowerCase().includes(productSearchTerm.toLowerCase()));
      const matchesCategory = !selectedCategory || product.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, productSearchTerm, selectedCategory]);

  const handleCreateCustomer = async () => {
    if (!newCustomer.name.trim()) {
      toast.error('Customer name is required');
      return;
    }
    setCreatingCustomer(true);
    try {
      const response = await api.post('/sales/customers', newCustomer);
      const newCustomerData = response.data.customer;
      setCustomers([newCustomerData, ...customers]);
      setFormData({ ...formData, customerId: newCustomerData._id });
      setSelectedCustomer(newCustomerData);
      setCustomerSearchTerm(newCustomerData.name);
      setShowAddCustomerForm(false);
      setNewCustomer({ name: '', email: '', phone: '', location: '' });
      toast.success('Customer created successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to create customer');
    } finally {
      setCreatingCustomer(false);
    }
  };

  const handleProductCreated = (newProduct: ProductWithStock) => {
    setProducts([newProduct, ...products]);
    setTempItem({ 
      ...tempItem, 
      productId: newProduct._id,
      name: newProduct.name
    });
    setProductSearchTerm(newProduct.name);
    setShowProductDropdown(false);
  };

  const handleCreateNewInvoiceFromQuote = async (quoteId: string) => {
    setCreatingNewInvoiceId(quoteId);
    try {
      const response = await api.post(`/sales/quotations/${quoteId}/create-invoice`);
      toast.success(`New invoice created: ${response.data.invoice.invoiceNumber}`);
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to create new invoice');
    } finally {
      setCreatingNewInvoiceId(null);
    }
  };

  const calculateTotals = useCallback(() => {
    let subtotal = 0;
    let totalTax = 0;
    let totalCost = 0;
    let totalProfit = 0;
    
    for (const item of formData.items) {
      const product = products.find((p) => p._id === item.productId);
      const price = item.customPrice || product?.price || 0;
      const buyingPrice = product?.buyingPrice || 0;
      const itemTotal = price * item.qty;
      const itemCost = buyingPrice * item.qty;
      const itemProfit = itemTotal - itemCost;
      
      subtotal += itemTotal;
      totalCost += itemCost;
      totalProfit += itemProfit;
      
      if (formData.taxPerItem && item.taxable) {
        totalTax += itemTotal * taxRate;
      }
    }
    
    const discountAmount = formData.discountType === 'percentage' 
      ? subtotal * (formData.discount / 100) 
      : formData.discount;
    
    let tax = totalTax;
    if (!formData.taxPerItem) {
      const taxableAfterDiscount = Math.max(0, subtotal - discountAmount);
      tax = taxableAfterDiscount * taxRate;
    }
    
    const total = subtotal - discountAmount + tax + formData.transportCost;
    
    return { subtotal, discountAmount, tax, total, totalCost, totalProfit };
  }, [formData, products, taxRate]);

  const { subtotal, discountAmount, tax, total, totalCost, totalProfit } = calculateTotals();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.items.length === 0) return toast.error('Please add at least one item');
    if (!formData.customerId) return toast.error('Please select a customer');
    try {
      const payload = {
        customerId: formData.customerId,
        items: formData.items.map(item => ({ 
          productId: item.productId, 
          qty: item.qty, 
          customPrice: item.customPrice, 
          taxable: item.taxable, 
          name: item.name || undefined
        })), 
        discount: formData.discount,
        discountType: formData.discountType,
        notes: formData.notes,
        terms: formData.terms,
        validUntil: formData.validUntil,
        taxPerItem: formData.taxPerItem,
        transport: { cost: formData.transportCost, description: formData.transportDescription },
        estimatedDelivery: formData.estimatedDelivery,
      };
      if (editingQuote) {
        await updateSalesQuotation(editingQuote._id, { status: editingQuote.status, ...payload });
        toast.success('Quotation updated successfully');
      } else {
        await createSalesQuotation(payload);
        toast.success('Quotation created successfully');
      }
      setShowModal(false);
      resetForm();
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Operation failed');
    }
  };

  const handleSendEmail = async (id: string) => {
    setSendingId(id);
    try {
      await sendQuotationEmail(id);
      toast.success('Quotation sent successfully');
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to send quotation');
    } finally {
      setSendingId(null);
    }
  };

  const handleAccept = async (id: string) => {
    setAcceptingId(id);
    try {
      const result = await acceptQuotation(id);
      toast.success(`Quotation accepted! Invoice: ${result.invoice.invoiceNumber}`);
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to accept quotation');
    } finally {
      setAcceptingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this quotation?')) return;
    try {
      await deleteSalesQuotation(id);
      toast.success('Quotation deleted successfully');
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Delete failed');
    }
  };

  const handleView = (quote: Quotation) => {
    setViewingQuote(quote);
    setViewingCustomer(customers.find(c => c._id === quote.customerId) || null);
    setShowViewModal(true);
  };

  const handlePrintPDF = async (quote: Quotation) => {
    const customer = customers.find(c => c._id === quote.customerId);
    if (!customer) return toast.error('Customer not found');
    setIsGeneratingPDF(true);
    const toastId = toast.loading('Generating PDF...');
    try {
      const pdfBlob = await generateQuotationPDF(quote, customer, settings, logoUrl);
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Quotation-${quote.quoteNumber}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
      toast.success('PDF generated!', { id: toastId });
    } catch (error) {
      toast.error('Failed to generate PDF', { id: toastId });
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const resetForm = () => {
    setEditingQuote(null);
    setProductSearchTerm('');
    setSelectedCategory('');
    setCustomerSearchTerm('');
    setSelectedCustomer(null);
    setShowAddCustomerForm(false);
    const validUntilDate = new Date();
    validUntilDate.setDate(validUntilDate.getDate() + 7);
    setFormData({
      customerId: '',
      items: [],
      discount: 0,
      discountType: 'fixed',
      notes: '',
      terms: '',
      validUntil: validUntilDate.toISOString().split('T')[0],
      transportCost: 0,
      transportDescription: '',
      estimatedDelivery: '',
      taxPerItem: false,
    });
    setTempItem({ productId: '', qty: 1, customPrice: null, taxable: true, name: '' });
    setNewCustomer({ name: '', email: '', phone: '', location: '' });
  };

  const addItem = () => {
    if (!tempItem.productId || tempItem.qty <= 0) return;
    const product = products.find(p => p._id === tempItem.productId);
    if (product) {
      const displayName = tempItem.name && tempItem.name.trim() ? tempItem.name : product.name;
      setFormData(prev => ({
        ...prev,
        items: [
          ...prev.items,
          {
            productId: tempItem.productId,
            qty: tempItem.qty,
            customPrice: tempItem.customPrice || undefined,
            taxable: tempItem.taxable,
            name: displayName,
          },
        ],
      }));
      setTempItem({ productId: '', qty: 1, customPrice: null, taxable: true, name: '' });
      setProductSearchTerm('');
      setShowProductDropdown(false);
    }
  };

  const removeItem = (index: number) => setFormData(prev => ({ ...prev, items: prev.items.filter((_, i) => i !== index) }));
  const updateItemQty = (index: number, qty: number) => {
    const newItems = [...formData.items];
    newItems[index].qty = qty;
    setFormData(prev => ({ ...prev, items: newItems }));
  };
  const updateItemPrice = (index: number, price: number) => {
    const newItems = [...formData.items];
    newItems[index].customPrice = price;
    setFormData(prev => ({ ...prev, items: newItems }));
  };
  const updateItemName = (index: number, name: string) => {
    const newItems = [...formData.items];
    newItems[index].name = name;
    setFormData(prev => ({ ...prev, items: newItems }));
  };
  const toggleItemTax = (index: number) => {
    const newItems = [...formData.items];
    newItems[index].taxable = !newItems[index].taxable;
    setFormData(prev => ({ ...prev, items: newItems }));
  };

  // ==================== STYLES ====================
  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      draft: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
      sent: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      accepted: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      rejected: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      expired: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted': return <CheckCircle className="w-4 h-4" />;
      case 'rejected': return <XCircle className="w-4 h-4" />;
      case 'expired': return <Clock className="w-4 h-4" />;
      case 'sent': return <Send className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-12 h-12 animate-spin text-cyan-600 dark:text-cyan-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900">
      <div className="space-y-6 p-6">
        {/* ==================== HEADER ==================== */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Quotations</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {totalQuotations.toLocaleString()} total quotations
              {quoteStartDate && quoteEndDate && ` (${new Date(quoteStartDate).toLocaleDateString()} - ${new Date(quoteEndDate).toLocaleDateString()})`}
            </p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => setShowReportModal(true)} 
              className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-lg font-medium flex items-center gap-2 transition-all shadow-lg shadow-green-600/20 dark:shadow-green-800/30"
            >
              <Download className="w-4 h-4" /> Export Report
            </button>
            <button 
              onClick={() => { resetForm(); setShowModal(true); }} 
              className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white rounded-lg font-medium flex items-center gap-2 transition-all shadow-lg shadow-cyan-600/20 dark:shadow-cyan-800/30"
            >
              <Plus className="w-4 h-4" /> Create Quotation
            </button>
          </div>
        </div>

        {/* ==================== FILTERS ==================== */}
        <div className="space-y-4 w-full">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
              <input 
                type="text" 
                placeholder="Search by quote # or customer..." 
                defaultValue={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)} 
                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
              {searchTerm && (
                <button
                  onClick={() => handleSearchChange('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <select 
              value={statusFilter} 
              onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }} 
              className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-cyan-500"
            >
              <option value="">All Status</option>
              <option value="draft">Draft</option>
              <option value="sent">Sent</option>
              <option value="accepted">Accepted</option>
              <option value="rejected">Rejected</option>
              <option value="expired">Expired</option>
            </select>
            <button 
              onClick={fetchData} 
              className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-700 dark:text-gray-300"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          {/* Date Filter Buttons - Same Line */}
          <div className="flex flex-wrap items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-400 dark:text-gray-500 mr-1 flex-shrink-0" />
            
            {(['all', 'today', 'yesterday', '7d', '30d', 'month', 'year'] as const).map((period) => (
              <button
                key={period}
                type="button"
                onClick={() => applyQuoteDateFilter(period)}
                className={`px-3 py-1.5 rounded-lg border text-sm font-medium transition whitespace-nowrap ${
                  isDateFilterActive(period)
                    ? 'bg-cyan-600 text-white border-cyan-600 shadow-lg shadow-cyan-600/20 dark:shadow-cyan-800/30' 
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {period === 'all' ? 'All' : 
                 period === '7d' ? '7 Days' : 
                 period === '30d' ? '30 Days' : 
                 period === 'month' ? 'This Month' : 
                 period === 'year' ? 'This Year' : 
                 period.charAt(0).toUpperCase() + period.slice(1)}
              </button>
            ))}

            <button
              type="button"
              onClick={() => applyQuoteDateFilter('custom')}
              className={`px-3 py-1.5 rounded-lg border text-sm font-medium transition whitespace-nowrap ${
                quoteDateFilterPeriod === 'custom' && (quoteStartDate || quoteEndDate)
                  ? 'bg-cyan-600 text-white border-cyan-600 shadow-lg shadow-cyan-600/20 dark:shadow-cyan-800/30' 
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              Custom
            </button>

            <div className="flex items-center gap-2">
              <input
                type="date"
                value={quoteStartDate}
                onChange={(e) => handleCustomDateChange('start', e.target.value)}
                className="px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-cyan-500 w-36"
                aria-label="Start date"
              />
              <span className="text-gray-400 text-sm">to</span>
              <input
                type="date"
                value={quoteEndDate}
                onChange={(e) => handleCustomDateChange('end', e.target.value)}
                className="px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-cyan-500 w-36"
                aria-label="End date"
              />
            </div>

            {(quoteStartDate || quoteEndDate) && (
              <button
                type="button"
                onClick={clearQuoteDateFilters}
                className="p-1.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title="Clear date filters"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* ==================== TABLE ==================== */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-400">Quote #</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-400">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-400">Items</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-400">Total</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-400">Profit</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-400">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-400">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                {quotations.map((quote) => {
                  const hasInvoice = !!(quote as any).invoiceId;
                  const isAccepted = quote.status === 'accepted';
                  const profit = (quote as any).totalProfit || 0;
                  const profitMargin = quote.total > 0 ? (profit / quote.total) * 100 : 0;
                  
                  return (
                    <tr key={quote._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                          <span className="text-sm font-medium text-gray-900 dark:text-white">{quote.quoteNumber}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{quote.customerName}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{quote.customerEmail}</p>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{quote.items.length} items</td>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white">KES {quote.total?.toLocaleString() || 0}</td>
                      <td className="px-6 py-4">
                        {profit > 0 ? (
                          <span className="text-sm text-green-600 dark:text-green-400 font-medium">
                            KES {profit.toLocaleString()}
                            <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">({profitMargin.toFixed(1)}%)</span>
                          </span>
                        ) : (
                          <span className="text-sm text-gray-400 dark:text-gray-500">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(quote.status)}`}>
                            {getStatusIcon(quote.status)} {quote.status}
                          </span>
                          {hasInvoice && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                              <Receipt className="w-3 h-3" /> Invoice
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{new Date(quote.createdAt).toLocaleDateString()}</td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2 flex-wrap">
                          <button onClick={() => handleView(quote)} className="p-1.5 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors" title="View">
                            <Eye className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                          </button>
                          <button onClick={() => handleSendEmail(quote._id)} disabled={sendingId === quote._id} className="p-1.5 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-lg transition-colors" title="Send Email">
                            {sendingId === quote._id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 text-green-500 dark:text-green-400" />}
                          </button>
                          <button onClick={() => handlePrintPDF(quote)} disabled={isGeneratingPDF} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors" title="Download PDF">
                            <Printer className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                          </button>
                          <button 
                            onClick={() => { 
                              setEditingQuote(quote); 
                              const loadedItems = quote.items.map((i: any) => ({ 
                                productId: i.productId, 
                                qty: i.qty, 
                                customPrice: i.customPrice ? i.price : undefined, 
                                taxable: i.taxable !== false, 
                                name: i.name || ''
                              }));
                              setFormData({ 
                                customerId: quote.customerId, 
                                items: loadedItems, 
                                discount: quote.discount, 
                                discountType: quote.discountType, 
                                notes: quote.notes || '', 
                                terms: quote.terms || '', 
                                validUntil: quote.validUntil?.split('T')[0] || '', 
                                transportCost: (quote as any).transportCost || 0, 
                                transportDescription: (quote as any).transportDescription || '', 
                                estimatedDelivery: (quote as any).estimatedDelivery || '', 
                                taxPerItem: (quote as any).taxPerItem || false 
                              }); 
                              const customer = customers.find(c => c._id === quote.customerId);
                              if (customer) {
                                setSelectedCustomer(customer);
                                setCustomerSearchTerm(customer.name);
                              }
                              setShowModal(true); 
                            }} 
                            className="p-1.5 hover:bg-yellow-100 dark:hover:bg-yellow-900/30 rounded-lg transition-colors" 
                            title="Edit"
                          >
                            <Edit className="w-4 h-4 text-yellow-500 dark:text-yellow-400" />
                          </button>
                          <button onClick={() => handleDelete(quote._id)} className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors" title="Delete">
                            <Trash2 className="w-4 h-4 text-red-500 dark:text-red-400" />
                          </button>
                          {(quote.status === 'sent' || quote.status === 'draft') && (
                            <button onClick={() => handleAccept(quote._id)} disabled={acceptingId === quote._id} className="p-1.5 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-lg transition-colors" title="Accept">
                              {acceptingId === quote._id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4 text-green-500 dark:text-green-400" />}
                            </button>
                          )}
                          {isAccepted && (
                            <button 
                              onClick={() => handleCreateNewInvoiceFromQuote(quote._id)} 
                              disabled={creatingNewInvoiceId === quote._id} 
                              className="p-1.5 hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-lg transition-colors" 
                              title="Create New Invoice"
                            >
                              {creatingNewInvoiceId === quote._id ? 
                                <Loader2 className="w-4 h-4 animate-spin text-purple-500 dark:text-purple-400" /> : 
                                <FileSpreadsheet className="w-4 h-4 text-purple-500 dark:text-purple-400" />
                              }
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalQuotations)} of {totalQuotations}
              </div>
              <div className="flex items-center gap-1">
                <button 
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))} 
                  disabled={currentPage === 1} 
                  className="p-1.5 rounded disabled:opacity-50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-700 dark:text-gray-300"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-sm text-gray-600 dark:text-gray-400">Page {currentPage} of {totalPages}</span>
                <button 
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} 
                  disabled={currentPage === totalPages} 
                  className="p-1.5 rounded disabled:opacity-50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-700 dark:text-gray-300"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ==================== CREATE/EDIT MODAL ==================== */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white dark:bg-gray-900 rounded-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto shadow-2xl dark:shadow-gray-950/50">
              <div className="p-6 border-b border-gray-200 dark:border-gray-800 sticky top-0 bg-white dark:bg-gray-900 z-10 flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">{editingQuote ? 'Edit Quotation' : 'Create Quotation'}</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {editingQuote && editingQuote.status === 'accepted' 
                      ? 'Editing an accepted quotation. After saving, you can create a new invoice.' 
                      : 'Fill in the details below to create a quotation for your customer'}
                  </p>
                </div>
                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-500 dark:text-gray-400">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Warning for editing accepted quotation */}
                {editingQuote && editingQuote.status === 'accepted' && (
                  <div className="bg-amber-50 dark:bg-amber-950/30 border-l-4 border-amber-500 p-4 rounded-lg">
                    <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
                      <AlertCircle className="w-5 h-5" />
                      <span className="font-semibold">Editing Accepted Quotation</span>
                    </div>
                    <p className="text-sm text-amber-600 dark:text-amber-300 mt-1">
                      This quotation has already been accepted and an invoice created. After saving changes, 
                      use the "Create New Invoice" button to generate a new invoice with the updated details.
                    </p>
                  </div>
                )}

                {/* Customer Selection */}
                <div className="bg-gradient-to-r from-indigo-50/50 to-purple-50/50 dark:from-indigo-950/20 dark:to-purple-950/20 rounded-xl p-5 border border-indigo-100 dark:border-indigo-900/30">
                  <h3 className="font-semibold flex items-center gap-2 mb-4 text-gray-900 dark:text-white">
                    <Users className="w-5 h-5 text-indigo-600 dark:text-indigo-400" /> Customer Information
                  </h3>
                  {!showAddCustomerForm ? (
                    <div className="relative">
                      <input 
                        type="text" 
                        placeholder="Search or select customer..." 
                        value={customerSearchTerm} 
                        onChange={(e) => { setCustomerSearchTerm(e.target.value); setShowCustomerDropdown(true); }} 
                        className="w-full pl-4 pr-4 py-3 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-cyan-500"
                      />
                      {showCustomerDropdown && (
                        <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                          {filteredCustomers.map(customer => (
                            <button 
                              key={customer._id} 
                              type="button" 
                              onClick={() => { setFormData({ ...formData, customerId: customer._id }); setSelectedCustomer(customer); setCustomerSearchTerm(customer.name); setShowCustomerDropdown(false); }} 
                              className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            >
                              <div className="flex items-center justify-between">
                                <p className="text-sm font-medium text-gray-900 dark:text-white">{customer.name}</p>
                                {selectedCustomer?._id === customer._id && <CheckCircle className="w-4 h-4 text-green-500" />}
                              </div>
                              <div className="flex gap-3 text-xs text-gray-500 dark:text-gray-400">
                                {customer.email && <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {customer.email}</span>}
                                {customer.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {customer.phone}</span>}
                              </div>
                            </button>
                          ))}
                          <button 
                            type="button" 
                            onClick={() => setShowAddCustomerForm(true)} 
                            className="w-full text-left px-4 py-2 border-t border-gray-200 dark:border-gray-700 text-indigo-600 dark:text-indigo-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                          >
                            <Plus className="w-4 h-4 inline mr-2" /> Add New Customer
                          </button>
                        </div>
                      )}
                      {selectedCustomer && (
                        <div className="mt-3 p-3 bg-indigo-50 dark:bg-indigo-950/30 rounded-lg flex items-center justify-between border border-indigo-200 dark:border-indigo-800">
                          <div>
                            <p className="text-sm font-medium flex items-center gap-2 text-gray-900 dark:text-white">
                              <CheckCircle className="w-4 h-4 text-green-500" /> Selected: {selectedCustomer.name}
                            </p>
                            <div className="flex gap-3 text-xs text-gray-600 dark:text-gray-400 mt-1">
                              {selectedCustomer.email && <span>{selectedCustomer.email}</span>}
                              {selectedCustomer.phone && <span>{selectedCustomer.phone}</span>}
                            </div>
                          </div>
                          <button 
                            type="button" 
                            onClick={() => { setSelectedCustomer(null); setFormData({ ...formData, customerId: '' }); setCustomerSearchTerm(''); }} 
                            className="text-red-500 dark:text-red-400 text-sm hover:text-red-700"
                          >
                            Change
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="border border-gray-300 dark:border-gray-700 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 dark:text-white mb-3">New Customer</h4>
                      <div className="space-y-3">
                        <input 
                          type="text" 
                          placeholder="Full Name *" 
                          value={newCustomer.name} 
                          onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })} 
                          className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-cyan-500" 
                        />
                        <div className="grid grid-cols-2 gap-3">
                          <input 
                            type="email" 
                            placeholder="Email" 
                            value={newCustomer.email} 
                            onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })} 
                            className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-cyan-500" 
                          />
                          <input 
                            type="tel" 
                            placeholder="Phone" 
                            value={newCustomer.phone} 
                            onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })} 
                            className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-cyan-500" 
                          />
                        </div>
                        <input 
                          type="text" 
                          placeholder="Location" 
                          value={newCustomer.location} 
                          onChange={(e) => setNewCustomer({ ...newCustomer, location: e.target.value })} 
                          className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-cyan-500" 
                        />
                        <div className="flex gap-2">
                          <button 
                            type="button" 
                            onClick={handleCreateCustomer} 
                            disabled={creatingCustomer} 
                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm transition-colors disabled:opacity-50"
                          >
                            {creatingCustomer ? <Loader2 className="w-4 h-4 animate-spin inline mr-2" /> : null}
                            Create Customer
                          </button>
                          <button 
                            type="button" 
                            onClick={() => { setShowAddCustomerForm(false); setNewCustomer({ name: '', email: '', phone: '', location: '' }); }} 
                            className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-gray-700 dark:text-gray-300"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Tax Per Item Toggle */}
                <div className="bg-gradient-to-r from-amber-50/50 to-orange-50/50 dark:from-amber-950/20 dark:to-orange-950/20 rounded-xl p-5 border border-amber-100 dark:border-amber-900/30">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Settings className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                      <span className="font-semibold text-gray-900 dark:text-white">Tax Calculation</span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">({taxRate * 100}% tax rate)</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, taxPerItem: !formData.taxPerItem })}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${formData.taxPerItem ? 'bg-amber-600' : 'bg-gray-300 dark:bg-gray-600'}`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.taxPerItem ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    {formData.taxPerItem ? 'Tax calculated per item (only taxable items)' : 'Tax calculated on subtotal after discount'}
                  </p>
                </div>

                {/* Product Selection */}
                <div className="bg-gradient-to-r from-cyan-50/50 to-blue-50/50 dark:from-cyan-950/20 dark:to-blue-950/20 rounded-xl p-5 border border-cyan-100 dark:border-cyan-900/30">
                  <h3 className="font-semibold flex items-center gap-2 mb-4 text-gray-900 dark:text-white">
                    <Package className="w-5 h-5 text-cyan-600 dark:text-cyan-400" /> Add Products
                  </h3>
                  
                  {/* Category Filter */}
                  <div className="flex items-center gap-2 mb-3">
                    <Filter className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                    <select 
                      value={selectedCategory} 
                      onChange={(e) => setSelectedCategory(e.target.value)} 
                      className="text-sm border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-1.5 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-cyan-500"
                    >
                      <option value="">All Categories</option>
                      {categories.map(cat => (
                        <option key={cat._id} value={cat._id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <div className="relative flex-1 min-w-[200px]">
                      <input 
                        type="text" 
                        placeholder="Search products..." 
                        value={productSearchTerm} 
                        onChange={(e) => handleProductSearchChange(e.target.value)} 
                        className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-cyan-500" 
                      />
                      {showProductDropdown && filteredProducts.length > 0 && (
                        <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                          {filteredProducts.slice(0, 10).map(product => (
                            <button 
                              key={product._id} 
                              type="button" 
                              onClick={() => {
                                setTempItem({
                                  ...tempItem,
                                  productId: product._id,
                                  name: product.name,
                                });
                                setProductSearchTerm(product.name);
                                setShowProductDropdown(false);
                              }} 
                              className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            >
                              <div className="flex justify-between items-center">
                                <div>
                                  <span className="font-medium text-gray-900 dark:text-white">{product.name}</span>
                                  {product.sku && <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">({product.sku})</span>}
                                </div>
                                <div className="text-right">
                                  <span className="text-sm text-gray-900 dark:text-white">KES {product.price.toLocaleString()}</span>
                                  {product.buyingPrice > 0 && (
                                    <span className="text-xs text-green-600 dark:text-green-400 ml-2">
                                      +{((product.price - product.buyingPrice) / product.price * 100).toFixed(0)}%
                                    </span>
                                  )}
                                </div>
                              </div>
                              {product.stock !== undefined && (
                                <p className="text-xs text-gray-500 dark:text-gray-400">Stock: {product.stock}</p>
                              )}
                            </button>
                          ))}
                          <button 
                            type="button" 
                            onClick={() => { setShowProductDropdown(false); setShowCreateProductModal(true); }} 
                            className="w-full text-left px-3 py-2 border-t border-gray-200 dark:border-gray-700 text-cyan-600 dark:text-cyan-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                          >
                            <Plus className="w-4 h-4 inline mr-2" /> Create New Product
                          </button>
                        </div>
                      )}
                    </div>
                    
                    {/* Custom Name Input */}
                    <input 
                      type="text" 
                      placeholder="Custom name (optional)" 
                      className="flex-1 min-w-[150px] px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-cyan-500"
                      value={tempItem.name}
                      onChange={(e) => setTempItem({ ...tempItem, name: e.target.value })}
                    />
                    
                    <input 
                      type="number" 
                      placeholder="Qty" 
                      className="w-20 px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-cyan-500 text-center" 
                      value={tempItem.qty} 
                      onChange={(e) => setTempItem({ ...tempItem, qty: Number(e.target.value) })} 
                      min="1" 
                    />
                    
                    <input 
                      type="number" 
                      placeholder="Custom price" 
                      className="w-32 px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-cyan-500" 
                      value={tempItem.customPrice || ''} 
                      onChange={(e) => setTempItem({ ...tempItem, customPrice: e.target.value ? Number(e.target.value) : null })} 
                      step="10"
                      min="0"
                    />
                    
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-600 dark:text-gray-400">Taxable</span>
                      <button 
                        type="button" 
                        onClick={() => setTempItem({ ...tempItem, taxable: !tempItem.taxable })} 
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${tempItem.taxable ? 'bg-cyan-600' : 'bg-gray-300 dark:bg-gray-600'}`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${tempItem.taxable ? 'translate-x-6' : 'translate-x-1'}`} />
                      </button>
                    </div>
                    
                    <button 
                      type="button" 
                      onClick={addItem} 
                      disabled={!tempItem.productId} 
                      className="p-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Items List */}
                {formData.items.length > 0 && (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 dark:bg-gray-800/50">
                        <tr>
                          <th className="px-3 py-2 text-left text-gray-600 dark:text-gray-400">Product Name</th>
                          <th className="px-3 py-2 text-center w-16 text-gray-600 dark:text-gray-400">Qty</th>
                          <th className="px-3 py-2 text-right w-24 text-gray-600 dark:text-gray-400">Price</th>
                          <th className="px-3 py-2 text-right w-28 text-gray-600 dark:text-gray-400">Total</th>
                          <th className="px-3 py-2 text-center w-20 text-gray-600 dark:text-gray-400">Taxable</th>
                          <th className="px-3 py-2 text-center w-10"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {formData.items.map((item, idx) => {
                          const product = products.find(p => p._id === item.productId);
                          const price = item.customPrice || product?.price || 0;
                          const itemTotal = price * item.qty;
                          return (
                            <tr key={idx} className="border-t dark:border-gray-800">
                              <td className="px-3 py-2">
                                <input
                                  type="text"
                                  value={item.name || product?.name || ''}
                                  onChange={(e) => updateItemName(idx, e.target.value)}
                                  className="w-full px-2 py-1 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-800 font-medium text-gray-900 dark:text-white focus:ring-1 focus:ring-cyan-500"
                                  placeholder="Product name"
                                />
                                {product?.sku && <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{product.sku}</div>}
                              </td>
                              <td className="px-3 py-2">
                                <input 
                                  type="number" 
                                  value={item.qty} 
                                  onChange={(e) => updateItemQty(idx, Number(e.target.value))} 
                                  className="w-16 px-2 py-1 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-1 focus:ring-cyan-500 text-center" 
                                  min="1" 
                                />
                              </td>
                              <td className="px-3 py-2">
                                <input 
                                  type="number" 
                                  value={price} 
                                  onChange={(e) => updateItemPrice(idx, Number(e.target.value))} 
                                  className="w-24 px-2 py-1 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-1 focus:ring-cyan-500 text-right" 
                                />
                              </td>
                              <td className="px-3 py-2 text-right font-medium text-gray-900 dark:text-white">KES {itemTotal.toLocaleString()}</td>
                              <td className="px-3 py-2 text-center">
                                <button 
                                  type="button" 
                                  onClick={() => toggleItemTax(idx)} 
                                  className={`px-2 py-1 text-xs rounded transition-colors ${item.taxable ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'}`}
                                >
                                  {item.taxable ? 'Yes' : 'No'}
                                </button>
                              </td>
                              <td className="px-3 py-2 text-center">
                                <button type="button" onClick={() => removeItem(idx)} className="text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors">
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Transport Section */}
                <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
                  <button 
                    type="button" 
                    onClick={() => setShowTransport(!showTransport)} 
                    className="w-full flex items-center justify-between p-4 bg-amber-50/30 dark:bg-amber-950/20 hover:bg-amber-50/50 dark:hover:bg-amber-950/40 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Truck className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                      <span className="font-semibold text-gray-900 dark:text-white">Transport & Delivery</span>
                    </div>
                    {showTransport ? <EyeOff className="w-5 h-5 text-gray-500 dark:text-gray-400" /> : <EyeIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />}
                  </button>
                  {showTransport && (
                    <div className="p-5 space-y-4 border-t border-gray-200 dark:border-gray-700">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Transport Cost (KES)</label>
                          <input 
                            type="number" 
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-cyan-500" 
                            value={formData.transportCost} 
                            onChange={(e) => setFormData({ ...formData, transportCost: Number(e.target.value) })} 
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                          <input 
                            type="text" 
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-cyan-500" 
                            placeholder="e.g., Door delivery" 
                            value={formData.transportDescription} 
                            onChange={(e) => setFormData({ ...formData, transportDescription: e.target.value })} 
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Estimated Delivery</label>
                        <input 
                          type="text" 
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-cyan-500" 
                          placeholder="e.g., 3-5 business days" 
                          value={formData.estimatedDelivery} 
                          onChange={(e) => setFormData({ ...formData, estimatedDelivery: e.target.value })} 
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Discount Section */}
                <div className="bg-gradient-to-r from-green-50/30 to-emerald-50/30 dark:from-green-950/20 dark:to-emerald-950/20 rounded-xl p-5 border border-green-100 dark:border-green-900/30">
                  <h3 className="font-semibold flex items-center gap-2 mb-3 text-gray-900 dark:text-white">
                    <Tag className="w-5 h-5 text-green-600 dark:text-green-400" /> Discount
                  </h3>
                  <div className="flex items-center gap-3">
                    <input 
                      type="number" 
                      value={formData.discount} 
                      onChange={(e) => setFormData({ ...formData, discount: Number(e.target.value) })} 
                      className="w-32 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-cyan-500" 
                      placeholder="0" 
                    />
                    <div className="flex gap-1">
                      <button 
                        type="button" 
                        onClick={() => setFormData({ ...formData, discountType: 'percentage' })} 
                        className={`px-4 py-2 rounded-lg text-sm transition-colors ${formData.discountType === 'percentage' ? 'bg-green-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
                      >
                        <Percent className="w-4 h-4 inline" /> %
                      </button>
                      <button 
                        type="button" 
                        onClick={() => setFormData({ ...formData, discountType: 'fixed' })} 
                        className={`px-4 py-2 rounded-lg text-sm transition-colors ${formData.discountType === 'fixed' ? 'bg-green-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
                      >
                        <DollarSign className="w-4 h-4 inline" /> KES
                      </button>
                    </div>
                  </div>
                </div>

                {/* Totals */}
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-900/50 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
                  <div className="space-y-2 text-gray-700 dark:text-gray-300">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span className="font-semibold text-gray-900 dark:text-white">KES {subtotal.toLocaleString()}</span>
                    </div>
                    {formData.transportCost > 0 && (
                      <div className="flex justify-between">
                        <span>Transport:</span>
                        <span className="text-amber-600 dark:text-amber-400">KES {formData.transportCost.toLocaleString()}</span>
                      </div>
                    )}
                    {discountAmount > 0 && (
                      <div className="flex justify-between text-green-600 dark:text-green-400">
                        <span>Discount:</span>
                        <span>-KES {discountAmount.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Tax ({taxRate * 100}%):</span>
                      <span>KES {tax.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t-2 border-gray-200 dark:border-gray-700">
                      <span className="text-lg font-bold text-gray-900 dark:text-white">Total:</span>
                      <span className="text-2xl font-bold text-cyan-600 dark:text-cyan-400">KES {total.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Notes & Terms */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes</label>
                    <textarea 
                      rows={3} 
                      placeholder="Additional notes..." 
                      value={formData.notes} 
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })} 
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-cyan-500" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Terms & Conditions</label>
                    <textarea 
                      rows={3} 
                      placeholder="Terms and conditions..." 
                      value={formData.terms} 
                      onChange={(e) => setFormData({ ...formData, terms: e.target.value })} 
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-cyan-500" 
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Valid Until</label>
                  <input 
                    type="date" 
                    required 
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-cyan-500" 
                    value={formData.validUntil} 
                    onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })} 
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button 
                    type="submit" 
                    className="flex-1 py-3 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-medium transition-colors"
                  >
                    <Save className="w-4 h-4 inline mr-2" /> {editingQuote ? 'Update Quotation' : 'Create Quotation'}
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setShowModal(false)} 
                    className="flex-1 py-3 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-gray-700 dark:text-gray-300"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ==================== VIEW MODAL ==================== */}
        {showViewModal && viewingQuote && (
          <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-900 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl dark:shadow-gray-950/50">
              <div className="p-6 border-b border-gray-200 dark:border-gray-800 sticky top-0 bg-white dark:bg-gray-900 flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Quotation Details</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{viewingQuote.quoteNumber}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handlePrintPDF(viewingQuote)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors text-gray-500 dark:text-gray-400">
                    <Printer className="w-5 h-5" />
                  </button>
                  <button onClick={() => handleSendEmail(viewingQuote._id)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors text-gray-500 dark:text-gray-400">
                    <Send className="w-5 h-5" />
                  </button>
                  <button onClick={() => setShowViewModal(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors text-gray-500 dark:text-gray-400">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                    <h3 className="font-semibold flex items-center gap-2 mb-3 text-gray-900 dark:text-white">
                      <User className="w-4 h-4" /> Customer
                    </h3>
                    <div className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
                      <p><strong>Name:</strong> {viewingQuote.customerName}</p>
                      {viewingQuote.customerEmail && <p><strong>Email:</strong> {viewingQuote.customerEmail}</p>}
                      {viewingQuote.customerPhone && <p><strong>Phone:</strong> {viewingQuote.customerPhone}</p>}
                    </div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                    <h3 className="font-semibold flex items-center gap-2 mb-3 text-gray-900 dark:text-white">
                      <Calendar className="w-4 h-4" /> Information
                    </h3>
                    <div className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
                      <p><strong>Status:</strong> {viewingQuote.status}</p>
                      <p><strong>Created:</strong> {new Date(viewingQuote.createdAt).toLocaleDateString()}</p>
                      <p><strong>Valid Until:</strong> {new Date(viewingQuote.validUntil).toLocaleDateString()}</p>
                      {(viewingQuote as any).invoiceId && (
                        <p><strong>Invoice:</strong> {(viewingQuote as any).invoiceNumber || (viewingQuote as any).invoiceId}</p>
                      )}
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-3 text-gray-900 dark:text-white">Items</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 dark:bg-gray-800/50">
                        <tr>
                          <th className="px-4 py-2 text-left text-gray-600 dark:text-gray-400">Item</th>
                          <th className="px-4 py-2 text-center text-gray-600 dark:text-gray-400">Qty</th>
                          <th className="px-4 py-2 text-right text-gray-600 dark:text-gray-400">Unit Price</th>
                          <th className="px-4 py-2 text-right text-gray-600 dark:text-gray-400">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {viewingQuote.items.map((item, idx) => (
                          <tr key={idx} className="border-t border-gray-200 dark:border-gray-800">
                            <td className="px-4 py-2 text-gray-900 dark:text-white">{item.name}</td>
                            <td className="px-4 py-2 text-center text-gray-700 dark:text-gray-300">{item.qty}</td>
                            <td className="px-4 py-2 text-right text-gray-700 dark:text-gray-300">KES {item.price.toLocaleString()}</td>
                            <td className="px-4 py-2 text-right font-semibold text-gray-900 dark:text-white">KES {(item.price * item.qty).toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <div className="space-y-2 text-right max-w-md ml-auto text-gray-700 dark:text-gray-300">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>KES {viewingQuote.subtotal?.toLocaleString() || 0}</span>
                    </div>
                    {(viewingQuote as any).transportCost > 0 && (
                      <div className="flex justify-between">
                        <span>Transport:</span>
                        <span>KES {(viewingQuote as any).transportCost.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Tax (16%):</span>
                      <span>KES {viewingQuote.tax?.toLocaleString() || 0}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t-2 border-gray-200 dark:border-gray-700">
                      <span className="text-lg font-bold text-gray-900 dark:text-white">Total:</span>
                      <span className="text-2xl font-bold text-cyan-600 dark:text-cyan-400">KES {viewingQuote.total?.toLocaleString() || 0}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================== EXPORT MODAL ==================== */}
        {showReportModal && (
          <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-900 rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl dark:shadow-gray-950/50">
              <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center sticky top-0 bg-white dark:bg-gray-900">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Export Quotations Report</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Download detailed quotations data as CSV</p>
                </div>
                <button onClick={() => setShowReportModal(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-500 dark:text-gray-400">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-6 space-y-6">
                {/* Export Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Export Type</label>
                  <div className="grid grid-cols-1 gap-2">
                    <button
                      onClick={() => setExportType('filtered')}
                      className={`p-3 rounded-lg border text-left transition ${
                        exportType === 'filtered' 
                          ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-900/20' 
                          : 'border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                      }`}
                    >
                      <div className="font-medium text-gray-900 dark:text-white">Current View</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        Export quotations currently displayed ({quotations.length} quotations)
                      </div>
                    </button>
                    <button
                      onClick={() => setExportType('all')}
                      className={`p-3 rounded-lg border text-left transition ${
                        exportType === 'all' 
                          ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-900/20' 
                          : 'border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                      }`}
                    >
                      <div className="font-medium text-gray-900 dark:text-white">All Quotations</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        Export all quotations ({totalQuotations} total)
                      </div>
                    </button>
                    <button
                      onClick={() => setExportType('dateRange')}
                      className={`p-3 rounded-lg border text-left transition ${
                        exportType === 'dateRange' 
                          ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-900/20' 
                          : 'border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                      }`}
                    >
                      <div className="font-medium text-gray-900 dark:text-white">Custom Date Range</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        Select specific date range
                      </div>
                    </button>
                  </div>
                </div>

                {/* Date Range */}
                {exportType === 'dateRange' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Start Date</label>
                      <input
                        type="date"
                        value={reportStartDate}
                        onChange={(e) => setReportStartDate(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-cyan-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">End Date</label>
                      <input
                        type="date"
                        value={reportEndDate}
                        onChange={(e) => setReportEndDate(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-cyan-500"
                      />
                    </div>
                  </div>
                )}

                {/* Status Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Filter by Status (Optional)</label>
                  <select
                    value={exportStatusFilter}
                    onChange={(e) => setExportStatusFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-cyan-500"
                  >
                    <option value="">All Status</option>
                    <option value="draft">Draft</option>
                    <option value="sent">Sent</option>
                    <option value="accepted">Accepted</option>
                    <option value="rejected">Rejected</option>
                    <option value="expired">Expired</option>
                  </select>
                </div>

                {/* Export Button */}
                <button
                  onClick={handleExportQuotations}
                  disabled={exportLoading || (exportType === 'dateRange' && (!reportStartDate || !reportEndDate))}
                  className="w-full px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {exportLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Exporting...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      Export CSV
                    </>
                  )}
                </button>

                <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                  CSV will include: Quote #, Customer, Email, Phone, Location, Items, Subtotal, Tax, Discount, Transport, Total, Status, Valid Until, Created Date, Sent Date, Accepted Date, Invoice #, Profit, Profit Margin, Created By
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ==================== CREATE PRODUCT MODAL ==================== */}
        <CreateProductModal 
          isOpen={showCreateProductModal} 
          onClose={() => setShowCreateProductModal(false)} 
          onProductCreated={handleProductCreated} 
          categories={categories} 
        />
      </div>
    </div>
  );
}