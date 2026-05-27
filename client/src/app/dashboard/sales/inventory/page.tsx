'use client';

import { useState, useEffect } from 'react';
import { 
  Package, Search, Filter, ChevronDown, Loader2, RefreshCw,
  TrendingUp, TrendingDown, AlertTriangle, CheckCircle, XCircle,
  DollarSign, Box, ShoppingBag, Download, Plus, Minus,
} from 'lucide-react';
import { getInventorySummary, getLowStockProducts, restockProduct } from '@/lib/api';
import { toast } from 'react-hot-toast';

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

export default function InventoryPage() {
  const [summary, setSummary] = useState<any>(null);
  const [lowStockProducts, setLowStockProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [showRestockModal, setShowRestockModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [restockQuantity, setRestockQuantity] = useState(1);
  const [restockPrice, setRestockPrice] = useState<number | null>(null);
  const [restockReason, setRestockReason] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [summaryRes, lowStockRes] = await Promise.all([
        getInventorySummary(),
        getLowStockProducts(10)
      ]);
      setSummary(summaryRes.summary);
      setLowStockProducts(lowStockRes.products || []);
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
      toast.success(`Restocked ${restockQuantity} units of ${selectedProduct.name}`);
      setShowRestockModal(false);
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to restock');
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
        <Loader2 className="w-8 h-8 animate-spin text-cyan-600" />
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
            Track stock levels, manage inventory value, and monitor low stock items
          </p>
        </div>
        <button onClick={fetchData} className="px-4 py-2 border rounded-lg hover:bg-gray-50 flex items-center gap-2">
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Inventory Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-5 text-white">
          <div className="flex items-center justify-between">
            <Package className="w-8 h-8 opacity-80" />
            <span className="text-2xl font-bold">{summary?.totalUnits || 0}</span>
          </div>
          <p className="text-sm opacity-80 mt-2">Total Units in Stock</p>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-5 text-white">
          <div className="flex items-center justify-between">
            <DollarSign className="w-8 h-8 opacity-80" />
            <span className="text-2xl font-bold">{formatCurrency(summary?.totalStockValue || 0)}</span>
          </div>
          <p className="text-sm opacity-80 mt-2">Stock Value (Cost)</p>
        </div>
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-5 text-white">
          <div className="flex items-center justify-between">
            <TrendingUp className="w-8 h-8 opacity-80" />
            <span className="text-2xl font-bold">{formatCurrency(summary?.totalPotentialProfit || 0)}</span>
          </div>
          <p className="text-sm opacity-80 mt-2">Potential Profit</p>
        </div>
        <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl p-5 text-white">
          <div className="flex items-center justify-between">
            <AlertTriangle className="w-8 h-8 opacity-80" />
            <span className="text-2xl font-bold">{summary?.lowStockItems || 0}</span>
          </div>
          <p className="text-sm opacity-80 mt-2">Low Stock Items</p>
        </div>
      </div>

      {/* Category Breakdown */}
      {summary?.categoryBreakdown?.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold mb-4">Inventory by Category</h2>
          <div className="space-y-3">
            {summary.categoryBreakdown.map((cat: any) => (
              <div key={cat._id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                <div>
                  <p className="font-medium">{cat._id}</p>
                  <p className="text-sm text-gray-500">{cat.units} units</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{formatCurrency(cat.stockValue)}</p>
                  <p className="text-sm text-gray-500">{formatCurrency(cat.inventoryValue)} (retail)</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Low Stock Products */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-6 py-4 border-b flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              Low Stock Alert
            </h2>
            <p className="text-sm text-gray-500">Products with stock below 10 units</p>
          </div>
          <div className="flex gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border rounded-lg w-64"
              />
            </div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-2 border rounded-lg"
            >
              <option value="">All Categories</option>
              <option value="Solar Panels">Solar Panels</option>
              <option value="Inverters">Inverters</option>
              <option value="Batteries">Batteries</option>
              <option value="Generators">Generators</option>
            </select>
          </div>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <CheckCircle className="w-12 h-12 mx-auto text-emerald-500 mb-3" />
            <p className="text-gray-500">No low stock items found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium">Product</th>
                  <th className="px-6 py-3 text-left text-xs font-medium">SKU</th>
                  <th className="px-6 py-3 text-right text-xs font-medium">Current Stock</th>
                  <th className="px-6 py-3 text-right text-xs font-medium">Selling Price</th>
                  <th className="px-6 py-3 text-right text-xs font-medium">Buying Price</th>
                  <th className="px-6 py-3 text-right text-xs font-medium">Profit Per Unit</th>
                  <th className="px-6 py-3 text-center text-xs font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredProducts.map((product) => {
                  const profitPerUnit = product.price - (product.buyingPrice || 0);
                  const stockStatus = product.stock === 0 ? 'Out of Stock' : product.stock < 5 ? 'Critical' : 'Low Stock';
                  const statusColor = product.stock === 0 ? 'text-red-600' : product.stock < 5 ? 'text-orange-600' : 'text-amber-600';
                  
                  return (
                    <tr key={product._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-xs text-gray-500">{product.category}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-mono">{product.sku || 'N/A'}</td>
                      <td className="px-6 py-4 text-right">
                        <span className={`font-semibold ${statusColor}`}>{product.stock}</span>
                        <p className="text-xs text-gray-500">{stockStatus}</p>
                       </td>
                      <td className="px-6 py-4 text-right">{formatCurrency(product.price)}</td>
                      <td className="px-6 py-4 text-right text-gray-500">{formatCurrency(product.buyingPrice || 0)}</td>
                      <td className="px-6 py-4 text-right">
                        <span className={profitPerUnit >= 0 ? 'text-emerald-600' : 'text-red-600'}>
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
                          className="px-3 py-1.5 bg-cyan-600 text-white rounded-lg text-sm hover:bg-cyan-700"
                        >
                          <Plus className="w-4 h-4 inline mr-1" />
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

      {/* Restock Modal */}
      {showRestockModal && selectedProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Restock Product</h2>
              <button onClick={() => setShowRestockModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <p className="font-medium">{selectedProduct.name}</p>
              <p className="text-sm text-gray-500">Current Stock: {selectedProduct.stock}</p>
              <p className="text-sm text-gray-500">Current Buying Price: {formatCurrency(selectedProduct.buyingPrice || 0)}</p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Quantity to Add *</label>
                <input
                  type="number"
                  min="1"
                  value={restockQuantity}
                  onChange={(e) => setRestockQuantity(parseInt(e.target.value))}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">New Buying Price (optional)</label>
                <input
                  type="number"
                  value={restockPrice || ''}
                  onChange={(e) => setRestockPrice(e.target.value ? parseFloat(e.target.value) : null)}
                  className="w-full px-4 py-2 border rounded-lg"
                  placeholder="Leave empty to keep current price"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Reason (optional)</label>
                <input
                  type="text"
                  value={restockReason}
                  onChange={(e) => setRestockReason(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg"
                  placeholder="e.g., New shipment received"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleRestock}
                  className="flex-1 py-3 bg-cyan-600 text-white rounded-lg font-medium"
                >
                  Confirm Restock
                </button>
                <button
                  onClick={() => setShowRestockModal(false)}
                  className="flex-1 py-3 border rounded-lg"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}