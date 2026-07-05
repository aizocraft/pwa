'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  TrendingUp,
  DollarSign,
  ShoppingBag,
  FileText,
  Users,
  CheckCircle,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  RefreshCw,
  Target,
  Award,
  Activity,
  PieChart as PieChartIcon,
  Clock,
  CreditCard,
  Zap,
  Calendar,
  Package,
  Star,
  Flame,
  BarChart3,
  LineChart,
  Wallet,
  Smartphone,
  Banknote,
  Building2,
  Filter,
  X,
  Loader2,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  Copy,
  Check,
  Printer,
  FileSpreadsheet,
  Mail,
  Share2,
  Settings,
  Sliders,
  Grid3x3,
  List,
  LayoutGrid,
  Maximize2,
  Minimize2,
  TrendingDown,
  AlertCircle,
  Info,
  HelpCircle,
  MoreHorizontal,
  Plus,
  Minus,
  Move,
  RefreshCcw,
  RotateCcw,
  Sparkles,
  Crown,
  Medal,
  Trophy,
  Gem,
  Diamond,
  Layers,
  Network,
  Globe,
  Radio,
  Scan,
  Fingerprint,
  Shield,
  Lock,
  Unlock,
  Key,
  Wifi,
  Bluetooth,
  Cloud,
  Database,
  Server,
  Cpu,
  HardDrive,
  Monitor,
  Tablet,
  Phone,
  Headphones,
  Speaker,
  Mic,
  Video,
  Camera,
  ImageIcon,
  Film,
  Music,
  RadioIcon,
  CompassIcon,
  Anchor,
  Ship,
  Plane,
  Car,
  Train,
  XCircle,
  Bus,
  Bike,
  Heart,
  HeartPulse,
  Stethoscope,
  Pill,
  Syringe,
  Bandage,
  Hospital,
  Ambulance,
  Home,
  Building,
  Factory,
  Warehouse,
  Store,
  ShoppingCart,
  Truck,
  PackageCheck,
  PackageOpen,
  PackageX,
  Box,
  Archive,
  Folder,
  File,
  FileCheck,
  FileX,
  FileClock,
  FileSearch,
  FileSpreadsheetIcon,
  FileTextIcon,
} from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { toast } from 'react-hot-toast';
import api from '@/lib/api';
import {
  LineChart as ReLineChart,
  Line,
  BarChart as ReBarChart,
  Bar,
  PieChart as RePieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  ComposedChart,
  Sector,
  ScatterChart,
  Scatter,
  ZAxis,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Treemap,
  Sankey,
} from 'recharts';
import type {
  SalesAnalytics,
  AdminAnalytics,
  OverviewMetrics,
  QuotationMetrics,
  OrderMetrics,
  TransactionMetrics,
  CustomerMetrics,
  MonthlyTarget,
  TopProduct,
  ChartsData,
  ConversionFunnel,
  SalesRepInfo,
} from '@/lib/sales';

type AnalyticsData = SalesAnalytics | AdminAnalytics | null;

// ==================== COLOR SCHEME ====================
const COLORS = {
  primary: '#0043b3',
  secondary: '#000063',
  accent: '#009dff',
  white: '#ffffff',
  dark: '#0a0a1a',
  light: '#f5f7fa',
  success: '#00c853',
  warning: '#ffab00',
  danger: '#ff1744',
  info: '#009dff',
  gray: '#6b7280',
  lightGray: '#e5e7eb',
  darkGray: '#374151',
};

const CHART_COLORS = [
  '#0043b3',
  '#009dff',
  '#00c853',
  '#ffab00',
  '#ff1744',
  '#7c3aed',
  '#ec4899',
  '#14b8a6',
  '#f59e0b',
  '#8b5cf6',
];

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
    week: 'Last 7 Days',
    month: 'Last 30 Days',
    quarter: 'Last Quarter',
    year: 'This Year',
  };
  return labels[period] || period;
};

