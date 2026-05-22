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
  XCircle,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  RefreshCw,
  Target,
  Award,
  Activity,
  PieChart,
  Clock
} from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { toast } from 'react-hot-toast';
import api from '@/lib/api';

interface AnalyticsData {
  overview: {
    totalRevenue: number;
    totalOrders: number;
    averageOrderValue: number;
    conversionRate: number;
    totalCustomers?: number;
    activeCustomers?: number;
    totalQuotations?: number;
    successRate?: number;
    revenueGrowth?: string;
    orderGrowth?: string;
  };
  quotations: {
    totalQuotations: number;
    convertedCount: number;
    acceptedCount: number;
    draftCount: number;
    sentCount: number;
    rejectedCount: number;
    conversionRate: string;
    totalQuotationValue: number;
  };
  orders: {
    totalOrders: number;
    totalRevenue: number;
    paidOrders: number;
    pendingOrders: number;
    cancelledOrders: number;
    averageOrderValue: number;
    completionRate: number;
  };
  transactions: {
    totalTransactions: number;
    totalVolume: number;
    completed: number;
    pending: number;
    failed: number;
    refunded: number;
    successRate: number;
    averageValue: number;
  };
  customers?: {
    totalCustomers: number;
    activeCustomers: number;
    totalCustomerValue: number;
  };
  monthlyTarget?: {
    target: number;
    current: number;
    remaining: number;
    progress: number;
  };
  recentActivities?: {
    quotations: any[];
    orders: any[];
  };
  products?: {
    totalProducts: number;
    lowStockProducts: number;
    outOfStockProducts: number;
    totalStockValue: number;
  };
  users?: {
    totalUsers: number;
    adminUsers: number;
    salesUsers: number;
    regularUsers: number;
    activeUsers: number;
  };
  topProducts?: Array<{
    id: string;
    name: string;
    revenue: number;
    quantity: number;
    orders: number;
    stock: number;
  }>;
  topCustomers?: Array<{
    id: string;
    name: string;
    totalSpent: number;
    orderCount: number;
  }>;
  dailySales?: Array<{
    _id: string;
    revenue: number;
    orders: number;
  }>;
}

export default function SalesAnalytics() {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [refreshing, setRefreshing] = useState(false);
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const endpoint = isAdmin ? '/analytics/admin/overview' : '/analytics/sales/overview';
      const response = await api.get(endpoint, { params: { period } });
      
      // Handle response - backend returns { success: true, data: {...} }
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
      
      // Set fallback data
      setAnalytics(getFallbackData());
    } finally {
      setLoading(false);
    }
  };

  const getFallbackData = (): AnalyticsData => ({
    overview: {
      totalRevenue: 0,
      totalOrders: 0,
      averageOrderValue: 0,
      conversionRate: 0,
      totalCustomers: 0,
      activeCustomers: 0,
      totalQuotations: 0,
      successRate: 0,
      revenueGrowth: '0',
      orderGrowth: '0'
    },
    quotations: {
      totalQuotations: 0,
      convertedCount: 0,
      acceptedCount: 0,
      draftCount: 0,
      sentCount: 0,
      rejectedCount: 0,
      conversionRate: '0',
      totalQuotationValue: 0
    },
    orders: {
      totalOrders: 0,
      totalRevenue: 0,
      paidOrders: 0,
      pendingOrders: 0,
      cancelledOrders: 0,
      averageOrderValue: 0,
      completionRate: 0
    },
    transactions: {
      totalTransactions: 0,
      totalVolume: 0,
      completed: 0,
      pending: 0,
      failed: 0,
      refunded: 0,
      successRate: 0,
      averageValue: 0
    }
  });

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600"></div>
      </div>
    );
  }

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
    value={`KES ${(analytics?.overview?.totalRevenue || 0).toLocaleString()}`}
    icon={DollarSign}
    color="green"
    change={analytics?.overview?.revenueGrowth ? `+${analytics.overview.revenueGrowth}%` : undefined}
  />
  <MetricCard
    title="Total Orders"
    value={analytics?.overview?.totalOrders || 0}
    icon={ShoppingBag}
    color="blue"
    change={analytics?.overview?.orderGrowth}
  />
  <MetricCard
    title="Conversion Rate"
    value={`${analytics?.overview?.conversionRate || 0}%`}
    icon={TrendingUp}
    color="purple"
  />
  <MetricCard
    title="Success Rate"
    value={`${(analytics?.transactions?.successRate || 0).toFixed(1)}%`}
    icon={Activity}
    color="orange"
  />
