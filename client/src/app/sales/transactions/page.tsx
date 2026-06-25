'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Receipt,
  Search,
  Eye,
  Download,
  RefreshCw,
  Smartphone,
  CreditCard,
  DollarSign,
  CheckCircle,
  XCircle,
  Clock,
  Filter,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  FileText,
  User,
  Mail,
  Phone,
  Wallet,
  Banknote,
  ChevronRight,
  ChevronLeft,
  Loader2,
  X,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  Activity,
  Zap,
  Award,
  Target,
  Building2,
  Link2,
  Copy,
  Check,
} from 'lucide-react';
import { getTransactions, getTransactionStats, exportTransactionsToCSV } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { toast } from 'react-hot-toast';
import {
  BarChart,
  Bar,
  PieChart as RePieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  ComposedChart,
} from 'recharts';
import { debounce } from 'lodash';

// ==================== TYPES ====================
interface Transaction {
  _id: string;
  transactionId: string;
  orderId?: string;
  orderNumber?: string;
  invoiceNumber?: string;
  quotationNumber?: string;
  userId?: string;
  guestEmail?: string;
  guestPhone?: string;
  customerName: string;
  amount: number;
  currency: string;
  paymentMethod: 'mpesa' | 'card' | 'cod' | 'cash' | 'bank_transfer' | 'cheque';
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  mpesaReceipt?: string;
  cardLast4?: string;
  cardBrand?: string;
  reference?: string;
  notes?: string;
  source: 'checkout' | 'quotation' | 'admin' | 'manual' | 'invoice';
  isPartialPayment: boolean;
  recordedBy?: string;
  recordedByName?: string;
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface TransactionStats {
  summary: {
    totalVolume: number;
    totalTransactions: number;
    completed: number;
    pending: number;
    failed: number;
    refunded: number;
  };
  byStatus: Array<{ _id: string; count: number; volume: number }>;
  bySource: Array<{ _id: string; count: number; volume: number }>;
  byMethod: Array<{ _id: string; count: number; volume: number }>;
}

type DateFilterPeriod = 'all' | 'today' | 'yesterday' | '7d' | '30d' | 'month' | 'year' | 'custom';

// ==================== HELPERS ====================
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatCompact = (num: number): string => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
};

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    completed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800',
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800',
    failed: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800',
    refunded: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200 dark:border-orange-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400';
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'completed': return <CheckCircle className="w-4 h-4" />;
    case 'pending': return <Clock className="w-4 h-4" />;
    case 'failed': return <XCircle className="w-4 h-4" />;
    case 'refunded': return <ArrowUpRight className="w-4 h-4" />;
    default: return <Receipt className="w-4 h-4" />;
  }
};

const getPaymentIcon = (method: string) => {
  switch (method) {
    case 'mpesa': return <Smartphone className="w-4 h-4" />;
    case 'card': return <CreditCard className="w-4 h-4" />;
    case 'cash': return <DollarSign className="w-4 h-4" />;
    case 'bank_transfer': return <Banknote className="w-4 h-4" />;
    case 'cheque': return <FileText className="w-4 h-4" />;
    default: return <Receipt className="w-4 h-4" />;
  }
};

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4'];

// ==================== DATE FILTER HELPERS ====================
const getDateString = (date: Date) => date.toISOString().split('T')[0];

const isDateFilterActive = (period: DateFilterPeriod, startDate: string, endDate: string): boolean => {
  if (period === 'all') return !startDate && !endDate;
  
  const now = new Date();
  const today = getDateString(now);
  
  switch(period) {
    case 'today':
      return startDate === today && endDate === today;
    case 'yesterday': {
      const yesterday = new Date(now);
      yesterday.setDate(now.getDate() - 1);
      const yStr = getDateString(yesterday);
      return startDate === yStr && endDate === yStr;
    }
    case '7d': {
      const weekAgo = new Date(now);
      weekAgo.setDate(now.getDate() - 6);
      return startDate === getDateString(weekAgo) && endDate === today;
    }
    case '30d': {
      const monthAgo = new Date(now);
      monthAgo.setDate(now.getDate() - 29);
      return startDate === getDateString(monthAgo) && endDate === today;
    }
    case 'month': {
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      return startDate === getDateString(monthStart) && endDate === today;
    }
    case 'year': {
      const yearStart = new Date(now.getFullYear(), 0, 1);
      return startDate === getDateString(yearStart) && endDate === today;
    }
    default:
      return false;
  }
};

