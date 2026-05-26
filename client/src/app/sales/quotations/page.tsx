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
  Filter,
  Tag,
  Users,
  DollarSign,
  Percent,
  Shield,
  AlertCircle,
  Download,
  TrendingUp,
  Settings,
  EyeOff,
  Eye as EyeIcon,
  Wallet,
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
import { RecordPaymentModal } from '../../../components/RecordPaymentModal';
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
  const [showTransport, setShowTransport] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportStartDate, setReportStartDate] = useState('');
  const [reportEndDate, setReportEndDate] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedOrderForPayment, setSelectedOrderForPayment] = useState<{
    id: string;
    number: string;
    total: number;
    amountPaid: number;
    balanceDue: number;
  } | null>(null);
  const itemsPerPage = 10;
  
  // Debounced search
  const searchTimeoutRef = useRef<NodeJS.Timeout>();

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

  // Debounced search handler
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => {
      setCurrentPage(1);
      fetchData();
    }, 500);
  };

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

  const fetchQuotationPaymentStatus = async (quotationId: string) => {
    try {
      const response = await api.get(`/payments/orders/${quotationId}`);
      return response.data;
    } catch {
      return { amountPaid: 0, balanceDue: 0 };
    }
  };

  // Export report
  const handleExportReport = async () => {
    if (!reportStartDate || !reportEndDate) {
      toast.error('Please select both start and end dates');
      return;
    }

    setIsExporting(true);
    try {
      const response = await api.get('/sales/quotations', {
        params: {
          startDate: reportStartDate,
          endDate: reportEndDate,
          limit: 1000,
        },
      });

      const filteredQuotes = response.data.quotations.filter((q: Quotation) => {
        const createdAt = new Date(q.createdAt);
        return createdAt >= new Date(reportStartDate) && createdAt <= new Date(reportEndDate);
      });

      const csvRows = [
        ['Quote/Invoice #', 'Customer', 'Date', 'Status', 'Subtotal', 'Transport', 'Tax', 'Total'],
        ...filteredQuotes.map((q: Quotation) => [
          q.invoiceNumber || q.quoteNumber,
          q.customerName,
          new Date(q.createdAt).toLocaleDateString(),
          q.status,
          q.subtotal?.toLocaleString() || '0',
          (q as any).transportCost?.toLocaleString() || '0',
          q.tax?.toLocaleString() || '0',
          q.total?.toLocaleString() || '0',
        ]),
      ];

      const csvContent = csvRows.map(row => row.join(',')).join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `quotations-report-${reportStartDate}-to-${reportEndDate}.csv`;
      link.click();
      URL.revokeObjectURL(url);
      
      toast.success(`Exported ${filteredQuotes.length} records`);
      setShowReportModal(false);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export report');
    } finally {
      setIsExporting(false);
    }
  };

  const filteredCustomers = useMemo(() => {
    if (!customerSearchTerm) return customers;
    const term = customerSearchTerm.toLowerCase();
    return customers.filter(c => 
      c.name.toLowerCase().includes(term) ||
      (c.email && c.email.toLowerCase().includes(term)) ||
      (c.phone && c.phone.includes(term))
    );
  }, [customers, customerSearchTerm]);

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(productSearchTerm.toLowerCase()) ||
                           (product.sku && product.sku.toLowerCase().includes(productSearchTerm.toLowerCase()));
      const matchesCategory = !selectedCategory || product.category === selectedCategory || product.categoryId === selectedCategory;
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
      const result = await acceptQuotation(id);
      toast.success(`Quotation accepted! ${result.invoiceNumber ? `Invoice: ${result.invoiceNumber}` : ''}`);
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to accept quotation');
    } finally {
      setAcceptingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this document? This action cannot be undone.')) return;
    try {
      await deleteSalesQuotation(id);
      setQuotations(quotations.filter((q) => q._id !== id));
      toast.success('Document deleted successfully');
      fetchData();
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
    const loadingToast = toast.loading('Generating PDF...');

    try {
      const pdfBlob = await generateQuotationPDF(quote, customer, settings, logoUrl);
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      const filename = quote.invoiceNumber 
        ? `Invoice-${quote.invoiceNumber}.pdf` 
        : `Quotation-${quote.quoteNumber}.pdf`;
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success('PDF generated!', { id: loadingToast });
    } catch (error) {
      console.error('PDF generation failed:', error);
      toast.error('Failed to generate PDF', { id: loadingToast });
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
    // Set valid until to 7 days from now (1 week)
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
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Quotations & Invoices</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Create and manage quotes. Quotes become invoices when accepted
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowReportModal(true)}
              className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-lg font-medium flex items-center gap-2 transition-all duration-300 shadow-md"
            >
              <Download className="w-4 h-4" />
              Export Report
            </button>
            <button
              onClick={() => {
                resetForm();
                setShowModal(true);
              }}
              className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white rounded-lg font-medium flex items-center gap-2 transition-all duration-300 shadow-md"
            >
              <Plus className="w-4 h-4" />
              Create Quotation
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              placeholder="Search by quote/invoice # or customer..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
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
            <option value="converted">Converted/Invoiced</option>
          </select>
          <button
            onClick={fetchData}
            className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <RefreshCw className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        {/* Quotations Table */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Document #</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Items</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                {quotations.map((quote) => (
                  <tr key={quote._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {quote.status === 'converted' ? (
                          <FileText className="w-4 h-4 text-purple-500" />
                        ) : (
                          <FileText className="w-4 h-4 text-gray-400" />
                        )}
                        <div>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {quote.status === 'converted' && quote.invoiceNumber ? quote.invoiceNumber : quote.quoteNumber}
                          </span>
                          {quote.status === 'converted' && quote.invoiceNumber && (
                            <div className="text-xs text-gray-400 dark:text-gray-500">Quote: {quote.quoteNumber}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{quote.customerName}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{quote.customerEmail}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{quote.items.length} items</td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white">KES {quote.total?.toLocaleString() || 0}</td>
                    <td className="px-6 py-4">
                      <div>
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(quote.status)}`}>
                          {getStatusIcon(quote.status)}
                          {quote.status === 'converted' ? 'Invoiced' : quote.status}
                        </span>
                        {/* Payment status for converted quotes */}
                        {quote.status === 'converted' && (
                          <div className="text-xs mt-1">
                            {quote.paymentStatus === 'paid' ? (
                              <span className="text-green-600 dark:text-green-400">✓ Paid</span>
                            ) : quote.paymentStatus === 'partially_paid' ? (
                              <span className="text-amber-600 dark:text-amber-400">
                                ⚡ Partially Paid (Balance: KES {quote.balanceDue?.toLocaleString()})
                              </span>
                            ) : (
                              <span className="text-red-600 dark:text-red-400">⚠ Unpaid</span>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{new Date(quote.createdAt).toLocaleDateString()}</td>
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
                          title={quote.status === 'converted' ? "Download Invoice" : "Download Quotation"}
                        >
                          <Printer className="w-4 h-4 text-gray-500" />
                        </button>
                        {/* Edit button - available for all except converted/invoiced */}
                        {quote.status !== 'converted' && (
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
                        )}
                        {/* Record Payment button - only for converted/invoiced quotes */}
                        {quote.status === 'converted' && (
                          <button
                            onClick={async () => {
                              const paymentInfo = await fetchQuotationPaymentStatus(quote._id);
                              setSelectedOrderForPayment({
                                id: quote._id,
                                number: quote.invoiceNumber || quote.quoteNumber,
                                total: quote.total,
                                amountPaid: paymentInfo.amountPaid || 0,
                                balanceDue: paymentInfo.balanceDue || quote.total,
                              });
                              setShowPaymentModal(true);
                            }}
                            className="p-1.5 hover:bg-amber-100 dark:hover:bg-amber-900/30 rounded-lg transition-colors"
                            title="Record Payment"
                          >
                            <Wallet className="w-4 h-4 text-amber-500" />
                          </button>
                        )}
                        {/* Delete button - always available with confirmation */}
                        <button
                          onClick={() => handleDelete(quote._id)}
                          className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                        {(quote.status === 'sent' || quote.status === 'draft') && (
                          <button
                            onClick={() => handleAccept(quote._id)}
                            disabled={acceptingId === quote._id}
                            className="p-1.5 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-lg transition-colors"
                            title="Accept & Convert to Invoice"
                          >
                            {acceptingId === quote._id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4 text-green-500" />}
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
                className="px-3 py-1 border border-gray-300 dark:border-gray-700 rounded-lg disabled:opacity-50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-700 dark:text-gray-300"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border border-gray-300 dark:border-gray-700 rounded-lg disabled:opacity-50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-700 dark:text-gray-300"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Create/Edit Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-900 rounded-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="p-6 border-b border-gray-200 dark:border-gray-800 sticky top-0 bg-white dark:bg-gray-900 flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    {editingQuote ? 'Edit Document' : 'Create New Document'}
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {editingQuote ? 'Update quotation details' : 'Fill in the details to create a new quotation'}
                  </p>
                </div>
                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                  <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Customer Selection */}
                <div className="bg-gradient-to-r from-indigo-50/50 to-purple-50/50 dark:from-gray-800/30 dark:to-gray-800/30 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
                  <h3 className="font-semibold flex items-center gap-2 mb-4 text-gray-900 dark:text-white">
                    <Users className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    Customer Information
                  </h3>
                  
                  {!showAddCustomerForm ? (
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                      <input
                        type="text"
                        placeholder="Search or select customer..."
                        value={customerSearchTerm}
                        onChange={(e) => {
                          setCustomerSearchTerm(e.target.value);
                          setShowCustomerDropdown(true);
                        }}
                        onFocus={() => setShowCustomerDropdown(true)}
                        className="w-full pl-9 pr-4 py-3 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                      
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
                                      <div className="flex gap-3 text-xs text-gray-500 dark:text-gray-400">
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
                                className="w-full text-left px-4 py-2 border-t border-gray-200 dark:border-gray-700 text-indigo-600 dark:text-indigo-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                              >
                                <Plus className="w-4 h-4 inline mr-2" /> Add New Customer
                              </button>
                            </>
                          ) : (
                            <div className="px-4 py-3 text-center">
                              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">No customers found</p>
                              <button
                                type="button"
                                onClick={() => setShowAddCustomerForm(true)}
                                className="text-indigo-600 dark:text-indigo-400 text-sm font-medium"
                              >
                                + Create New Customer
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800">
                      <h4 className="font-medium text-gray-900 dark:text-white mb-3">New Customer</h4>
                      <div className="space-y-3">
                        <input
                          type="text"
                          placeholder="Full Name *"
                          value={newCustomer.name}
                          onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                          className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                        />
                        <div className="grid grid-cols-2 gap-3">
                          <input
                            type="email"
                            placeholder="Email"
                            value={newCustomer.email}
                            onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                            className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                          />
                          <input
                            type="tel"
                            placeholder="Phone"
                            value={newCustomer.phone}
                            onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                            className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                          />
                        </div>
                        <input
                          type="text"
                          placeholder="Location"
                          value={newCustomer.location}
                          onChange={(e) => setNewCustomer({ ...newCustomer, location: e.target.value })}
                          className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                        />
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={handleCreateCustomer}
                            disabled={creatingCustomer || !newCustomer.name}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                          >
                            {creatingCustomer ? <Loader2 className="w-4 h-4 animate-spin inline" /> : 'Create Customer'}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setShowAddCustomerForm(false);
                              setNewCustomer({ name: '', email: '', phone: '', location: '' });
                            }}
                            className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-gray-700 dark:text-gray-300"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {formData.customerId && !showAddCustomerForm && (
                    <div className="mt-3 bg-green-50 dark:bg-green-900/20 rounded-lg p-2 px-3">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                        <span className="text-sm text-green-700 dark:text-green-400">
                          Customer: {customers.find(c => c._id === formData.customerId)?.name}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Product Selection with Category Filter */}
                <div className="bg-gradient-to-r from-blue-50/50 to-cyan-50/50 dark:from-gray-800/30 dark:to-gray-800/30 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
                  <h3 className="font-semibold flex items-center gap-2 mb-4 text-gray-900 dark:text-white">
                    <Package className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                    Add Products
                  </h3>
                  
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="relative flex-1 min-w-[200px]">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                      <input
                        type="text"
                        placeholder="Search products..."
                        value={productSearchTerm}
                        onChange={(e) => {
                          setProductSearchTerm(e.target.value);
                          setShowProductDropdown(true);
                        }}
                        onFocus={() => setShowProductDropdown(true)}
                        className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                      />
                      {showProductDropdown && (productSearchTerm || selectedCategory) && (
                        <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                          {filteredProducts.length > 0 ? (
                            filteredProducts.slice(0, 10).map((product) => (
                              <button
                                key={product._id}
                                type="button"
                                onClick={() => {
                                  setTempItem({ ...tempItem, productId: product._id });
                                  setProductSearchTerm(product.name);
                                  setShowProductDropdown(false);
                                }}
                                className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm text-gray-900 dark:text-white"
                              >
                                <div className="flex justify-between items-center">
                                  <span className="font-medium">{product.name}</span>
                                  <span className="text-xs text-gray-500 dark:text-gray-400">KES {product.price.toLocaleString()}</span>
                                </div>
                                {product.category && (
                                  <div className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Category: {product.category}</div>
                                )}
                              </button>
                            ))
                          ) : (
                            <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">No products found</div>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <select
                      value={selectedCategory}
                      onChange={(e) => {
                        setSelectedCategory(e.target.value);
                        setProductSearchTerm('');
                      }}
                      className="w-48 px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    >
                      <option value="">All Categories</option>
                      {categories.map((cat) => (
                        <option key={cat._id} value={cat._id}>{cat.name}</option>
                      ))}
                    </select>
                    
                    <input
                      type="number"
                      placeholder="Qty"
                      className="w-20 px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-center"
                      value={tempItem.qty}
                      onChange={(e) => setTempItem({ ...tempItem, qty: Number(e.target.value) })}
                      min="1"
                    />
                    
                    <input
                      type="number"
                      placeholder="Custom price"
                      className="w-32 px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                      value={tempItem.customPrice || ''}
                      onChange={(e) => setTempItem({ ...tempItem, customPrice: e.target.value ? Number(e.target.value) : null })}
                    />
                    
                    <div className="flex flex-col items-center">
                      <span className="text-xs text-gray-500 dark:text-gray-400 mb-1">Taxable</span>
                      <button
                        type="button"
                        onClick={() => setTempItem({ ...tempItem, taxable: !tempItem.taxable })}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          tempItem.taxable ? 'bg-cyan-600' : 'bg-gray-300 dark:bg-gray-600'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            tempItem.taxable ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                    
                    <button
                      type="button"
                      onClick={addItem}
                      disabled={!tempItem.productId}
                      className="p-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors disabled:opacity-50"
                      title="Add Item"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Items List */}
                {formData.items.length > 0 && (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 dark:bg-gray-800">
                        <tr>
                          <th className="px-3 py-2 text-left text-gray-700 dark:text-gray-300">Product</th>
                          <th className="px-3 py-2 text-center w-16 text-gray-700 dark:text-gray-300">Qty</th>
                          <th className="px-3 py-2 text-right w-24 text-gray-700 dark:text-gray-300">Price</th>
                          {formData.taxPerItem && <th className="px-3 py-2 text-center w-20 text-gray-700 dark:text-gray-300">Tax</th>}
                          <th className="px-3 py-2 text-right w-28 text-gray-700 dark:text-gray-300">Total</th>
                          <th className="px-3 py-2 text-center w-10"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {formData.items.map((item, idx) => {
                          const product = products.find((p) => p._id === item.productId);
                          const price = item.customPrice || product?.price || 0;
                          const itemTotal = price * item.qty;
                          return (
                            <tr key={idx} className="border-t dark:border-gray-800">
                              <td className="px-3 py-2">
                                <div className="text-gray-900 dark:text-white">{product?.name}</div>
                                {product?.category && <div className="text-xs text-gray-400">Category: {product.category}</div>}
                              </td>
                              <td className="px-3 py-2">
                                <input
                                  type="number"
                                  value={item.qty}
                                  onChange={(e) => updateItemQty(idx, Number(e.target.value))}
                                  className="w-16 px-2 py-1 border border-gray-300 dark:border-gray-700 rounded text-center bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                  min="1"
                                />
                              </td>
                              <td className="px-3 py-2">
                                <input
                                  type="number"
                                  value={price}
                                  onChange={(e) => updateItemPrice(idx, Number(e.target.value))}
                                  className="w-24 px-2 py-1 border border-gray-300 dark:border-gray-700 rounded text-right bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                  min="0"
                                />
                               </td>
                              {formData.taxPerItem && (
                                <td className="px-3 py-2 text-center">
                                  <button
                                    type="button"
                                    onClick={() => toggleItemTax(idx)}
                                    className={`px-2 py-1 text-xs rounded ${item.taxable ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'}`}
                                  >
                                    {item.taxable ? `${Math.round(taxRate * 100)}%` : '0%'}
                                  </button>
                                </td>
                              )}
                              <td className="px-3 py-2 text-right font-medium text-gray-900 dark:text-white">KES {itemTotal.toLocaleString()}</td>
                              <td className="px-3 py-2 text-center">
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

                {/* Tax Method Toggle */}
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Shield className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">Tax Calculation Method</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Apply tax per item or on total after discount</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-gray-700 dark:text-gray-300">Tax per item</span>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, taxPerItem: !formData.taxPerItem })}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          formData.taxPerItem ? 'bg-purple-600' : 'bg-gray-300 dark:bg-gray-600'
                        }`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.taxPerItem ? 'translate-x-6' : 'translate-x-1'}`} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Transport Section - Hidden by default */}
                <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setShowTransport(!showTransport)}
                    className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-amber-50/50 to-orange-50/50 dark:from-gray-800/30 dark:to-gray-800/30 hover:bg-amber-50 dark:hover:bg-gray-800/50 transition-colors"
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
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                            value={formData.transportCost}
                            onChange={(e) => setFormData({ ...formData, transportCost: Number(e.target.value) })}
                            min="0"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                          <input
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
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
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                          placeholder="e.g., 3-5 business days"
                          value={formData.estimatedDelivery}
                          onChange={(e) => setFormData({ ...formData, estimatedDelivery: e.target.value })}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Discount Section */}
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
                  <h3 className="font-semibold flex items-center gap-2 mb-3 text-gray-900 dark:text-white">
                    <Tag className="w-5 h-5 text-green-600 dark:text-green-400" />
                    Discount
                  </h3>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      value={formData.discount}
                      onChange={(e) => setFormData({ ...formData, discount: Number(e.target.value) })}
                      className="w-32 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      min="0"
                      placeholder="0"
                    />
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, discountType: 'percentage' })}
                        className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                          formData.discountType === 'percentage' 
                            ? 'bg-green-600 text-white' 
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        <Percent className="w-4 h-4 inline" /> %
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, discountType: 'fixed' })}
                        className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                          formData.discountType === 'fixed' 
                            ? 'bg-green-600 text-white' 
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        <DollarSign className="w-4 h-4 inline" /> KES
                      </button>
                    </div>
                  </div>
                </div>

                {/* Totals */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-2">
                  <div className="flex justify-between py-1">
                    <span className="text-gray-600 dark:text-gray-400">Subtotal:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">KES {subtotal.toLocaleString()}</span>
                  </div>
                  {formData.transportCost > 0 && (
                    <div className="flex justify-between py-1">
                      <span className="text-gray-600 dark:text-gray-400">Transport:</span>
                      <span className="text-amber-600 dark:text-amber-400">KES {formData.transportCost.toLocaleString()}</span>
                    </div>
                  )}
                  {discountAmount > 0 && (
                    <div className="flex justify-between py-1 text-green-600 dark:text-green-400">
                      <span>Discount:</span>
                      <span>-KES {discountAmount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between py-1">
                    <span className="text-gray-600 dark:text-gray-400">Tax ({Math.round(taxRate * 100)}%):</span>
                    <span className="text-gray-900 dark:text-white">KES {tax.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t-2 border-gray-200 dark:border-gray-700">
                    <span className="text-lg font-bold text-gray-900 dark:text-white">Total:</span>
                    <span className="text-2xl font-bold text-cyan-600 dark:text-cyan-400">KES {total.toLocaleString()}</span>
                  </div>
                </div>

                {/* Notes & Terms */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes</label>
                    <textarea 
                      rows={3} 
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400" 
                      value={formData.notes} 
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="Additional notes..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Terms & Conditions</label>
                    <textarea 
                      rows={3} 
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400" 
                      value={formData.terms} 
                      onChange={(e) => setFormData({ ...formData, terms: e.target.value })}
                      placeholder="Payment terms, delivery policy..."
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Valid Until</label>
                  <input 
                    type="date" 
                    required 
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white" 
                    value={formData.validUntil} 
                    onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })} 
                  />
                  <p className="text-xs text-gray-500 mt-1">Default: 1 week from today</p>
                </div>

                <div className="flex gap-3 pt-4">
                  <button type="submit" className="flex-1 py-3 bg-cyan-600 text-white rounded-lg font-medium hover:bg-cyan-700 transition-colors">
                    <Save className="w-4 h-4 inline mr-2" />
                    {editingQuote ? 'Update Document' : 'Create Document'}
                  </button>
                  <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-gray-700 dark:text-gray-300">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* View Modal */}
        {showViewModal && viewingQuote && viewingCustomer && (
          <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-900 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="p-6 border-b border-gray-200 dark:border-gray-800 sticky top-0 bg-white dark:bg-gray-900 flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    {viewingQuote.status === 'converted' ? 'Invoice Details' : 'Quotation Details'}
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {viewingQuote.status === 'converted' && viewingQuote.invoiceNumber ? viewingQuote.invoiceNumber : viewingQuote.quoteNumber}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handlePrintPDF(viewingQuote)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors" title="Download PDF">
                    <Printer className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </button>
                  <button onClick={() => handleSendEmail(viewingQuote._id)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors" title="Send Email">
                    <Send className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </button>
                  <button onClick={() => setShowViewModal(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                    <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                  </button>
                </div>
              </div>
              
              <div className="p-6 space-y-6">
                {/* Customer & Document Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                    <h3 className="font-semibold flex items-center gap-2 mb-3 text-gray-900 dark:text-white">
                      <User className="w-4 h-4" /> Customer Information
                    </h3>
                    <div className="space-y-2 text-sm">
                      <p className="text-gray-700 dark:text-gray-300"><strong className="text-gray-900 dark:text-white">Name:</strong> {viewingQuote.customerName}</p>
                      {viewingQuote.customerEmail && <p className="text-gray-700 dark:text-gray-300"><strong className="text-gray-900 dark:text-white">Email:</strong> {viewingQuote.customerEmail}</p>}
                      {viewingQuote.customerPhone && <p className="text-gray-700 dark:text-gray-300"><strong className="text-gray-900 dark:text-white">Phone:</strong> {viewingQuote.customerPhone}</p>}
                      {viewingCustomer?.location && <p className="text-gray-700 dark:text-gray-300"><strong className="text-gray-900 dark:text-white">Location:</strong> {viewingCustomer.location}</p>}
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                    <h3 className="font-semibold flex items-center gap-2 mb-3 text-gray-900 dark:text-white">
                      <Calendar className="w-4 h-4" /> Document Information
                    </h3>
                    <div className="space-y-2 text-sm">
                      <p className="text-gray-700 dark:text-gray-300"><strong className="text-gray-900 dark:text-white">Status:</strong> 
                        <span className={`inline-flex items-center gap-1 ml-2 px-2 py-0.5 rounded-full text-xs ${getStatusColor(viewingQuote.status)}`}>
                          {getStatusIcon(viewingQuote.status)}
                          {viewingQuote.status === 'converted' ? 'Invoiced' : viewingQuote.status}
                        </span>
                      </p>
                      <p className="text-gray-700 dark:text-gray-300"><strong className="text-gray-900 dark:text-white">Created:</strong> {new Date(viewingQuote.createdAt).toLocaleString()}</p>
                      <p className="text-gray-700 dark:text-gray-300"><strong className="text-gray-900 dark:text-white">Valid Until:</strong> {new Date(viewingQuote.validUntil).toLocaleDateString()}</p>
                      {viewingQuote.convertedAt && (
                        <p className="text-gray-700 dark:text-gray-300"><strong className="text-gray-900 dark:text-white">Converted:</strong> {new Date(viewingQuote.convertedAt).toLocaleString()}</p>
                      )}
                      {viewingQuote.status === 'converted' && (
                        <p className="text-gray-700 dark:text-gray-300"><strong className="text-gray-900 dark:text-white">Payment Status:</strong>
                          <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                            viewingQuote.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' :
                            viewingQuote.paymentStatus === 'partially_paid' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {viewingQuote.paymentStatus === 'paid' ? '✓ Paid' :
                             viewingQuote.paymentStatus === 'partially_paid' ? `⚠ Partially Paid (Balance: KES ${viewingQuote.balanceDue?.toLocaleString()})` :
                             '⚠ Unpaid'}
                          </span>
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Transport Info */}
                {(viewingQuote as any).transportCost > 0 && (
                  <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4">
                    <h3 className="font-semibold flex items-center gap-2 mb-3 text-gray-900 dark:text-white">
                      <Truck className="w-4 h-4 text-amber-600 dark:text-amber-400" /> Transport Information
                    </h3>
                    <div className="space-y-1 text-sm">
                      <p className="text-gray-700 dark:text-gray-300"><strong>Cost:</strong> KES {(viewingQuote as any).transportCost?.toLocaleString() || 0}</p>
                      {(viewingQuote as any).transportDescription && <p className="text-gray-700 dark:text-gray-300"><strong>Description:</strong> {(viewingQuote as any).transportDescription}</p>}
                      {(viewingQuote as any).estimatedDelivery && <p className="text-gray-700 dark:text-gray-300"><strong>Estimated Delivery:</strong> {(viewingQuote as any).estimatedDelivery}</p>}
                    </div>
                  </div>
                )}

                {/* Items Table */}
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2 text-gray-900 dark:text-white">
                    <Package className="w-4 h-4" /> Items
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 dark:bg-gray-800">
                        <tr>
                          <th className="px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300">Item</th>
                          <th className="px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300">Description</th>
                          <th className="px-4 py-2 text-center text-sm text-gray-700 dark:text-gray-300">Qty</th>
                          <th className="px-4 py-2 text-right text-sm text-gray-700 dark:text-gray-300">Unit Price</th>
                          {viewingQuote.taxPerItem && <th className="px-4 py-2 text-center text-sm text-gray-700 dark:text-gray-300">Tax</th>}
                          <th className="px-4 py-2 text-right text-sm text-gray-700 dark:text-gray-300">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {viewingQuote.items.map((item, idx) => {
                          const itemTotal = item.price * item.qty;
                          const isItemTaxable = (item as any).taxable !== false;
                          const itemTax = viewingQuote.taxPerItem && isItemTaxable ? itemTotal * viewingQuote.taxRate : 0;
                          return (
                            <tr key={idx} className="border-t dark:border-gray-800">
                              <td className="px-4 py-2 text-gray-900 dark:text-white">{item.name}</td>
                              <td className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">{item.description || '-'}</td>
                              <td className="px-4 py-2 text-center text-gray-900 dark:text-white">{item.qty}</td>
                              <td className="px-4 py-2 text-right text-gray-900 dark:text-white">KES {item.price.toLocaleString()}</td>
                              {viewingQuote.taxPerItem && (
                                <td className="px-4 py-2 text-center">
                                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${isItemTaxable ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'}`}>
                                    {isItemTaxable ? `${Math.round(viewingQuote.taxRate * 100)}%` : '0%'}
                                  </span>
                                 </td>
                              )}
                              <td className="px-4 py-2 text-right font-semibold text-gray-900 dark:text-white">
                                <div>KES {itemTotal.toLocaleString()}</div>
                                {viewingQuote.taxPerItem && isItemTaxable && (
                                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">VAT: +KES {itemTax.toLocaleString()}</div>
                                )}
                               </td>
                             </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Totals Section */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <div className="space-y-2 text-right max-w-md ml-auto">
                    <div className="flex justify-between py-1">
                      <span className="text-gray-600 dark:text-gray-400">Subtotal:</span>
                      <span className="font-semibold text-gray-900 dark:text-white">KES {viewingQuote.subtotal?.toLocaleString() || 0}</span>
                    </div>
                    {viewingQuote.discount > 0 && (
                      <div className="flex justify-between py-1 text-green-600 dark:text-green-400">
                        <span>Discount ({viewingQuote.discountType === 'percentage' ? `${viewingQuote.discount}%` : `KES ${viewingQuote.discount}`}):</span>
                        <span>-KES {viewingQuote.discount.toLocaleString()}</span>
                      </div>
                    )}
                    {(viewingQuote as any).transportCost > 0 && (
                      <div className="flex justify-between py-1">
                        <span className="text-gray-600 dark:text-gray-400">Transport:</span>
                        <span className="font-semibold text-amber-600 dark:text-amber-400">KES {(viewingQuote as any).transportCost?.toLocaleString() || 0}</span>
                      </div>
                    )}
                    <div className="flex justify-between py-1">
                      <span className="text-gray-600 dark:text-gray-400">Tax ({Math.round(viewingQuote.taxRate * 100)}%{viewingQuote.taxPerItem ? ' - per item' : ''}):</span>
                      <span className="text-gray-900 dark:text-white">KES {viewingQuote.tax?.toLocaleString() || 0}</span>
                    </div>
                    <div className="flex justify-between pt-2 mt-2 border-t-2 border-gray-200 dark:border-gray-700">
                      <span className="text-lg font-bold text-gray-900 dark:text-white">Total Amount:</span>
                      <span className="text-2xl font-bold text-cyan-600 dark:text-cyan-400">KES {viewingQuote.total?.toLocaleString() || 0}</span>
                    </div>
                  </div>
                </div>

                {/* Notes & Terms */}
                {viewingQuote.notes && (
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 border-l-4 border-yellow-500">
                    <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">Notes</h3>
                    <p className="text-sm text-gray-700 dark:text-gray-300">{viewingQuote.notes}</p>
                  </div>
                )}
                {viewingQuote.terms && (
                  <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 border-l-4 border-gray-500">
                    <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">Terms & Conditions</h3>
                    <p className="text-sm text-gray-700 dark:text-gray-300">{viewingQuote.terms}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Report Modal */}
        {showReportModal && (
          <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-900 rounded-xl max-w-md w-full p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Export Report</h2>
                <button onClick={() => setShowReportModal(false)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors">
                  <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Start Date</label>
                  <input 
                    type="date" 
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white" 
                    value={reportStartDate} 
                    onChange={(e) => setReportStartDate(e.target.value)} 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">End Date</label>
                  <input 
                    type="date" 
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white" 
                    value={reportEndDate} 
                    onChange={(e) => setReportEndDate(e.target.value)} 
                  />
                </div>
                <button 
                  onClick={handleExportReport} 
                  disabled={isExporting} 
                  className="w-full py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 transition-colors"
                >
                  {isExporting ? <Loader2 className="w-4 h-4 animate-spin inline mr-2" /> : <Download className="w-4 h-4 inline mr-2" />}
                  Export to CSV
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Record Payment Modal */}
        {showPaymentModal && selectedOrderForPayment && (
          <RecordPaymentModal
            isOpen={showPaymentModal}
            onClose={() => {
              setShowPaymentModal(false);
              setSelectedOrderForPayment(null);
            }}
            onSuccess={() => {
              fetchData();
            }}
            orderId={selectedOrderForPayment.id}
            orderNumber={selectedOrderForPayment.number}
            totalAmount={selectedOrderForPayment.total}
            amountPaid={selectedOrderForPayment.amountPaid}
            balanceDue={selectedOrderForPayment.balanceDue}
          />
        )}
      </div>
    </div>
  );
}