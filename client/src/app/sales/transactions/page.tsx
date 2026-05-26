'use client';

import { useState, useEffect } from 'react';
import {
  Receipt,
  Search,
  Eye,
  Download,
  RefreshCw,
  Smartphone,
  CreditCard,
  DollarSign,
  CheckCircle,
  XCircle,
  Clock,
  Filter,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  FileText,
  User,
  Mail,
  Phone,
  Wallet,
  Banknote,
  ChevronRight
} from 'lucide-react';
import api from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { toast } from 'react-hot-toast';

interface Transaction {
  _id: string;
  transactionId: string;
  orderId: string;
  orderNumber?: string;
  invoiceNumber?: string;
  quotationNumber?: string;
  userId?: string;
  guestEmail?: string;
  guestPhone?: string;
  customerName: string;
  amount: number;
  currency: string;
  paymentMethod: 'mpesa' | 'card' | 'cod' | 'cash' | 'bank_transfer' | 'cheque';
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  mpesaReceipt?: string;
  cardLast4?: string;
  cardBrand?: string;
  reference?: string;
  notes?: string;
  source: 'checkout' | 'quotation' | 'admin' | 'manual';
  isPartialPayment: boolean;
  recordedBy?: string;
  recordedByName?: string;
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
}

export default function SalesTransactionsPage() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      // Use the existing transactions endpoint from your backend
      const response = await api.get('/transactions', {
        params: { limit: 100 }
      });
      
      let transactionsData = response.data.transactions || [];
      
      // Sort by createdAt descending
      transactionsData = transactionsData.sort((a: Transaction, b: Transaction) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      
      setTransactions(transactionsData);
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
      toast.error('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      completed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
      failed: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
      refunded: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getPaymentIcon = (method: string) => {
    switch (method) {
      case 'mpesa': return <Smartphone className="w-4 h-4" />;
      case 'card': return <CreditCard className="w-4 h-4" />;
      case 'cash': return <DollarSign className="w-4 h-4" />;
      case 'bank_transfer': return <Banknote className="w-4 h-4" />;
      default: return <Receipt className="w-4 h-4" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'failed': return <XCircle className="w-4 h-4" />;
      case 'refunded': return <ArrowUpRight className="w-4 h-4" />;
      default: return <Receipt className="w-4 h-4" />;
    }
  };

  const filteredTransactions = transactions.filter(transaction =>
    (transaction.customerName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (transaction.transactionId?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (transaction.invoiceNumber?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (transaction.orderNumber?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  const filteredByStatus = statusFilter
    ? filteredTransactions.filter(t => t.status === statusFilter)
    : filteredTransactions;

  const allTransactions = transactions;
  const totalVolume = allTransactions
    .filter(t => t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0);
  const successRate = allTransactions.length
    ? ((allTransactions.filter(t => t.status === 'completed').length / allTransactions.length) * 100).toFixed(1)
    : '0';

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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Transactions</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Track all financial transactions and payment history
          </p>
        </div>
        <button
          onClick={fetchTransactions}
          className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-medium flex items-center gap-2 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-sm text-gray-500">Total Volume</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            KES {totalVolume.toLocaleString()}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Receipt className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-sm text-gray-500">Total Transactions</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {allTransactions.length}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <CheckCircle className="w-5 h-5 text-purple-600" />
            </div>
            <span className="text-sm text-gray-500">Success Rate</span>
          </div>
          <p className="text-2xl font-bold text-green-600">{successRate}%</p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
              <ArrowUpRight className="w-5 h-5 text-orange-600" />
            </div>
            <span className="text-sm text-gray-500">Avg. Transaction</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            KES {allTransactions.length
              ? (totalVolume / allTransactions.length).toLocaleString()
              : 0}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by customer, transaction ID, or invoice #..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-cyan-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
        >
          <option value="">All Status</option>
          <option value="completed">Completed</option>
          <option value="pending">Pending</option>
          <option value="failed">Failed</option>
          <option value="refunded">Refunded</option>
        </select>
      </div>

      {/* Transactions List */}
      <div className="space-y-4">
        {filteredByStatus.map((transaction) => (
          <div key={transaction._id} className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
            <div className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                    {getPaymentIcon(transaction.paymentMethod)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-mono text-sm text-gray-600 dark:text-gray-400">
                        {transaction.transactionId}
                      </p>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                        {getStatusIcon(transaction.status)}
                        {transaction.status}
                      </span>
                      {transaction.isPartialPayment && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
                          Partial Payment
                        </span>
                      )}
                      {transaction.source === 'manual' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400">
                          Manual Entry
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        <span>{transaction.customerName || 'Guest'}</span>
                      </div>
                      {transaction.orderNumber && (
                        <div className="flex items-center gap-1">
                          <FileText className="w-3 h-3" />
                          <span>Order: {transaction.orderNumber}</span>
                        </div>
                      )}
                      {transaction.invoiceNumber && (
                        <div className="flex items-center gap-1">
                          <FileText className="w-3 h-3" />
                          <span>Invoice: {transaction.invoiceNumber}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-xs text-gray-500 flex-wrap">
                      <span className="capitalize">{transaction.paymentMethod.replace('_', ' ')}</span>
                      {transaction.mpesaReceipt && (
                        <span>M-Pesa: {transaction.mpesaReceipt}</span>
                      )}
                      {transaction.cardLast4 && (
                        <span>Card: ****{transaction.cardLast4}</span>
                      )}
                      {transaction.reference && (
                        <span>Ref: {transaction.reference}</span>
                      )}
                      {transaction.recordedByName && (
                        <span>Recorded by: {transaction.recordedByName}</span>
                      )}
                      <span>{new Date(transaction.createdAt).toLocaleString()}</span>
                    </div>
                    {transaction.notes && (
                      <p className="text-xs text-gray-400 mt-1">{transaction.notes}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    KES {transaction.amount.toLocaleString()}
                  </p>
                  <button
                    onClick={() => {
                      setSelectedTransaction(transaction);
                      setShowDetailsModal(true);
                    }}
                    className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    title="View Details"
                  >
                    <Eye className="w-4 h-4 text-gray-500" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredByStatus.length === 0 && (
        <div className="text-center py-12">
          <Receipt className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No transactions found</p>
        </div>
      )}

      {/* Transaction Details Modal */}
      {showDetailsModal && selectedTransaction && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Transaction Details</h2>
              <button onClick={() => setShowDetailsModal(false)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded">
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Transaction ID:</span>
                <span className="font-mono text-sm">{selectedTransaction.transactionId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Amount:</span>
                <span className="font-semibold text-lg">KES {selectedTransaction.amount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Payment Method:</span>
                <span className="capitalize">{selectedTransaction.paymentMethod.replace('_', ' ')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedTransaction.status)}`}>
                  {getStatusIcon(selectedTransaction.status)}
                  {selectedTransaction.status}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Source:</span>
                <span className="capitalize">{selectedTransaction.source}</span>
              </div>
              {selectedTransaction.isPartialPayment && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment Type:</span>
                  <span className="text-amber-600">Partial Payment</span>
                </div>
              )}
              {selectedTransaction.mpesaReceipt && (
                <div className="flex justify-between">
                  <span className="text-gray-600">M-Pesa Receipt:</span>
                  <span>{selectedTransaction.mpesaReceipt}</span>
                </div>
              )}
              {selectedTransaction.cardLast4 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Card Last 4:</span>
                  <span>****{selectedTransaction.cardLast4}</span>
                </div>
              )}
              {selectedTransaction.cardBrand && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Card Brand:</span>
                  <span className="capitalize">{selectedTransaction.cardBrand}</span>
                </div>
              )}
              {selectedTransaction.reference && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Reference:</span>
                  <span>{selectedTransaction.reference}</span>
                </div>
              )}
              {selectedTransaction.recordedByName && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Recorded By:</span>
                  <span>{selectedTransaction.recordedByName}</span>
                </div>
              )}
              {selectedTransaction.paidAt && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Paid At:</span>
                  <span>{new Date(selectedTransaction.paidAt).toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">Customer:</span>
                <span>{selectedTransaction.customerName || 'Guest'}</span>
              </div>
              {selectedTransaction.orderNumber && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Order #:</span>
                  <span>{selectedTransaction.orderNumber}</span>
                </div>
              )}
              {selectedTransaction.invoiceNumber && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Invoice #:</span>
                  <span>{selectedTransaction.invoiceNumber}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">Created:</span>
                <span>{new Date(selectedTransaction.createdAt).toLocaleString()}</span>
              </div>
              {selectedTransaction.notes && (
                <div>
                  <span className="text-gray-600">Notes:</span>
                  <p className="text-sm mt-1 text-gray-700 dark:text-gray-300">{selectedTransaction.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}