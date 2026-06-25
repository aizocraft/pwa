'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Package,
  Calendar,
  Download,
  Filter,
  RefreshCw,
  ChevronDown,
  Loader2,
  BarChart3,
  Activity,
  Award,
  Target,
  Zap,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  Star,
  ChevronLeft,
  ChevronRight,
  X,
  PieChart,
  Users,
  Building2,
  Wallet,
  Percent,
  LineChart as LineChartIcon,
  BarChart as BarChartIcon,
  Settings,
  Eye,
  EyeOff,
  Printer,
  FileSpreadsheet,
} from 'lucide-react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart as RePieChart,
  Pie,
  Cell,
  Scatter,
  ScatterChart,
  ZAxis,
  ComposedChart,
} from 'recharts';
import {
  getProfitSummary,
  getProfitByProduct,
  getProfitByCategory,
  getProfitBySupplier,
  getProfitTrends,
  getTopProfitProducts,
} from '@/lib/api';
import toast from 'react-hot-toast';

// Colors for charts
const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'];
const DARK_COLORS = ['#60A5FA', '#34D399', '#FBBF24', '#F87171', '#A78BFA', '#F472B6', '#22D3EE', '#A3E635'];

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

const getPeriodLabel = (period: string): string => {
  const labels: Record<string, string> = {
    '7d': 'Last 7 Days',
    '30d': 'Last 30 Days',
    '90d': 'Last 90 Days',
    'year': 'This Year',
    'all': 'All Time',
  };
  return labels[period] || period;
};

// ==================== EXPORT MODAL ====================
interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (type: 'filtered' | 'all' | 'dateRange', startDate: string, endDate: string) => Promise<void>;
  exporting: boolean;
}

function ExportModal({ isOpen, onClose, onExport, exporting }: ExportModalProps) {
  const [exportType, setExportType] = useState<'filtered' | 'all' | 'dateRange'>('filtered');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl dark:shadow-gray-950/50">
        <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center sticky top-0 bg-white dark:bg-gray-900">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Export Profit Report</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Download profit data as CSV</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-500 dark:text-gray-400">
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
                  Export currently displayed data
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
                <div className="font-medium text-gray-900 dark:text-white">All Data</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Export all profit data
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

          {/* Export Button */}
          <button
            onClick={() => onExport(exportType, startDate, endDate)}
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
            CSV will include: Product, SKU, Category, Revenue, Cost, Profit, Margin, Units Sold, Supplier
          </p>
        </div>
      </div>
    </div>
  );
}

