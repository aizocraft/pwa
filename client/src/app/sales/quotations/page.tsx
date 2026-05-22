// app/sales/quotations/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
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
  DollarSign,
  Calendar,
  User,
  Package,
  Truck,
  X,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from 'lucide-react';
import {
  listSalesQuotations,
  createSalesQuotation,
  updateSalesQuotation,
  deleteSalesQuotation,
  sendQuotationEmail,
  acceptQuotation,
  listSalesCustomers,
  listPublicShippingAreas,
  type Quotation,
  type SalesCustomer,
} from '@/lib/sales';
import { listProducts } from '@/lib/sales';
import { useAuth } from '@/lib/auth';
import { useCompanySettings } from '@/lib/use-company-settings';
import { getLogoUrl, getTaxRate } from '@/lib/company';
import { toast } from 'react-hot-toast';
import { generateQuotationPDF } from './components/QuotationPDF';

export default function QuotationsPage() {
  const { user } = useAuth();
  const { data: settings } = useCompanySettings();
  const logoUrl = getLogoUrl(settings || null);
  
  const [taxRate, setTaxRate] = useState<number>(0.16); 
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [customers, setCustomers] = useState<SalesCustomer[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [shippingAreas, setShippingAreas] = useState<any[]>([]);
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
  const itemsPerPage = 10;



  const [formData, setFormData] = useState({
    customerId: '',
    items: [] as Array<{
      productId: string;
      qty: number;
      customPrice?: number;
    }>,
    discount: 0,
    discountType: 'fixed' as 'percentage' | 'fixed',
    notes: '',
    terms: '',
    validUntil: '',
    shippingAreaId: '',
    estimatedDelivery: '',
  });

  const [tempItem, setTempItem] = useState({
    productId: '',
    qty: 1,
    customPrice: null as number | null,
  });

  useEffect(() => {
    fetchData();
  }, [searchTerm, statusFilter, currentPage]);

  useEffect(() => {
    if (showModal) {
      const loadShippingAreas = async () => {
        try {
          const shippingRes = await listPublicShippingAreas();
          setShippingAreas(shippingRes || []);
        } catch (error) {
          console.error('Failed to load shipping areas:', error);
        }
      };
      loadShippingAreas();
    }
  }, [showModal]);

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


  const fetchData = async () => {
    try {
      setLoading(true);
      const [quotesRes, customersRes, productsRes, shippingRes] = await Promise.all([
        listSalesQuotations({
          search: searchTerm || undefined,
          status: statusFilter || undefined,
          page: currentPage,
          limit: itemsPerPage,
        }),
        listSalesCustomers(),
        listProducts({ limit: 100 }),
        listPublicShippingAreas(),
      ]);
      setQuotations(quotesRes.quotations);
      setTotalPages(quotesRes.pagination?.pages || 1);
      setCustomers(customersRes.customers);
      setProducts(productsRes.products || []);
      setShippingAreas(shippingRes || []);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const calculateTotals = useCallback(() => {
  let subtotal = 0;
  for (const item of formData.items) {
    const product = products.find((p) => p._id === item.productId);
    const price = item.customPrice || product?.price || 0;
    subtotal += price * item.qty;
  }

  const selectedArea = shippingAreas.find((a) => a._id === formData.shippingAreaId);
  let shippingCost = 0;

  // Match backend logic + avoid showing "Free" unless a freeThreshold is actually configured (> 0)
  if (selectedArea) {
    const freeShippingEnabled = selectedArea.freeThreshold > 0;
    const qualifiesForFreeShipping = freeShippingEnabled && subtotal >= selectedArea.freeThreshold;

    shippingCost = qualifiesForFreeShipping ? 0 : selectedArea.baseCost || 0;
  }

  const discountAmount =
    formData.discountType === 'percentage'
      ? subtotal * (formData.discount / 100)
      : formData.discount;
  
  const tax = (subtotal - discountAmount) * taxRate;
  const total = subtotal - discountAmount + tax + shippingCost;

  return { subtotal, discountAmount, tax, total, shippingCost };
}, [formData.items, formData.discount, formData.discountType, formData.shippingAreaId, products, shippingAreas, taxRate]); // Add taxRate to dependencies

  const { subtotal, discountAmount, tax, total, shippingCost } = calculateTotals();

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
        items: formData.items,
        discount: formData.discount,
        discountType: formData.discountType,
        notes: formData.notes,
        terms: formData.terms,
        validUntil: formData.validUntil,
        shippingAreaId: formData.shippingAreaId || undefined,
        estimatedDelivery: formData.estimatedDelivery || undefined,
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

// Replace the handlePrintPDF function with this improved version
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
    
    // Create download link
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

// Add a batch PDF download function (optional)
const handleBatchPDFDownload = async () => {
  const selectedQuotes = quotations.filter(q => q.status === 'sent' || q.status === 'accepted');
  if (selectedQuotes.length === 0) {
    toast.error('No quotations available for batch download');
    return;
  }

  toast.loading(`Generating ${selectedQuotes.length} PDFs...`);
  
  for (const quote of selectedQuotes) {
    const customer = customers.find((c) => c._id === quote.customerId);
    if (customer) {
      const pdfBlob = await generateQuotationPDF(quote, customer, settings, logoUrl);
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Quotation-${quote.quoteNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      await new Promise(resolve => setTimeout(resolve, 500)); // Delay between downloads
    }
  }
  
  toast.success('All PDFs generated!');
};

  const resetForm = () => {
    setEditingQuote(null);
    setFormData({
      customerId: '',
      items: [],
      discount: 0,
      discountType: 'fixed',
      notes: '',
      terms: '',
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      shippingAreaId: '',
      estimatedDelivery: '',
    });
    setTempItem({ productId: '', qty: 1, customPrice: null });
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
          },
        ],
      }));
      setTempItem({ productId: '', qty: 1, customPrice: null });
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Shipping</th>
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
                              {item.description && <span className="block text-xs text-gray-400 dark:text-gray-500 truncate">{item.description}</span>}
                            </p>
                          ))}
                          {quote.items.length > 2 && (
                            <p className="text-xs text-gray-400 dark:text-gray-500">+{quote.items.length - 2} more</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">KES {quote.subtotal?.toLocaleString() || 0}</td>
                    <td className="px-6 py-4 text-sm">
                      {quote.shippingInfo?.cost !== undefined ? (
                        quote.shippingInfo.freeThreshold > 0 && quote.shippingInfo.cost === 0 ? (
                          <span className="text-green-600 dark:text-green-400 font-medium">Free</span>
                        ) : (
                          <span className="text-amber-600 dark:text-amber-400">KES {quote.shippingInfo.cost.toLocaleString()}</span>
                        )
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}

                    </td>
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
                              items: quote.items.map((i) => ({
                                productId: i.productId,
                                qty: i.qty,
                                customPrice: i.customPrice ? i.price : undefined,
                              })),


                              discount: quote.discount,
                              discountType: quote.discountType,
                              notes: quote.notes || '',
                              terms: quote.terms || '',
                              validUntil: quote.validUntil.split('T')[0],
                              shippingAreaId: quote.shippingInfo?.areaId || '',
                              estimatedDelivery: quote.shippingInfo?.estimatedDelivery || '',
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
                      <p>
                        <strong>Name:</strong> {viewingQuote.customerName}
                      </p>
                      {viewingQuote.customerEmail && (
                        <p>
                          <strong>Email:</strong> {viewingQuote.customerEmail}
                        </p>
                      )}
                      {viewingQuote.customerPhone && (
                        <p>
                          <strong>Phone:</strong> {viewingQuote.customerPhone}
                        </p>
                      )}
                      {viewingCustomer.location && (
                        <p>
                          <strong>Location:</strong> {viewingCustomer.location}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                    <h3 className="font-semibold flex items-center gap-2 mb-3">
                      <Calendar className="w-4 h-4" /> Quote Information
                    </h3>
                    <div className="space-y-2 text-sm">
                      <p>
                        <strong>Status:</strong>{' '}
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${getStatusColor(viewingQuote.status)}`}>
                          {viewingQuote.status}
                        </span>
                      </p>
                      <p>
                        <strong>Created:</strong> {new Date(viewingQuote.createdAt).toLocaleString()}
                      </p>
                      <p>
                        <strong>Valid Until:</strong> {new Date(viewingQuote.validUntil).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>

                {viewingQuote.shippingInfo && (
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                    <h3 className="font-semibold flex items-center gap-2 mb-3">
                      <Truck className="w-4 h-4" /> Shipping Information
                    </h3>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <p>
                        <strong>Area:</strong> {viewingQuote.shippingInfo.areaName}
                      </p>
                      <p>
                        <strong>Cost:</strong>{' '}
                        {viewingQuote.shippingInfo.freeThreshold > 0 && viewingQuote.shippingInfo.cost === 0 ? 'Free' : `KES ${viewingQuote.shippingInfo.cost.toLocaleString()}`}

                      </p>
                      <p>
                        <strong>Delivery:</strong> {viewingQuote.shippingInfo.estimatedDelivery}
                      </p>
                    </div>
                  </div>
                )}

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
                          <th className="px-4 py-2 text-right text-sm">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {viewingQuote.items.map((item, idx) => (
                          <tr key={idx} className="border-t dark:border-gray-800">
                            <td className="px-4 py-2">
                              {item.name}
                              {item.customPrice && <span className="text-xs text-blue-500 ml-2">(Custom)</span>}
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">
                              {item.description ? (
                                <span className="line-clamp-2">{item.description}</span>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </td>
                            <td className="px-4 py-2 text-center">{item.qty}</td>
                            <td className="px-4 py-2 text-right">KES {item.price.toLocaleString()}</td>
                            <td className="px-4 py-2 text-right font-semibold">KES {(item.price * item.qty).toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Totals */}
                <div className="border-t pt-4">
                  <div className="space-y-2 text-right">
                    <p className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Subtotal:</span>
                      <span className="font-semibold">KES {viewingQuote.subtotal?.toLocaleString() || 0}</span>
                    </p>
                    {viewingQuote.discount > 0 && (
                      <p className="flex justify-between text-red-600">

                        <span>
                          Discount ({viewingQuote.discountType === 'percentage' ? `${viewingQuote.discount}%` : `KES ${viewingQuote.discount}`}):
                        </span>
                        <span>-KES {viewingQuote.discount.toLocaleString()}</span>
                      </p>

                    )}
                    {viewingQuote.shippingInfo?.cost !== undefined && viewingQuote.shippingInfo.cost > 0 && (
                      <p className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Shipping ({viewingQuote.shippingInfo.areaName}):</span>
                        <span className="font-semibold text-amber-600">KES {viewingQuote.shippingInfo.cost.toLocaleString()}</span>
                      </p>
                    )}
                    {typeof viewingQuote.shippingInfo?.freeThreshold === 'number' && viewingQuote.shippingInfo.freeThreshold > 0 && viewingQuote.shippingInfo?.cost === 0 && (
                      <p className="flex justify-between text-green-600">
                        <span>Shipping ({viewingQuote.shippingInfo.areaName}):</span>
                        <span>Free Shipping</span>
                      </p>
                    )}
                    <p className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Tax ({(viewingQuote.taxRate * 100).toFixed(0)}%):</span>
                      <span>KES {viewingQuote.tax?.toLocaleString() || 0}</span>
                    </p>
                    <div className="pt-2 mt-2 border-t-2 border-gray-200 dark:border-gray-700">
                      <p className="flex justify-between text-lg font-bold">
                        <span>Total:</span>
                        <span className="text-cyan-600">KES {viewingQuote.total?.toLocaleString() || 0}</span>
                      </p>
                    </div>
                  </div>
                </div>

                {viewingQuote.notes && (
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                    <h3 className="font-semibold mb-2">Notes</h3>
                    <p className="text-sm">{viewingQuote.notes}</p>
                  </div>
                )}
                {viewingQuote.terms && (
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                    <h3 className="font-semibold mb-2">Terms & Conditions</h3>
                    <p className="text-sm">{viewingQuote.terms}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Create/Edit Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-900 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="p-6 border-b border-gray-200 dark:border-gray-800 sticky top-0 bg-white dark:bg-gray-900 flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {editingQuote ? 'Edit Quotation' : 'Create Quotation'}
                </h2>
                <button onClick={() => setShowModal(false)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Customer *</label>
                  <select
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-cyan-500"
                    value={formData.customerId}
                    onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                    disabled={!!editingQuote}
                  >
                    <option value="">Select a customer...</option>
                    {customers.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name} - {c.email || c.phone}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Shipping Section */}
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-4 bg-gray-50 dark:bg-gray-800/50">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Truck className="w-4 h-4" /> Shipping Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Shipping Area</label>
                      <select
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        value={formData.shippingAreaId}
                        onChange={(e) => setFormData({ ...formData, shippingAreaId: e.target.value })}
                      >
                        <option value="">Select shipping area...</option>
                        {shippingAreas.map((area) => (
                          <option key={area._id} value={area._id}>
                            {area.name} - KES {area.baseCost.toLocaleString()}{' '}
                            {area.freeThreshold > 0 && `(Free over KES ${area.freeThreshold.toLocaleString()})`}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Estimated Delivery</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        placeholder="e.g., 3-5 business days"
                        value={formData.estimatedDelivery}
                        onChange={(e) => setFormData({ ...formData, estimatedDelivery: e.target.value })}
                      />
                    </div>
                  </div>
                  {formData.shippingAreaId && shippingCost > 0 && (
                    <div className="text-sm text-green-600 dark:text-green-400">Shipping Cost: KES {shippingCost.toLocaleString()}</div>
                  )}
                  {(() => {
                    const selectedArea = shippingAreas.find((a) => a._id === formData.shippingAreaId);
                    const freeShippingEnabled = selectedArea?.freeThreshold > 0;
                    const qualifiesForFree = freeShippingEnabled && shippingCost === 0;

                    if (formData.shippingAreaId && qualifiesForFree) {
                      return <div className="text-sm text-green-600 dark:text-green-400">✓ Free Shipping</div>;
                    }

                    if (formData.shippingAreaId && shippingCost > 0) {
                      return null;
                    }

                    return null;
                  })()}

                </div>

                {/* Add Items */}
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-4">
                  <h3 className="font-semibold">Add Products</h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <select
                      className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      value={tempItem.productId}
                      onChange={(e) => setTempItem({ ...tempItem, productId: e.target.value })}
                    >
                      <option value="">Select product</option>
                      {products.map((p) => (
                        <option key={p._id} value={p._id}>
                          {p.name} - KES {p.price.toLocaleString()} (Stock: {p.stock})
                        </option>
                      ))}
                    </select>
                    <input
                      type="number"
                      placeholder="Custom Price"
                      className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      value={tempItem.customPrice || ''}
                      onChange={(e) => setTempItem({ ...tempItem, customPrice: e.target.value ? Number(e.target.value) : null })}
                    />
                    <input
                      type="number"
                      placeholder="Quantity"
                      className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      value={tempItem.qty}
                      onChange={(e) => setTempItem({ ...tempItem, qty: Number(e.target.value) })}
                    />
                    <button type="button" onClick={addItem} className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors">
                      <Plus className="w-4 h-4 inline" /> Add
                    </button>
                  </div>
                </div>

                {/* Items List */}
                {formData.items.length > 0 && (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 dark:bg-gray-800">
                        <tr>
                          <th className="px-4 py-2 text-left">Product</th>
                          <th className="px-4 py-2 text-center">Qty</th>
                          <th className="px-4 py-2 text-right">Unit Price</th>
                          <th className="px-4 py-2 text-right">Total</th>
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>
                        {formData.items.map((item, idx) => {
                          const product = products.find((p) => p._id === item.productId);
                          const price = item.customPrice || product?.price || 0;
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
                              <td className="px-4 py-2">
                                <input
                                  type="number"
                                  value={price}
                                  onChange={(e) => updateItemPrice(idx, Number(e.target.value))}
                                  className="w-32 px-2 py-1 border border-gray-300 dark:border-gray-700 rounded text-right bg-white dark:bg-gray-800"
                                  min="0"
                                />
                              </td>
                              <td className="px-4 py-2 text-right font-semibold">KES {(price * item.qty).toLocaleString()}</td>
                              <td className="px-4 py-2">
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

                {/* Totals */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">Subtotal:</span>
                    <span className="font-semibold">KES {subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">Shipping:</span>
                    {formData.shippingAreaId ? (
                      (() => {
                        const selectedArea = shippingAreas.find((a) => a._id === formData.shippingAreaId);
                        const freeShippingEnabled = selectedArea?.freeThreshold > 0;
                        const qualifiesForFree = freeShippingEnabled && shippingCost === 0;

                        if (qualifiesForFree) {
                          return <span className="font-semibold text-green-600">Free Shipping</span>;
                        }

                        return <span className="font-semibold text-amber-600">KES {shippingCost.toLocaleString()}</span>;
                      })()
                    ) : (
                      <span className="text-gray-400">Not selected</span>
                    )}

                  </div>
                  <div className="flex items-center gap-4 flex-wrap justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Discount:</span>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={formData.discount}
                        onChange={(e) => setFormData({ ...formData, discount: Number(e.target.value) })}
                        className="w-24 px-2 py-1 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-800"
                        min="0"
                      />
                      <select
                        value={formData.discountType}
                        onChange={(e) => setFormData({ ...formData, discountType: e.target.value as any })}
                        className="px-2 py-1 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-800"
                      >
                        <option value="fixed">KES</option>
                        <option value="percentage">%</option>
                      </select>
                      {formData.discount > 0 && (
                        <span className="text-green-600 text-sm">Save: KES {discountAmount.toLocaleString()}</span>
                      )}
                    </div>
                  </div>
<div className="flex justify-between items-center">
  <span className="text-gray-600 dark:text-gray-400">Tax ({Math.round(taxRate * 100)}%):</span>
  <span>KES {tax.toLocaleString()}</span>
</div>
                  <div className="flex justify-between items-center pt-2 border-t border-gray-200 dark:border-gray-700">
                    <span className="text-lg font-bold">Total:</span>
                    <span className="text-lg font-bold text-cyan-600">KES {total.toLocaleString()}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes</label>
                  <textarea
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    placeholder="Additional notes..."
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Terms & Conditions</label>
                  <textarea
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    placeholder="Payment terms, delivery terms..."
                    value={formData.terms}
                    onChange={(e) => setFormData({ ...formData, terms: e.target.value })}
                  />
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
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-lg hover:from-cyan-700 hover:to-blue-700 transition-all"
                  >
                    {editingQuote ? 'Update' : 'Create'} Quotation
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
      </div>
    </div>
  );
}