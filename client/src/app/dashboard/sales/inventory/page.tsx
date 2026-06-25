// src/app/dashboard/sales/inventory/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  Package, Search, Filter, ChevronDown, Loader2, RefreshCw,
  TrendingUp, TrendingDown, AlertTriangle, CheckCircle, XCircle,
  DollarSign, Box, ShoppingBag, Download, Plus, Minus,
  Upload, FileSpreadsheet, FileJson, Trash2, Edit2,
  Settings, BarChart3, PieChart, Zap, Shield, Truck,
  Eye, Users, Star, Calendar, Clock, FileText, DownloadCloud,
  UploadCloud, CheckSquare, Square, AlertOctagon
} from 'lucide-react';
import { 
  getInventorySummary, 
  getLowStockProducts, 
  restockProduct,
  exportProducts,
  downloadImportTemplate,
  bulkImportProducts,
  bulkUpdateProducts,
  bulkDeleteProducts,
  bulkAdjustStock,
  getInventoryValuation
} from '@/lib/api';
import { toast } from 'react-hot-toast';

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

const formatNumber = (num: number) => {
  return new Intl.NumberFormat('en-KE').format(num);
};

type TabType = 'low-stock' | 'valuation' | 'bulk-actions';

export default function InventoryPage() {
  const [summary, setSummary] = useState<any>(null);
  const [lowStockProducts, setLowStockProducts] = useState<any[]>([]);
  const [valuation, setValuation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('low-stock');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
  const [showRestockModal, setShowRestockModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [restockQuantity, setRestockQuantity] = useState(1);
  const [restockPrice, setRestockPrice] = useState<number | null>(null);
  const [restockReason, setRestockReason] = useState('');
  const [showBulkImportModal, setShowBulkImportModal] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [showBulkAdjustModal, setShowBulkAdjustModal] = useState(false);
  const [bulkAdjustOperation, setBulkAdjustOperation] = useState<'add' | 'subtract' | 'set'>('add');
  const [bulkAdjustQuantity, setBulkAdjustQuantity] = useState(1);
  const [bulkAdjustReason, setBulkAdjustReason] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [summaryRes, lowStockRes, valuationRes] = await Promise.all([
        getInventorySummary(),
        getLowStockProducts(10),
        getInventoryValuation()
      ]);
      setSummary(summaryRes.summary);
      setLowStockProducts(lowStockRes.products || []);
      setValuation(valuationRes);
    } catch (error) {
      toast.error('Failed to fetch inventory data');
    } finally {
      setLoading(false);
    }
  };

  const handleRestock = async () => {
    if (!selectedProduct) return;
    try {
      await restockProduct(selectedProduct._id, {
        quantity: restockQuantity,
        buyingPrice: restockPrice || undefined,
        reason: restockReason || undefined
      });

      setShowRestockModal(false);
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to restock');
    }
  };

  const handleExport = async (format: 'csv' | 'json') => {
    setExporting(true);
    try {
      const blob = await exportProducts({ format });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `products_${Date.now()}.${format}`;
      a.click();
      URL.revokeObjectURL(url);

    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Export failed');
    } finally {
      setExporting(false);
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const blob = await downloadImportTemplate();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'product_import_template.csv';
      a.click();
      URL.revokeObjectURL(url);
   
    } catch (error: any) {
      toast.error('Failed to download template');
    }
  };

  const handleBulkImport = async () => {
    if (!importFile) {
      toast.error('Please select a file');
      return;
    }
    setImporting(true);
    try {
      const result = await bulkImportProducts(importFile);
     
      setShowBulkImportModal(false);
      setImportFile(null);
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Import failed');
    } finally {
      setImporting(false);
    }
  };

  const handleBulkStockAdjust = async () => {
    if (selectedProducts.size === 0) {
      toast.error('No products selected');
      return;
    }
    try {
      const adjustments = Array.from(selectedProducts).map(productId => ({
        productId,
        quantity: bulkAdjustQuantity,
        operation: bulkAdjustOperation
      }));
      const result = await bulkAdjustStock(adjustments, bulkAdjustReason);
     
      setShowBulkAdjustModal(false);
      setSelectedProducts(new Set());
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Stock adjustment failed');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedProducts.size === 0) return;
    try {
      const result = await bulkDeleteProducts(Array.from(selectedProducts));
    
      setShowDeleteConfirm(false);
      setSelectedProducts(new Set());
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Delete failed');
    }
  };

  const toggleProductSelection = (productId: string) => {
    const newSelected = new Set(selectedProducts);
    if (newSelected.has(productId)) {
      newSelected.delete(productId);
    } else {
      newSelected.add(productId);
    }
    setSelectedProducts(newSelected);
  };

  const toggleAllProducts = () => {
    if (selectedProducts.size === filteredProducts.length) {
      setSelectedProducts(new Set());
    } else {
      setSelectedProducts(new Set(filteredProducts.map(p => p._id)));
    }
  };

  const filteredProducts = lowStockProducts.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         (p.sku?.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = !categoryFilter || p.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-600 dark:text-cyan-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Inventory Management</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Track stock levels, manage inventory value, and perform bulk operations
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button 
            onClick={() => handleExport('csv')}
            disabled={exporting}
            className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 flex items-center gap-2 transition-all duration-200 disabled:opacity-50"
          >
            {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <DownloadCloud className="w-4 h-4" />}
            Export CSV
          </button>
          <button 
            onClick={() => handleExport('json')}
            disabled={exporting}
            className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 flex items-center gap-2 transition-all duration-200 disabled:opacity-50"
          >
            <FileJson className="w-4 h-4" />
            Export JSON
          </button>
          <button 
            onClick={() => setShowBulkImportModal(true)}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white rounded-lg flex items-center gap-2 transition-all duration-200 shadow-sm hover:shadow-md"
          >
            <UploadCloud className="w-4 h-4" />
            Bulk Import
          </button>
          <button 
            onClick={fetchData} 
            className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 flex items-center gap-2 transition-all duration-200"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Tabs - Products tab removed */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex gap-6">
          <button
            onClick={() => setActiveTab('low-stock')}
            className={`pb-3 px-2 text-sm font-medium transition-colors relative whitespace-nowrap ${
              activeTab === 'low-stock' 
                ? 'text-cyan-600 dark:text-cyan-400 border-b-2 border-cyan-600 dark:border-cyan-400' 
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <AlertTriangle className="w-4 h-4 inline mr-2" />
            Low Stock Alert
          </button>
          <button
            onClick={() => setActiveTab('valuation')}
            className={`pb-3 px-2 text-sm font-medium transition-colors relative whitespace-nowrap ${
              activeTab === 'valuation' 
                ? 'text-cyan-600 dark:text-cyan-400 border-b-2 border-cyan-600 dark:border-cyan-400' 
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <BarChart3 className="w-4 h-4 inline mr-2" />
            Inventory Valuation
          </button>
          <button
            onClick={() => setActiveTab('bulk-actions')}
            className={`pb-3 px-2 text-sm font-medium transition-colors relative whitespace-nowrap ${
              activeTab === 'bulk-actions' 
                ? 'text-cyan-600 dark:text-cyan-400 border-b-2 border-cyan-600 dark:border-cyan-400' 
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <Settings className="w-4 h-4 inline mr-2" />
            Bulk Actions
          </button>
        </nav>
      </div>

      {/* Inventory Summary Cards - Always visible */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 rounded-xl p-5 text-white shadow-lg hover:shadow-xl transition-shadow duration-200">
          <div className="flex items-center justify-between">
            <Package className="w-8 h-8 opacity-80" />
            <span className="text-2xl font-bold">{formatNumber(summary?.totalUnits || 0)}</span>
          </div>
          <p className="text-sm opacity-80 mt-2">Total Units in Stock</p>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 dark:from-purple-600 dark:to-purple-700 rounded-xl p-5 text-white shadow-lg hover:shadow-xl transition-shadow duration-200">
          <div className="flex items-center justify-between">
            <DollarSign className="w-8 h-8 opacity-80" />
            <span className="text-2xl font-bold">{formatCurrency(summary?.totalStockValue || 0)}</span>
          </div>
          <p className="text-sm opacity-80 mt-2">Stock Value (Cost)</p>
        </div>
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 dark:from-emerald-600 dark:to-emerald-700 rounded-xl p-5 text-white shadow-lg hover:shadow-xl transition-shadow duration-200">
          <div className="flex items-center justify-between">
            <TrendingUp className="w-8 h-8 opacity-80" />
            <span className="text-2xl font-bold">{formatCurrency(summary?.totalPotentialProfit || 0)}</span>
          </div>
          <p className="text-sm opacity-80 mt-2">Potential Profit</p>
        </div>
        <div className="bg-gradient-to-br from-amber-500 to-amber-600 dark:from-amber-600 dark:to-amber-700 rounded-xl p-5 text-white shadow-lg hover:shadow-xl transition-shadow duration-200">
          <div className="flex items-center justify-between">
            <AlertTriangle className="w-8 h-8 opacity-80" />
            <span className="text-2xl font-bold">{summary?.lowStockItems || 0}</span>
          </div>
          <p className="text-sm opacity-80 mt-2">Low Stock Items</p>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'low-stock' && (
        <>
          {/* Category Breakdown */}
          {summary?.categoryBreakdown?.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Inventory by Category</h2>
              <div className="space-y-3">
                {summary.categoryBreakdown.map((cat: any) => (
                  <div key={cat._id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors duration-200">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{cat._id}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{formatNumber(cat.units)} units</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900 dark:text-white">{formatCurrency(cat.stockValue)}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{formatCurrency(cat.inventoryValue)} (retail)</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Low Stock Products Table */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-4 flex-wrap">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-500 dark:text-amber-400" />
                  Low Stock Alert
                </h2>
                {selectedProducts.size > 0 && (
                  <div className="flex gap-2 flex-wrap">
                    <button
                      onClick={() => setShowBulkAdjustModal(true)}
                      className="px-3 py-1 text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-all duration-200"
                    >
                      Adjust Stock ({selectedProducts.size})
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(true)}
                      className="px-3 py-1 text-sm bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-all duration-200"
                    >
                      Delete ({selectedProducts.size})
                    </button>
                  </div>
                )}
              </div>
              <div className="flex gap-3 flex-wrap">
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="px-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="">All Categories</option>
                  {summary?.categoryBreakdown?.map((cat: any) => (
                    <option key={cat._id} value={cat._id}>{cat._id}</option>
                  ))}
                </select>
              </div>
            </div>

            {filteredProducts.length === 0 ? (
              <div className="text-center py-12">
                <CheckCircle className="w-12 h-12 mx-auto text-emerald-500 dark:text-emerald-400 mb-3" />
                <p className="text-gray-500 dark:text-gray-400">No low stock items found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-900/50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        <button onClick={toggleAllProducts} className="flex items-center gap-2 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
                          {selectedProducts.size === filteredProducts.length ? 
                            <CheckSquare className="w-4 h-4 text-cyan-600 dark:text-cyan-400" /> : 
                            <Square className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                          }
                        </button>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Product</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">SKU</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Current Stock</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Selling Price</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Buying Price</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Profit Per Unit</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredProducts.map((product) => {
                      const profitPerUnit = product.price - (product.buyingPrice || 0);
                      const stockStatus = product.stock === 0 ? 'Out of Stock' : product.stock < 5 ? 'Critical' : 'Low Stock';
                      const statusColor = product.stock === 0 ? 'text-red-600 dark:text-red-400' : product.stock < 5 ? 'text-orange-600 dark:text-orange-400' : 'text-amber-600 dark:text-amber-400';
                      
                      return (
                        <tr key={product._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200">
                          <td className="px-6 py-4">
                            <button 
                              onClick={() => toggleProductSelection(product._id)}
                              className="hover:scale-110 transition-transform duration-200"
                            >
                              {selectedProducts.has(product._id) ? 
                                <CheckSquare className="w-4 h-4 text-cyan-600 dark:text-cyan-400" /> : 
                                <Square className="w-4 h-4 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300" />
                              }
                            </button>
                          </td>
                          <td className="px-6 py-4">
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">{product.name}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">{product.category}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm font-mono text-gray-600 dark:text-gray-400">{product.sku || 'N/A'}</td>
                          <td className="px-6 py-4 text-right">
                            <span className={`font-semibold ${statusColor}`}>{product.stock}</span>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{stockStatus}</p>
                          </td>
                          <td className="px-6 py-4 text-right text-gray-900 dark:text-white">{formatCurrency(product.price)}</td>
                          <td className="px-6 py-4 text-right text-gray-500 dark:text-gray-400">{formatCurrency(product.buyingPrice || 0)}</td>
                          <td className="px-6 py-4 text-right">
                            <span className={profitPerUnit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}>
                              {formatCurrency(Math.abs(profitPerUnit))}
                              {profitPerUnit >= 0 ? ' profit' : ' loss'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <button
                              onClick={() => {
                                setSelectedProduct(product);
                                setRestockQuantity(1);
                                setRestockPrice(product.buyingPrice);
                                setRestockReason('');
                                setShowRestockModal(true);
                              }}
                              className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-700 dark:bg-cyan-500 dark:hover:bg-cyan-600 text-white rounded-lg text-sm transition-all duration-200 hover:shadow-md flex items-center justify-center gap-1 mx-auto"
                            >
                              <Plus className="w-4 h-4" />
                              Restock
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {/* Valuation Tab */}
      {activeTab === 'valuation' && valuation && (
        <div className="space-y-6">
          {/* Valuation Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 dark:from-indigo-600 dark:to-indigo-700 rounded-xl p-5 text-white shadow-lg hover:shadow-xl transition-shadow duration-200">
              <div className="flex items-center justify-between">
                <DollarSign className="w-8 h-8 opacity-80" />
                <span className="text-2xl font-bold">{formatCurrency(valuation.summary.totalRetailValue)}</span>
              </div>
              <p className="text-sm opacity-80 mt-2">Total Retail Value</p>
              <p className="text-xs opacity-60">Cost: {formatCurrency(valuation.summary.totalCostValue)}</p>
            </div>
            <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 dark:from-emerald-600 dark:to-emerald-700 rounded-xl p-5 text-white shadow-lg hover:shadow-xl transition-shadow duration-200">
              <div className="flex items-center justify-between">
                <TrendingUp className="w-8 h-8 opacity-80" />
                <span className="text-2xl font-bold">{formatCurrency(valuation.summary.totalPotentialProfit)}</span>
              </div>
              <p className="text-sm opacity-80 mt-2">Total Profit Potential</p>
              <p className="text-xs opacity-60">Margin: {valuation.summary.averageMargin.toFixed(1)}%</p>
            </div>
            <div className="bg-gradient-to-br from-amber-500 to-amber-600 dark:from-amber-600 dark:to-amber-700 rounded-xl p-5 text-white shadow-lg hover:shadow-xl transition-shadow duration-200">
              <div className="flex items-center justify-between">
                <Box className="w-8 h-8 opacity-80" />
                <span className="text-2xl font-bold">{formatNumber(valuation.summary.totalStockUnits)}</span>
              </div>
              <p className="text-sm opacity-80 mt-2">Total Stock Units</p>
              <p className="text-xs opacity-60">{valuation.summary.productsWithData} products</p>
            </div>
          </div>

          {/* Top Products by Value */}
          {valuation.topProductsByValue?.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Top Products by Inventory Value</h2>
              <div className="space-y-3">
                {valuation.topProductsByValue.map((product: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors duration-200">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{product.name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">SKU: {product.sku} | Stock: {product.stock} units</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-emerald-600 dark:text-emerald-400">{formatCurrency(product.inventoryValue)}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Profit: {formatCurrency(product.potentialProfit)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Category Valuation Breakdown */}
          {valuation.categoryBreakdown?.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Category Valuation Breakdown</h2>
              <div className="space-y-3">
                {valuation.categoryBreakdown.map((cat: any) => (
                  <div key={cat._id} className="p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors duration-200">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium text-lg text-gray-900 dark:text-white">{cat._id}</p>
                      <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">{formatCurrency(cat.totalValue)}</p>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <div>
                        <p className="text-gray-500 dark:text-gray-400">Cost</p>
                        <p className="font-medium text-gray-900 dark:text-white">{formatCurrency(cat.totalCost)}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 dark:text-gray-400">Profit</p>
                        <p className="font-medium text-emerald-600 dark:text-emerald-400">{formatCurrency(cat.totalProfit)}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 dark:text-gray-400">Margin</p>
                        <p className="font-medium text-gray-900 dark:text-white">{((cat.totalProfit / cat.totalValue) * 100).toFixed(1)}%</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Bulk Actions Tab - Optimized with dark mode */}
      {activeTab === 'bulk-actions' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Bulk Stock Adjustment Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Settings className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Bulk Stock Adjustment</h2>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Quickly adjust stock levels for multiple products at once
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Operation</label>
                <select 
                  value={bulkAdjustOperation}
                  onChange={(e) => setBulkAdjustOperation(e.target.value as any)}
                  className="w-full px-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="add">Add Stock (+)</option>
                  <option value="subtract">Subtract Stock (-)</option>
                  <option value="set">Set Exact Stock (=)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Quantity</label>
                <input
                  type="number"
                  min="1"
                  value={bulkAdjustQuantity}
                  onChange={(e) => setBulkAdjustQuantity(parseInt(e.target.value))}
                  className="w-full px-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>
              <button
                onClick={() => setShowBulkAdjustModal(true)}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-lg font-medium transition-all duration-200 shadow-sm hover:shadow-md"
              >
                Apply to Selected Products
              </button>
            </div>
          </div>

          {/* Bulk Delete Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Bulk Delete Products</h2>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Permanently delete multiple products from inventory
            </p>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full py-3 bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 text-white rounded-lg font-medium transition-all duration-200 shadow-sm hover:shadow-md"
            >
              Delete Selected Products
            </button>
          </div>

          {/* Import/Export Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                <Upload className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Import/Export</h2>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Bulk import products from CSV or export inventory data
            </p>
            <div className="space-y-3">
              <button
                onClick={handleDownloadTemplate}
                className="w-full py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 text-gray-700 dark:text-gray-300 flex items-center justify-center gap-2 transition-all duration-200"
              >
                <FileText className="w-4 h-4" />
                Download Template
              </button>
              <button
                onClick={() => setShowBulkImportModal(true)}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white rounded-lg flex items-center justify-center gap-2 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <UploadCloud className="w-4 h-4" />
                Bulk Import
              </button>
            </div>
          </div>

          {/* Instructions Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <Shield className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Instructions</h2>
            </div>
            <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
              <p className="flex items-start gap-2">
                <span className="text-emerald-500 dark:text-emerald-400 mt-0.5">✓</span>
                Select products using checkboxes in the Low Stock tab
              </p>
              <p className="flex items-start gap-2">
                <span className="text-emerald-500 dark:text-emerald-400 mt-0.5">✓</span>
                Use bulk actions to adjust stock or delete multiple products
              </p>
              <p className="flex items-start gap-2">
                <span className="text-emerald-500 dark:text-emerald-400 mt-0.5">✓</span>
                Download template for correct CSV format before bulk import
              </p>
              <p className="flex items-start gap-2">
                <span className="text-emerald-500 dark:text-emerald-400 mt-0.5">✓</span>
                Export data in CSV or JSON format for reporting
              </p>
              <p className="flex items-start gap-2">
                <span className="text-emerald-500 dark:text-emerald-400 mt-0.5">✓</span>
                Use the Valuation tab for detailed inventory financial analysis
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Restock Modal */}
      {showRestockModal && selectedProduct && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Restock Product</h2>
              <button onClick={() => setShowRestockModal(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                <XCircle className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>
            <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <p className="font-medium text-gray-900 dark:text-white">{selectedProduct.name}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Current Stock: {selectedProduct.stock}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Current Buying Price: {formatCurrency(selectedProduct.buyingPrice || 0)}</p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Quantity to Add *</label>
                <input
                  type="number"
                  min="1"
                  value={restockQuantity}
                  onChange={(e) => setRestockQuantity(parseInt(e.target.value))}
                  className="w-full px-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">New Buying Price (optional)</label>
                <input
                  type="number"
                  value={restockPrice || ''}
                  onChange={(e) => setRestockPrice(e.target.value ? parseFloat(e.target.value) : null)}
                  className="w-full px-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200"
                  placeholder="Leave empty to keep current price"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Reason (optional)</label>
                <input
                  type="text"
                  value={restockReason}
                  onChange={(e) => setRestockReason(e.target.value)}
                  className="w-full px-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200"
                  placeholder="e.g., New shipment received"
                />
              </div>
              <div className="flex gap-3 pt-4 flex-col sm:flex-row">
                <button
                  onClick={handleRestock}
                  className="flex-1 py-3 bg-cyan-600 hover:bg-cyan-700 dark:bg-cyan-500 dark:hover:bg-cyan-600 text-white rounded-lg font-medium transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  Confirm Restock
                </button>
                <button
                  onClick={() => setShowRestockModal(false)}
                  className="flex-1 py-3 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-all duration-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Import Modal */}
      {showBulkImportModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Bulk Import Products</h2>
              <button onClick={() => setShowBulkImportModal(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                <XCircle className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-sm">
                <p className="font-medium text-gray-900 dark:text-white mb-2">CSV Format Requirements:</p>
                <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-400">
                  <li>First row must be column headers</li>
                  <li>Required: Product Name, Price (KES)</li>
                  <li>Optional: SKU, Category, Brand, Stock, etc.</li>
                  <li>Download template for correct format</li>
                </ul>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Select CSV File</label>
                <input
                  type="file"
                  accept=".csv"
                  onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                  className="w-full border border-gray-200 dark:border-gray-700 rounded-lg p-2 bg-white dark:bg-gray-900 text-gray-900 dark:text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-cyan-50 file:text-cyan-700 hover:file:bg-cyan-100 dark:file:bg-cyan-900/30 dark:file:text-cyan-400 transition-all duration-200"
                />
              </div>
              <div className="flex gap-3 pt-4 flex-col sm:flex-row">
                <button
                  onClick={handleBulkImport}
                  disabled={importing || !importFile}
                  className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md flex items-center justify-center gap-2"
                >
                  {importing ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
                  {importing ? 'Importing...' : 'Import'}
                </button>
                <button
                  onClick={() => setShowBulkImportModal(false)}
                  className="flex-1 py-3 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-all duration-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Stock Adjust Modal */}
      {showBulkAdjustModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Bulk Stock Adjustment</h2>
              <button onClick={() => setShowBulkAdjustModal(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                <XCircle className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>
            <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <p className="font-medium text-gray-900 dark:text-white">{selectedProducts.size} products selected</p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Operation</label>
                <select 
                  value={bulkAdjustOperation}
                  onChange={(e) => setBulkAdjustOperation(e.target.value as any)}
                  className="w-full px-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="add">Add Stock (+)</option>
                  <option value="subtract">Subtract Stock (-)</option>
                  <option value="set">Set Exact Stock (=)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Quantity</label>
                <input
                  type="number"
                  min="1"
                  value={bulkAdjustQuantity}
                  onChange={(e) => setBulkAdjustQuantity(parseInt(e.target.value))}
                  className="w-full px-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Reason</label>
                <input
                  type="text"
                  value={bulkAdjustReason}
                  onChange={(e) => setBulkAdjustReason(e.target.value)}
                  className="w-full px-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="e.g., Physical inventory count"
                />
              </div>
              <div className="flex gap-3 pt-4 flex-col sm:flex-row">
                <button
                  onClick={handleBulkStockAdjust}
                  className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-lg font-medium transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  Apply Adjustment
                </button>
                <button
                  onClick={() => setShowBulkAdjustModal(false)}
                  className="flex-1 py-3 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-all duration-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-full">
                <AlertOctagon className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Confirm Deletion</h2>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Are you sure you want to delete {selectedProducts.size} product(s)? This action cannot be undone.
            </p>
            <div className="flex gap-3 flex-col sm:flex-row">
              <button
                onClick={handleBulkDelete}
                className="flex-1 py-3 bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 text-white rounded-lg font-medium transition-all duration-200 shadow-sm hover:shadow-md"
              >
                Yes, Delete
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-3 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-all duration-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}