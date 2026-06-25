'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  Search,
  Eye,
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
  ChevronLeft,
  ChevronRight,
  Loader2,
  Download,
  Wallet,
  TrendingUp,
  AlertCircle,
  Mail,
  Phone,
  Receipt,
  Plus,
  Filter,
} from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { useCompanySettings } from '@/lib/use-company-settings';
import { getLogoUrl } from '@/lib/company';
import { toast } from 'react-hot-toast';
import { generateInvoicePDF } from './components/InvoicePDF';
import { RecordPaymentModal } from '../../../components/RecordPaymentModal';
import api from '@/lib/api';
import type { Invoice } from '@/lib/sales';
import { debounce } from 'lodash';

type DateFilterPeriod = 'all' | 'today' | 'yesterday' | '7d' | '30d' | 'month' | 'year' | 'custom';

export default function InvoicesPage() {
  const { user } = useAuth();
  const { data: settings } = useCompanySettings();
  const logoUrl = getLogoUrl(settings || null);
  
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>('');
  const [invoiceDateFilterPeriod, setInvoiceDateFilterPeriod] = useState<DateFilterPeriod>('all');
  const [invoiceStartDate, setInvoiceStartDate] = useState('');
  const [invoiceEndDate, setInvoiceEndDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalInvoices, setTotalInvoices] = useState(0);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingInvoice, setViewingInvoice] = useState<Invoice | null>(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedInvoiceForPayment, setSelectedInvoiceForPayment] = useState<{
    id: string;
    number: string;
    total: number;
    amountPaid: number;
    balanceDue: number;
  } | null>(null);
  const [creatingOrderId, setCreatingOrderId] = useState<string | null>(null);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportType, setExportType] = useState<'filtered' | 'all' | 'dateRange'>('filtered');
  const [exportStartDate, setExportStartDate] = useState('');
  const [exportEndDate, setExportEndDate] = useState('');
  const [exportStatus, setExportStatus] = useState<string>('');
  const [exportPaymentStatus, setExportPaymentStatus] = useState<string>('');
  const [exportLoading, setExportLoading] = useState(false);
  
  const itemsPerPage = 10;

  // Debounced search
  const debouncedSearch = useMemo(
    () => debounce((value: string) => {
      setSearchTerm(value);
      setCurrentPage(1);
    }, 400),
    []
  );

  // Clean up debounce on unmount
  useEffect(() => {
    return () => debouncedSearch.cancel();
  }, [debouncedSearch]);

  const getDateString = (date: Date) => date.toISOString().split('T')[0];

  // Helper: Escape CSV field
  const escapeCSV = (value: any) => {
    if (value === null || value === undefined) return '""';
    const str = String(value);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return `"${str}"`;
  };

  // Helper: Format currency for CSV
  const formatCurrencyCSV = (amount: number) => {
    return `"KES ${amount.toLocaleString()}"`;
  };

  // ==================== DATE FILTER FUNCTIONS ====================
  
  const isDateFilterActive = (period: DateFilterPeriod): boolean => {
    if (period === 'all') return !invoiceStartDate && !invoiceEndDate;
    
    const now = new Date();
    const today = getDateString(now);
    
    switch(period) {
      case 'today':
        return invoiceStartDate === today && invoiceEndDate === today;
      case 'yesterday': {
        const yesterday = new Date(now);
        yesterday.setDate(now.getDate() - 1);
        const yStr = getDateString(yesterday);
        return invoiceStartDate === yStr && invoiceEndDate === yStr;
      }
      case '7d': {
        const weekAgo = new Date(now);
        weekAgo.setDate(now.getDate() - 6);
        return invoiceStartDate === getDateString(weekAgo) && invoiceEndDate === today;
      }
      case '30d': {
        const monthAgo = new Date(now);
        monthAgo.setDate(now.getDate() - 29);
        return invoiceStartDate === getDateString(monthAgo) && invoiceEndDate === today;
      }
      case 'month': {
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        return invoiceStartDate === getDateString(monthStart) && invoiceEndDate === today;
      }
      case 'year': {
        const yearStart = new Date(now.getFullYear(), 0, 1);
        return invoiceStartDate === getDateString(yearStart) && invoiceEndDate === today;
      }
      default:
        return false;
    }
  };

  const applyInvoiceDateFilter = (period: DateFilterPeriod) => {
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

    setInvoiceDateFilterPeriod(period);
    setInvoiceStartDate(start);
    setInvoiceEndDate(end);
    setCurrentPage(1);
  };

  const clearInvoiceDateFilters = () => {
    setInvoiceDateFilterPeriod('all');
    setInvoiceStartDate('');
    setInvoiceEndDate('');
    setCurrentPage(1);
  };

  const handleCustomDateChange = (type: 'start' | 'end', value: string) => {
    if (type === 'start') {
      setInvoiceStartDate(value);
    } else {
      setInvoiceEndDate(value);
    }
    setInvoiceDateFilterPeriod('custom');
    // Only fetch if both dates are set
    if ((type === 'start' && value && invoiceEndDate) || (type === 'end' && value && invoiceStartDate)) {
      setCurrentPage(1);
    } else if (type === 'start' && !value) {
      clearInvoiceDateFilters();
    }
  };

  // ==================== EXPORT ====================
  const handleExportInvoices = async () => {
    setExportLoading(true);
    try {
      let invoicesToExport: Invoice[] = [];
      
      if (exportType === 'all') {
        let allInvoices: Invoice[] = [];
        let page = 1;
        let hasMore = true;
        
        while (hasMore) {
          const response = await api.get('/sales/invoices', {
            params: {
              limit: 100,
              page: page,
              status: exportStatus || undefined,
              paymentStatus: exportPaymentStatus || undefined,
              startDate: exportStartDate || undefined,
              endDate: exportEndDate || undefined,
            }
          });
          
          const data = response.data.invoices || [];
          allInvoices = [...allInvoices, ...data];
          
          if (response.data.pagination && page >= response.data.pagination.pages) {
            hasMore = false;
          } else {
            page++;
          }
        }
        invoicesToExport = allInvoices;
      } else if (exportType === 'dateRange') {
        const response = await api.get('/sales/invoices', {
          params: {
            limit: 1000,
            page: 1,
            startDate: exportStartDate || undefined,
            endDate: exportEndDate || undefined,
            status: exportStatus || undefined,
            paymentStatus: exportPaymentStatus || undefined,
          }
        });
        invoicesToExport = response.data.invoices || [];
      } else {
        invoicesToExport = invoices;
      }

      if (invoicesToExport.length === 0) {
        toast.error('No invoices to export');
        return;
      }

      const headers = [
        'Invoice Number',
        'Quotation Number',
        'Customer Name',
        'Customer Email',
        'Customer Phone',
        'Customer Location',
        'Items Count',
        'Subtotal (KES)',
        'Tax (KES)',
        'Discount (KES)',
        'Transport Cost (KES)',
        'Total (KES)',
        'Amount Paid (KES)',
        'Balance Due (KES)',
        'Payment Status',
        'Invoice Status',
        'Issue Date',
        'Due Date',
        'Days Overdue',
        'Order Created',
        'Profit (KES)',
        'Profit Margin (%)',
        'Created By'
      ];

      const rows = invoicesToExport.map((inv) => {
        const daysOverdue = inv.dueDate && new Date(inv.dueDate) < new Date() && inv.paymentStatus !== 'paid'
          ? Math.floor((new Date().getTime() - new Date(inv.dueDate).getTime()) / (1000 * 60 * 60 * 24))
          : 0;
        
        return [
          escapeCSV(inv.invoiceNumber),
          escapeCSV(inv.quotationNumber || 'N/A'),
          escapeCSV(inv.customerName),
          escapeCSV(inv.customerEmail || 'N/A'),
          escapeCSV(inv.customerPhone || 'N/A'),
          escapeCSV(inv.customerLocation || 'N/A'),
          inv.items.length,
          formatCurrencyCSV(inv.subtotal || 0),
          formatCurrencyCSV(inv.tax || 0),
          formatCurrencyCSV(inv.discount || 0),
          formatCurrencyCSV((inv as any).transportCost || 0),
          formatCurrencyCSV(inv.total || 0),
          formatCurrencyCSV(inv.amountPaid || 0),
          formatCurrencyCSV(inv.balanceDue || 0),
          escapeCSV(inv.paymentStatus),
          escapeCSV(inv.status),
          escapeCSV(inv.issueDate ? new Date(inv.issueDate).toLocaleDateString() : 'N/A'),
          escapeCSV(inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : 'N/A'),
          daysOverdue > 0 ? daysOverdue : 0,
          inv.orderId ? 'Yes' : 'No',
          formatCurrencyCSV((inv as any).totalProfit || 0),
          (inv.total && (inv as any).totalProfit) ? (((inv as any).totalProfit / inv.total) * 100).toFixed(2) + '%' : '0%',
          escapeCSV((inv as any).createdByName || 'N/A')
        ];
      });

      const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
      const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      let filename = 'invoices';
      if (exportType === 'all') {
        filename += '-all';
      } else if (exportType === 'dateRange' && exportStartDate && exportEndDate) {
        filename += `-${exportStartDate}-to-${exportEndDate}`;
      } else if (invoiceStartDate && invoiceEndDate) {
        filename += `-${invoiceStartDate}-to-${invoiceEndDate}`;
      } else {
        filename += `-${new Date().toISOString().split('T')[0]}`;
      }
      
      if (exportStatus) {
        filename += `-${exportStatus}`;
      }
      if (exportPaymentStatus) {
        filename += `-${exportPaymentStatus}`;
      }
      
      link.download = `${filename}.csv`;
      link.click();
      URL.revokeObjectURL(url);
      toast.success(`Exported ${invoicesToExport.length} invoices successfully`);
      setShowExportModal(false);
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Failed to export invoices');
    } finally {
      setExportLoading(false);
    }
  };

  // ==================== FETCH INVOICES ====================
  const fetchInvoices = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/sales/invoices', {
        params: {
          search: searchTerm || undefined,
          status: statusFilter || undefined,
          paymentStatus: paymentStatusFilter || undefined,
          startDate: invoiceStartDate || undefined,
          endDate: invoiceEndDate || undefined,
          page: currentPage,
          limit: itemsPerPage,
        },
      });
      setInvoices(response.data.invoices);
      setTotalPages(response.data.pagination?.pages || 1);
      setTotalInvoices(response.data.pagination?.total || 0);
    } catch (error) {
      console.error('Failed to fetch invoices:', error);
      toast.error('Failed to load invoices');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, statusFilter, paymentStatusFilter, invoiceStartDate, invoiceEndDate, currentPage]);

  // Fetch on filter changes
  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  // ==================== HANDLERS ====================
  const handleSearchChange = (value: string) => {
    debouncedSearch(value);
  };

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  const handlePaymentStatusFilterChange = (value: string) => {
    setPaymentStatusFilter(value);
    setCurrentPage(1);
  };

  const handleSendEmail = async (id: string) => {
    setSendingId(id);
    try {
      await api.post(`/sales/invoices/${id}/send`);
      toast.success('Invoice sent successfully');
      fetchInvoices();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to send invoice');
    } finally {
      setSendingId(null);
    }
  };

  const handlePrintPDF = async (invoice: Invoice) => {
    setIsGeneratingPDF(true);
    const loadingToast = toast.loading('Generating PDF...');

    try {
      const pdfBlob = await generateInvoicePDF(invoice, settings, logoUrl);
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Invoice-${invoice.invoiceNumber}.pdf`;
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

  const handleCreateOrder = async (invoiceId: string) => {
    const invoice = invoices.find(i => i._id === invoiceId);
    if (invoice?.orderId) {
      toast.error('An order has already been created for this invoice');
      return;
    }

    if (!confirm('Create an order from this invoice? This will deduct stock and create a fulfillment order.')) {
      return;
    }
    
    setCreatingOrderId(invoiceId);
    try {
      const response = await api.post(`/sales/invoices/${invoiceId}/create-order`, {
        paymentMethod: 'cod'
      });
      
      toast.success(`Order created: ${response.data.order.orderNumber}`);
      fetchInvoices();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to create order');
    } finally {
      setCreatingOrderId(null);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      draft: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
      sent: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      paid: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      partially_paid: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      overdue: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      cancelled: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const getPaymentStatusBadge = (status: string) => {
    const config: Record<string, { color: string; icon: JSX.Element; text: string }> = {
      paid: { color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', icon: <CheckCircle className="w-3 h-3" />, text: 'Paid' },
      unpaid: { color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', icon: <XCircle className="w-3 h-3" />, text: 'Unpaid' },
      partially_paid: { color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400', icon: <Clock className="w-3 h-3" />, text: 'Partially Paid' },
      overpaid: { color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400', icon: <TrendingUp className="w-3 h-3" />, text: 'Overpaid' },
    };
    return config[status] || config.unpaid;
  };

  if (loading && invoices.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-12 h-12 animate-spin text-cyan-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900">
      <div className="space-y-6 p-6">
        {/* ==================== HEADER ==================== */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Invoices</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {totalInvoices.toLocaleString()} total invoices
              {invoiceStartDate && invoiceEndDate && ` (${new Date(invoiceStartDate).toLocaleDateString()} - ${new Date(invoiceEndDate).toLocaleDateString()})`}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setShowExportModal(true)}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium flex items-center gap-2 transition-all"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
            <button
              onClick={fetchInvoices}
              className="px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg font-medium flex items-center gap-2 transition-all"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </div>

        {/* ==================== FILTERS ==================== */}
        <div className="space-y-4 w-full">
          {/* Row 1: Search and Status */}
          <div className="flex flex-wrap gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by invoice #, customer..."
                defaultValue={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-cyan-500"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => handleStatusFilterChange(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-cyan-500"
            >
              <option value="">All Status</option>
              <option value="draft">Draft</option>
              <option value="sent">Sent</option>
              <option value="paid">Paid</option>
              <option value="partially_paid">Partially Paid</option>
              <option value="overdue">Overdue</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <select
              value={paymentStatusFilter}
              onChange={(e) => handlePaymentStatusFilterChange(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-cyan-500"
            >
              <option value="">All Payment Status</option>
              <option value="unpaid">Unpaid</option>
              <option value="partially_paid">Partially Paid</option>
              <option value="paid">Paid</option>
              <option value="overpaid">Overpaid</option>
            </select>
          </div>

          {/* Row 2: Date Filters - Same Line */}
          <div className="flex flex-wrap items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-400 dark:text-gray-500 mr-1 flex-shrink-0" />
            
            {(['all', 'today', 'yesterday', '7d', '30d', 'month', 'year'] as const).map((period) => (
              <button
                key={period}
                type="button"
                onClick={() => applyInvoiceDateFilter(period)}
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
              onClick={() => applyInvoiceDateFilter('custom')}
              className={`px-3 py-1.5 rounded-lg border text-sm font-medium transition whitespace-nowrap ${
                invoiceDateFilterPeriod === 'custom' && (invoiceStartDate || invoiceEndDate)
                  ? 'bg-cyan-600 text-white border-cyan-600 shadow-lg shadow-cyan-600/20 dark:shadow-cyan-800/30' 
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              Custom
            </button>

            <div className="flex items-center gap-2">
              <input
                type="date"
                value={invoiceStartDate}
                onChange={(e) => handleCustomDateChange('start', e.target.value)}
                className="px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-cyan-500 w-36"
                aria-label="Start date"
              />
              <span className="text-gray-400 text-sm">to</span>
              <input
                type="date"
                value={invoiceEndDate}
                onChange={(e) => handleCustomDateChange('end', e.target.value)}
                className="px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-cyan-500 w-36"
                aria-label="End date"
              />
            </div>

            {(invoiceStartDate || invoiceEndDate) && (
              <button
                type="button"
                onClick={clearInvoiceDateFilters}
                className="p-1.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title="Clear date filters"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* ==================== INVOICES TABLE ==================== */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Invoice #</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Items</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Profit</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Payment Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Balance</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Due Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                {invoices.map((invoice) => {
                  const paymentBadge = getPaymentStatusBadge(invoice.paymentStatus);
                  const isOverdue = new Date(invoice.dueDate) < new Date() && invoice.paymentStatus !== 'paid';
                  const hasOrder = !!invoice.orderId;
                  const profit = (invoice as any).totalProfit || 0;
                  const profitMargin = invoice.total > 0 ? (profit / invoice.total) * 100 : 0;
                  
                  return (
                    <tr key={invoice._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-purple-500" />
                          <span className="text-sm font-medium text-gray-900 dark:text-white">{invoice.invoiceNumber}</span>
                        </div>
                        <div className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Quote: {invoice.quotationNumber}</div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{invoice.customerName}</p>
                        {invoice.customerEmail && (
                          <p className="text-xs text-gray-500 dark:text-gray-400">{invoice.customerEmail}</p>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{invoice.items.length} items</td>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white">KES {invoice.total?.toLocaleString() || 0}</td>
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
                        <div className="flex flex-col gap-1">
                          <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${paymentBadge.color}`}>
                            {paymentBadge.icon}
                            {paymentBadge.text}
                          </div>
                          {isOverdue && (
                            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                              <AlertCircle className="w-3 h-3" />
                              OVERDUE
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {invoice.balanceDue > 0 ? (
                          <span className="text-sm font-medium text-amber-600 dark:text-amber-400">
                            KES {invoice.balanceDue.toLocaleString()}
                          </span>
                        ) : (
                          <span className="text-sm text-green-600 dark:text-green-400">Fully Paid</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                        {new Date(invoice.dueDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2 flex-wrap">
                          <button 
                            onClick={() => {
                              setViewingInvoice(invoice);
                              setShowViewModal(true);
                            }} 
                            className="p-1.5 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors" 
                            title="View"
                          >
                            <Eye className="w-4 h-4 text-blue-500" />
                          </button>
                          <button 
                            onClick={() => handleSendEmail(invoice._id)} 
                            disabled={sendingId === invoice._id}
                            className="p-1.5 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-lg transition-colors" 
                            title="Send Email"
                          >
                            {sendingId === invoice._id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 text-green-500" />}
                          </button>
                          <button 
                            onClick={() => handlePrintPDF(invoice)} 
                            disabled={isGeneratingPDF} 
                            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors" 
                            title="Download PDF"
                          >
                            <Printer className="w-4 h-4 text-gray-500" />
                          </button>
                          {invoice.paymentStatus !== 'paid' && invoice.paymentStatus !== 'overpaid' && (
                            <button
                              onClick={() => {
                                setSelectedInvoiceForPayment({
                                  id: invoice._id,
                                  number: invoice.invoiceNumber,
                                  total: invoice.total,
                                  amountPaid: invoice.amountPaid,
                                  balanceDue: invoice.balanceDue,
                                });
                                setShowPaymentModal(true);
                              }}
                              className="p-1.5 hover:bg-amber-100 dark:hover:bg-amber-900/30 rounded-lg transition-colors"
                              title="Record Payment"
                            >
                              <Wallet className="w-4 h-4 text-amber-500" />
                            </button>
                          )}
                          {!hasOrder && (
                            <button
                              onClick={() => handleCreateOrder(invoice._id)}
                              disabled={creatingOrderId === invoice._id}
                              className="p-1.5 hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-lg transition-colors"
                              title="Create Order"
                            >
                              {creatingOrderId === invoice._id ? (
                                <Loader2 className="w-4 h-4 animate-spin text-purple-500" />
                              ) : (
                                <Package className="w-4 h-4 text-purple-500" />
                              )}
                            </button>
                          )}
                          {hasOrder && (
                            <div className="p-1.5" title="Order Already Created">
                              <CheckCircle className="w-4 h-4 text-green-500" />
                            </div>
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
              <div className="text-xs text-gray-500">
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalInvoices)} of {totalInvoices}
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-1.5 rounded disabled:opacity-50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-1.5 rounded disabled:opacity-50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ==================== VIEW INVOICE MODAL ==================== */}
      {showViewModal && viewingInvoice && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl dark:shadow-gray-950/50">
            <div className="p-6 border-b border-gray-200 dark:border-gray-800 sticky top-0 bg-white dark:bg-gray-900 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Invoice Details</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">{viewingInvoice.invoiceNumber}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handlePrintPDF(viewingInvoice)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors text-gray-500 dark:text-gray-400">
                  <Printer className="w-5 h-5" />
                </button>
                <button onClick={() => handleSendEmail(viewingInvoice._id)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors text-gray-500 dark:text-gray-400">
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
                    <p><strong>Name:</strong> {viewingInvoice.customerName}</p>
                    {viewingInvoice.customerEmail && <p><strong>Email:</strong> {viewingInvoice.customerEmail}</p>}
                    {viewingInvoice.customerPhone && <p><strong>Phone:</strong> {viewingInvoice.customerPhone}</p>}
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                  <h3 className="font-semibold flex items-center gap-2 mb-3 text-gray-900 dark:text-white">
                    <Calendar className="w-4 h-4" /> Information
                  </h3>
                  <div className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
                    <p><strong>Status:</strong> {viewingInvoice.status}</p>
                    <p><strong>Payment:</strong> {viewingInvoice.paymentStatus}</p>
                    <p><strong>Issue Date:</strong> {new Date(viewingInvoice.issueDate).toLocaleDateString()}</p>
                    <p><strong>Due Date:</strong> {new Date(viewingInvoice.dueDate).toLocaleDateString()}</p>
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
                      {viewingInvoice.items.map((item, idx) => (
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
                    <span>KES {viewingInvoice.subtotal?.toLocaleString() || 0}</span>
                  </div>
                  {(viewingInvoice as any).transportCost > 0 && (
                    <div className="flex justify-between">
                      <span>Transport:</span>
                      <span>KES {(viewingInvoice as any).transportCost.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Tax (16%):</span>
                    <span>KES {viewingInvoice.tax?.toLocaleString() || 0}</span>
                  </div>
                  <div className="flex justify-between text-green-600 dark:text-green-400">
                    <span>Discount:</span>
                    <span>-KES {viewingInvoice.discount?.toLocaleString() || 0}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t-2 border-gray-200 dark:border-gray-700">
                    <span className="text-lg font-bold text-gray-900 dark:text-white">Total:</span>
                    <span className="text-2xl font-bold text-cyan-600 dark:text-cyan-400">KES {viewingInvoice.total?.toLocaleString() || 0}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
                    <span>Amount Paid:</span>
                    <span>KES {viewingInvoice.amountPaid?.toLocaleString() || 0}</span>
                  </div>
                  <div className="flex justify-between text-sm font-medium text-amber-600 dark:text-amber-400">
                    <span>Balance Due:</span>
                    <span>KES {viewingInvoice.balanceDue?.toLocaleString() || 0}</span>
                  </div>
                </div>
              </div>
              {viewingInvoice.notes && (
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Notes</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{viewingInvoice.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ==================== PAYMENT MODAL ==================== */}
      {showPaymentModal && selectedInvoiceForPayment && (
        <RecordPaymentModal
          isOpen={showPaymentModal}
          onClose={() => {
            setShowPaymentModal(false);
            setSelectedInvoiceForPayment(null);
          }}
          onSuccess={() => {
            fetchInvoices();
          }}
          invoiceId={selectedInvoiceForPayment.id}
          invoiceNumber={selectedInvoiceForPayment.number}
          totalAmount={selectedInvoiceForPayment.total}
          amountPaid={selectedInvoiceForPayment.amountPaid}
          balanceDue={selectedInvoiceForPayment.balanceDue}
        />
      )}

      {/* ==================== EXPORT MODAL ==================== */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl dark:shadow-gray-950/50">
            <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center sticky top-0 bg-white dark:bg-gray-900">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Export Invoices Report</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Download detailed invoices data as CSV</p>
              </div>
              <button onClick={() => setShowExportModal(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors text-gray-500 dark:text-gray-400">
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
                      Export invoices currently displayed ({invoices.length} invoices)
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
                    <div className="font-medium text-gray-900 dark:text-white">All Invoices</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Export all invoices ({totalInvoices} total)
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
                      value={exportStartDate}
                      onChange={(e) => setExportStartDate(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">End Date</label>
                    <input
                      type="date"
                      value={exportEndDate}
                      onChange={(e) => setExportEndDate(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>
                </div>
              )}

              {/* Status Filters */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                  <select
                    value={exportStatus}
                    onChange={(e) => setExportStatus(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-cyan-500"
                  >
                    <option value="">All Status</option>
                    <option value="draft">Draft</option>
                    <option value="sent">Sent</option>
                    <option value="paid">Paid</option>
                    <option value="partially_paid">Partially Paid</option>
                    <option value="overdue">Overdue</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Payment Status</label>
                  <select
                    value={exportPaymentStatus}
                    onChange={(e) => setExportPaymentStatus(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-cyan-500"
                  >
                    <option value="">All Payment Status</option>
                    <option value="unpaid">Unpaid</option>
                    <option value="partially_paid">Partially Paid</option>
                    <option value="paid">Paid</option>
                    <option value="overpaid">Overpaid</option>
                  </select>
                </div>
              </div>

              {/* Export Button */}
              <button
                onClick={handleExportInvoices}
                disabled={exportLoading || (exportType === 'dateRange' && (!exportStartDate || !exportEndDate))}
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
                CSV will include: Invoice #, Quote #, Customer, Email, Phone, Location, Items, Subtotal, Tax, Discount, Transport, Total, Paid, Balance, Payment Status, Status, Issue Date, Due Date, Days Overdue, Order Created, Profit, Profit Margin, Created By
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}