// app/sales/analytics/page.tsx
'use client';

import { useState, useEffect } from 'react';
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
  PieChart,
  Clock,
  CreditCard,
  Zap
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
  ComposedChart
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
  TopProduct
} from '@/lib/sales';

// Use union type for analytics data
type AnalyticsData = SalesAnalytics | AdminAnalytics | null;

// Colors for charts
const CHART_COLORS = {
  primary: '#06b6d4',
  secondary: '#8b5cf6',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#3b82f6',
  purple: '#a855f7',
  pink: '#ec4899',
  indigo: '#6366f1',
  cyan: '#06b6d4',
  teal: '#14b8a6',
  orange: '#f97316',
  gray: '#6b7280'
};

const CHART_COLORS_ARRAY = [
  CHART_COLORS.primary,
  CHART_COLORS.secondary,
  CHART_COLORS.success,
  CHART_COLORS.warning,
  CHART_COLORS.danger,
  CHART_COLORS.info,
  CHART_COLORS.purple,
  CHART_COLORS.pink,
  CHART_COLORS.indigo,
  CHART_COLORS.teal,
  CHART_COLORS.orange,
];

// Define chart data types
interface ChartDataPoint {
  date: string;
  revenue: number;
  orders: number;
}

interface HourlyDataPoint {
  hour: number;
  orders: number;
  revenue: number;
}

interface CategoryDataPoint {
  category: string;
  revenue: number;
  quantity: number;
}