// ==================== EXPORT MODAL ====================
function ExportModal({ isOpen, onClose, onExport, exporting }: any) {
  const [exportType, setExportType] = useState<'filtered' | 'all' | 'dateRange'>('filtered');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [methodFilter, setMethodFilter] = useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl dark:shadow-gray-950/50">
        <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center sticky top-0 bg-white dark:bg-gray-900">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Export Transactions</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Download transaction data as CSV</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-500 dark:text-gray-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Export Type</label>
            <div className="grid grid-cols-1 gap-2">
              {[
                { value: 'filtered', label: 'Current View', desc: 'Export currently displayed transactions' },
                { value: 'all', label: 'All Transactions', desc: 'Export all transactions' },
                { value: 'dateRange', label: 'Custom Date Range', desc: 'Select specific date range' },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setExportType(option.value as any)}
                  className={`p-3 rounded-lg border text-left transition ${
                    exportType === option.value
                      ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-900/20'
                      : 'border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                >
                  <div className="font-medium text-gray-900 dark:text-white">{option.label}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">{option.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {exportType === 'dateRange' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-cyan-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-cyan-500"
                />
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status Filter</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-cyan-500"
              >
                <option value="">All Status</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Payment Method</label>
              <select
                value={methodFilter}
                onChange={(e) => setMethodFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-cyan-500"
              >
                <option value="">All Methods</option>
                <option value="mpesa">M-Pesa</option>
                <option value="card">Card</option>
                <option value="cash">Cash</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="cheque">Cheque</option>
              </select>
            </div>
          </div>

          <button
            onClick={() => onExport(exportType, startDate, endDate, statusFilter, methodFilter)}
            disabled={exporting || (exportType === 'dateRange' && (!startDate || !endDate))}
            className="w-full px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {exporting ? (
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
            CSV will include: Transaction ID, Order #, Invoice #, Customer, Amount, Status, Payment Method, Source, Reference, Date, Notes
          </p>
        </div>
      </div>
    </div>
  );
}

// ==================== MAIN COMPONENT ====================
export default function SalesTransactionsPage() {
  const router = useRouter();
  const { user, isLoggedIn, isAdminOrSales } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [stats, setStats] = useState<TransactionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [methodFilter, setMethodFilter] = useState<string>('');
  const [sourceFilter, setSourceFilter] = useState<string>('');
  const [dateFilterPeriod, setDateFilterPeriod] = useState<DateFilterPeriod>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
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

  // ==================== AUTH CHECK ====================
  useEffect(() => {
    if (!isLoggedIn || !isAdminOrSales) {
      router.push('/auth/login');
      toast.error('Please login with sales or admin access to view transactions');
      return;
    }
    fetchTransactions();
    fetchStats();
  }, [isLoggedIn, isAdminOrSales, router]);

  // ==================== FETCH FUNCTIONS ====================
  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getTransactions({ 
        limit: 500,
        status: statusFilter || undefined,
        paymentMethod: methodFilter || undefined,
        source: sourceFilter || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      });
      let transactionsData = response.transactions || [];
      
      transactionsData = transactionsData.sort((a: Transaction, b: Transaction) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      
      setTransactions(transactionsData);
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
      toast.error('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, methodFilter, sourceFilter, startDate, endDate]);

  const fetchStats = useCallback(async () => {
    try {
      const response = await getTransactionStats();
      setStats(response);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  }, []);

  // ==================== DATE FILTER FUNCTIONS ====================
  const applyDateFilter = (period: DateFilterPeriod) => {
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

    setDateFilterPeriod(period);
    setStartDate(start);
    setEndDate(end);
    setCurrentPage(1);
  };

  const clearDateFilters = () => {
    setDateFilterPeriod('all');
    setStartDate('');
    setEndDate('');
    setCurrentPage(1);
  };

  const handleCustomDateChange = (type: 'start' | 'end', value: string) => {
    if (type === 'start') {
      setStartDate(value);
    } else {
      setEndDate(value);
    }
    setDateFilterPeriod('custom');
    // Only fetch if both dates are set
    if ((type === 'start' && value && endDate) || (type === 'end' && value && startDate)) {
      setCurrentPage(1);
    } else if (type === 'start' && !value) {
      clearDateFilters();
    }
  };

  // ==================== EXPORT ====================
  const handleExport = async (type: string, sDate: string, eDate: string, status: string, method: string) => {
    setExporting(true);
    try {
      const params: any = {};
      if (type === 'dateRange' && sDate && eDate) {
        params.startDate = sDate;
        params.endDate = eDate;
      }
      if (status) params.status = status;
      if (method) params.paymentMethod = method;
      
      const blob = await exportTransactionsToCSV(params);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const dateSuffix = sDate && eDate ? `${sDate}-to-${eDate}` : new Date().toISOString().split('T')[0];
      link.download = `transactions-${dateSuffix}.csv`;
      link.click();
      URL.revokeObjectURL(url);
      toast.success('Transactions exported successfully');
      setShowExportModal(false);
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Failed to export transactions');
    } finally {
      setExporting(false);
    }
  };

  // ==================== FILTERED & PAGINATED DATA ====================
  const filteredData = useMemo(() => {
    let data = transactions;
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      data = data.filter(t =>
        (t.customerName?.toLowerCase() || '').includes(term) ||
        (t.transactionId?.toLowerCase() || '').includes(term) ||
        (t.invoiceNumber?.toLowerCase() || '').includes(term) ||
        (t.orderNumber?.toLowerCase() || '').includes(term) ||
        (t.mpesaReceipt?.toLowerCase() || '').includes(term)
      );
    }
    
    return data;
  }, [transactions, searchTerm]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // ==================== STATS CALCULATIONS ====================
  const completedTransactions = transactions.filter(t => t.status === 'completed');
  const totalVolume = completedTransactions.reduce((sum, t) => sum + t.amount, 0);
  const successRate = transactions.length
    ? ((completedTransactions.length / transactions.length) * 100).toFixed(1)
    : '0';

  // ==================== COPY TRANSACTION ID ====================
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(text);
    setTimeout(() => setCopiedId(null), 2000);
    toast.success('Copied to clipboard');
  };

  // ==================== RENDER ====================
  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-10 h-10 animate-spin text-cyan-600 dark:text-cyan-400" />
          <p className="text-sm text-gray-500 dark:text-gray-400">Loading transactions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900 p-6 space-y-6">
      {/* ==================== HEADER ==================== */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Receipt className="w-6 h-6 text-cyan-500" />
            Transactions
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Track all financial transactions and payment history
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowExportModal(true)}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium flex items-center gap-2 transition-colors shadow-lg shadow-emerald-600/20 dark:shadow-emerald-800/30"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
          <button
            onClick={() => { fetchTransactions(); fetchStats(); }}
            className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-700 dark:text-gray-300"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ==================== SUMMARY CARDS ==================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-900 rounded-xl p-5 border border-gray-200 dark:border-gray-800 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Volume</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(totalVolume)}</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl p-5 border border-gray-200 dark:border-gray-800 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Transactions</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{transactions.length}</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <Receipt className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl p-5 border border-gray-200 dark:border-gray-800 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Success Rate</p>
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{successRate}%</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl p-5 border border-gray-200 dark:border-gray-800 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Avg. Transaction</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {transactions.length ? formatCurrency(totalVolume / transactions.length) : formatCurrency(0)}
              </p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <Activity className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
          </div>
        </div>
      </div>

      {/* ==================== CHARTS ==================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Breakdown - Pie Chart */}
        <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Status Breakdown</h2>
          <ResponsiveContainer width="100%" height={250}>
            <RePieChart>
              <Pie 
                data={stats?.byStatus || []} 
                cx="50%" 
                cy="50%" 
                labelLine={false} 
                label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`} 
                outerRadius={80} 
                fill="#8884d8" 
                dataKey="count" 
                nameKey="_id"
              >
                {(stats?.byStatus || []).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(v: any) => `${v} transactions`}
                contentStyle={{
                  backgroundColor: 'rgb(255,255,255)',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  color: '#111827',
                }}
                labelStyle={{ color: '#6b7280' }}
              />
            </RePieChart>
          </ResponsiveContainer>
        </div>

        {/* Method Breakdown - Bar Chart */}
        <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Payment Methods</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={stats?.byMethod || []} layout="vertical" margin={{ left: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-700" />
              <XAxis type="number" tickFormatter={formatCompact} stroke="#6b7280" className="dark:stroke-gray-400" />
              <YAxis type="category" dataKey="_id" stroke="#6b7280" className="dark:stroke-gray-400" />
              <Tooltip
                formatter={(v: any) => `${v} transactions`}
                contentStyle={{
                  backgroundColor: 'rgb(255,255,255)',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  color: '#111827',
                }}
                labelStyle={{ color: '#6b7280' }}
              />
              <Bar dataKey="count" fill="#3B82F6" name="Transactions" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ==================== FILTERS ==================== */}
      <div className="space-y-4">
        {/* Row 1: Search and main filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              placeholder="Search by customer, transaction ID, invoice #..."
              defaultValue={searchTerm}
              onChange={(e) => debouncedSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-cyan-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
            className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-cyan-500"
          >
            <option value="">All Status</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
          </select>
          <select
            value={methodFilter}
            onChange={(e) => { setMethodFilter(e.target.value); setCurrentPage(1); }}
            className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-cyan-500"
          >
            <option value="">All Methods</option>
            <option value="mpesa">M-Pesa</option>
            <option value="card">Card</option>
            <option value="cash">Cash</option>
            <option value="bank_transfer">Bank Transfer</option>
            <option value="cheque">Cheque</option>
          </select>
          <select
            value={sourceFilter}
            onChange={(e) => { setSourceFilter(e.target.value); setCurrentPage(1); }}
            className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-cyan-500"
          >
            <option value="">All Sources</option>
            <option value="checkout">Checkout</option>
            <option value="quotation">Quotation</option>
            <option value="invoice">Invoice</option>
            <option value="manual">Manual</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        {/* Row 2: Date Filters - Same Line */}
        <div className="flex flex-wrap items-center gap-2">
          <Calendar className="w-4 h-4 text-gray-400 dark:text-gray-500 mr-1 flex-shrink-0" />
          
          {(['all', 'today', 'yesterday', '7d', '30d', 'month', 'year'] as const).map((period) => (
            <button
              key={period}
              type="button"
              onClick={() => applyDateFilter(period)}
              className={`px-3 py-1.5 rounded-lg border text-sm font-medium transition whitespace-nowrap ${
                isDateFilterActive(period, startDate, endDate)
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
            onClick={() => applyDateFilter('custom')}
            className={`px-3 py-1.5 rounded-lg border text-sm font-medium transition whitespace-nowrap ${
              dateFilterPeriod === 'custom' && (startDate || endDate)
                ? 'bg-cyan-600 text-white border-cyan-600 shadow-lg shadow-cyan-600/20 dark:shadow-cyan-800/30'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            Custom
          </button>

          <div className="flex items-center gap-2">
            <input
              type="date"
              value={startDate}
              onChange={(e) => handleCustomDateChange('start', e.target.value)}
              className="px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-cyan-500 w-36"
              aria-label="Start date"
            />
            <span className="text-gray-400 text-sm">to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => handleCustomDateChange('end', e.target.value)}
              className="px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-cyan-500 w-36"
              aria-label="End date"
            />
          </div>

          {(startDate || endDate) && (
            <button
              type="button"
              onClick={clearDateFilters}
              className="p-1.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title="Clear date filters"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* ==================== TRANSACTIONS LIST ==================== */}
      <div className="space-y-4">
        {paginatedData.length === 0 ? (
          <div className="bg-white dark:bg-gray-900 rounded-xl p-12 text-center border border-gray-200 dark:border-gray-800">
            <Receipt className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">No transactions found</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {searchTerm || statusFilter || methodFilter || sourceFilter || startDate
                ? 'Try adjusting your filters'
                : 'No transactions have been recorded yet'}
            </p>
          </div>
        ) : (
          paginatedData.map((transaction) => (
            <div
              key={transaction._id}
              className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                      {getPaymentIcon(transaction.paymentMethod)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <button
                          onClick={() => copyToClipboard(transaction.transactionId)}
                          className="font-mono text-sm text-gray-600 dark:text-gray-400 hover:text-cyan-600 dark:hover:text-cyan-400 flex items-center gap-1"
                        >
                          {transaction.transactionId}
                          {copiedId === transaction.transactionId ? (
                            <Check className="w-3 h-3 text-emerald-500" />
                          ) : (
                            <Copy className="w-3 h-3 opacity-50 hover:opacity-100" />
                          )}
                        </button>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(transaction.status)}`}>
                          {getStatusIcon(transaction.status)}
                          {transaction.status}
                        </span>
                        {transaction.isPartialPayment && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                            Partial
                          </span>
                        )}
                        {transaction.source === 'manual' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400 border border-purple-200 dark:border-purple-800">
                            Manual
                          </span>
                        )}
                        {transaction.source === 'invoice' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                            Invoice
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-600 dark:text-gray-400 flex-wrap">
                        <div className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          <span>{transaction.customerName || 'Guest'}</span>
                        </div>
                        {transaction.orderNumber && (
                          <div className="flex items-center gap-1">
                            <FileText className="w-3 h-3" />
                            <span>Order: {transaction.orderNumber}</span>
                          </div>
                        )}
                        {transaction.invoiceNumber && (
                          <div className="flex items-center gap-1">
                            <FileText className="w-3 h-3" />
                            <span>Invoice: {transaction.invoiceNumber}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-xs text-gray-500 dark:text-gray-400 flex-wrap">
                        <span className="capitalize flex items-center gap-1">
                          {getPaymentIcon(transaction.paymentMethod)}
                          {transaction.paymentMethod.replace('_', ' ')}
                        </span>
                        {transaction.mpesaReceipt && (
                          <span>M-Pesa: {transaction.mpesaReceipt}</span>
                        )}
                        {transaction.cardLast4 && (
                          <span>Card: ****{transaction.cardLast4}</span>
                        )}
                        {transaction.reference && (
                          <span>Ref: {transaction.reference}</span>
                        )}
                        {transaction.recordedByName && (
                          <span>By: {transaction.recordedByName}</span>
                        )}
                        <span>{new Date(transaction.createdAt).toLocaleString()}</span>
                      </div>
                      {transaction.notes && (
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{transaction.notes}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {formatCurrency(transaction.amount)}
                    </p>
                    <button
                      onClick={() => {
                        setSelectedTransaction(transaction);
                        setShowDetailsModal(true);
                      }}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ==================== PAGINATION ==================== */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredData.length)} of {filteredData.length}
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg border border-gray-300 dark:border-gray-700 disabled:opacity-50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm text-gray-600 dark:text-gray-400 px-3">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg border border-gray-300 dark:border-gray-700 disabled:opacity-50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ==================== DETAILS MODAL ==================== */}
      {showDetailsModal && selectedTransaction && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl dark:shadow-gray-950/50">
            <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center sticky top-0 bg-white dark:bg-gray-900">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Transaction Details</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-mono">{selectedTransaction.transactionId}</p>
              </div>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-500 dark:text-gray-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Amount</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(selectedTransaction.amount)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Status</p>
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedTransaction.status)}`}>
                    {getStatusIcon(selectedTransaction.status)}
                    {selectedTransaction.status}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Payment Method</p>
                  <p className="font-medium text-gray-900 dark:text-white capitalize flex items-center gap-2">
                    {getPaymentIcon(selectedTransaction.paymentMethod)}
                    {selectedTransaction.paymentMethod.replace('_', ' ')}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Source</p>
                  <p className="font-medium text-gray-900 dark:text-white capitalize">{selectedTransaction.source}</p>
                </div>
              </div>

              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Customer</p>
                <p className="font-medium text-gray-900 dark:text-white">{selectedTransaction.customerName || 'Guest'}</p>
              </div>

              {(selectedTransaction.orderNumber || selectedTransaction.invoiceNumber) && (
                <div className="grid grid-cols-2 gap-4">
                  {selectedTransaction.orderNumber && (
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Order Number</p>
                      <p className="font-medium text-gray-900 dark:text-white">{selectedTransaction.orderNumber}</p>
                    </div>
                  )}
                  {selectedTransaction.invoiceNumber && (
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Invoice Number</p>
                      <p className="font-medium text-gray-900 dark:text-white">{selectedTransaction.invoiceNumber}</p>
                    </div>
                  )}
                </div>
              )}

              {selectedTransaction.mpesaReceipt && (
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">M-Pesa Receipt</p>
                  <p className="font-medium text-gray-900 dark:text-white">{selectedTransaction.mpesaReceipt}</p>
                </div>
              )}

              {selectedTransaction.cardLast4 && (
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Card</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {selectedTransaction.cardBrand || 'Card'} ****{selectedTransaction.cardLast4}
                  </p>
                </div>
              )}

              {selectedTransaction.reference && (
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Reference</p>
                  <p className="font-medium text-gray-900 dark:text-white">{selectedTransaction.reference}</p>
                </div>
              )}

              {selectedTransaction.recordedByName && (
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Recorded By</p>
                  <p className="font-medium text-gray-900 dark:text-white">{selectedTransaction.recordedByName}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Created At</p>
                  <p className="text-sm text-gray-900 dark:text-white">{new Date(selectedTransaction.createdAt).toLocaleString()}</p>
                </div>
                {selectedTransaction.paidAt && (
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Paid At</p>
                    <p className="text-sm text-gray-900 dark:text-white">{new Date(selectedTransaction.paidAt).toLocaleString()}</p>
                  </div>
                )}
              </div>

              {selectedTransaction.notes && (
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Notes</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">{selectedTransaction.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ==================== EXPORT MODAL ==================== */}
      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        onExport={handleExport}
        exporting={exporting}
      />
    </div>
  );
}