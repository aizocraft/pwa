// app/sales/overview.tsx
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  DollarSign,
  ShoppingCart,
  Users,
  FileSpreadsheet,
  TrendingUp,
  ArrowUpRight,
  Activity,
  Target,
  Award,
  CreditCard,
  Smartphone,
  Home,
  CheckCircle,
  Clock,
  XCircle,
  Sparkles,
  Zap,
  Calendar,
  Clock as ClockIcon,
  BarChart4,
  PieChart,
  Download,
  RefreshCw,
  AlertCircle,
  TrendingDown,
  Gift,
  UserPlus,
  FileText,
  Package,
  ChevronRight,
  Star,
  ThumbsUp
} from 'lucide-react';
import { getSalesAnalyticsOverview, type SalesAnalytics } from '@/lib/sales';
import { useAuth } from '@/lib/auth';
import { toast } from 'react-hot-toast';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RePieChart,
  Pie,
  Cell,
  Legend,
  BarChart,
  Bar,
  LineChart,
  Line
} from 'recharts';
import Link from 'next/link';
import SalesActionCard from '@/components/ui/SalesActionCard';

// Fallback data for charts when analytics has not returned any points yet
const fallbackChartData = [
  { name: 'No activity', sales: 0, orders: 0 },
];

const paymentMethodData = [
  { name: 'M-PESA', value: 65 },
  { name: 'Cash', value: 15 },
  { name: 'Bank Transfer', value: 10 },
  { name: 'Card', value: 7 },
  { name: 'Other', value: 3 },
];

const COLORS = ['#06b6d4', '#10b981', '#6366f1', '#f59e0b', '#ef4444'];