// ==================== EXPORT MODAL ====================
function ExportModal({ isOpen, onClose, onExport, exporting, analytics, period }: any) {
  const [exportType, setExportType] = useState<'summary' | 'detailed' | 'charts' | 'pdf'>('summary');
  const [format, setFormat] = useState<'csv' | 'json'>('csv');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200 dark:border-gray-800 animate-in fade-in zoom-in duration-200">
        <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center sticky top-0 bg-white dark:bg-gray-900 z-10">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Export Analytics</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Download analytics data in your preferred format</p>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors text-gray-500 dark:text-gray-400"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Export Type</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {[
                { value: 'summary', label: '📊 Summary Report', desc: 'Key metrics and overview' },
                { value: 'detailed', label: '📈 Detailed Report', desc: 'All data with breakdowns' },
                { value: 'charts', label: '📉 Chart Data', desc: 'Raw data for visualizations' },
                { value: 'pdf', label: '📄 PDF Report', desc: 'Professional PDF document' },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setExportType(option.value as any)}
                  className={`p-3 rounded-xl border-2 text-left transition-all ${
                    exportType === option.value
                      ? 'border-[#0043b3] bg-[#0043b3]/10 dark:bg-[#0043b3]/20 shadow-md'
                      : 'border-gray-200 dark:border-gray-700 hover:border-[#0043b3]/50 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                >
                  <div className="font-medium text-gray-900 dark:text-white text-sm">{option.label}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{option.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {exportType !== 'pdf' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Format</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setFormat('csv')}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    format === 'csv'
                      ? 'bg-[#0043b3] text-white shadow-md'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  CSV
                </button>
                <button
                  onClick={() => setFormat('json')}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    format === 'json'
                      ? 'bg-[#0043b3] text-white shadow-md'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  JSON
                </button>
              </div>
            </div>
          )}

          <button
            onClick={() => onExport(exportType, format)}
            disabled={exporting}
            className="w-full px-4 py-3.5 bg-gradient-to-r from-[#0043b3] to-[#000063] hover:from-[#000063] hover:to-[#0043b3] text-white rounded-xl font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
          >
            {exporting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                {exportType === 'pdf' ? 'Generate PDF Report' : `Export ${format.toUpperCase()}`}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ==================== CUSTOM TOOLTIP ====================
const CustomTooltip = ({ active, payload, label, unit = 'KES' }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 min-w-[180px]">
        <p className="text-sm font-semibold text-gray-900 dark:text-white mb-2">{label}</p>
        {payload.map((p: any, idx: number) => (
          <p key={idx} className="text-sm flex items-center gap-2" style={{ color: p.color || '#0043b3' }}>
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color || '#0043b3' }} />
            {p.name}: {unit === 'KES' ? formatCurrency(p.value) : p.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// ==================== MAIN COMPONENT ====================
export default function AnalyticsPage() {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<AnalyticsData>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [refreshing, setRefreshing] = useState(false);
  const [activeChart, setActiveChart] = useState<'revenue' | 'orders' | 'quotations'>('revenue');
  const [chartView, setChartView] = useState<'trend' | 'comparison' | 'distribution'>('trend');
  const [showExportModal, setShowExportModal] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [showAllProducts, setShowAllProducts] = useState(false);
  const [hoveredCategory, setHoveredCategory] = useState<number | null>(null);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const isAdmin = user?.role === 'admin';

  // ==================== FETCH DATA ====================
  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      const endpoint = isAdmin ? '/analytics/admin/overview' : '/analytics/sales/overview';
      const response = await api.get(endpoint, { params: { period } });

      let data;
      if (response.data.success) {
        data = response.data.data;
      } else {
        data = response.data;
      }

      setAnalytics(data);
    } catch (error: any) {
      console.error('Failed to fetch analytics:', error);
      toast.error(error.response?.data?.error || 'Failed to load analytics');
      setAnalytics(null);
    } finally {
      setLoading(false);
    }
  }, [period, isAdmin]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAnalytics();
    setRefreshing(false);
    toast.success('Analytics refreshed');
  };

  // ==================== DATA GETTERS ====================
  const getOverview = (): OverviewMetrics =>
    analytics?.overview || {
      totalRevenue: 0,
      totalCost: 0,
      totalProfit: 0,
      profitMargin: 0,
      totalOrders: 0,
      averageOrderValue: 0,
      conversionRate: 0,
      totalCustomers: 0,
      activeCustomers: 0,
      totalQuotations: 0,
      successRate: 0,
      revenueGrowth: '0',
      orderGrowth: '0',
    };

  const getOrders = (): OrderMetrics =>
    analytics?.orders || {
      totalOrders: 0,
      totalRevenue: 0,
      totalCost: 0,
      totalProfit: 0,
      profitMargin: 0,
      averageProfitPerOrder: 0,
      paidOrders: 0,
      pendingOrders: 0,
      cancelledOrders: 0,
      averageOrderValue: 0,
      completionRate: 0,
    };

  const getQuotations = (): QuotationMetrics =>
    analytics?.quotations || {
      totalQuotations: 0,
      totalQuotationValue: 0,
      totalQuotationProfit: 0,
      averageQuotationMargin: 0,
      convertedCount: 0,
      acceptedCount: 0,
      draftCount: 0,
      sentCount: 0,
      rejectedCount: 0,
      conversionRate: 0,
    };

  const getTransactions = (): TransactionMetrics =>
    analytics?.transactions || {
      totalTransactions: 0,
      totalVolume: 0,
      completed: 0,
      pending: 0,
      failed: 0,
      refunded: 0,
      successRate: 0,
      averageValue: 0,
    };

  const getCustomers = (): CustomerMetrics | undefined => analytics?.customers;
  const getMonthlyTarget = (): MonthlyTarget | undefined => analytics?.monthlyTarget;

  const getTopProducts = (): TopProduct[] => {
    if (isAdmin && (analytics as AdminAnalytics)?.topProducts) {
      return (analytics as AdminAnalytics).topProducts || [];
    }
    if (!isAdmin && (analytics as SalesAnalytics)?.topProducts) {
      return (analytics as SalesAnalytics).topProducts || [];
    }
    return [];
  };

  const getDailySalesData = (): any[] => {
    let rawData: any[] = [];
    if (isAdmin && (analytics as AdminAnalytics)?.charts?.dailySales) {
      rawData = (analytics as AdminAnalytics).charts?.dailySales || [];
    } else if (!isAdmin && (analytics as SalesAnalytics)?.charts?.dailyPerformance) {
      rawData = (analytics as SalesAnalytics).charts?.dailyPerformance || [];
    }

    if (!rawData || rawData.length === 0) {
      return [];
    }

    return rawData.map((item) => ({
      date: item._id || item.date || '',
      revenue: Number(item.revenue || 0),
      orders: Number(item.orders || 0),
      quotations: Number(item.quotations || 0),
    }));
  };

  const getQuotationTrendData = (): any[] => {
    const rawData = (analytics as any)?.charts?.quotationTrends || [];
    if (!rawData || rawData.length === 0) {
      return [];
    }

    return rawData.map((item: any) => {
      const total = Object.entries(item || {}).reduce((sum, [key, value]) => {
        if (key === 'date' || key === '_id') {
          return sum;
        }
        return sum + (typeof value === 'number' ? value : Number(value || 0));
      }, 0);

      return {
        date: item.date || item._id || '',
        total,
        accepted: Number(item.accepted || item.Accepted || 0),
        converted: Number(item.converted || item.Converted || 0),
      };
    });
  };

  const getChartSeriesData = (): any[] => {
    const dailyData = getDailySalesData();
    const quotationData = getQuotationTrendData();

    if (!quotationData.length) {
      return dailyData;
    }

    return dailyData.map((item) => {
      const matchingQuotation = quotationData.find((quote) => quote.date === item.date);
      return {
        ...item,
        quotations: matchingQuotation ? matchingQuotation.total : 0,
      };
    });
  };

  const getPaymentMethodsData = () => {
    const paymentMethods = (analytics as any)?.charts?.paymentMethods;
    if (paymentMethods?.labels?.length && paymentMethods?.datasets?.length) {
      return paymentMethods.labels.map((label: string, index: number) => ({
        name: label,
        value: paymentMethods.datasets[0]?.data[index] || 0,
        volume: paymentMethods.datasets[1]?.data[index] || 0,
      }));
    }

    return [];
  };

  const getCategorySalesData = (): any[] => {
    const categories = isAdmin ? (analytics as AdminAnalytics)?.charts?.categorySales || [] : [];

    return categories
      .filter((cat) => {
        const hasRevenue = (cat.revenue || 0) > 0;
        const hasValidName =
          cat.category &&
          cat.category !== 'Uncategorized' &&
          cat.category !== 'uncategorized' &&
          cat.category !== '';
        return hasRevenue && hasValidName;
      })
      .map((cat) => ({
        ...cat,
        category: cat.category || 'Other',
        revenue: Number(cat.revenue || 0),
        quantity: Number(cat.quantity || 0),
      }));
  };

  const getHourlyDistributionData = (): any[] => {
    let rawData: any[] = [];
    if (isAdmin && (analytics as AdminAnalytics)?.charts?.hourlyDistribution) {
      rawData = (analytics as AdminAnalytics).charts?.hourlyDistribution || [];
    }

    if (!rawData || rawData.length === 0) {
      return [];
    }

    return rawData.map((item) => ({
      hour: item.hour ?? 0,
      orders: Number(item.orders || 0),
      revenue: Number(item.revenue || 0),
    }));
  };

  const getConversionFunnel = (): ConversionFunnel | undefined => {
    if (isAdmin && (analytics as AdminAnalytics)?.conversionFunnel) {
      return (analytics as AdminAnalytics).conversionFunnel;
    }
    return undefined;
  };

  // ==================== COMPUTED DATA ====================
  const overview = getOverview();
  const quotations = getQuotations();
  const orders = getOrders();
  const transactions = getTransactions();
  const customers = getCustomers();
  const monthlyTarget = getMonthlyTarget();
  const topProducts = getTopProducts();
  const chartData = useMemo(() => getChartSeriesData(), [analytics, isAdmin]);
  const paymentMethodData = getPaymentMethodsData();
  const categorySales = getCategorySalesData();
  const hourlyDistribution = getHourlyDistributionData();
  const conversionFunnel = getConversionFunnel();

  const hasCategoryData = categorySales.length > 0;
  const displayCategories = showAllCategories ? categorySales : categorySales.slice(0, 6);

  // Backend should provide `percentage`, but add a safe fallback for older data
  const normalizedDisplayCategories = useMemo(() => {
    const total = displayCategories.reduce((sum, c) => sum + (Number(c.revenue) || 0), 0);
    return displayCategories.map((c) => {
      const revenue = Number(c.revenue) || 0;
      const percentage = typeof c.percentage === 'number' ? c.percentage : total > 0 ? (revenue / total) * 100 : 0;
      return { ...c, percentage };
    });
  }, [displayCategories]);

  const activeMetricKey = activeChart === 'revenue' ? 'revenue' : activeChart === 'orders' ? 'orders' : 'quotations';
  const activeMetricLabel = activeChart === 'revenue' ? 'Revenue' : activeChart === 'orders' ? 'Orders' : 'Quotations';
  const comparisonMetricKey = activeChart === 'revenue' ? 'orders' : activeChart === 'orders' ? 'revenue' : 'orders';
  const comparisonMetricLabel = activeChart === 'revenue' ? 'Orders' : activeChart === 'orders' ? 'Revenue' : 'Orders';
  const hasMetricData = chartData.some((item) => Number(item[activeMetricKey] || 0) > 0);

  const totalRevenue = overview.totalRevenue || 0;
  const totalOrders = overview.totalOrders || 0;
  const avgOrderValue = overview.averageOrderValue || 0;
  const conversionRate = overview.conversionRate || 0;
  const successRate = transactions.successRate || 0;

  // ==================== EXPORT HANDLER ====================
  const handleExport = async (exportType: string, format: string) => {
    setExporting(true);
    try {
      if (!analytics) {
        toast.error('No data to export');
        return;
      }

      let exportData: any = {};

      if (exportType === 'summary') {
        exportData = {
          period: analytics.period,
          generatedAt: new Date().toISOString(),
          overview: overview,
          orders: orders,
          quotations: quotations,
          transactions: transactions,
          customers: customers,
          topProducts: topProducts,
          summary: {
            totalRevenue,
            totalOrders,
            averageOrderValue: avgOrderValue,
            conversionRate,
            successRate,
          },
        };
      } else if (exportType === 'detailed') {
        exportData = {
          ...analytics,
          generatedAt: new Date().toISOString(),
          exportedBy: user?.name || user?.email || 'Unknown',
        };
} else if (exportType === 'charts') {
  exportData = {
    dailySales: chartData,  // ← Use chartData instead
    paymentMethods: paymentMethodData,
    categorySales: categorySales,
    hourlyDistribution: hourlyDistribution,
    topProducts: topProducts,
    generatedAt: new Date().toISOString(),
  };
      } else if (exportType === 'pdf') {
        // Generate PDF report (simplified - would use a library in production)
        const reportContent = `
          ANALYTICS REPORT
          =================
          Period: ${getPeriodLabel(period)}
          Generated: ${new Date().toISOString()}
          
          SUMMARY
          -------
          Total Revenue: ${formatCurrency(totalRevenue)}
          Total Orders: ${totalOrders}
          Average Order Value: ${formatCurrency(avgOrderValue)}
          Conversion Rate: ${conversionRate}%
          Success Rate: ${successRate}%
          
          ORDERS
          ------
          Paid: ${orders.paidOrders}
          Pending: ${orders.pendingOrders}
          Cancelled: ${orders.cancelledOrders}
          Completion Rate: ${orders.completionRate.toFixed(1)}%
          
          QUOTATIONS
          ----------
          Total: ${quotations.totalQuotations}
          Accepted: ${quotations.acceptedCount}
          Converted: ${quotations.convertedCount}
          Conversion Rate: ${quotations.conversionRate || 0}%
          
          TRANSACTIONS
          ------------
          Completed: ${transactions.completed}
          Pending: ${transactions.pending}
          Failed: ${transactions.failed}
          Refunded: ${transactions.refunded}
          Total Volume: ${formatCurrency(transactions.totalVolume)}
        `;

        const blob = new Blob([reportContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `analytics-report-${new Date().toISOString().split('T')[0]}.txt`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success('PDF report generated successfully');
        setShowExportModal(false);
        setExporting(false);
        return;
      }

      if (format === 'csv') {
        // Flatten object for CSV
        const flattenObject = (obj: any, prefix = ''): Record<string, any> => {
          const result: Record<string, any> = {};
          for (const key in obj) {
            if (obj[key] && typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
              Object.assign(result, flattenObject(obj[key], `${prefix}${key}_`));
            } else if (Array.isArray(obj[key])) {
              result[`${prefix}${key}`] = JSON.stringify(obj[key]);
            } else {
              result[`${prefix}${key}`] = obj[key];
            }
          }
          return result;
        };

        const flat = flattenObject(exportData);
        const headers = Object.keys(flat);
        const values = headers.map((h) => flat[h] ?? '');
        const csv = [headers.join(','), values.join(',')].join('\n');

        const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `analytics-${exportType}-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success('Analytics exported successfully');
      } else {
        const json = JSON.stringify(exportData, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `analytics-${exportType}-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success('Analytics exported successfully');
      }

      setShowExportModal(false);
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Failed to export analytics');
    } finally {
      setExporting(false);
    }
  };

  // ==================== RENDER ACTIVE SHAPE FOR PIE ====================
  const renderActiveShape = (props: any) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;
    return (
      <g>
        <text x={cx} y={cy - 10} dy={8} textAnchor="middle" fill={fill} className="text-sm font-bold">
          {payload.name}
        </text>
        <text x={cx} y={cy + 10} dy={8} textAnchor="middle" fill="#666" className="text-xs">
          {`${(percent * 100).toFixed(0)}%`}
        </text>
        <text x={cx} y={cy + 25} dy={8} textAnchor="middle" fill="#666" className="text-xs">
          {formatCurrency(value)}
        </text>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius + 10}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
          opacity={0.9}
        />
        <Sector
          cx={cx}
          cy={cy}
          startAngle={startAngle}
          endAngle={endAngle}
          innerRadius={outerRadius + 6}
          outerRadius={outerRadius + 10}
          fill={fill}
        />
      </g>
    );
  };

  // ==================== LOADING STATE ====================
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-10 h-10 animate-spin text-[#0043b3]" />
          <p className="text-sm text-gray-500 dark:text-gray-400">Loading analytics...</p>
        </div>
      </div>
    );
  }

  // ==================== MAIN RENDER ====================
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a1a] p-6 space-y-6">
      {/* ==================== HEADER ==================== */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#000063] dark:text-white flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-[#0043b3]" />
            Analytics Dashboard
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {isAdmin ? 'Complete business performance insights' : 'Track your personal sales performance'}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value as any)}
            className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#0043b3] transition-colors"
          >
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
            <option value="quarter">Last Quarter</option>
            <option value="year">This Year</option>
          </select>
          <button
            onClick={() => setShowExportModal(true)}
            className="px-4 py-2 bg-gradient-to-r from-[#0043b3] to-[#000063] hover:from-[#000063] hover:to-[#0043b3] text-white rounded-xl font-medium flex items-center gap-2 transition-all shadow-sm hover:shadow-md"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors border border-gray-300 dark:border-gray-700"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* ==================== KEY METRICS ==================== */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Revenue</p>
              <p className="text-2xl font-bold text-[#000063] dark:text-white mt-1">{formatCurrency(totalRevenue)}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[#0043b3]/10 dark:bg-[#0043b3]/20 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-[#0043b3]" />
            </div>
          </div>
          {overview.revenueGrowth && (
            <div className="flex items-center gap-1 mt-2">
              {parseFloat(overview.revenueGrowth) >= 0 ? (
                <>
                  <ArrowUpRight className="w-3 h-3 text-[#00c853]" />
                  <span className="text-xs font-medium text-[#00c853]">{overview.revenueGrowth}%</span>
                </>
              ) : (
                <>
                  <ArrowDownRight className="w-3 h-3 text-[#ff1744]" />
                  <span className="text-xs font-medium text-[#ff1744]">{overview.revenueGrowth}%</span>
                </>
              )}
              <span className="text-xs text-gray-400">vs last period</span>
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Orders</p>
              <p className="text-2xl font-bold text-[#000063] dark:text-white mt-1">{totalOrders}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[#0043b3]/10 dark:bg-[#0043b3]/20 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5 text-[#0043b3]" />
            </div>
          </div>
          {overview.orderGrowth && (
            <div className="flex items-center gap-1 mt-2">
              {parseFloat(overview.orderGrowth) >= 0 ? (
                <>
                  <ArrowUpRight className="w-3 h-3 text-[#00c853]" />
                  <span className="text-xs font-medium text-[#00c853]">{overview.orderGrowth}%</span>
                </>
              ) : (
                <>
                  <ArrowDownRight className="w-3 h-3 text-[#ff1744]" />
                  <span className="text-xs font-medium text-[#ff1744]">{overview.orderGrowth}%</span>
                </>
              )}
              <span className="text-xs text-gray-400">vs last period</span>
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Conversion</p>
              <p className="text-2xl font-bold text-[#000063] dark:text-white mt-1">{conversionRate}%</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[#0043b3]/10 dark:bg-[#0043b3]/20 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-[#0043b3]" />
            </div>
          </div>
<div className="mt-2">
  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
    <div 
      className="bg-[#0043b3] h-1.5 rounded-full" 
      style={{ width: `${Math.min(Number(conversionRate) || 0, 100)}%` }} 
    />
  </div>
</div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Success Rate</p>
              <p className="text-2xl font-bold text-[#000063] dark:text-white mt-1">{successRate.toFixed(1)}%</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[#0043b3]/10 dark:bg-[#0043b3]/20 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-[#0043b3]" />
            </div>
          </div>
          <div className="mt-2">
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
              <div
                className={`h-1.5 rounded-full ${successRate >= 80 ? 'bg-[#00c853]' : successRate >= 50 ? 'bg-[#ffab00]' : 'bg-[#ff1744]'}`}
                style={{ width: `${Math.min(successRate, 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ==================== PERFORMANCE TREND ==================== */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-800">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-[#000063] dark:text-white flex items-center gap-2">
                <LineChart className="w-5 h-5 text-[#0043b3]" />
                Performance Trends
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Daily revenue, orders, and quotation performance</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setChartView('trend')}
                className={`px-3 py-1.5 text-xs rounded-xl transition-all ${
                  chartView === 'trend'
                    ? 'bg-[#0043b3] text-white shadow-sm'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                <LineChart className="w-3.5 h-3.5 inline mr-1" />
                Trend
              </button>
              <button
                onClick={() => setChartView('comparison')}
                className={`px-3 py-1.5 text-xs rounded-xl transition-all ${
                  chartView === 'comparison'
                    ? 'bg-[#0043b3] text-white shadow-sm'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5 inline mr-1" />
                Comparison
              </button>
              <button
                onClick={() => setChartView('distribution')}
                className={`px-3 py-1.5 text-xs rounded-xl transition-all ${
                  chartView === 'distribution'
                    ? 'bg-[#0043b3] text-white shadow-sm'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                <PieChartIcon className="w-3.5 h-3.5 inline mr-1" />
                Distribution
              </button>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mt-4">
            {['revenue', 'orders', 'quotations'].map((type) => (
              <button
                key={type}
                onClick={() => setActiveChart(type as any)}
                className={`px-3 py-1 text-xs rounded-xl transition-all ${
                  activeChart === type
                    ? 'bg-[#0043b3] text-white shadow-sm'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <div className="p-6">
          {chartData.length > 0 && hasMetricData ? (
            <ResponsiveContainer width="100%" height={350}>
              {chartView === 'trend' ? (
                <ComposedChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-700" />
                  <XAxis dataKey="date" stroke="#6b7280" className="dark:stroke-gray-400" />
                  <YAxis yAxisId="left" stroke="#6b7280" tickFormatter={formatCompact} className="dark:stroke-gray-400" />
                  <YAxis yAxisId="right" orientation="right" stroke="#6b7280" className="dark:stroke-gray-400" />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  {activeChart === 'revenue' ? (
                    <Area
                      yAxisId="left"
                      type="monotone"
                      dataKey="revenue"
                      name="Revenue"
                      fill="#0043b3"
                      fillOpacity={0.1}
                      stroke="#0043b3"
                      strokeWidth={2}
                    />
                  ) : activeChart === 'orders' ? (
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="orders"
                      name="Orders"
                      stroke="#009dff"
                      strokeWidth={2}
                      dot={{ r: 3, fill: '#009dff' }}
                    />
                  ) : (
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="quotations"
                      name="Quotations"
                      stroke="#00c853"
                      strokeWidth={2}
                      dot={{ r: 3, fill: '#00c853' }}
                      strokeDasharray="5 5"
                    />
                  )}
                </ComposedChart>
              ) : chartView === 'comparison' ? (
                <ReBarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-700" />
                  <XAxis dataKey="date" stroke="#6b7280" className="dark:stroke-gray-400" />
                  <YAxis stroke="#6b7280" tickFormatter={formatCompact} className="dark:stroke-gray-400" />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar dataKey={activeMetricKey} name={activeMetricLabel} fill="#0043b3" radius={[4, 4, 0, 0]} />
                  <Bar dataKey={comparisonMetricKey} name={comparisonMetricLabel} fill="#009dff" radius={[4, 4, 0, 0]} />
                </ReBarChart>
              ) : (
                <RePieChart>
                  <Pie
                    data={chartData.filter((item) => Number(item[activeMetricKey] || 0) > 0).slice(0, 10)}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                    outerRadius={120}
                    dataKey={activeMetricKey}
                    nameKey="date"
                  >
                    {chartData.filter((item) => Number(item[activeMetricKey] || 0) > 0).slice(0, 10).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                </RePieChart>
              )}
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-80 text-gray-500 dark:text-gray-400">
              <div className="text-center">
                <LineChart className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                <p>No data available for the selected period</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ==================== CATEGORY & PAYMENT CHARTS ==================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Sales */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#0043b3]/10 dark:bg-[#0043b3]/20 rounded-xl">
                <PieChartIcon className="w-5 h-5 text-[#0043b3]" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-[#000063] dark:text-white">Sales by Category</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Revenue distribution across categories</p>
              </div>
            </div>
          </div>
          <div className="p-6">
            {hasCategoryData && displayCategories.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={300}>
                  <RePieChart>
                  <Pie
                            data={normalizedDisplayCategories}
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={90}
                            paddingAngle={2}
                            dataKey="revenue"
                            nameKey="category"
                            onMouseEnter={(_, index) => {
                              setHoveredCategory(index);
                              setActiveIndex(index);
                            }}
                            onMouseLeave={() => {
                              setHoveredCategory(null);
                              setActiveIndex(null);
                            }}
                            activeShape={renderActiveShape}
                          >
                            {displayCategories.map((entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={CHART_COLORS[index % CHART_COLORS.length]}
                                stroke="white"
                                strokeWidth={2}
                                opacity={hoveredCategory === null || hoveredCategory === index ? 1 : 0.6}
                              />
                            ))}
                          </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend verticalAlign="bottom" height={36} />
                  </RePieChart>
                </ResponsiveContainer>

                <div className="grid grid-cols-2 gap-2 mt-4">
                    {normalizedDisplayCategories.map((cat, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:shadow-sm transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: CHART_COLORS[idx % CHART_COLORS.length] }}
                          />
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
                            {cat.category}
                          </span>
                        </div>
                        <span className="text-sm font-bold text-[#000063] dark:text-white">
                          {cat.percentage?.toFixed(1) || 0}%
                        </span>
                      </div>
                      <div className="mt-1">
                        <p className="text-xs text-gray-500">{formatCurrency(cat.revenue)}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {categorySales.length > 6 && (
                  <button
                    onClick={() => setShowAllCategories(!showAllCategories)}
                    className="mt-4 text-sm text-[#0043b3] hover:text-[#000063] font-medium transition-colors"
                  >
                    {showAllCategories ? 'Show Less' : `Show All (${categorySales.length})`}
                  </button>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <PieChartIcon className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-4" />
                <p className="text-gray-500 dark:text-gray-400">No category sales data available</p>
              </div>
            )}
          </div>
        </div>

        {/* Payment Methods */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#0043b3]/10 dark:bg-[#0043b3]/20 rounded-xl">
                <CreditCard className="w-5 h-5 text-[#0043b3]" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-[#000063] dark:text-white">Payment Methods</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Transaction distribution by method</p>
              </div>
            </div>
          </div>
          <div className="p-6">
            {paymentMethodData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={280}>
                  <RePieChart>
                    <Pie
                      data={paymentMethodData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                      innerRadius={40}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                    >
                    {paymentMethodData.map((entry: { name: string; value: number; volume: number }, index: number) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={CHART_COLORS[index % CHART_COLORS.length]}
                        stroke="white"
                        strokeWidth={2}
                      />
                    ))}
                    </Pie>
                   <Tooltip
                    content={({ active, payload }: { active?: boolean; payload?: readonly any[] }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0]?.payload;
                        if (!data) return null;
                        
                        const totalValue = paymentMethodData.reduce(
                          (sum: number, item: { value: number }) => sum + item.value, 
                          0
                        );
                        const percentage = totalValue > 0 ? ((data.value / totalValue) * 100) : 0;
                        
                        return (
                          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700">
                            <p className="font-semibold text-gray-900 dark:text-white">{data.name}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                              Count: {data.value} ({percentage.toFixed(0)}%)
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                              Volume: {formatCurrency(data.volume)}
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                    <Legend verticalAlign="bottom" height={36} />
                  </RePieChart>
                </ResponsiveContainer>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
                  {paymentMethodData.map((method: { name: string; volume: number }, idx: number) => {
                    const icons: Record<string, any> = {
                      MPESA: Smartphone,
                      CARD: CreditCard,
                      COD: Package,
                      CASH: DollarSign,
                      BANK_TRANSFER: Building2,
                      CHEQUE: FileText,
                    };
                    const Icon = icons[method.name] || CreditCard;
                    return (
                      <div
                        key={idx}
                        className="text-center p-4 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:shadow-sm transition-all"
                      >
                        <Icon className="w-5 h-5 mx-auto text-[#0043b3] dark:text-[#009dff]" />
                        <p className="text-xs text-gray-500 mt-1">{method.name}</p>
                        <p className="text-sm font-bold text-[#000063] dark:text-white mt-0.5">
                          {formatCurrency(method.volume)}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <CreditCard className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-4" />
                <p className="text-gray-500 dark:text-gray-400">No payment method data available</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ==================== HOURLY DISTRIBUTION ==================== */}
      {hourlyDistribution.length > 0 && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#0043b3]/10 dark:bg-[#0043b3]/20 rounded-xl">
                <Clock className="w-5 h-5 text-[#0043b3]" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-[#000063] dark:text-white">Hourly Sales Distribution</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Peak hours and order patterns</p>
              </div>
            </div>
          </div>
          <div className="p-6">
            <ResponsiveContainer width="100%" height={280}>
              <ComposedChart data={hourlyDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-700" />
                <XAxis 
                  dataKey="hour" 
                  tickFormatter={(hour) => `${hour}:00`} 
                  stroke="#6b7280" 
                  className="dark:stroke-gray-400" 
                />
                <YAxis yAxisId="left" stroke="#6b7280" className="dark:stroke-gray-400" />
                <YAxis 
                  yAxisId="right" 
                  orientation="right" 
                  tickFormatter={formatCompact} 
                  stroke="#6b7280" 
                  className="dark:stroke-gray-400" 
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar yAxisId="left" dataKey="orders" name="Orders" fill="#0043b3" radius={[4, 4, 0, 0]} />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="revenue"
                  name="Revenue"
                  stroke="#009dff"
                  strokeWidth={2}
                  dot={{ r: 3, fill: '#009dff' }}
                />
              </ComposedChart>
            </ResponsiveContainer>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
              {(() => {
                const peakHour = hourlyDistribution.reduce(
                  (max, curr) => (curr.orders > max.orders ? curr : max),
                  hourlyDistribution[0] || { hour: 0, orders: 0 }
                );
                const peakRevenue = hourlyDistribution.reduce(
                  (max, curr) => (curr.revenue > max.revenue ? curr : max),
                  hourlyDistribution[0] || { hour: 0, revenue: 0 }
                );
                const totalOrders = hourlyDistribution.reduce((sum, h) => sum + h.orders, 0);
                const avgOrders = (totalOrders / 24).toFixed(1);
                const totalRevenue = hourlyDistribution.reduce((sum, h) => sum + h.revenue, 0);
                const avgRevenue = Math.round(totalRevenue / 24);
                return (
                  <>
                    <div className="text-center p-4 rounded-xl bg-[#0043b3]/5 dark:bg-[#0043b3]/10 border border-gray-200 dark:border-gray-700">
                      <Flame className="w-5 h-5 text-[#0043b3] mx-auto mb-1" />
                      <p className="text-xs text-gray-500">Peak Order Hour</p>
                      <p className="text-xl font-bold text-[#000063] dark:text-white">{peakHour.hour}:00</p>
                      <p className="text-xs text-gray-500">{peakHour.orders} orders</p>
                    </div>
                    <div className="text-center p-4 rounded-xl bg-[#0043b3]/5 dark:bg-[#0043b3]/10 border border-gray-200 dark:border-gray-700">
                      <TrendingUp className="w-5 h-5 text-[#0043b3] mx-auto mb-1" />
                      <p className="text-xs text-gray-500">Peak Revenue Hour</p>
                      <p className="text-xl font-bold text-[#000063] dark:text-white">{peakRevenue.hour}:00</p>
                      <p className="text-xs text-gray-500">{formatCurrency(peakRevenue.revenue)}</p>
                    </div>
                    <div className="text-center p-4 rounded-xl bg-[#0043b3]/5 dark:bg-[#0043b3]/10 border border-gray-200 dark:border-gray-700">
                      <Activity className="w-5 h-5 text-[#0043b3] mx-auto mb-1" />
                      <p className="text-xs text-gray-500">Avg Orders/Hour</p>
                      <p className="text-xl font-bold text-[#000063] dark:text-white">{avgOrders}</p>
                    </div>
                    <div className="text-center p-4 rounded-xl bg-[#0043b3]/5 dark:bg-[#0043b3]/10 border border-gray-200 dark:border-gray-700">
                      <DollarSign className="w-5 h-5 text-[#0043b3] mx-auto mb-1" />
                      <p className="text-xs text-gray-500">Avg Revenue/Hour</p>
                      <p className="text-xl font-bold text-[#000063] dark:text-white">{formatCurrency(avgRevenue)}</p>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* ==================== QUOTATION & ORDER PERFORMANCE ==================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#0043b3]/10 dark:bg-[#0043b3]/20 rounded-xl">
                <FileText className="w-5 h-5 text-[#0043b3]" />
              </div>
              <h2 className="text-lg font-semibold text-[#000063] dark:text-white">Quotation Performance</h2>
            </div>
          </div>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                <p className="text-2xl font-bold text-[#000063] dark:text-white">{quotations.totalQuotations}</p>
                <p className="text-xs text-gray-500">Total</p>
              </div>
              <div className="text-center p-4 rounded-xl bg-[#00c853]/5 dark:bg-[#00c853]/10 border border-[#00c853]/20">
                <p className="text-2xl font-bold text-[#00c853]">{quotations.acceptedCount}</p>
                <p className="text-xs text-gray-500">Accepted</p>
              </div>
              <div className="text-center p-4 rounded-xl bg-[#0043b3]/5 dark:bg-[#0043b3]/10 border border-[#0043b3]/20">
                <p className="text-2xl font-bold text-[#0043b3]">{quotations.convertedCount}</p>
                <p className="text-xs text-gray-500">Converted</p>
              </div>
              <div className="text-center p-4 rounded-xl bg-[#009dff]/5 dark:bg-[#009dff]/10 border border-[#009dff]/20">
                <p className="text-2xl font-bold text-[#009dff]">{quotations.conversionRate || 0}%</p>
                <p className="text-xs text-gray-500">Conversion Rate</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#0043b3]/10 dark:bg-[#0043b3]/20 rounded-xl">
                <ShoppingBag className="w-5 h-5 text-[#0043b3]" />
              </div>
              <h2 className="text-lg font-semibold text-[#000063] dark:text-white">Order Status</h2>
            </div>
          </div>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 rounded-xl bg-[#00c853]/5 dark:bg-[#00c853]/10 border border-[#00c853]/20">
                <p className="text-2xl font-bold text-[#00c853]">{orders.paidOrders}</p>
                <p className="text-xs text-gray-500">Paid</p>
              </div>
              <div className="text-center p-4 rounded-xl bg-[#ffab00]/5 dark:bg-[#ffab00]/10 border border-[#ffab00]/20">
                <p className="text-2xl font-bold text-[#ffab00]">{orders.pendingOrders}</p>
                <p className="text-xs text-gray-500">Pending</p>
              </div>
              <div className="text-center p-4 rounded-xl bg-[#ff1744]/5 dark:bg-[#ff1744]/10 border border-[#ff1744]/20">
                <p className="text-2xl font-bold text-[#ff1744]">{orders.cancelledOrders}</p>
                <p className="text-xs text-gray-500">Cancelled</p>
              </div>
            </div>
            <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Completion Rate</span>
                <span className="text-sm font-semibold text-[#0043b3]">{orders.completionRate.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-[#0043b3] h-2 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(orders.completionRate, 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ==================== TRANSACTION ANALYSIS ==================== */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#0043b3]/10 dark:bg-[#0043b3]/20 rounded-xl">
              <Wallet className="w-5 h-5 text-[#0043b3]" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-[#000063] dark:text-white">Transaction Analysis</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Payment status and volume breakdown</p>
            </div>
          </div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 rounded-xl bg-[#00c853]/5 dark:bg-[#00c853]/10 border border-[#00c853]/20">
              <CheckCircle className="w-5 h-5 text-[#00c853] mx-auto mb-1" />
              <p className="text-2xl font-bold text-[#000063] dark:text-white">{transactions.completed}</p>
              <p className="text-xs text-gray-500">Completed</p>
            </div>
            <div className="text-center p-4 rounded-xl bg-[#ffab00]/5 dark:bg-[#ffab00]/10 border border-[#ffab00]/20">
              <Clock className="w-5 h-5 text-[#ffab00] mx-auto mb-1" />
              <p className="text-2xl font-bold text-[#000063] dark:text-white">{transactions.pending}</p>
              <p className="text-xs text-gray-500">Pending</p>
            </div>
            <div className="text-center p-4 rounded-xl bg-[#ff1744]/5 dark:bg-[#ff1744]/10 border border-[#ff1744]/20">
              <XCircle className="w-5 h-5 text-[#ff1744] mx-auto mb-1" />
              <p className="text-2xl font-bold text-[#000063] dark:text-white">{transactions.failed}</p>
              <p className="text-xs text-gray-500">Failed</p>
            </div>
            <div className="text-center p-4 rounded-xl bg-[#ffab00]/5 dark:bg-[#ffab00]/10 border border-[#ffab00]/20">
              <ArrowUpRight className="w-5 h-5 text-[#ffab00] mx-auto mb-1" />
              <p className="text-2xl font-bold text-[#000063] dark:text-white">{transactions.refunded}</p>
              <p className="text-xs text-gray-500">Refunded</p>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-800 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex justify-between items-center p-4 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              <span className="text-gray-600 dark:text-gray-400">Total Volume</span>
              <span className="font-bold text-xl text-[#000063] dark:text-white">{formatCurrency(transactions.totalVolume)}</span>
            </div>
            <div className="flex justify-between items-center p-4 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              <span className="text-gray-600 dark:text-gray-400">Average Transaction</span>
              <span className="font-semibold text-lg text-[#0043b3]">{formatCurrency(transactions.averageValue)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ==================== TOP PRODUCTS ==================== */}
      {topProducts.length > 0 && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#0043b3]/10 dark:bg-[#0043b3]/20 rounded-xl">
                  <Star className="w-5 h-5 text-[#0043b3]" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-[#000063] dark:text-white">Top Performing Products</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Best sellers by revenue and quantity</p>
                </div>
              </div>
              {topProducts.length > 5 && (
                <button
                  onClick={() => setShowAllProducts(!showAllProducts)}
                  className="text-sm text-[#0043b3] hover:text-[#000063] font-medium transition-colors"
                >
                  {showAllProducts ? 'Show Less' : `View All (${topProducts.length})`}
                </button>
              )}
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              {(showAllProducts ? topProducts : topProducts.slice(0, 5)).map((product, idx) => (
                <div
                  key={product.id || idx}
                  className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all hover:border-[#0043b3]/30"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white text-sm ${
                        idx === 0
                          ? 'bg-gradient-to-r from-[#0043b3] to-[#000063]'
                          : idx === 1
                          ? 'bg-gradient-to-r from-[#009dff] to-[#0043b3]'
                          : idx === 2
                          ? 'bg-gradient-to-r from-[#00c853] to-[#009dff]'
                          : 'bg-gray-500'
                      }`}
                    >
                      {idx + 1}
                    </div>
                    <div>
                      <p className="font-semibold text-[#000063] dark:text-white">{product.name}</p>
                      <p className="text-xs text-gray-500">
                        {product.quantity || 0} units • {product.orders || 0} orders
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-[#0043b3]">{formatCurrency(product.revenue || 0)}</p>
                    <p className="text-xs text-gray-500">Revenue</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ==================== MONTHLY TARGET (SALES ONLY) ==================== */}
      {!isAdmin && monthlyTarget && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#0043b3]/10 dark:bg-[#0043b3]/20 rounded-xl">
                <Target className="w-5 h-5 text-[#0043b3]" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-[#000063] dark:text-white">Monthly Sales Target</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Track progress towards monthly goals</p>
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-gray-600 dark:text-gray-400">Progress</span>
              <span className="text-sm font-bold text-[#0043b3]">{monthlyTarget.progress.toFixed(0)}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden mb-6">
              <div
                className="bg-gradient-to-r from-[#0043b3] to-[#009dff] h-3 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(monthlyTarget.progress, 100)}%` }}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                <p className="text-2xl font-bold text-[#000063] dark:text-white">{formatCurrency(monthlyTarget.current)}</p>
                <p className="text-xs text-gray-500">Achieved</p>
              </div>
              <div className="text-center p-4 rounded-xl bg-[#0043b3]/5 dark:bg-[#0043b3]/10 border border-[#0043b3]/20">
                <p className="text-2xl font-bold text-[#0043b3]">{formatCurrency(monthlyTarget.remaining)}</p>
                <p className="text-xs text-gray-500">Remaining</p>
              </div>
              <div className="text-center p-4 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                <p className="text-2xl font-bold text-[#000063] dark:text-white">{formatCurrency(monthlyTarget.target)}</p>
                <p className="text-xs text-gray-500">Target</p>
              </div>
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
        analytics={analytics}
        period={period}
      />
    </div>
  );
}