export default function SalesAnalytics() {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<AnalyticsData>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [refreshing, setRefreshing] = useState(false);
  const [activeChart, setActiveChart] = useState<'revenue' | 'orders' | 'quotations'>('revenue');
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  const fetchAnalytics = async () => {
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
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAnalytics();
    setRefreshing(false);
    toast.success('Analytics refreshed');
  };

  const handleExport = () => {
    if (!analytics) return;
    
    const csvData = [
      ['Metric', 'Value'],
      ['Total Revenue', analytics.overview.totalRevenue],
      ['Total Orders', analytics.overview.totalOrders],
      ['Average Order Value', analytics.overview.averageOrderValue],
      ['Conversion Rate', `${analytics.overview.conversionRate}%`],
      ...(analytics.customers ? [['Total Customers', analytics.customers.totalCustomers || 0]] : []),
      ['Total Quotations', analytics.quotations.totalQuotations],
      ['Converted Quotes', analytics.quotations.convertedCount],
      ['Accepted Quotes', analytics.quotations.acceptedCount],
      ['Transaction Success Rate', `${analytics.transactions.successRate.toFixed(1)}%`],
      ['Total Transaction Volume', analytics.transactions.totalVolume],
      ['Completed Transactions', analytics.transactions.completed]
    ];
    
    const csv = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Analytics exported');
  };

  // Helper to safely access properties
  const getOverview = (): OverviewMetrics => analytics?.overview || {
    totalRevenue: 0,
    totalOrders: 0,
    averageOrderValue: 0,
    conversionRate: 0,
    totalCustomers: 0,
    activeCustomers: 0,
    totalQuotations: 0,
    successRate: 0,
  };

  const getQuotations = (): QuotationMetrics => analytics?.quotations || {
    totalQuotations: 0,
    convertedCount: 0,
    acceptedCount: 0,
    draftCount: 0,
    sentCount: 0,
    rejectedCount: 0,
    conversionRate: 0,
    totalQuotationValue: 0,
  };

  const getOrders = (): OrderMetrics => analytics?.orders || {
    totalOrders: 0,
    totalRevenue: 0,
    paidOrders: 0,
    pendingOrders: 0,
    cancelledOrders: 0,
    averageOrderValue: 0,
    completionRate: 0,
  };

  const getTransactions = (): TransactionMetrics => analytics?.transactions || {
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

  // Transform daily sales data for charts
  const getDailySalesForChart = (): ChartDataPoint[] => {
    let rawData: any[] = [];
    if (isAdmin && (analytics as AdminAnalytics)?.charts?.dailySales) {
      rawData = (analytics as AdminAnalytics).charts?.dailySales || [];
    } else if (!isAdmin && (analytics as SalesAnalytics)?.charts?.dailyPerformance) {
      rawData = (analytics as SalesAnalytics).charts?.dailyPerformance || [];
    }
    
    // Transform to ChartDataPoint format
    return rawData.map(item => ({
      date: (item as any)._id || (item as any).date || '',
      revenue: (item as any).revenue || 0,
      orders: (item as any).orders || 0
    }));
  };

  // Get payment methods data
  const getPaymentMethodsData = () => {
    if (isAdmin && (analytics as AdminAnalytics)?.charts?.paymentMethods) {
      const pm = (analytics as AdminAnalytics).charts?.paymentMethods;
      return pm?.labels?.map((label, index) => ({
        name: label,
        value: pm.datasets[0]?.data[index] || 0,
        volume: pm.datasets[1]?.data[index] || 0
      })) || [];
    }
    return [];
  };

  // Get category sales data
  const getCategorySalesData = (): CategoryDataPoint[] => {
    if (isAdmin && (analytics as AdminAnalytics)?.charts?.categorySales) {
      return (analytics as AdminAnalytics).charts?.categorySales || [];
    }
    return [];
  };

  // Get hourly distribution data
  const getHourlyDistributionData = (): HourlyDataPoint[] => {
    let rawData: any[] = [];
    if (isAdmin && (analytics as AdminAnalytics)?.charts?.hourlyDistribution) {
      rawData = (analytics as AdminAnalytics).charts?.hourlyDistribution || [];
    }
    
    // Ensure each item has hour property
    return rawData.map(item => ({
      hour: (item as any).hour ?? 0,
      orders: (item as any).orders || 0,
      revenue: (item as any).revenue || 0
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600"></div>
      </div>
    );
  }

  const overview = getOverview();
  const quotations = getQuotations();
  const orders = getOrders();
  const transactions = getTransactions();
  const customers = getCustomers();
  const monthlyTarget = getMonthlyTarget();
  const topProducts = getTopProducts();
  const dailySales = getDailySalesForChart();
  const paymentMethodData = getPaymentMethodsData();
  const categorySales = getCategorySalesData();
  const hourlyDistribution = getHourlyDistributionData();

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label, unit = 'KES' }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="text-sm font-semibold text-gray-900 dark:text-white">{label}</p>
          {payload.map((p: any, idx: number) => (
            <p key={idx} className="text-sm" style={{ color: p.color }}>
              {p.name}: {unit === 'KES' ? `KES ${p.value?.toLocaleString()}` : p.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {isAdmin ? 'Admin Analytics' : 'Sales Analytics'}
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {isAdmin 
              ? 'Complete overview of your business performance' 
              : 'Track your personal sales performance and metrics'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value as any)}
            className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
            <option value="quarter">Last Quarter</option>
            <option value="year">Last Year</option>
          </select>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={handleExport}
            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-medium flex items-center gap-2 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Revenue"
          value={`KES ${(overview.totalRevenue || 0).toLocaleString()}`}
          icon={DollarSign}
          color="green"
          change={overview.revenueGrowth ? `+${overview.revenueGrowth}%` : undefined}
        />
        <MetricCard
          title="Total Orders"
          value={overview.totalOrders || 0}
          icon={ShoppingBag}
          color="blue"
          change={overview.orderGrowth}
        />
        <MetricCard
          title="Conversion Rate"
          value={`${overview.conversionRate || 0}%`}
          icon={TrendingUp}
          color="purple"
        />
        <MetricCard
          title="Success Rate"
          value={`${(transactions.successRate || 0).toFixed(1)}%`}
          icon={Activity}
          color="orange"
        />
      </div>

      {/* Main Chart Section */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800">
        <div className="p-6 border-b border-gray-200 dark:border-gray-800">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Performance Trends</h2>
            <div className="flex gap-2">
              <button
                onClick={() => setActiveChart('revenue')}
                className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                  activeChart === 'revenue'
                    ? 'bg-cyan-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                Revenue
              </button>
              <button
                onClick={() => setActiveChart('orders')}
                className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                  activeChart === 'orders'
                    ? 'bg-cyan-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                Orders
              </button>
              <button
                onClick={() => setActiveChart('quotations')}
                className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                  activeChart === 'quotations'
                    ? 'bg-cyan-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                Quotations
              </button>
            </div>
          </div>
        </div>
        <div className="p-6">
          {dailySales.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              {activeChart === 'revenue' && (
                <ComposedChart data={dailySales}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="date" stroke="#6b7280" />
                  <YAxis yAxisId="left" stroke="#6b7280" tickFormatter={(value) => `KES ${value/1000}K`} />
                  <YAxis yAxisId="right" orientation="right" stroke="#6b7280" />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Area yAxisId="left" type="monotone" dataKey="revenue" name="Revenue (KES)" fill={CHART_COLORS.primary} fillOpacity={0.3} stroke={CHART_COLORS.primary} />
                  <Line yAxisId="right" type="monotone" dataKey="orders" name="Orders" stroke={CHART_COLORS.secondary} strokeWidth={2} />
                </ComposedChart>
              )}
              {activeChart === 'orders' && (
                <ReBarChart data={dailySales}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="date" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip content={<CustomTooltip unit="count" />} />
                  <Legend />
                  <Bar dataKey="orders" name="Orders" fill={CHART_COLORS.primary} radius={[4, 4, 0, 0]} />
                </ReBarChart>
              )}
              {activeChart === 'quotations' && (
                <ReLineChart data={dailySales}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="date" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip content={<CustomTooltip unit="count" />} />
                  <Legend />
                  <Line type="monotone" dataKey="orders" name="Orders" stroke={CHART_COLORS.warning} strokeWidth={2} dot={{ r: 4 }} />
                </ReLineChart>
              )}
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-96 text-gray-500">
              No data available for the selected period
            </div>
          )}
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment Methods Chart */}
        {paymentMethodData.length > 0 && (
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800">
            <div className="p-6 border-b border-gray-200 dark:border-gray-800">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-cyan-600" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Payment Methods</h2>
              </div>
            </div>
            <div className="p-6">
              <ResponsiveContainer width="100%" height={300}>
<RePieChart>
  <Pie
    data={paymentMethodData}
    cx="50%"
    cy="50%"
    labelLine={false}
    label={({ name, percent }) => {
      const percentage = percent || 0;
      return `${name}: ${(percentage * 100).toFixed(0)}%`;
    }}
    outerRadius={80}
    fill="#8884d8"
    dataKey="value"
  >
    {paymentMethodData.map((entry, index) => (
      <Cell key={`cell-${index}`} fill={CHART_COLORS_ARRAY[index % CHART_COLORS_ARRAY.length]} />
    ))}
  </Pie>
  <Tooltip />
  <Legend />
</RePieChart>
              </ResponsiveContainer>
              <div className="mt-4 grid grid-cols-3 gap-4 text-center">
                {paymentMethodData.map((method, idx) => (
                  <div key={idx} className="p-2 rounded-lg bg-gray-50 dark:bg-gray-800">
                    <p className="text-xs text-gray-500">{method.name}</p>
                    <p className="text-lg font-bold" style={{ color: CHART_COLORS_ARRAY[idx % CHART_COLORS_ARRAY.length] }}>
                      {method.name === 'MPESA' ? '💰' : method.name === 'CARD' ? '💳' : '📦'}
                    </p>
                    <p className="text-sm font-semibold">KES {method.volume?.toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Category Sales Chart */}
        {categorySales.length > 0 && (
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800">
            <div className="p-6 border-b border-gray-200 dark:border-gray-800">
              <div className="flex items-center gap-2">
                <PieChart className="w-5 h-5 text-cyan-600" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Sales by Category</h2>
              </div>
            </div>
            <div className="p-6">
              <ResponsiveContainer width="100%" height={300}>
                <ReBarChart data={categorySales} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" tickFormatter={(value) => `KES ${value/1000}K`} />
                  <YAxis type="category" dataKey="category" width={100} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="revenue" name="Revenue" fill={CHART_COLORS.primary} radius={[0, 4, 4, 0]} />
                </ReBarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      {/* Hourly Distribution Chart */}
      {hourlyDistribution.length > 0 && (
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800">
          <div className="p-6 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-cyan-600" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Hourly Sales Distribution</h2>
            </div>
            <p className="text-sm text-gray-500 mt-1">Peak hours and order patterns throughout the day</p>
          </div>
          <div className="p-6">
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={hourlyDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" tickFormatter={(hour) => `${hour}:00`} />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" tickFormatter={(value) => `KES ${value/1000}K`} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar yAxisId="left" dataKey="orders" name="Orders" fill={CHART_COLORS.primary} radius={[4, 4, 0, 0]} />
                <Line yAxisId="right" type="monotone" dataKey="revenue" name="Revenue" stroke={CHART_COLORS.secondary} strokeWidth={2} />
              </ComposedChart>
            </ResponsiveContainer>
            <div className="mt-4 grid grid-cols-4 gap-4">
              {(() => {
                const peakHour = hourlyDistribution.reduce((max, curr) => curr.orders > max.orders ? curr : max, hourlyDistribution[0] || { hour: 0, orders: 0 });
                const peakRevenue = hourlyDistribution.reduce((max, curr) => curr.revenue > max.revenue ? curr : max, hourlyDistribution[0] || { hour: 0, revenue: 0 });
                return (
                  <>
                    <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <Zap className="w-4 h-4 text-green-600 mx-auto mb-1" />
                      <p className="text-xs text-gray-500">Peak Order Hour</p>
                      <p className="text-lg font-bold text-green-600">{peakHour.hour}:00</p>
                      <p className="text-xs">{peakHour.orders} orders</p>
                    </div>
                    <div className="text-center p-3 bg-cyan-50 dark:bg-cyan-900/20 rounded-lg">
                      <TrendingUp className="w-4 h-4 text-cyan-600 mx-auto mb-1" />
                      <p className="text-xs text-gray-500">Peak Revenue Hour</p>
                      <p className="text-lg font-bold text-cyan-600">{peakRevenue.hour}:00</p>
                      <p className="text-xs">KES {peakRevenue.revenue?.toLocaleString()}</p>
                    </div>
                    <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                      <Activity className="w-4 h-4 text-purple-600 mx-auto mb-1" />
                      <p className="text-xs text-gray-500">Avg Orders/Hour</p>
                      <p className="text-lg font-bold text-purple-600">
                        {(hourlyDistribution.reduce((sum, h) => sum + h.orders, 0) / 24).toFixed(1)}
                      </p>
                    </div>
                    <div className="text-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                      <DollarSign className="w-4 h-4 text-orange-600 mx-auto mb-1" />
                      <p className="text-xs text-gray-500">Avg Revenue/Hour</p>
                      <p className="text-lg font-bold text-orange-600">
                        KES {Math.round(hourlyDistribution.reduce((sum, h) => sum + h.revenue, 0) / 24).toLocaleString()}
                      </p>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Admin Additional Metrics */}
      {isAdmin && customers && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <MetricCard
            title="Total Customers"
            value={customers.totalCustomers || 0}
            icon={Users}
            color="cyan"
          />
          <MetricCard
            title="Active Customers"
            value={customers.activeCustomers || 0}
            icon={CheckCircle}
            color="green"
          />
          <MetricCard
            title="Avg Customer Value"
            value={`KES ${((customers.totalCustomerValue || 0) / (customers.totalCustomers || 1)).toLocaleString()}`}
            icon={Award}
            color="purple"
          />
        </div>
      )}

      {/* Quotation Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PerformanceCard
          title="Quotation Performance"
          icon={FileText}
          metrics={[
            { label: 'Total Quotations', value: quotations.totalQuotations || 0 },
            { label: 'Accepted', value: quotations.acceptedCount || 0, color: 'text-green-600' },
            { label: 'Converted', value: quotations.convertedCount || 0, color: 'text-blue-600' },
            { label: 'Conversion Rate', value: `${quotations.conversionRate || 0}%`, color: 'text-cyan-600' }
          ]}
          progress={{
            value: typeof quotations.conversionRate === 'string' ? parseFloat(quotations.conversionRate) : (quotations.conversionRate || 0),
            label: 'Conversion Rate'
          }}
        />

        <PerformanceCard
          title="Order Status"
          icon={PieChart}
          metrics={[
            { label: 'Paid Orders', value: orders.paidOrders || 0, color: 'text-green-600' },
            { label: 'Pending', value: orders.pendingOrders || 0, color: 'text-yellow-600' },
            { label: 'Cancelled', value: orders.cancelledOrders || 0, color: 'text-red-600' }
          ]}
          progress={{
            value: orders.completionRate || 0,
            label: 'Completion Rate'
          }}
        />
      </div>

      {/* Transaction Analysis */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800">
        <div className="p-6 border-b border-gray-200 dark:border-gray-800">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Transaction Analysis</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <StatBox label="Completed" value={transactions.completed || 0} color="green" />
            <StatBox label="Pending" value={transactions.pending || 0} color="yellow" />
            <StatBox label="Failed" value={transactions.failed || 0} color="red" />
            <StatBox label="Refunded" value={transactions.refunded || 0} color="orange" />
          </div>
          <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Total Volume</span>
              <span className="font-bold text-xl text-gray-900 dark:text-white">
                KES {(transactions.totalVolume || 0).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center mt-2">
              <span className="text-sm text-gray-500">Average Transaction</span>
              <span className="font-semibold text-gray-700 dark:text-gray-300">
                KES {Math.round(transactions.averageValue || 0).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Top Products */}
      {topProducts.length > 0 && (
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800">
          <div className="p-6 border-b border-gray-200 dark:border-gray-800">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Top Products</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {topProducts.map((product, idx) => (
                <div key={product.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-500 w-6">{idx + 1}</span>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{product.name}</p>
                      <p className="text-sm text-gray-500">{product.quantity} units • {product.orders} orders</p>
                    </div>
                  </div>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    KES {product.revenue.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Monthly Target (Sales Only) */}
      {!isAdmin && monthlyTarget && (
        <div className="bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Target className="w-6 h-6" />
              <h3 className="text-lg font-semibold">Monthly Target</h3>
            </div>
            <span className="text-sm opacity-90">{monthlyTarget.progress.toFixed(0)}% Complete</span>
          </div>
          <div className="mb-4">
            <div className="w-full bg-white/20 rounded-full h-3">
              <div 
                className="bg-white h-3 rounded-full transition-all"
                style={{ width: `${Math.min(monthlyTarget.progress, 100)}%` }}
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold">KES {(monthlyTarget.current / 1000).toFixed(0)}K</p>
              <p className="text-xs opacity-80">Achieved</p>
            </div>
            <div>
              <p className="text-2xl font-bold">KES {(monthlyTarget.remaining / 1000).toFixed(0)}K</p>
              <p className="text-xs opacity-80">Remaining</p>
            </div>
            <div>
              <p className="text-2xl font-bold">KES {(monthlyTarget.target / 1000).toFixed(0)}K</p>
              <p className="text-xs opacity-80">Target</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ==================== HELPER COMPONENTS ====================
type MetricCardProps = {
  title: string;
  value: string | number;
  icon: any;
  color: 'green' | 'blue' | 'purple' | 'orange' | 'cyan';
  change?: string;
};

function MetricCard({ title, value, icon: Icon, color, change }: MetricCardProps) {
  const colors = {
    green: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
    blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
    purple: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
    orange: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400',
    cyan: 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400'
  };
  
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-2 rounded-lg ${colors[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
        {change && (
          <span className={`text-sm font-medium flex items-center gap-1 ${change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
            {change.startsWith('+') ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            {change}
          </span>
        )}
      </div>
      <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{value}</h3>
      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{title}</p>
    </div>
  );
}

function PerformanceCard({ title, icon: Icon, metrics, progress }: any) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800">
      <div className="p-6 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h2>
          <Icon className="w-5 h-5 text-gray-400" />
        </div>
      </div>
      <div className="p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          {metrics.map((metric: any, idx: number) => (
            <div key={idx} className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">{metric.label}</span>
              <span className={`font-semibold ${metric.color || 'text-gray-900 dark:text-white'}`}>{metric.value}</span>
            </div>
          ))}
        </div>
        <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">{progress.label}</span>
            <span className="text-sm font-semibold text-cyan-600">{progress.value.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div className="bg-cyan-600 h-2 rounded-full" style={{ width: `${Math.min(progress.value, 100)}%` }} />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatBox({ label, value, color }: { label: string; value: string | number; color: 'green' | 'yellow' | 'red' | 'orange' }) {
  const colors = {
    green: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400',
    yellow: 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400',
    red: 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400',
    orange: 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400'
  };
  
  return (
    <div className={`text-center p-4 rounded-lg ${colors[color]}`}>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs mt-1">{label}</p>
    </div>
  );
}