</div>

      {/* Admin Additional Metrics */}
      {isAdmin && analytics?.customers && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <MetricCard
            title="Total Customers"
            value={analytics.customers.totalCustomers || 0}
            icon={Users}
            color="cyan"
          />
          <MetricCard
            title="Active Customers"
            value={analytics.customers.activeCustomers || 0}
            icon={CheckCircle}
            color="green"
          />
          <MetricCard
            title="Avg Customer Value"
            value={`KES ${((analytics.customers.totalCustomerValue || 0) / (analytics.customers.totalCustomers || 1)).toLocaleString()}`}
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
            { label: 'Total Quotations', value: analytics?.quotations.totalQuotations || 0 },
            { label: 'Accepted', value: analytics?.quotations.acceptedCount || 0, color: 'text-green-600' },
            { label: 'Converted', value: analytics?.quotations.convertedCount || 0, color: 'text-blue-600' },
            { label: 'Conversion Rate', value: `${analytics?.quotations.conversionRate || 0}%`, color: 'text-cyan-600' }
          ]}
          progress={{
            value: parseFloat(analytics?.quotations.conversionRate || '0'),
            label: 'Conversion Rate'
          }}
        />

        <PerformanceCard
          title="Order Status"
          icon={PieChart}
          metrics={[
            { label: 'Paid Orders', value: analytics?.orders.paidOrders || 0, color: 'text-green-600' },
            { label: 'Pending', value: analytics?.orders.pendingOrders || 0, color: 'text-yellow-600' },
            { label: 'Cancelled', value: analytics?.orders.cancelledOrders || 0, color: 'text-red-600' }
          ]}
          progress={{
            value: analytics?.orders.completionRate || 0,
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
            <StatBox label="Completed" value={analytics?.transactions.completed || 0} color="green" />
            <StatBox label="Pending" value={analytics?.transactions.pending || 0} color="yellow" />
            <StatBox label="Failed" value={analytics?.transactions.failed || 0} color="red" />
            <StatBox label="Refunded" value={analytics?.transactions.refunded || 0} color="orange" />
          </div>
          <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Total Volume</span>
              <span className="font-bold text-xl text-gray-900 dark:text-white">
                KES {(analytics?.transactions.totalVolume || 0).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center mt-2">
              <span className="text-sm text-gray-500">Average Transaction</span>
              <span className="font-semibold text-gray-700 dark:text-gray-300">
                KES {Math.round(analytics?.transactions.averageValue || 0).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Target (Sales Only) */}
      {!isAdmin && analytics?.monthlyTarget && (
        <div className="bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Target className="w-6 h-6" />
              <h3 className="text-lg font-semibold">Monthly Target</h3>
            </div>
            <span className="text-sm opacity-90">{analytics.monthlyTarget.progress.toFixed(0)}% Complete</span>
          </div>
          <div className="mb-4">
            <div className="w-full bg-white/20 rounded-full h-3">
              <div 
                className="bg-white h-3 rounded-full transition-all"
                style={{ width: `${Math.min(analytics.monthlyTarget.progress, 100)}%` }}
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold">KES {(analytics.monthlyTarget.current / 1000).toFixed(0)}K</p>
              <p className="text-xs opacity-80">Achieved</p>
            </div>
            <div>
              <p className="text-2xl font-bold">KES {(analytics.monthlyTarget.remaining / 1000).toFixed(0)}K</p>
              <p className="text-xs opacity-80">Remaining</p>
            </div>
            <div>
              <p className="text-2xl font-bold">KES {(analytics.monthlyTarget.target / 1000).toFixed(0)}K</p>
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