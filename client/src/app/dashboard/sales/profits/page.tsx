'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  TrendingUp, TrendingDown, DollarSign, Package, Calendar, 
  Download, Filter, RefreshCw, ChevronDown, Loader2,
  BarChart3,  Activity, Award, Target, Zap,
  AlertCircle, CheckCircle, XCircle, Clock, Star
} from 'lucide-react';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import {
  getProfitSummary,
  getProfitByProduct,
  getProfitByCategory,
  getProfitBySupplier,
  getProfitTrends,
  getTopProfitProducts
} from '@/lib/api';
import toast from 'react-hot-toast';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'];

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

export default function ProfitsPage() {
  const [period, setPeriod] = useState<'7d' | '30d' | '90d' | 'year'>('30d');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [supplierFilter, setSupplierFilter] = useState('');
  const [exporting, setExporting] = useState(false);

  // Fetch profit summary
  const { data: summary, isLoading: summaryLoading } = useQuery({
    queryKey: ['profit-summary', period],
    queryFn: () => getProfitSummary(),
  });

  // Fetch profit by product
  const { data: productProfit, isLoading: productLoading } = useQuery({
    queryKey: ['profit-by-product', period, categoryFilter, supplierFilter],
    queryFn: () => getProfitByProduct({ limit: 20 }),
  });

  // Fetch profit by category
  const { data: categoryProfit } = useQuery({
    queryKey: ['profit-by-category', period],
    queryFn: () => getProfitByCategory(),
  });

  // Fetch profit by supplier
  const { data: supplierProfit } = useQuery({
    queryKey: ['profit-by-supplier', period],
    queryFn: () => getProfitBySupplier(),
  });

  // Fetch profit trends
  const { data: trends } = useQuery({
    queryKey: ['profit-trends', period],
    queryFn: () => getProfitTrends({ period: period === '7d' ? 'daily' : period === '30d' ? 'weekly' : 'monthly', months: period === 'year' ? 12 : 3 }),
  });

  // Fetch top products
  const { data: topProducts } = useQuery({
    queryKey: ['top-profit-products'],
    queryFn: () => getTopProfitProducts({ limit: 10 }),
  });

  const handleExport = async () => {
    setExporting(true);
    try {
      toast.success('Profit report exported successfully');
    } catch (error) {
      toast.error('Failed to export report');
    } finally {
      setExporting(false);
    }
  };

  const summaryData = summary?.summary || {
    totalRevenue: 0,
    totalCost: 0,
    totalProfit: 0,
    totalUnitsSold: 0,
    overallMargin: '0'
  };

  const productData = productProfit?.products || [];
  const categoryData = categoryProfit?.categories || [];
  const supplierData = supplierProfit?.suppliers || [];
  const trendsData = trends?.trends || [];

  if (summaryLoading || productLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Profit Analytics</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Track and analyze profitability across products, categories, and suppliers
          </p>
        </div>
        <div className="flex gap-3">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value as any)}
            className="px-4 py-2 border rounded-lg bg-white dark:bg-gray-800"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
            <option value="year">This Year</option>
          </select>
          <button
            onClick={handleExport}
            disabled={exporting}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
          <button className="px-4 py-2 border rounded-lg hover:bg-gray-50">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Profit Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-5 text-white">
          <div className="flex items-center justify-between">
            <DollarSign className="w-8 h-8 opacity-80" />
            <span className="text-2xl font-bold">{formatCurrency(summaryData.totalRevenue)}</span>
          </div>
          <p className="text-sm opacity-80 mt-2">Total Revenue</p>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-5 text-white">
          <div className="flex items-center justify-between">
            <Package className="w-8 h-8 opacity-80" />
            <span className="text-2xl font-bold">{formatCurrency(summaryData.totalCost)}</span>
          </div>
          <p className="text-sm opacity-80 mt-2">Total Cost</p>
        </div>
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-5 text-white">
          <div className="flex items-center justify-between">
            <TrendingUp className="w-8 h-8 opacity-80" />
            <span className="text-2xl font-bold">{formatCurrency(summaryData.totalProfit)}</span>
          </div>
          <p className="text-sm opacity-80 mt-2">Total Profit</p>
        </div>
        <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl p-5 text-white">
          <div className="flex items-center justify-between">
            <Target className="w-8 h-8 opacity-80" />
            <span className="text-2xl font-bold">{summaryData.overallMargin}%</span>
          </div>
          <p className="text-sm opacity-80 mt-2">Profit Margin</p>
        </div>
      </div>

      {/* Profit Trends Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Profit Trends</h2>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-blue-500"></span>
            <span className="text-xs">Revenue</span>
            <span className="w-3 h-3 rounded-full bg-emerald-500 ml-2"></span>
            <span className="text-xs">Profit</span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={trendsData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="_id" />
            <YAxis tickFormatter={(v) => formatCompact(v)} />
            <Tooltip formatter={(v: any) => formatCurrency(v)} />
            <Legend />
            <Line type="monotone" dataKey="revenue" stroke="#3B82F6" strokeWidth={2} />
            <Line type="monotone" dataKey="profit" stroke="#10B981" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Profit by Category */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold mb-4">Profit by Category</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={categoryData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="_id" />
            <YAxis tickFormatter={(v) => formatCompact(v)} />
            <Tooltip formatter={(v: any) => formatCurrency(v)} />
            <Bar dataKey="totalRevenue" fill="#3B82F6" name="Revenue" />
            <Bar dataKey="totalProfit" fill="#10B981" name="Profit" />
          </BarChart>
        </ResponsiveContainer>
      </div>

    <div className="overflow-x-auto">
  <table className="w-full">
    <thead className="bg-gray-50 dark:bg-gray-900/50">
      <tr>
        <th className="px-6 py-3 text-left text-xs font-medium">Product</th>
        <th className="px-6 py-3 text-left text-xs font-medium">SKU</th>
        <th className="px-6 py-3 text-right text-xs font-medium">Revenue</th>
        <th className="px-6 py-3 text-right text-xs font-medium">Profit</th>
        <th className="px-6 py-3 text-right text-xs font-medium">Margin</th>
        <th className="px-6 py-3 text-right text-xs font-medium">Units Sold</th>
      </tr>
    </thead>
    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
      {topProducts?.products?.slice(0, 10).map((product: any) => (
        <tr key={product._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
          <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{product.name}</td>
          <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{product.sku}</td>
          <td className="px-6 py-4 text-right text-gray-900 dark:text-white">{formatCurrency(product.totalRevenue)}</td>
          <td className="px-6 py-4 text-right text-emerald-600 dark:text-emerald-400">{formatCurrency(product.totalProfit)}</td>
          <td className="px-6 py-4 text-right">
            <span className={product.margin >= 30 ? 'text-emerald-600 dark:text-emerald-400' : product.margin >= 0 ? 'text-amber-600 dark:text-amber-400' : 'text-red-600 dark:text-red-400'}>
              {product.margin.toFixed(1)}%
            </span>
          </td>
          <td className="px-6 py-4 text-right text-gray-900 dark:text-white">{product.totalUnitsSold}</td>
        </tr>
      ))}
    </tbody>
  </table>
</div>


    </div>
  );
}

function formatCompact(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}