// ==================== MAIN COMPONENT ====================
export default function ProfitsPage() {
  // ============ STATE ============
  const [period, setPeriod] = useState<'7d' | '30d' | '90d' | 'year' | 'all'>('30d');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [supplierFilter, setSupplierFilter] = useState<string>('');
  const [categories, setCategories] = useState<string[]>([]);
  const [suppliers, setSuppliers] = useState<string[]>([]);
  const [exporting, setExporting] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [chartView, setChartView] = useState<'trends' | 'categories' | 'suppliers'>('trends');
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'profit' | 'margin' | 'revenue' | 'units'>('profit');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // ============ DATA STATE ============
  const [summaryData, setSummaryData] = useState({
    totalRevenue: 0,
    totalCost: 0,
    totalProfit: 0,
    totalUnitsSold: 0,
    overallMargin: '0',
  });

  const [productData, setProductData] = useState<any[]>([]);
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [supplierData, setSupplierData] = useState<any[]>([]);
  const [trendsData, setTrendsData] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);

  // ============ FETCH FUNCTIONS ============
  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [summary, products, categories, suppliers, trends, top] = await Promise.all([
        getProfitSummary(),
        getProfitByProduct({ limit: 50 }),
        getProfitByCategory(),
        getProfitBySupplier(),
        getProfitTrends({ period: period === '7d' ? 'daily' : period === '30d' ? 'weekly' : 'monthly', months: period === 'year' ? 12 : 3 }),
        getTopProfitProducts({ limit: 20 }),
      ]);

      setSummaryData(summary.summary);
      setProductData(products.products || []);
      setCategoryData(categories.categories || []);
      setSupplierData(suppliers.suppliers || []);
      setTrendsData(trends.trends || []);
      setTopProducts(top.products || []);

      // Extract unique categories and suppliers for filters
      const uniqueCategories = [...new Set((products.products || []).map((p: any) => p.category).filter(Boolean))];
      const uniqueSuppliers = [...new Set((products.products || []).map((p: any) => p.supplierName).filter(Boolean))];
      setCategories(uniqueCategories as string[]);
      setSuppliers(uniqueSuppliers as string[]);
    } catch (error) {
      console.error('Failed to fetch profit data:', error);
      toast.error('Failed to load profit data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, [period]);

  // ============ EXPORT HANDLER ============
  const handleExport = async (type: 'filtered' | 'all' | 'dateRange', startDate: string, endDate: string) => {
    setExporting(true);
    try {
      let dataToExport = productData;

      if (type === 'all') {
        // Fetch all products
        const allProducts = await getProfitByProduct({ limit: 500 });
        dataToExport = allProducts.products || [];
      } else if (type === 'dateRange' && startDate && endDate) {
        const filtered = await getProfitByProduct({ 
          startDate, 
          endDate, 
          limit: 500 
        });
        dataToExport = filtered.products || [];
      }

      if (dataToExport.length === 0) {
        toast.error('No data to export');
        return;
      }

      // Build CSV
      const headers = [
        'Product Name',
        'SKU',
        'Category',
        'Supplier',
        'Revenue (KES)',
        'Cost (KES)',
        'Profit (KES)',
        'Margin (%)',
        'Units Sold',
        'Avg Selling Price',
        'Avg Buying Price',
      ];

      const rows = dataToExport.map((p: any) => [
        p.productName || p.name || 'N/A',
        p.productSku || p.sku || 'N/A',
        p.category || 'N/A',
        p.supplierName || 'N/A',
        p.totalRevenue?.toFixed(2) || '0',
        p.totalCost?.toFixed(2) || '0',
        p.totalProfit?.toFixed(2) || '0',
        p.averageMargin?.toFixed(1) || p.margin?.toFixed(1) || '0',
        p.totalUnitsSold || '0',
        p.averageSellingPrice?.toFixed(2) || '0',
        p.averageBuyingPrice?.toFixed(2) || '0',
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(',')),
      ].join('\n');

      const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const dateSuffix = startDate && endDate ? `${startDate}-to-${endDate}` : new Date().toISOString().split('T')[0];
      link.download = `profit-report-${dateSuffix}.csv`;
      link.click();
      URL.revokeObjectURL(url);
      toast.success(`Exported ${dataToExport.length} products`);
      setShowExportModal(false);
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Failed to export report');
    } finally {
      setExporting(false);
    }
  };

  // ============ FILTERING & SORTING ============
  const filteredProducts = useMemo(() => {
    return productData
      .filter(p => !categoryFilter || p.category === categoryFilter)
      .filter(p => !supplierFilter || p.supplierName === supplierFilter)
      .sort((a, b) => {
        let aVal = 0;
        let bVal = 0;
        
        switch (sortBy) {
          case 'profit':
            aVal = a.totalProfit || 0;
            bVal = b.totalProfit || 0;
            break;
          case 'margin':
            aVal = a.averageMargin || a.margin || 0;
            bVal = b.averageMargin || b.margin || 0;
            break;
          case 'revenue':
            aVal = a.totalRevenue || 0;
            bVal = b.totalRevenue || 0;
            break;
          case 'units':
            aVal = a.totalUnitsSold || 0;
            bVal = b.totalUnitsSold || 0;
            break;
          default:
            aVal = a.totalProfit || 0;
            bVal = b.totalProfit || 0;
        }
        
        return sortOrder === 'desc' ? bVal - aVal : aVal - bVal;
      });
  }, [productData, categoryFilter, supplierFilter, sortBy, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [categoryFilter, supplierFilter, sortBy, sortOrder]);

  // ============ RENDER ============
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-10 h-10 animate-spin text-cyan-600 dark:text-cyan-400" />
          <p className="text-sm text-gray-500 dark:text-gray-400">Loading profit analytics...</p>
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
            <TrendingUp className="w-6 h-6 text-emerald-500" />
            Profit Analytics
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Track and analyze profitability across products, categories, and suppliers
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-cyan-500"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
            <option value="year">This Year</option>
            <option value="all">All Time</option>
          </select>
          <button
            onClick={() => setShowExportModal(true)}
            disabled={exporting}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium flex items-center gap-2 transition-colors shadow-lg shadow-emerald-600/20 dark:shadow-emerald-800/30"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
          <button
            onClick={fetchAllData}
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
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(summaryData.totalRevenue)}</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl p-5 border border-gray-200 dark:border-gray-800 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Cost</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(summaryData.totalCost)}</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <Package className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl p-5 border border-gray-200 dark:border-gray-800 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Profit</p>
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(summaryData.totalProfit)}</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl p-5 border border-gray-200 dark:border-gray-800 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Profit Margin</p>
              <p className={`text-2xl font-bold ${parseFloat(summaryData.overallMargin) >= 30 ? 'text-emerald-600 dark:text-emerald-400' : parseFloat(summaryData.overallMargin) >= 0 ? 'text-amber-600 dark:text-amber-400' : 'text-red-600 dark:text-red-400'}`}>
                {summaryData.overallMargin}%
              </p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <Target className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
          </div>
        </div>
      </div>

      {/* ==================== CHART VIEW SELECTOR ==================== */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setChartView('trends')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            chartView === 'trends'
              ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/20 dark:shadow-cyan-800/30'
              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
        >
          <LineChartIcon className="w-4 h-4 inline mr-2" />
          Trends
        </button>
        <button
          onClick={() => setChartView('categories')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            chartView === 'categories'
              ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/20 dark:shadow-cyan-800/30'
              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
        >
          <BarChartIcon className="w-4 h-4 inline mr-2" />
          By Category
        </button>
        <button
          onClick={() => setChartView('suppliers')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            chartView === 'suppliers'
              ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/20 dark:shadow-cyan-800/30'
              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
        >
          <Building2 className="w-4 h-4 inline mr-2" />
          By Supplier
        </button>
      </div>

      {/* ==================== CHARTS ==================== */}
      <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm">
        {chartView === 'trends' && (
          <>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Profit Trends</h2>
              <div className="flex items-center gap-4 text-xs">
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                  Revenue
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                  Profit
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-full bg-amber-500"></span>
                  Margin
                </span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={320}>
              <ComposedChart data={trendsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-700" />
                <XAxis dataKey="_id" stroke="#6b7280" className="dark:stroke-gray-400" />
                <YAxis yAxisId="left" tickFormatter={formatCompact} stroke="#6b7280" className="dark:stroke-gray-400" />
                <YAxis yAxisId="right" orientation="right" tickFormatter={(v) => `${v}%`} stroke="#6b7280" className="dark:stroke-gray-400" />
<Tooltip 
  formatter={(v: any, name: any) => {
    if (name === 'Margin') return `${v}%`;
    return formatCurrency(v);
  }} 
  contentStyle={{ backgroundColor: 'rgb(255,255,255)', border: '1px solid #e5e7eb', borderRadius: '8px', color: '#111827' }} 
  labelStyle={{ color: '#6b7280' }}
/>
                <Legend />
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="revenue"
                  fill="#3B82F6"
                  stroke="#3B82F6"
                  fillOpacity={0.1}
                  name="Revenue"
                />
                <Line yAxisId="left" type="monotone" dataKey="profit" stroke="#10B981" strokeWidth={2} name="Profit" />
                <Line yAxisId="right" type="monotone" dataKey="margin" stroke="#F59E0B" strokeWidth={2} name="Margin" strokeDasharray="5 5" />
              </ComposedChart>
            </ResponsiveContainer>
          </>
        )}

        {chartView === 'categories' && (
          <>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Profit by Category</h2>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={categoryData} layout="vertical" margin={{ left: 80 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-700" />
                <XAxis type="number" tickFormatter={formatCompact} stroke="#6b7280" className="dark:stroke-gray-400" />
                <YAxis type="category" dataKey="_id" stroke="#6b7280" className="dark:stroke-gray-400" width={80} />
                <Tooltip
                  formatter={(v: any) => formatCurrency(v)}
                  contentStyle={{
                    backgroundColor: 'rgb(255,255,255)',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    color: '#111827',
                  }}
                  labelStyle={{ color: '#6b7280' }}
                />
                <Legend />
                <Bar dataKey="totalRevenue" fill="#3B82F6" name="Revenue" />
                <Bar dataKey="totalProfit" fill="#10B981" name="Profit" />
              </BarChart>
            </ResponsiveContainer>
          </>
        )}

        {chartView === 'suppliers' && (
          <>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Profit by Supplier</h2>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={supplierData} layout="vertical" margin={{ left: 80 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-700" />
                <XAxis type="number" tickFormatter={formatCompact} stroke="#6b7280" className="dark:stroke-gray-400" />
                <YAxis type="category" dataKey="_id" stroke="#6b7280" className="dark:stroke-gray-400" width={80} />
                <Tooltip
                  formatter={(v: any) => formatCurrency(v)}
                  contentStyle={{
                    backgroundColor: 'rgb(255,255,255)',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    color: '#111827',
                  }}
                  labelStyle={{ color: '#6b7280' }}
                />
                <Legend />
                <Bar dataKey="totalRevenue" fill="#8B5CF6" name="Revenue" />
                <Bar dataKey="totalProfit" fill="#10B981" name="Profit" />
              </BarChart>
            </ResponsiveContainer>
          </>
        )}
      </div>

      {/* ==================== FILTERS ==================== */}
      <div className="flex flex-wrap gap-3 items-center">
        <Filter className="w-4 h-4 text-gray-400 dark:text-gray-500" />
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-cyan-500"
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        <select
          value={supplierFilter}
          onChange={(e) => setSupplierFilter(e.target.value)}
          className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-cyan-500"
        >
          <option value="">All Suppliers</option>
          {suppliers.map((sup) => (
            <option key={sup} value={sup}>{sup}</option>
          ))}
        </select>
        <button
          onClick={() => {
            setCategoryFilter('');
            setSupplierFilter('');
          }}
          className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-700 dark:text-gray-300"
        >
          <X className="w-3 h-3" />
        </button>
        <span className="text-sm text-gray-500 dark:text-gray-400 ml-auto">
          {filteredProducts.length} products
        </span>
      </div>

      {/* ==================== TOP PRODUCTS TABLE ==================== */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-500" />
            Top Profit Products
          </h2>
          <div className="flex flex-wrap gap-2">
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value as any);
                setCurrentPage(1);
              }}
              className="text-sm border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-1.5 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-cyan-500"
            >
              <option value="profit">Sort by Profit</option>
              <option value="margin">Sort by Margin</option>
              <option value="revenue">Sort by Revenue</option>
              <option value="units">Sort by Units</option>
            </select>
            <button
              onClick={() => {
                setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc');
                setCurrentPage(1);
              }}
              className="text-sm border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-1.5 bg-white dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              {sortOrder === 'desc' ? '↓ Descending' : '↑ Ascending'}
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Product</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">SKU</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Category</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Revenue</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Cost</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Profit</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Margin</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Units</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {paginatedProducts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                    No products found matching filters
                  </td>
                </tr>
              ) : (
                paginatedProducts.map((product: any) => {
                  const margin = product.averageMargin || product.margin || 0;
                  const isHighMargin = margin >= 30;
                  const isMediumMargin = margin >= 15 && margin < 30;
                  const isLowMargin = margin < 15 && margin >= 0;
                  const isNegative = margin < 0;

                  return (
                    <tr key={product._id || product.productId} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900 dark:text-white">{product.productName || product.name}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{product.productSku || product.sku || 'N/A'}</td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{product.category || 'N/A'}</td>
                      <td className="px-6 py-4 text-right text-gray-900 dark:text-white">{formatCurrency(product.totalRevenue || 0)}</td>
                      <td className="px-6 py-4 text-right text-gray-500 dark:text-gray-400">{formatCurrency(product.totalCost || 0)}</td>
                      <td className="px-6 py-4 text-right font-semibold text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(product.totalProfit || 0)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            isHighMargin
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                              : isMediumMargin
                              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                              : isLowMargin
                              ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                              : isNegative
                              ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                              : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                          }`}
                        >
                          {margin.toFixed(1)}%
                          {isNegative && <TrendingDown className="w-3 h-3 inline ml-1" />}
                          {isHighMargin && <TrendingUp className="w-3 h-3 inline ml-1" />}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right text-gray-900 dark:text-white">{product.totalUnitsSold || 0}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredProducts.length)} of {filteredProducts.length} products
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-1.5 rounded disabled:opacity-50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded disabled:opacity-50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

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