export default function SalesOverview() {
  const { user } = useAuth();
  const router = useRouter();
  const [analytics, setAnalytics] = useState<SalesAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter'>('week');
  const [selectedChart, setSelectedChart] = useState<'sales' | 'orders'>('sales');

  // Redirect admin users away from overview
  useEffect(() => {
    if (user?.role === 'admin') {
      router.replace('/sales/analytics');
    }
  }, [user?.role, router]);

  useEffect(() => {
    if (user?.role === 'sales') {
      fetchAnalytics(timeRange);
    }
  }, [user?.role, timeRange]);

  const fetchAnalytics = async (
    period: 'week' | 'month' | 'quarter' = timeRange,
    showToast = false
  ) => {
    const toastId = showToast ? toast.loading('Loading sales dashboard...') : undefined;
    try {
      setLoading(true);
      const data = await getSalesAnalyticsOverview(period);
      setAnalytics(data);
      if (toastId) {
        toast.success('Sales dashboard refreshed', { id: toastId, duration: 4000 });
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      if (toastId) {
        toast.error('Failed to load dashboard data', { id: toastId, duration: 5000 });
      } else {
        toast.error('Failed to load dashboard data');
      }
    } finally {
      setLoading(false);
    }
  };

  const chartData = useMemo(() => {
    const sourceData = analytics?.charts?.dailyPerformance ?? [];
    if (!sourceData.length) {
      return fallbackChartData;
    }

    return sourceData.map((item) => ({
      name: new Date(item.date).toLocaleDateString('en', { month: 'short', day: 'numeric' }),
      sales: item.revenue ?? 0,
      orders: item.orders ?? 0,
    }));
  }, [analytics?.charts?.dailyPerformance]);

  const periodLabel = useMemo(() => {
    switch (timeRange) {
      case 'week':
        return 'the last 7 days';
      case 'quarter':
        return 'this quarter';
      default:
        return 'this month';
    }
  }, [timeRange]);

  if (!user) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600"></div>
      </div>
    );
  }

  if (user.role === 'admin') {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600"></div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600"></div>
      </div>
    );
  }

  const formatGrowth = (value?: number | string) => {
    const numericValue = typeof value === 'string' ? Number(value) : value ?? 0;
    const sign = numericValue >= 0 ? '+' : '';
    return `${sign}${numericValue.toFixed(1)}%`;
  };

  // Helper functions
  const getTotalRevenue = () => analytics?.orders?.totalRevenue || 0;
  const getTotalOrders = () => analytics?.orders?.totalOrders || 0;
  const getTotalQuotations = () => analytics?.quotations?.totalQuotations || 0;
  const getConvertedCount = () => analytics?.quotations?.convertedCount || 0;
  const getAcceptedCount = () => analytics?.quotations?.acceptedCount || 0;
  const getPaidOrders = () => analytics?.orders?.paidOrders || 0;
  const getCancelledOrders = () => analytics?.orders?.cancelledOrders || 0;
  const getSuccessRate = () => analytics?.transactions?.successRate || 0;
  const getCompletedTransactions = () => analytics?.transactions?.completed || 0;
  const getPendingTransactions = () => analytics?.transactions?.pending || 0;
  const getFailedTransactions = () => analytics?.transactions?.failed || 0;
  const getRefundedTransactions = () => analytics?.transactions?.refunded || 0;
  const getTotalVolume = () => analytics?.transactions?.totalVolume || 0;
  
  const getConversionRate = () => {
    const total = getTotalQuotations();
    const converted = getConvertedCount();
    return total > 0 ? (converted / total) * 100 : 0;
  };
  
  const getCompletionRate = () => {
    const total = getTotalOrders();
    const paid = getPaidOrders();
    return total > 0 ? (paid / total) * 100 : 0;
  };

  const stats = [
    {
      title: 'Total Revenue',
      value: `KES ${getTotalRevenue().toLocaleString()}`,
      icon: DollarSign,
      color: 'green',
      change: formatGrowth(analytics?.overview?.revenueGrowth),
      trend: 'up' as const,
      detail: 'This month'
    },
    {
      title: 'Total Orders',
      value: getTotalOrders().toString(),
      icon: ShoppingCart,
      color: 'blue',
      change: formatGrowth(analytics?.overview?.orderGrowth),
      trend: 'up' as const,
      detail: `${getPaidOrders()} completed`
    },
    {
      title: 'Quotations',
      value: getTotalQuotations().toString(),
      icon: FileSpreadsheet,
      color: 'orange',
      change: `${getConvertedCount()} converted`,
      trend: 'neutral' as const,
      detail: `${getAcceptedCount()} accepted`
    },
    {
      title: 'Success Rate',
      value: `${getSuccessRate().toFixed(1)}%`,
      icon: TrendingUp,
      color: 'purple',
      change: '+2.5%',
      trend: 'up' as const,
      detail: 'vs last month'
    }
  ];

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; text: string; border: string; hover: string }> = {
      green: { 
        bg: 'bg-green-50 dark:bg-green-900/20', 
        text: 'text-green-600 dark:text-green-400',
        border: 'border-green-200 dark:border-green-800',
        hover: 'hover:bg-green-100 dark:hover:bg-green-900/30'
      },
      blue: { 
        bg: 'bg-blue-50 dark:bg-blue-900/20', 
        text: 'text-blue-600 dark:text-blue-400',
        border: 'border-blue-200 dark:border-blue-800',
        hover: 'hover:bg-blue-100 dark:hover:bg-blue-900/30'
      },
      orange: { 
        bg: 'bg-orange-50 dark:bg-orange-900/20', 
        text: 'text-orange-600 dark:text-orange-400',
        border: 'border-orange-200 dark:border-orange-800',
        hover: 'hover:bg-orange-100 dark:hover:bg-orange-900/30'
      },
      purple: { 
        bg: 'bg-purple-50 dark:bg-purple-900/20', 
        text: 'text-purple-600 dark:text-purple-400',
        border: 'border-purple-200 dark:border-purple-800',
        hover: 'hover:bg-purple-100 dark:hover:bg-purple-900/30'
      }
    };
    return colors[color];
  };

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Welcome back, {user?.name || 'Sales Representative'}!
            </h1>
            <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-400 text-xs font-medium">
              <Sparkles className="w-3 h-3" />
              New
            </span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Here's your sales performance overview for {periodLabel}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchAnalytics(timeRange, true)}
            className="px-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center gap-2 text-sm"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
          <button className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg flex items-center gap-2 text-sm transition-colors">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => {
          const colors = getColorClasses(stat.color);
          return (
            <div
              key={idx}
              className={`bg-white dark:bg-gray-900 rounded-xl shadow-sm border ${colors.border} p-6 hover:shadow-md transition-all hover:-translate-y-0.5 cursor-pointer group`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-2.5 ${colors.bg} rounded-xl group-hover:scale-110 transition-transform`}>
                  <stat.icon className={`w-5 h-5 ${colors.text}`} />
                </div>
                <span className={`text-sm font-medium flex items-center gap-1 ${
                  stat.trend === 'up' ? 'text-green-600' : 
                  stat.trend === 'neutral' ? 'text-gray-500' : 'text-gray-500'
                }`}>
                  {stat.trend === 'up' && <ArrowUpRight className="w-3 h-3" />}
                  {stat.change}
                </span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                {stat.value}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{stat.title}</p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{stat.detail}</p>
            </div>
          );
        })}
      </div>

      {/* Time Range Selector */}
      <div className="flex items-center gap-2 bg-white dark:bg-gray-900 rounded-xl p-1 border border-gray-200 dark:border-gray-800 w-fit">
        {(['week', 'month', 'quarter'] as const).map((range) => (
          <button
            key={range}
            onClick={() => setTimeRange(range)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
              timeRange === range
                ? 'bg-cyan-600 text-white'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            {range}
          </button>
        ))}
      </div>

      {/* Chart Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Sales Overview</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Daily sales and order trends for {periodLabel}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSelectedChart('sales')}
                className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  selectedChart === 'sales'
                    ? 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-400'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                Sales
              </button>
              <button
                onClick={() => setSelectedChart('orders')}
                className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  selectedChart === 'orders'
                    ? 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-400'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                Orders
              </button>
            </div>
          </div>
          <div className="h-72">
            {chartData.length === 0 ? (
              <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-gray-200 bg-gray-50 text-sm text-gray-500 dark:border-gray-700 dark:bg-gray-800/40 dark:text-gray-400">
                No activity recorded for this period yet.
              </div>
            ) : (
            <ResponsiveContainer width="100%" height="100%">
              {selectedChart === 'sales' ? (
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" strokeOpacity={0.5} />
                  <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} />
                  <YAxis stroke="#9ca3af" fontSize={12} tickFormatter={(value) => `KES ${value/1000}k`} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(255,255,255,0.9)',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      backdropFilter: 'blur(8px)'
                    }}
                  // Recharts Tooltip formatter typing varies by ValueType; keep it permissive to avoid TS mismatch.
                    formatter={(value: any) => [`KES ${Number(value ?? 0).toLocaleString()}`, 'Sales'] as [string, string]}
                  />
                  <Area
                    type="monotone"
                    dataKey="sales"
                    stroke="#06b6d4"
                    strokeWidth={2}
                    fill="url(#salesGradient)"
                  />
                </AreaChart>
              ) : (
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" strokeOpacity={0.5} />
                  <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} />
                  <YAxis stroke="#9ca3af" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(255,255,255,0.9)',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      backdropFilter: 'blur(8px)'
                    }}
                  />
                  <Bar dataKey="orders" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                </BarChart>
              )}
            </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Payment Method Distribution */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Payment Methods</h2>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <RePieChart>
                <Pie
                  data={paymentMethodData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {paymentMethodData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255,255,255,0.9)',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    backdropFilter: 'blur(8px)'
                  }}
                />
                <Legend verticalAlign="bottom" height={36} />
              </RePieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quotation Performance */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800">
          <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Quotation Performance
            </h2>
            <Link
              href="/sales/quotations"
              className="text-sm text-cyan-600 hover:text-cyan-700 flex items-center gap-1"
            >
              View all <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-800">
              <span className="text-gray-600 dark:text-gray-400">Total Created</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {getTotalQuotations()}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-800">
              <span className="text-gray-600 dark:text-gray-400">Accepted</span>
              <span className="font-semibold text-green-600">
                {getAcceptedCount()}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-800">
              <span className="text-gray-600 dark:text-gray-400">Converted to Orders</span>
              <span className="font-semibold text-blue-600">
                {getConvertedCount()}
              </span>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-800">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Conversion Rate</span>
                <span className="text-sm font-semibold text-cyan-600">
                  {getConversionRate().toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
                <div
                  className="bg-gradient-to-r from-cyan-500 to-blue-600 h-2 rounded-full transition-all duration-1000"
                  style={{
                    width: `${Math.min(getConversionRate(), 100)}%`
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Order Status Breakdown */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800">
          <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Order Status
            </h2>
            <Link
              href="/sales/orders"
              className="text-sm text-cyan-600 hover:text-cyan-700 flex items-center gap-1"
            >
              View all <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-gray-600 dark:text-gray-400">Paid Orders</span>
              </div>
              <span className="font-semibold text-green-600">
                {getPaidOrders()}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-yellow-500" />
                <span className="text-gray-600 dark:text-gray-400">Processing</span>
              </div>
              <span className="font-semibold text-yellow-600">
                {Math.max(0, getTotalOrders() - getPaidOrders() - getCancelledOrders())}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500" />
                <span className="text-gray-600 dark:text-gray-400">Cancelled</span>
              </div>
              <span className="font-semibold text-red-600">
                {getCancelledOrders()}
              </span>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-800">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Completion Rate</span>
                <span className="text-sm font-semibold text-cyan-600">
                  {getCompletionRate().toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
                <div
                  className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-1000"
                  style={{
                    width: `${Math.min(getCompletionRate(), 100)}%`
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Transaction Summary */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800">
        <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Transaction Summary
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Real-time transaction status</p>
          </div>
          <Link
            href="/sales/transactions"
            className="text-sm text-cyan-600 hover:text-cyan-700 flex items-center gap-1"
          >
            View all <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="text-center p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/50">
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {getCompletedTransactions()}
              </p>
              <p className="text-xs text-gray-500 mt-1 flex items-center justify-center gap-1">
                <CheckCircle className="w-3 h-3 text-green-500" />
                Completed
              </p>
            </div>
            <div className="text-center p-4 rounded-xl bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800/50">
              <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                {getPendingTransactions()}
              </p>
              <p className="text-xs text-gray-500 mt-1 flex items-center justify-center gap-1">
                <Clock className="w-3 h-3 text-yellow-500" />
                Pending
              </p>
            </div>
            <div className="text-center p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50">
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                {getFailedTransactions()}
              </p>
              <p className="text-xs text-gray-500 mt-1 flex items-center justify-center gap-1">
                <XCircle className="w-3 h-3 text-red-500" />
                Failed
              </p>
            </div>
            <div className="text-center p-4 rounded-xl bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800/50">
              <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {getRefundedTransactions()}
              </p>
              <p className="text-xs text-gray-500 mt-1 flex items-center justify-center gap-1">
                <ArrowUpRight className="w-3 h-3 text-orange-500" />
                Refunded
              </p>
            </div>
          </div>
          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-800">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <span className="text-gray-600 dark:text-gray-400">Total Volume</span>
                <p className="font-bold text-2xl text-gray-900 dark:text-white">
                  KES {getTotalVolume().toLocaleString()}
                </p>
              </div>
              <div className="flex items-center gap-6">
                <div>
                  <span className="text-sm text-gray-500">Average Transaction</span>
                  <p className="font-semibold text-gray-700 dark:text-gray-300">
                    KES {Math.round(analytics?.transactions?.averageValue || 0).toLocaleString()}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Success Rate</span>
                  <p className="font-semibold text-green-600">
                    {getSuccessRate().toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <SalesActionCard
          icon={FileSpreadsheet}
          title="New Quotation"
          description="Create a new quotation for your customer"
          href="/sales/quotations"
          color="cyan"
        />
        <SalesActionCard
          icon={UserPlus}
          title="Add Customer"
          description="Register a new customer"
          href="/sales/customers"
          color="purple"
        />
        <SalesActionCard
          icon={FileText}
          title="Create Invoice"
          description="Generate invoice from quotation"
          href="/sales/invoices"
          color="green"
        />
        <SalesActionCard
          icon={Package}
          title="View Orders"
          description="Check order status and fulfillment"
          href="/sales/orders"
          color="orange"
        />
      </div>
    </div>
  );
}

// Quick Action Card Component
function QuickActionCard({ 
  icon: Icon, 
  title, 
  description, 
  href, 
  color 
}: { 
  icon: any; 
  title: string; 
  description: string; 
  href: string; 
  color: string;
}) {
  const router = useRouter();
  const colorClasses: Record<string, { bg: string; text: string; hover: string }> = {
    cyan: { bg: 'bg-cyan-50 dark:bg-cyan-900/20', text: 'text-cyan-600 dark:text-cyan-400', hover: 'hover:bg-cyan-100 dark:hover:bg-cyan-900/30' },
    purple: { bg: 'bg-purple-50 dark:bg-purple-900/20', text: 'text-purple-600 dark:text-purple-400', hover: 'hover:bg-purple-100 dark:hover:bg-purple-900/30' },
    green: { bg: 'bg-green-50 dark:bg-green-900/20', text: 'text-green-600 dark:text-green-400', hover: 'hover:bg-green-100 dark:hover:bg-green-900/30' },
    orange: { bg: 'bg-orange-50 dark:bg-orange-900/20', text: 'text-orange-600 dark:text-orange-400', hover: 'hover:bg-orange-100 dark:hover:bg-orange-900/30' },
  };

  const colors = colorClasses[color];

  return (
    <button
      onClick={() => router.push(href)}
      className={`bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6 text-left hover:shadow-md transition-all group ${colors.hover}`}
    >
      <div className={`p-3 ${colors.bg} rounded-xl w-fit mb-3 group-hover:scale-110 transition-transform`}>
        <Icon className={`w-5 h-5 ${colors.text}`} />
      </div>
      <h3 className="font-semibold text-gray-900 dark:text-white">{title}</h3>
      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{description}</p>
    </button>
  );
}