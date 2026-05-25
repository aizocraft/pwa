// app/sales/quotations/page.tsx
'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
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
  X, Save,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Filter,
  Tag,
  Users,
  DollarSign,
  Percent,
  Shield,
  AlertCircle,
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
  stock: number;
  category?: string;
  categoryId?: string;
  images?: Array<{ url: string }>;
  description?: string;
  sku?: string;
}

interface QuotationItemWithTax {
  productId: string;
  qty: number;
  customPrice?: number;
  taxable: boolean;
}

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
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);
  const [creatingCustomer, setCreatingCustomer] = useState(false);
  const itemsPerPage = 10;

  // Product search/filter states
  const [productSearchTerm, setProductSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [showProductDropdown, setShowProductDropdown] = useState(false);

  // Customer search state
  const [customerSearchTerm, setCustomerSearchTerm] = useState('');
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [showAddCustomerForm, setShowAddCustomerForm] = useState(false);
  
  // New customer form
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
  });

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
  });

  useEffect(() => {
    fetchData();
    fetchCategories();
  }, [searchTerm, statusFilter, currentPage]);

  useEffect(() => {
    if (showModal) {
      fetchProducts();
    }
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

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories?limit=100');
      if (response.data.categories) {
        setCategories(response.data.categories);
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      const params: any = { limit: 100 };
      if (productSearchTerm) params.search = productSearchTerm;
      if (selectedCategory) params.category = selectedCategory;
      const response = await listProducts(params);
      setProducts(response.products || []);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [quotesRes, customersRes] = await Promise.all([
        listSalesQuotations({
          search: searchTerm || undefined,
          status: statusFilter || undefined,
          page: currentPage,
          limit: itemsPerPage,
        }),
        listSalesCustomers({ limit: 100 }),
      ]);
      setQuotations(quotesRes.quotations);
      setTotalPages(quotesRes.pagination?.pages || 1);
      setCustomers(customersRes.customers);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  // Filter customers based on search
  const filteredCustomers = useMemo(() => {
    if (!customerSearchTerm) return customers;
    const term = customerSearchTerm.toLowerCase();
    return customers.filter(c => 
      c.name.toLowerCase().includes(term) ||
      (c.email && c.email.toLowerCase().includes(term)) ||
      (c.phone && c.phone.includes(term))
    );
  }, [customers, customerSearchTerm]);

  // Filter products based on search and category
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(productSearchTerm.toLowerCase()) ||
                           (product.sku && product.sku.toLowerCase().includes(productSearchTerm.toLowerCase()));
      const matchesCategory = !selectedCategory || product.category === selectedCategory || product.categoryId === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, productSearchTerm, selectedCategory]);

  // Create new customer
  const handleCreateCustomer = async () => {
    if (!newCustomer.name.trim()) {
      toast.error('Customer name is required');
      return;
    }

    setCreatingCustomer(true);
    try {
      const response = await api.post('/sales/customers', newCustomer);
      const createdCustomer = response.data.customer;
      setCustomers([createdCustomer, ...customers]);
      setFormData({ ...formData, customerId: createdCustomer._id });
      setCustomerSearchTerm(createdCustomer.name);
      setShowAddCustomerForm(false);
      setNewCustomer({ name: '', email: '', phone: '', location: '' });
      toast.success('Customer created successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to create customer');
    } finally {
      setCreatingCustomer(false);
    }
  };

  const calculateTotals = useCallback(() => {
    let subtotal = 0;
    let totalTax = 0;
    
    for (const item of formData.items) {
      const product = products.find((p) => p._id === item.productId);
      const price = item.customPrice || product?.price || 0;
      const itemTotal = price * item.qty;
      subtotal += itemTotal;
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

    return { subtotal, discountAmount, tax, total };
  }, [formData.items, formData.discount, formData.discountType, formData.transportCost, formData.taxPerItem, products, taxRate]);

  const { subtotal, discountAmount, tax, total } = calculateTotals();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.items.length === 0) {
      toast.error('Please add at least one item');
      return;
    }
    if (!formData.customerId) {
      toast.error('Please select a customer');
      return;
    }

    try {
      const payload = {
        customerId: formData.customerId,
        items: formData.items.map(item => ({
          productId: item.productId,
          qty: item.qty,
          customPrice: item.customPrice,
          taxable: item.taxable,
        })),
        discount: formData.discount,
        discountType: formData.discountType,
        notes: formData.notes,
        terms: formData.terms,
        validUntil: formData.validUntil,
        taxPerItem: formData.taxPerItem,
        transport: {
          cost: formData.transportCost,
          description: formData.transportDescription,
        },
        estimatedDelivery: formData.estimatedDelivery,
      };

      if (editingQuote) {
        await updateSalesQuotation(editingQuote._id, {
          status: editingQuote.status,
          ...payload,
        });
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
      await acceptQuotation(id);
      toast.success('Quotation accepted and order created successfully');
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
      setQuotations(quotations.filter((q) => q._id !== id));
      toast.success('Quotation deleted successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Delete failed');
    }
  };

  const handleView = (quote: Quotation) => {
    setViewingQuote(quote);
    const customer = customers.find((c) => c._id === quote.customerId);
    setViewingCustomer(customer || null);
    setShowViewModal(true);
  };

  const handlePrintPDF = async (quote: Quotation) => {
    const customer = customers.find((c) => c._id === quote.customerId);
    if (!customer) {
      toast.error('Customer not found');
      return;
    }

    setIsGeneratingPDF(true);
    const loadingToast = toast.loading('Generating professional PDF...');

    try {
      const pdfBlob = await generateQuotationPDF(quote, customer, settings, logoUrl);
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Quotation-${quote.quoteNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success('PDF generated successfully!', { id: loadingToast });
    } catch (error) {
      console.error('PDF generation failed:', error);
      toast.error('Failed to generate PDF. Please try again.', { id: loadingToast });
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const resetForm = () => {
    setEditingQuote(null);
    setProductSearchTerm('');
    setSelectedCategory('');
    setCustomerSearchTerm('');
    setShowAddCustomerForm(false);
    setFormData({
      customerId: '',
      items: [],
      discount: 0,
      discountType: 'fixed',
      notes: '',
      terms: '',
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      transportCost: 0,
      transportDescription: '',
      estimatedDelivery: '',
      taxPerItem: false,
    });
    setTempItem({ productId: '', qty: 1, customPrice: null, taxable: true });
    setNewCustomer({ name: '', email: '', phone: '', location: '' });
  };

  const addItem = () => {
    if (!tempItem.productId || tempItem.qty <= 0) return;
    const product = products.find((p) => p._id === tempItem.productId);
    if (product) {
      setFormData((prev) => ({
        ...prev,
        items: [
          ...prev.items,
          {
            productId: tempItem.productId,
            qty: tempItem.qty,
            customPrice: tempItem.customPrice || undefined,
            taxable: tempItem.taxable,
          },
        ],
      }));
      setTempItem({ productId: '', qty: 1, customPrice: null, taxable: true });
      setProductSearchTerm('');
      setShowProductDropdown(false);
    }
  };

  const removeItem = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const updateItemQty = (index: number, qty: number) => {
    const newItems = [...formData.items];
    newItems[index].qty = qty;
    setFormData((prev) => ({ ...prev, items: newItems }));
  };

  const updateItemPrice = (index: number, price: number) => {
    const newItems = [...formData.items];
    newItems[index].customPrice = price;
    setFormData((prev) => ({ ...prev, items: newItems }));
  };

  const toggleItemTax = (index: number) => {
    const newItems = [...formData.items];
    newItems[index].taxable = !newItems[index].taxable;
    setFormData((prev) => ({ ...prev, items: newItems }));
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      draft: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
      sent: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      accepted: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      rejected: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      expired: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      converted: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    };
    return colors[status] || 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted':
        return <CheckCircle className="w-4 h-4" />;
      case 'rejected':
        return <XCircle className="w-4 h-4" />;
      case 'expired':
        return <Clock className="w-4 h-4" />;
      case 'sent':
        return <Send className="w-4 h-4" />;
      case 'converted':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-12 h-12 animate-spin text-cyan-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900">
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Quotations</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Create and manage quotes with automatic order conversion on acceptance
            </p>
          </div>
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white rounded-lg font-medium flex items-center gap-2 transition-all duration-300 shadow-md hover:shadow-lg"
          >
            <Plus className="w-4 h-4" />
            Create Quotation
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by quote # or customer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-cyan-500"
          >
            <option value="">All Status</option>
            <option value="draft">Draft</option>
            <option value="sent">Sent</option>
            <option value="accepted">Accepted</option>
            <option value="rejected">Rejected</option>
            <option value="expired">Expired</option>
            <option value="converted">Converted</option>
          </select>
          <button
            onClick={fetchData}
            className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Quotations Table */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Quote #</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Items</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Subtotal</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Transport</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Valid Until</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                {quotations.map((quote) => (
                  <tr key={quote._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{quote.quoteNumber}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{quote.customerName}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{quote.customerEmail}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{quote.items.length} items</p>
                        <div className="mt-1 space-y-0.5">
                          {quote.items.slice(0, 2).map((item: any, idx: number) => (
                            <p key={idx} className="text-xs text-gray-500 dark:text-gray-400">
                              {item.qty}x {item.name}
                            </p>
                          ))}
                          {quote.items.length > 2 && (
                            <p className="text-xs text-gray-400 dark:text-gray-500">+{quote.items.length - 2} more</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">KES {quote.subtotal?.toLocaleString() || 0}</td>
                    <td className="px-6 py-4 text-sm text-amber-600 dark:text-amber-400">KES {(quote as any).transportCost?.toLocaleString() || 0}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white">KES {quote.total?.toLocaleString() || 0}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(quote.status)}`}>
                        {getStatusIcon(quote.status)}
                        {quote.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{new Date(quote.validUntil).toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button onClick={() => handleView(quote)} className="p-1.5 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors" title="View">
                          <Eye className="w-4 h-4 text-blue-500" />
                        </button>
                        <button
                          onClick={() => handleSendEmail(quote._id)}
                          disabled={quote.status === 'converted' || sendingId === quote._id}
                          className={`p-1.5 rounded-lg transition-colors ${
                            quote.status !== 'converted' ? 'hover:bg-green-100 dark:hover:bg-green-900/30' : 'opacity-50 cursor-not-allowed'
                          }`}
                          title="Send Email"
                        >
                          {sendingId === quote._id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 text-green-500" />}
                        </button>
                        <button
                          onClick={() => handlePrintPDF(quote)}
                          disabled={isGeneratingPDF}
                          className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                          title="Download PDF"
                        >
                          <Printer className="w-4 h-4 text-gray-500" />
                        </button>
                        <button
                          onClick={() => {
                            setEditingQuote(quote);
                            setFormData({
                              customerId: quote.customerId,
                              items: quote.items.map((i: any) => ({
                                productId: i.productId,
                                qty: i.qty,
                                customPrice: i.customPrice ? i.price : undefined,
                                taxable: i.taxable !== false,
                              })),
                              discount: quote.discount,
                              discountType: quote.discountType,
                              notes: quote.notes || '',
                              terms: quote.terms || '',
                              validUntil: quote.validUntil.split('T')[0],
                              transportCost: (quote as any).transportCost || 0,
                              transportDescription: (quote as any).transportDescription || '',
                              estimatedDelivery: (quote as any).estimatedDelivery || '',
                              taxPerItem: (quote as any).taxPerItem || false,
                            });
                            setShowModal(true);
                          }}
                          className="p-1.5 hover:bg-yellow-100 dark:hover:bg-yellow-900/30 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4 text-yellow-500" />
                        </button>
                        {(quote.status === 'sent' || quote.status === 'draft') && (
                          <button
                            onClick={() => handleAccept(quote._id)}
                            disabled={acceptingId === quote._id}
                            className="p-1.5 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-lg transition-colors"
                            title="Accept & Convert to Order"
                          >
                            {acceptingId === quote._id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4 text-green-500" />}
                          </button>
                        )}
                        {quote.status !== 'converted' && quote.status !== 'accepted' && (
                          <button
                            onClick={() => handleDelete(quote._id)}
                            className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border rounded-lg disabled:opacity-50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border rounded-lg disabled:opacity-50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Create/Edit Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-900 rounded-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="p-6 border-b border-gray-200 dark:border-gray-800 sticky top-0 bg-white dark:bg-gray-900 flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {editingQuote ? 'Edit Quotation' : 'Create Quotation'}
                </h2>
                <button onClick={() => setShowModal(false)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Customer Selection with Search and Add New */}
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-4 bg-gradient-to-r from-indigo-50/30 to-purple-50/30 dark:from-gray-800/30 dark:to-gray-800/30">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Users className="w-4 h-4 text-indigo-600" />
                    Customer Information
                    <span className="text-xs text-gray-500 ml-2">Search or add new customer</span>
                  </h3>
                  
                  {!showAddCustomerForm ? (
                    <>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search customer by name, email or phone..."
                          value={customerSearchTerm}
                          onChange={(e) => {
                            setCustomerSearchTerm(e.target.value);
                            setShowCustomerDropdown(true);
                          }}
                          onFocus={() => setShowCustomerDropdown(true)}
                          className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                        
                        {/* Customer Dropdown */}
                        {showCustomerDropdown && customerSearchTerm && (
                          <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                            {filteredCustomers.length > 0 ? (
                              <>
                                {filteredCustomers.map((customer) => (
                                  <button
                                    key={customer._id}
                                    type="button"
                                    onClick={() => {
                                      setFormData({ ...formData, customerId: customer._id });
                                      setCustomerSearchTerm(customer.name);
                                      setShowCustomerDropdown(false);
                                    }}
                                    className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                  >
                                    <div className="flex justify-between items-center">
                                      <div>
                                        <p className="text-sm font-medium text-gray-900 dark:text-white">{customer.name}</p>
                                        <div className="flex gap-3 text-xs text-gray-500">
                                          {customer.email && <span>{customer.email}</span>}
                                          {customer.phone && <span>{customer.phone}</span>}
                                        </div>
                                      </div>
                                      {formData.customerId === customer._id && (
                                        <CheckCircle className="w-4 h-4 text-green-500" />
                                      )}
                                    </div>
                                  </button>
                                ))}
                                <button
                                  type="button"
                                  onClick={() => setShowAddCustomerForm(true)}
                                  className="w-full text-left px-4 py-2 border-t border-gray-200 dark:border-gray-700 text-indigo-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                >
                                  <Plus className="w-4 h-4 inline mr-2" /> Add New Customer
                                </button>
                              </>
                            ) : (
                              <div className="px-4 py-3 text-center">
                                <p className="text-sm text-gray-500 mb-2">No customers found</p>
                                <button
                                  type="button"
                                  onClick={() => setShowAddCustomerForm(true)}
                                  className="text-indigo-600 text-sm font-medium"
                                >
                                  + Create New Customer
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      
                      {formData.customerId && (
                        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            <span className="text-sm font-medium text-green-700 dark:text-green-400">
                              Selected: {customers.find(c => c._id === formData.customerId)?.name}
                            </span>
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800">
                      <h4 className="font-medium text-gray-900 dark:text-white mb-3">New Customer</h4>
                      <div className="space-y-3">
                        <input
                          type="text"
                          placeholder="Full Name *"
                          value={newCustomer.name}
                          onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                          className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                        />
                        <div className="grid grid-cols-2 gap-3">
                          <input
                            type="email"
                            placeholder="Email"
                            value={newCustomer.email}
                            onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                            className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                          />
                          <input
                            type="tel"
                            placeholder="Phone"
                            value={newCustomer.phone}
                            onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                            className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                          />
                        </div>
                        <input
                          type="text"
                          placeholder="Location"
                          value={newCustomer.location}
                          onChange={(e) => setNewCustomer({ ...newCustomer, location: e.target.value })}
                          className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                        />
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={handleCreateCustomer}
                            disabled={creatingCustomer || !newCustomer.name}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 disabled:opacity-50"
                          >
                            {creatingCustomer ? <Loader2 className="w-4 h-4 animate-spin inline" /> : 'Create Customer'}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setShowAddCustomerForm(false);
                              setNewCustomer({ name: '', email: '', phone: '', location: '' });
                            }}
                            className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Product Selection with Search and Category Filter */}
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-4 bg-gradient-to-r from-blue-50/30 to-cyan-50/30 dark:from-gray-800/30 dark:to-gray-800/30">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Package className="w-4 h-4 text-cyan-600" />
                    Add Products
                    <span className="text-xs text-gray-500 ml-2">Search with category filter</span>
                  </h3>
                  
                  {/* Search and Filter Row */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {/* Product Search Input */}
                    <div className="relative md:col-span-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search products..."
                        value={productSearchTerm}
                        onChange={(e) => {
                          setProductSearchTerm(e.target.value);
                          setShowProductDropdown(true);
                        }}
                        onFocus={() => setShowProductDropdown(true)}
                        className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                      />
                    </div>
                    
                    {/* Category Filter */}
                    <div className="relative">
                      <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-cyan-500"
                      >
                        <option value="">All Categories</option>
                        {categories.map((cat) => (
                          <option key={cat._id} value={cat._id}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    {/* Quantity */}
                    <input
                      type="number"
                      placeholder="Quantity"
                      className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-cyan-500"
                      value={tempItem.qty}
                      onChange={(e) => setTempItem({ ...tempItem, qty: Number(e.target.value) })}
                      min="1"
                    />
                  </div>
                  
                  {/* Product Dropdown */}
                  {showProductDropdown && (productSearchTerm || selectedCategory) && (
                    <div className="relative">
                      <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {filteredProducts.length > 0 ? (
                          filteredProducts.map((product) => (
                            <button
                              key={product._id}
                              type="button"
                              onClick={() => {
                                setTempItem({ ...tempItem, productId: product._id });
                                setProductSearchTerm(product.name);
                                setShowProductDropdown(false);
                              }}
                              className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex justify-between items-center"
                            >
                              <div>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">{product.name}</p>
                                {product.sku && <p className="text-xs text-gray-500">SKU: {product.sku}</p>}
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-semibold text-cyan-600">KES {product.price.toLocaleString()}</p>
                                <p className="text-xs text-gray-500">Stock: {product.stock}</p>
                              </div>
                            </button>
                          ))
                        ) : (
                          <div className="px-4 py-3 text-sm text-gray-500 text-center">No products found</div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* Custom Price and Tax Toggle Row */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <input
                      type="number"
                      placeholder="Custom Price (optional)"
                      className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-cyan-500"
                      value={tempItem.customPrice || ''}
                      onChange={(e) => setTempItem({ ...tempItem, customPrice: e.target.value ? Number(e.target.value) : null })}
                    />
                    
                    {/* Tax Toggle Switch */}
                    <div className="flex items-center gap-3 px-3 py-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Taxable:</span>
                      <button
                        type="button"
                        onClick={() => setTempItem({ ...tempItem, taxable: !tempItem.taxable })}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 ${
                          tempItem.taxable ? 'bg-cyan-600' : 'bg-gray-300 dark:bg-gray-600'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            tempItem.taxable ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                      <span className={`text-xs ${tempItem.taxable ? 'text-cyan-600 font-medium' : 'text-gray-400'}`}>
                        {tempItem.taxable ? 'VAT applies' : 'No VAT'}
                      </span>
                    </div>
                    
                    <button
                      type="button"
                      onClick={addItem}
                      disabled={!tempItem.productId}
                      className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-lg hover:from-cyan-700 hover:to-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Plus className="w-4 h-4 inline mr-1" /> Add Item
                    </button>
                  </div>
                </div>

                {/* Items List */}
                {formData.items.length > 0 && (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 dark:bg-gray-800">
                        <tr>
                          <th className="px-4 py-2 text-left text-sm">Product</th>
                          <th className="px-4 py-2 text-center text-sm">Qty</th>
                          <th className="px-4 py-2 text-right text-sm">Unit Price</th>
                          {formData.taxPerItem && <th className="px-4 py-2 text-center text-sm">Tax</th>}
                          <th className="px-4 py-2 text-right text-sm">Total</th>
                          <th className="px-4 py-2 text-center text-sm"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {formData.items.map((item, idx) => {
                          const product = products.find((p) => p._id === item.productId);
                          const price = item.customPrice || product?.price || 0;
                          const itemTotal = price * item.qty;
                          const itemTax = (formData.taxPerItem && item.taxable) ? itemTotal * taxRate : 0;
                          return (
                            <tr key={idx} className="border-t dark:border-gray-800">
                              <td className="px-4 py-2">
                                {product?.name}
                                {item.customPrice && <span className="text-xs text-blue-500 ml-2">(Custom)</span>}
                              </td>
                              <td className="px-4 py-2 text-center">
                                <input
                                  type="number"
                                  value={item.qty}
                                  onChange={(e) => updateItemQty(idx, Number(e.target.value))}
                                  className="w-20 px-2 py-1 border border-gray-300 dark:border-gray-700 rounded text-center bg-white dark:bg-gray-800"
                                  min="1"
                                />
                              </td>
                              <td className="px-4 py-2 text-right">
                                <input
                                  type="number"
                                  value={price}
                                  onChange={(e) => updateItemPrice(idx, Number(e.target.value))}
                                  className="w-32 px-2 py-1 border border-gray-300 dark:border-gray-700 rounded text-right bg-white dark:bg-gray-800"
                                  min="0"
                                  step="any"
                                />
                               </td>
                               {formData.taxPerItem && (
                                 <td className="px-4 py-2 text-center">
                                   <div className="flex items-center justify-center gap-2">
                                     <button
                                       type="button"
                                       onClick={() => toggleItemTax(idx)}
                                       className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${
                                         item.taxable ? 'bg-cyan-600' : 'bg-gray-300 dark:bg-gray-600'
                                       }`}
                                     >
                                       <span
                                         className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                                           item.taxable ? 'translate-x-5' : 'translate-x-1'
                                         }`}
                                       />
                                     </button>
                                     <span className="text-xs text-gray-600 dark:text-gray-400">
                                       {item.taxable ? `+${Math.round(taxRate * 100)}%` : '0%'}
                                     </span>
                                   </div>
                                 </td>
                               )}
                              <td className="px-4 py-2">
                                <div className="text-right">
                                  <div className="text-sm font-mono text-gray-900">KES {itemTotal.toLocaleString()}</div>
                                  {formData.taxPerItem && item.taxable && (
                                    <div className="text-xs text-gray-500 mt-1">
                                      VAT: +KES {itemTax.toLocaleString()}
                                    </div>
                                  )}
                                </div>
                               </td>
                              <td className="px-4 py-2 text-center">
                                <button type="button" onClick={() => removeItem(idx)} className="text-red-500 hover:text-red-700">
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

                {/* Tax Per Item Toggle */}
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-800/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Shield className="w-5 h-5 text-purple-600" />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">Tax Calculation Method</p>
                        <p className="text-xs text-gray-500">Apply tax to each item individually or to the total after discount</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-gray-600">Tax per item</span>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, taxPerItem: !formData.taxPerItem })}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          formData.taxPerItem ? 'bg-purple-600' : 'bg-gray-300 dark:bg-gray-600'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            formData.taxPerItem ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Transport Box - Replaces Shipping Area */}
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-4 bg-gradient-to-r from-amber-50/30 to-orange-50/30 dark:from-gray-800/30 dark:to-gray-800/30">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Truck className="w-4 h-4 text-amber-600" />
                    Transport & Delivery
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Transport Cost (KES)</label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="number"
                          className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500"
                          value={formData.transportCost}
                          onChange={(e) => setFormData({ ...formData, transportCost: Number(e.target.value) })}
                          min="0"
                          step="100"
                          placeholder="0"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Transport Description (Optional)</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500"
                        placeholder="e.g., Door delivery, Freight charges, Courier, etc."
                        value={formData.transportDescription}
                        onChange={(e) => setFormData({ ...formData, transportDescription: e.target.value })}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Estimated Delivery Time</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500"
                      placeholder="e.g., 3-5 business days, 1 week, etc."
                      value={formData.estimatedDelivery}
                      onChange={(e) => setFormData({ ...formData, estimatedDelivery: e.target.value })}
                    />
                  </div>
                </div>

                {/* Discount Section */}
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-4 bg-gray-50 dark:bg-gray-800/50">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Tag className="w-4 h-4 text-green-600" />
                    Discount
                  </h3>
                  <div className="flex items-center gap-4 flex-wrap">
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={formData.discount}
                        onChange={(e) => setFormData({ ...formData, discount: Number(e.target.value) })}
                        className="w-32 px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                        min="0"
                        step={formData.discountType === 'percentage' ? 1 : 100}
                        placeholder="0"
                      />
                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, discountType: 'percentage' })}
                          className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                            formData.discountType === 'percentage'
                              ? 'bg-green-600 text-white'
                              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                          }`}
                        >
                          <Percent className="w-4 h-4 inline mr-1" /> %
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, discountType: 'fixed' })}
                          className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                            formData.discountType === 'fixed'
                              ? 'bg-green-600 text-white'
                              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                          }`}
                        >
                          <DollarSign className="w-4 h-4 inline mr-1" /> KES
                        </button>
                      </div>
                    </div>
                    {formData.discount > 0 && (
                      <div className="bg-green-100 dark:bg-green-900/30 rounded-lg px-3 py-2">
                        <span className="text-sm text-green-700 dark:text-green-400">
                          Customer saves: KES {discountAmount.toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Totals Summary */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-2">
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600 dark:text-gray-400">Subtotal:</span>
                    <span className="font-semibold">KES {subtotal.toLocaleString()}</span>
                  </div>
                  
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600 dark:text-gray-400">Transport:</span>
                    <span className="font-semibold text-amber-600">KES {formData.transportCost.toLocaleString()}</span>
                    {formData.transportDescription && (
                      <span className="text-xs text-gray-400 ml-2">({formData.transportDescription})</span>
                    )}
                  </div>
                  
                  {discountAmount > 0 && (
                    <div className="flex justify-between items-center py-2 text-green-600">
                      <span>Discount ({formData.discountType === 'percentage' ? `${formData.discount}%` : `KES ${formData.discount.toLocaleString()}`}):</span>
                      <span>- KES {discountAmount.toLocaleString()}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600 dark:text-gray-400">Tax ({Math.round(taxRate * 100)}% VAT{formData.taxPerItem ? ' - per item' : ''}):</span>
                    <span>KES {tax.toLocaleString()}</span>
                  </div>
                  
                  <div className="flex justify-between items-center pt-3 mt-2 border-t-2 border-gray-200 dark:border-gray-700">
                    <span className="text-lg font-bold text-gray-900 dark:text-white">Total:</span>
                    <span className="text-2xl font-bold text-cyan-600">KES {total.toLocaleString()}</span>
                  </div>
                </div>

                {/* Notes and Terms */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes</label>
                    <textarea
                      rows={3}
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      placeholder="Additional notes for customer..."
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Terms & Conditions</label>
                    <textarea
                      rows={3}
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      placeholder="Payment terms, delivery policy, warranty, etc."
                      value={formData.terms}
                      onChange={(e) => setFormData({ ...formData, terms: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Valid Until</label>
                  <input
                    type="date"
                    required
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    value={formData.validUntil}
                    onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-lg hover:from-cyan-700 hover:to-blue-700 transition-all flex items-center justify-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    {editingQuote ? 'Update Quotation' : 'Save Draft'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* View Quotation Modal */}
        {showViewModal && viewingQuote && viewingCustomer && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-900 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="p-6 border-b border-gray-200 dark:border-gray-800 sticky top-0 bg-white dark:bg-gray-900 flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Quotation Details</h2>
                  <p className="text-sm text-gray-500">{viewingQuote.quoteNumber}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handlePrintPDF(viewingQuote)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg" title="Download PDF">
                    <Printer className="w-5 h-5" />
                  </button>
                  <button onClick={() => handleSendEmail(viewingQuote._id)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg" title="Send">
                    <Send className="w-5 h-5" />
                  </button>
                  <button onClick={() => setShowViewModal(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                    <h3 className="font-semibold flex items-center gap-2 mb-3">
                      <User className="w-4 h-4" /> Customer Information
                    </h3>
                    <div className="space-y-2 text-sm">
                      <p><strong>Name:</strong> {viewingQuote.customerName}</p>
                      {viewingQuote.customerEmail && <p><strong>Email:</strong> {viewingQuote.customerEmail}</p>}
                      {viewingQuote.customerPhone && <p><strong>Phone:</strong> {viewingQuote.customerPhone}</p>}
                      {viewingCustomer.location && <p><strong>Location:</strong> {viewingCustomer.location}</p>}
                    </div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                    <h3 className="font-semibold flex items-center gap-2 mb-3">
                      <Calendar className="w-4 h-4" /> Quote Information
                    </h3>
                    <div className="space-y-2 text-sm">
                      <p><strong>Status:</strong> <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${getStatusColor(viewingQuote.status)}`}>{viewingQuote.status}</span></p>
                      <p><strong>Created:</strong> {new Date(viewingQuote.createdAt).toLocaleString()}</p>
                      <p><strong>Valid Until:</strong> {new Date(viewingQuote.validUntil).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>

                {/* Transport Info */}
                {(viewingQuote as any).transportCost > 0 && (
                  <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4">
                    <h3 className="font-semibold flex items-center gap-2 mb-3">
                      <Truck className="w-4 h-4" /> Transport Information
                    </h3>
                    <div className="space-y-1 text-sm">
                      <p><strong>Cost:</strong> KES {(viewingQuote as any).transportCost?.toLocaleString() || 0}</p>
                      {(viewingQuote as any).transportDescription && <p><strong>Description:</strong> {(viewingQuote as any).transportDescription}</p>}
                      {(viewingQuote as any).estimatedDelivery && <p><strong>Estimated Delivery:</strong> {(viewingQuote as any).estimatedDelivery}</p>}
                    </div>
                  </div>
                )}

                {/* Items Table */}
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Package className="w-4 h-4" /> Items
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 dark:bg-gray-800">
                        <tr>
                          <th className="px-4 py-2 text-left text-sm">Item</th>
                          <th className="px-4 py-2 text-left text-sm">Description</th>
                          <th className="px-4 py-2 text-center text-sm">Qty</th>
                          <th className="px-4 py-2 text-right text-sm">Unit Price</th>
                          {viewingQuote.taxPerItem && <th className="px-4 py-2 text-center text-sm">Tax</th>}
                          <th className="px-4 py-2 text-right text-sm">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {viewingQuote.items.map((item, idx) => {
                          const itemTotal = item.price * item.qty;
                          const isItemTaxable = (item as any).taxable !== false;
                          const itemTax = viewingQuote.taxPerItem && isItemTaxable ? itemTotal * viewingQuote.taxRate : 0;
                          return (
                            <tr key={idx} className="border-t dark:border-gray-800">
                              <td className="px-4 py-2">{item.name}</td>
                              <td className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">{item.description || '-'}</td>
                              <td className="px-4 py-2 text-center">{item.qty}</td>
                              <td className="px-4 py-2 text-right">
                                <div>KES {item.price.toLocaleString()}</div>
                              </td>
                              {viewingQuote.taxPerItem && (
                                <td className="px-4 py-2 text-center">
                                  <div className="flex items-center justify-center gap-1">
                                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${isItemTaxable ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'}`}>
                                      {isItemTaxable ? `${Math.round(viewingQuote.taxRate * 100)}%` : '0%'}
                                    </span>
                                  </div>
                                </td>
                              )}
                              <td className="px-4 py-2 text-right font-semibold">
                                <div>KES {itemTotal.toLocaleString()}</div>
                                {viewingQuote.taxPerItem && isItemTaxable && (
                                  <div className="text-xs text-gray-500 mt-1">VAT: +KES {itemTax.toLocaleString()}</div>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Totals */}
                <div className="border-t pt-4">
                  <div className="space-y-2 text-right">
                    <p className="flex justify-between"><span className="text-gray-600">Subtotal:</span><span className="font-semibold">KES {viewingQuote.subtotal?.toLocaleString() || 0}</span></p>
                    {viewingQuote.discount > 0 && <p className="flex justify-between text-green-600"><span>Discount ({viewingQuote.discountType === 'percentage' ? `${viewingQuote.discount}%` : `KES ${viewingQuote.discount}`}):</span><span>-KES {viewingQuote.discount.toLocaleString()}</span></p>}
                    {(viewingQuote as any).transportCost > 0 && <p className="flex justify-between"><span className="text-gray-600">Transport:</span><span className="font-semibold text-amber-600">KES {(viewingQuote as any).transportCost?.toLocaleString() || 0}</span></p>}
                    <p className="flex justify-between"><span className="text-gray-600">Tax ({Math.round(viewingQuote.taxRate * 100)}%{viewingQuote.taxPerItem ? ' - per item' : ''}):</span><span>KES {viewingQuote.tax?.toLocaleString() || 0}</span></p>
                    <div className="pt-2 mt-2 border-t-2 border-gray-200"><p className="flex justify-between text-lg font-bold"><span>Total:</span><span className="text-cyan-600">KES {viewingQuote.total?.toLocaleString() || 0}</span></p></div>
                  </div>
                </div>

                {viewingQuote.notes && <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4"><h3 className="font-semibold mb-2">Notes</h3><p className="text-sm">{viewingQuote.notes}</p></div>}
                {viewingQuote.terms && <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4"><h3 className="font-semibold mb-2">Terms & Conditions</h3><p className="text-sm">{viewingQuote.terms}</p></div>}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}