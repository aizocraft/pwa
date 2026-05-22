// app/sales/orders.tsx
'use client';

import { useState, useEffect } from 'react';
import {
  Eye,
  Truck,
  Search,
  CreditCard,
  Smartphone,
  DollarSign,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  Plus
} from 'lucide-react';
import { listOrderTransactions, createManualTransaction, type Transaction } from '@/lib/sales';
import { toast } from 'react-hot-toast';

interface Order {
  _id: string;
  orderNumber: string;
  customerName: string;
  items: Array<{ name: string; qty: number; price: number }>;
  total: number;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  createdAt: string;
}

export default function SalesOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [transactionForm, setTransactionForm] = useState({
    paymentMethod: 'mpesa' as 'mpesa' | 'card' | 'cod',
    amount: '',
    status: 'completed' as 'pending' | 'completed' | 'failed' | 'refunded',
    transactionId: '',
    mpesaReceipt: '',
    notes: ''
  });

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      // Fetch orders from API - you'll need to implement this endpoint
      const res = await fetch('/api/orders?sales=true');
      const data = await res.json();
      setOrders(data);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleViewTransactions = async (order: Order) => {
    setSelectedOrder(order);
    try {
      const data = await listOrderTransactions(order._id);
      setTransactions(data.transactions);
      setShowTransactionModal(true);
    } catch (error) {
      toast.error('Failed to load transactions');
    }
  };

  const handleRecordTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;

    try {
      await createManualTransaction({
        orderId: selectedOrder._id,
        paymentMethod: transactionForm.paymentMethod,
        amount: parseFloat(transactionForm.amount),
        status: transactionForm.status,
        transactionId: transactionForm.transactionId || undefined,
        mpesaReceipt: transactionForm.mpesaReceipt || undefined,
        notes: transactionForm.notes || undefined
      });
      toast.success('Transaction recorded successfully');
      // Refresh transactions
      const data = await listOrderTransactions(selectedOrder._id);
      setTransactions(data.transactions);
      setTransactionForm({
        paymentMethod: 'mpesa',
        amount: '',
        status: 'completed',
        transactionId: '',
        mpesaReceipt: '',
        notes: ''
      });
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to record transaction');
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      completed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
      failed: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
      refunded: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
      delivered: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
      shipped: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      processing: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400',
      cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
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
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Orders</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Monitor and manage orders, record payments
        </p>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search orders..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
        />
      </div>

      {/* Orders Table */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Order #</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Items</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Payment</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {orders.map((order) => (
                <tr key={order._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                    {order.orderNumber}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                    {order.customerName}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                    {order.items.length} items
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white">
                    KES {order.total.toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.paymentStatus)}`}>
                      {order.paymentStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleViewTransactions(order)}
                        className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                        title="View Transactions"
                      >
                        <CreditCard className="w-4 h-4 text-gray-500" />
                      </button>
                      <button className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors" title="Track Order">
                        <Truck className="w-4 h-4 text-gray-500" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Transactions Modal */}
      {showTransactionModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center sticky top-0 bg-white dark:bg-gray-900">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Order Transactions
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {selectedOrder.orderNumber} - {selectedOrder.customerName}
                </p>
              </div>
              <button
                onClick={() => setShowTransactionModal(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Existing Transactions */}
              {transactions.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                    Transaction History
                  </h3>
                  <div className="space-y-3">
                    {transactions.map((tx) => (
                      <div
                        key={tx._id}
                        className="border border-gray-200 dark:border-gray-800 rounded-lg p-4"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-mono text-sm text-gray-600 dark:text-gray-400">
                              {tx.transactionId}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              {tx.paymentMethod === 'mpesa' && <Smartphone className="w-4 h-4 text-green-600" />}
                              {tx.paymentMethod === 'card' && <CreditCard className="w-4 h-4 text-blue-600" />}
                              {tx.paymentMethod === 'cod' && <DollarSign className="w-4 h-4 text-orange-600" />}
                              <span className="text-sm capitalize">{tx.paymentMethod}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-gray-900 dark:text-white">
                              KES {tx.amount.toLocaleString()}
                            </p>
                            <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(tx.status)}`}>
                              {tx.status}
                            </span>
                          </div>
                        </div>
                        {tx.mpesaReceipt && (
                          <p className="text-xs text-gray-500 mt-2">
                            Receipt: {tx.mpesaReceipt}
                          </p>
                        )}
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(tx.createdAt).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Record New Transaction */}
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                  Record Payment
                </h3>
                <form onSubmit={handleRecordTransaction} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Payment Method</label>
                      <select
                        required
                        className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800"
                        value={transactionForm.paymentMethod}
                        onChange={(e) => setTransactionForm({ ...transactionForm, paymentMethod: e.target.value as any })}
                      >
                        <option value="mpesa">M-Pesa</option>
                        <option value="card">Card</option>
                        <option value="cod">Cash on Delivery</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Amount (KES)</label>
                      <input
                        type="number"
                        required
                        step="0.01"
                        className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800"
                        value={transactionForm.amount}
                        onChange={(e) => setTransactionForm({ ...transactionForm, amount: e.target.value })}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Status</label>
                    <select
                      required
                      className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800"
                      value={transactionForm.status}
                      onChange={(e) => setTransactionForm({ ...transactionForm, status: e.target.value as any })}
                    >
                      <option value="completed">Completed</option>
                      <option value="pending">Pending</option>
                      <option value="failed">Failed</option>
                      <option value="refunded">Refunded</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Transaction ID / Reference</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800"
                      value={transactionForm.transactionId}
                      onChange={(e) => setTransactionForm({ ...transactionForm, transactionId: e.target.value })}
                      placeholder="Optional for completed payments"
                    />
                  </div>
                  {transactionForm.paymentMethod === 'mpesa' && (
                    <div>
                      <label className="block text-sm font-medium mb-1">M-Pesa Receipt</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800"
                        value={transactionForm.mpesaReceipt}
                        onChange={(e) => setTransactionForm({ ...transactionForm, mpesaReceipt: e.target.value })}
                      />
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium mb-1">Notes</label>
                    <textarea
                      rows={2}
                      className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800"
                      value={transactionForm.notes}
                      onChange={(e) => setTransactionForm({ ...transactionForm, notes: e.target.value })}
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors"
                  >
                    Record Transaction
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}