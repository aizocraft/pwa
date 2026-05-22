// app/sales/overview.tsx
'use client';

import { useState, useEffect } from 'react';
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
  XCircle
} from 'lucide-react';
import { getSalesAnalyticsOverview, type SalesAnalyticsOverview } from '@/lib/sales';
import { useAuth } from '@/lib/auth';
import { toast } from 'react-hot-toast';

export default function SalesOverview() {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<SalesAnalyticsOverview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const data = await getSalesAnalyticsOverview();
      setAnalytics(data);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600"></div>
      </div>
    );
  }

  const stats = [
    {
      title: 'Total Revenue',
      value: `KES ${(analytics?.orders.totalRevenue || 0).toLocaleString()}`,
      icon: DollarSign,
      color: 'green',
      change: '+12.5%'
    },
    {
      title: 'Total Orders',
      value: analytics?.orders.totalOrders || 0,
      icon: ShoppingCart,
      color: 'blue',
      change: '+8.3%'
    },
    {
      title: 'Quotations',
      value: analytics?.quotations.totalQuotations || 0,
      icon: FileSpreadsheet,
      color: 'orange',
      change: `${analytics?.quotations.convertedCount || 0} converted`
    },
    {
      title: 'Success Rate',
      value: `${(analytics?.transactions.successRate || 0).toFixed(1)}%`,
      icon: TrendingUp,
      color: 'purple',
      change: '+5.2%'
    }
  ];

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; text: string }> = {
      green: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-600 dark:text-green-400' },
      blue: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-600 dark:text-blue-400' },
      orange: { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-600 dark:text-orange-400' },
      purple: { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-600 dark:text-purple-400' }
    };
    return colors[color];
  };

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Welcome back, {user?.name || 'Sales Representative'}!
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Here's your sales performance overview
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => {
          const colors = getColorClasses(stat.color);
          return (
            <div
              key={idx}
              className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-2 ${colors.bg} rounded-lg`}>
                  <stat.icon className={`w-6 h-6 ${colors.text}`} />
                </div>
                <span className="text-sm font-medium text-green-600 flex items-center gap-1">
                  <ArrowUpRight className="w-3 h-3" /> {stat.change}
                </span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                {stat.value}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{stat.title}</p>
            </div>
          );
        })}
      </div>

      {/* Performance Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quotation Performance */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800">
          <div className="p-6 border-b border-gray-200 dark:border-gray-800">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Quotation Performance
            </h2>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Total Created</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {analytics?.quotations.totalQuotations || 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Accepted</span>
              <span className="font-semibold text-green-600">
                {analytics?.quotations.acceptedCount || 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Converted to Orders</span>
              <span className="font-semibold text-blue-600">
                {analytics?.quotations.convertedCount || 0}
              </span>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-800">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Conversion Rate</span>
                <span className="text-sm font-semibold text-cyan-600">
                  {analytics?.quotations.totalQuotations
                    ? ((analytics.quotations.convertedCount / analytics.quotations.totalQuotations) * 100).toFixed(1)
                    : 0}%
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
                <div
                  className="bg-cyan-600 h-2 rounded-full transition-all"
                  style={{
                    width: analytics?.quotations.totalQuotations
                      ? `${(analytics.quotations.convertedCount / analytics.quotations.totalQuotations) * 100}%`
                      : '0%'
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Order Status Breakdown */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800">
          <div className="p-6 border-b border-gray-200 dark:border-gray-800">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Order Status
            </h2>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-gray-600 dark:text-gray-400">Paid Orders</span>
              </div>
              <span className="font-semibold text-green-600">
                {analytics?.orders.paidOrders || 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <XCircle className="w-4 h-4 text-red-600" />
                <span className="text-gray-600 dark:text-gray-400">Cancelled</span>
              </div>
              <span className="font-semibold text-red-600">
                {analytics?.orders.cancelledOrders || 0}
              </span>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-800">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Completion Rate</span>
                <span className="text-sm font-semibold text-cyan-600">
                  {analytics?.orders.totalOrders
                    ? ((analytics.orders.paidOrders / analytics.orders.totalOrders) * 100).toFixed(1)
                    : 0}%
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
                <div
                  className="bg-green-600 h-2 rounded-full transition-all"
                  style={{
                    width: analytics?.orders.totalOrders
                      ? `${(analytics.orders.paidOrders / analytics.orders.totalOrders) * 100}%`
                      : '0%'
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Transaction Summary */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 lg:col-span-2">
          <div className="p-6 border-b border-gray-200 dark:border-gray-800">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Transaction Summary
            </h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">
                  {analytics?.transactions.completed || 0}
                </p>
                <p className="text-xs text-gray-500 mt-1">Completed</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-yellow-600">
                  {analytics?.transactions.pending || 0}
                </p>
                <p className="text-xs text-gray-500 mt-1">Pending</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-red-600">
                  {analytics?.transactions.failed || 0}
                </p>
                <p className="text-xs text-gray-500 mt-1">Failed</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-orange-600">
                  {analytics?.transactions.refunded || 0}
                </p>
                <p className="text-xs text-gray-500 mt-1">Refunded</p>
              </div>
            </div>
            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-800">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Total Volume</span>
                <span className="font-bold text-gray-900 dark:text-white">
                  KES {(analytics?.transactions.totalVolume || 0).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}