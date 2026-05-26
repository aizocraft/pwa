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
  Plus,
  X,
  Package as PackageIcon
} from 'lucide-react';
import { getAdminOrders, getOrderPaymentSummary, recordManualPayment } from '@/lib/api';
import { type Transaction } from '@/lib/sales';
import { toast } from 'react-hot-toast';

// Define local order type based on what getAdminOrders returns
interface OrderItem {
  name: string;
  qty: number;
  price: number;
}

interface OrderData {
  _id: string;
  orderNumber: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  items?: OrderItem[];
  total: number;
  status: string;
  paymentStatus: string;
  paymentMethod?: string;
  amountPaid?: number;
  balanceDue?: number;
  createdAt: string;
  updatedAt: string;
}

interface OrderWithDetails extends OrderData {
  amountPaid: number;
  balanceDue: number;
  customerName: string;
}

export default function SalesOrders() {
  const [orders, setOrders] = useState<OrderWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<OrderWithDetails | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [transactionForm, setTransactionForm] = useState({
    paymentMethod: 'mpesa' as 'mpesa' | 'card' | 'cash' | 'bank_transfer' | 'cheque',
    amount: '',
    reference: '',
    notes: ''
  });
  const [recordingPayment, setRecordingPayment] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await getAdminOrders({ limit: 100 });
      const ordersData = response.orders || [];
      const ordersWithDetails: OrderWithDetails[] = ordersData.map((order: OrderData) => ({
        ...order,
        customerName: order.customerName || 'Guest',
        amountPaid: order.amountPaid || 0,
        balanceDue: Math.max(0, (order.balanceDue || order.total || 0) - (order.amountPaid || 0))
      }));
      setOrders(ordersWithDetails);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleViewTransactions = async (order: OrderWithDetails) => {
    setSelectedOrder(order);
    try {
      const data = await getOrderPaymentSummary(order._id);
      // Use the data from API - it's more accurate
      const apiAmountPaid = data.amountPaid || 0;
      const apiBalanceDue = Math.max(0, data.balanceDue || 0);
      const apiTotal = data.total || order.total || 0;
      
      setTransactions(data.transactions || []);
      setSelectedOrder({
        ...order,
        total: apiTotal,
        amountPaid: apiAmountPaid,
        balanceDue: apiBalanceDue
      });
      setShowTransactionModal(true);
    } catch (error) {
      console.error('Failed to load transactions:', error);
      toast.error('Failed to load transactions');
    }
  };

  const handleRecordTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;
    
    const amount = parseFloat(transactionForm.amount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    
    // Use the selected order's balance due (which should be accurate from API)
    const currentBalance = selectedOrder.balanceDue;
    
    if (currentBalance <= 0) {
      toast.error('This order is already fully paid');
      return;
    }
    
    if (amount > currentBalance) {
      toast.error(`Amount cannot exceed balance due of KES ${currentBalance.toLocaleString()}`);
      return;
    }

    setRecordingPayment(true);
    try {
      const result = await recordManualPayment({
        orderId: selectedOrder._id,
        amount: amount,
        paymentMethod: transactionForm.paymentMethod,
        reference: transactionForm.reference || undefined,
        notes: transactionForm.notes || undefined
      });
      
      toast.success(`Payment of KES ${amount.toLocaleString()} recorded successfully`);
      
      // Refresh data from API to get accurate state
      const updatedPaymentData = await getOrderPaymentSummary(selectedOrder._id);
      const newAmountPaid = updatedPaymentData.amountPaid || 0;
      const newBalanceDue = Math.max(0, updatedPaymentData.balanceDue || 0);
      
      setTransactions(updatedPaymentData.transactions || []);
      setSelectedOrder({
        ...selectedOrder,
        amountPaid: newAmountPaid,
        balanceDue: newBalanceDue
      });
      
      setTransactionForm({
        paymentMethod: 'mpesa',
        amount: '',
        reference: '',
        notes: ''
      });
      
      // Refresh orders list
      await fetchOrders();
      
      // Close modal if fully paid
      if (newBalanceDue === 0) {
        setTimeout(() => {
          setShowTransactionModal(false);
        }, 2000);
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.error || 'Failed to record payment';
      toast.error(errorMsg);
    } finally {
      setRecordingPayment(false);
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
      cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
      unpaid: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
      partially_paid: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
      paid: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getPaymentIcon = (method: string) => {
    switch (method) {
      case 'mpesa': return <Smartphone className="w-4 h-4" />;
      case 'card': return <CreditCard className="w-4 h-4" />;
      case 'cash': return <DollarSign className="w-4 h-4" />;
      default: return <CreditCard className="w-4 h-4" />;
    }
  };

  const filteredOrders = orders.filter(order =>
    order.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.customerName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const calculateBalance = (order: OrderWithDetails) => {
    const total = order.total || 0;
    const paid = order.amountPaid || 0;
    return Math.max(0, total - paid);
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Orders</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Monitor and manage orders, record payments
          </p>
        </div>
        <button
          onClick={fetchOrders}
          className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-medium flex items-center gap-2 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Paid</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Balance</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Payment</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {filteredOrders.map((order) => {
                const balance = calculateBalance(order);
                return (
                  <tr key={order._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                      {order.orderNumber}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {order.customerName}
                      {order.customerEmail && (
                        <div className="text-xs text-gray-400">{order.customerEmail}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {order.items?.length || 0} items
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white">
                      KES {(order.total || 0).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-green-600 dark:text-green-400">
                      KES {(order.amountPaid || 0).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-amber-600 dark:text-amber-400">
                      KES {balance.toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.paymentStatus)}`}>
                        {order.paymentStatus === 'partially_paid' ? 'Partially Paid' : order.paymentStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleViewTransactions(order)}
                          className="p-1.5 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                          title="View Transactions & Record Payment"
                        >
                          <CreditCard className="w-4 h-4 text-blue-500" />
                        </button>
                        <button className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors" title="Track Order">
                          <Truck className="w-4 h-4 text-gray-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {filteredOrders.length === 0 && (
        <div className="text-center py-12">
          <PackageIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No orders found</p>
        </div>
      )}

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
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Payment Summary */}
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-gray-800/50 dark:to-gray-800/30 rounded-lg p-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-sm text-gray-500">Total Amount</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">
                      KES {(selectedOrder.total || 0).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Amount Paid</p>
                    <p className="text-xl font-bold text-green-600">
                      KES {(selectedOrder.amountPaid || 0).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Balance Due</p>
                    <p className="text-xl font-bold text-amber-600">
                      KES {Math.max(0, selectedOrder.balanceDue).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Existing Transactions */}
              {transactions.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                    Transaction History ({transactions.length})
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
                              {getPaymentIcon(tx.paymentMethod)}
                              <span className="text-sm capitalize">{tx.paymentMethod}</span>
                              {tx.isPartialPayment && (
                                <span className="text-xs px-1.5 py-0.5 bg-amber-100 text-amber-800 rounded-full">Partial</span>
                              )}
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
                            M-Pesa Receipt: {tx.mpesaReceipt}
                          </p>
                        )}
                        {tx.reference && (
                          <p className="text-xs text-gray-500 mt-1">
                            Reference: {tx.reference}
                          </p>
                        )}
                        {tx.notes && (
                          <p className="text-xs text-gray-400 mt-1">{tx.notes}</p>
                        )}
                        <p className="text-xs text-gray-400 mt-2">
                          {new Date(tx.createdAt).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Record New Payment - Only show if not fully paid */}
              {selectedOrder.balanceDue > 0 && (
                <div className="border-t border-gray-200 dark:border-gray-800 pt-6">
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
                          <option value="cash">Cash</option>
                          <option value="bank_transfer">Bank Transfer</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Amount (KES)</label>
                        <input
                          type="number"
                          required
                          step="0.01"
                          min="1"
                          max={selectedOrder.balanceDue}
                          value={transactionForm.amount}
                          onChange={(e) => setTransactionForm({ ...transactionForm, amount: e.target.value })}
                          placeholder={`Max: ${selectedOrder.balanceDue.toLocaleString()}`}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Reference / Transaction ID</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800"
                        value={transactionForm.reference}
                        onChange={(e) => setTransactionForm({ ...transactionForm, reference: e.target.value })}
                        placeholder="Optional: M-Pesa code, Cheque #, etc."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Notes</label>
                      <textarea
                        rows={2}
                        className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800"
                        value={transactionForm.notes}
                        onChange={(e) => setTransactionForm({ ...transactionForm, notes: e.target.value })}
                        placeholder="Optional notes about this payment"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={recordingPayment}
                      className="w-full px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors disabled:opacity-50"
                    >
                      {recordingPayment ? (
                        <span className="flex items-center justify-center gap-2">
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          Recording...
                        </span>
                      ) : (
                        `Record Payment (Balance: KES ${selectedOrder.balanceDue.toLocaleString()})`
                      )}
                    </button>
                  </form>
                </div>
              )}

              {selectedOrder.balanceDue === 0 && (
                <div className="border-t border-gray-200 dark:border-gray-800 pt-6">
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 text-center">
                    <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                    <p className="text-green-700 dark:text-green-400 font-medium">
                      This order is fully paid
                    </p>
                    <p className="text-sm text-green-600 dark:text-green-500 mt-1">
                      Total Paid: KES {(selectedOrder.amountPaid || 0).toLocaleString()}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}