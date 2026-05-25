// app/sales/payments/page.tsx
'use client';

import { useState } from 'react';
import {
  Search,
  CreditCard,
  Smartphone,
  Building2,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Download,
  Printer,
  RefreshCw,
  DollarSign,
  Calendar,
  User,
  Mail,
  Phone,
  Receipt,
  Banknote,
  ArrowLeft,
  Filter,
  MoreVertical,
  AlertCircle,
  Loader2,
  X,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Wallet,
  Check,
  Copy,
  Send,
  FileText,
} from 'lucide-react';

// Mock payment data
interface PaymentRecord {
  id: string;
  invoiceNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  amount: number;
  paidAmount: number;
  remainingAmount: number;
  paymentMethod: 'mpesa' | 'bank' | 'cash' | 'card';
  status: 'paid' | 'partial' | 'pending' | 'overdue';
  transactionId?: string;
  mpesaReceipt?: string;
  paymentDate?: string;
  dueDate: string;
  notes?: string;
}

// Mock invoices data
const mockInvoices: PaymentRecord[] = [
  {
    id: '1',
    invoiceNumber: 'INV-2026-001',
    customerName: 'John Mwangi',
    customerEmail: 'john.mwangi@example.com',
    customerPhone: '+254712345678',
    amount: 250000,
    paidAmount: 250000,
    remainingAmount: 0,
    paymentMethod: 'mpesa',
    status: 'paid',
    transactionId: 'MPESA-TX-123456',
    mpesaReceipt: 'QWE123456789',
    paymentDate: '2026-01-15T10:30:00',
    dueDate: '2026-01-30',
  },
  {
    id: '2',
    invoiceNumber: 'INV-2026-002',
    customerName: 'Sarah Wanjiku',
    customerEmail: 'sarah@example.com',
    customerPhone: '+254723456789',
    amount: 187500,
    paidAmount: 100000,
    remainingAmount: 87500,
    paymentMethod: 'bank',
    status: 'partial',
    dueDate: '2026-02-15',
  },
  {
    id: '3',
    invoiceNumber: 'INV-2026-003',
    customerName: 'Peter Ochieng',
    customerEmail: 'peter@example.com',
    customerPhone: '+254734567890',
    amount: 450000,
    paidAmount: 0,
    remainingAmount: 450000,
    paymentMethod: 'mpesa',
    status: 'pending',
    dueDate: '2026-02-10',
  },
  {
    id: '4',
    invoiceNumber: 'INV-2026-004',
    customerName: 'Mary Nduta',
    customerEmail: 'mary@example.com',
    customerPhone: '+254745678901',
    amount: 320000,
    paidAmount: 0,
    remainingAmount: 320000,
    paymentMethod: 'card',
    status: 'overdue',
    dueDate: '2026-01-25',
  },
  {
    id: '5',
    invoiceNumber: 'INV-2026-005',
    customerName: 'James Kariuki',
    customerEmail: 'james@example.com',
    customerPhone: '+254756789012',
    amount: 95000,
    paidAmount: 95000,
    remainingAmount: 0,
    paymentMethod: 'cash',
    status: 'paid',
    transactionId: 'CASH-001',
    paymentDate: '2026-02-01T14:30:00',
    dueDate: '2026-02-20',
  },
];

// Payment Modal Component
interface RecordPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: PaymentRecord | null;
  onSuccess: () => void;
}

function RecordPaymentModal({ isOpen, onClose, invoice, onSuccess }: RecordPaymentModalProps) {
  const [paymentMethod, setPaymentMethod] = useState<'mpesa' | 'bank' | 'cash' | 'card'>('mpesa');
  const [amount, setAmount] = useState(invoice?.remainingAmount || 0);
  const [transactionId, setTransactionId] = useState('');
  const [mpesaReceipt, setMpesaReceipt] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen || !invoice) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    console.log('Payment recorded:', {
      invoiceId: invoice.id,
      amount,
      paymentMethod,
      transactionId,
      mpesaReceipt,
      notes,
    });
    
    setLoading(false);
    onSuccess();
    onClose();
  };

  const getPaymentMethodIcon = () => {
    switch (paymentMethod) {
      case 'mpesa': return <Smartphone className="w-5 h-5" />;
      case 'bank': return <Building2 className="w-5 h-5" />;
      case 'cash': return <Banknote className="w-5 h-5" />;
      case 'card': return <CreditCard className="w-5 h-5" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl max-w-md w-full shadow-2xl">
        <div className="p-5 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Record Payment</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-5">
          {/* Invoice Info */}
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Invoice:</span>
              <span className="font-medium">{invoice.invoiceNumber}</span>
            </div>
            <div className="flex justify-between text-sm mt-1">
              <span className="text-gray-500">Customer:</span>
              <span className="font-medium">{invoice.customerName}</span>
            </div>
            <div className="flex justify-between text-sm mt-1">
              <span className="text-gray-500">Amount Due:</span>
              <span className="font-bold text-amber-600">KES {invoice.remainingAmount.toLocaleString()}</span>
            </div>
          </div>

          {/* Payment Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Payment Amount (KES)
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="number"
                required
                min="1"
                max={invoice.remainingAmount}
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full pl-9 pr-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Max: KES {invoice.remainingAmount.toLocaleString()}
            </p>
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Payment Method
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(['mpesa', 'bank', 'cash', 'card'] as const).map((method) => (
                <button
                  key={method}
                  type="button"
                  onClick={() => setPaymentMethod(method)}
                  className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg border transition-all ${
                    paymentMethod === method
                      ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-900/20 text-cyan-600'
                      : 'border-gray-300 dark:border-gray-700 hover:border-cyan-400'
                  }`}
                >
                  {method === 'mpesa' && <Smartphone className="w-4 h-4" />}
                  {method === 'bank' && <Building2 className="w-4 h-4" />}
                  {method === 'cash' && <Banknote className="w-4 h-4" />}
                  {method === 'card' && <CreditCard className="w-4 h-4" />}
                  <span className="text-sm capitalize">{method}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Transaction ID (for M-PESA/Bank/Card) */}
          {(paymentMethod === 'mpesa' || paymentMethod === 'bank' || paymentMethod === 'card') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Transaction ID
              </label>
              <input
                type="text"
                required
                placeholder={paymentMethod === 'mpesa' ? 'M-PESA Transaction Code' : 'Reference Number'}
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
              />
            </div>
          )}

          {/* M-PESA Receipt Number */}
          {paymentMethod === 'mpesa' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                M-PESA Receipt Number
              </label>
              <input
                type="text"
                placeholder="e.g., QWE123456789"
                value={mpesaReceipt}
                onChange={(e) => setMpesaReceipt(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
              />
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Notes (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="Additional payment notes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-sm"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || amount <= 0 || amount > invoice.remainingAmount}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
              Record Payment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Payment Details Modal
function PaymentDetailsModal({ isOpen, onClose, payment }: { isOpen: boolean; onClose: () => void; payment: PaymentRecord | null }) {
  if (!isOpen || !payment) return null;

  const getStatusBadge = () => {
    switch (payment.status) {
      case 'paid':
        return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700"><CheckCircle className="w-3 h-3" /> Paid</span>;
      case 'partial':
        return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700"><Clock className="w-3 h-3" /> Partial</span>;
      case 'pending':
        return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700"><Clock className="w-3 h-3" /> Pending</span>;
      case 'overdue':
        return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700"><AlertCircle className="w-3 h-3" /> Overdue</span>;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl max-w-lg w-full shadow-2xl">
        <div className="p-5 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Payment Details</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-500">Invoice Number:</span>
            <span className="font-medium">{payment.invoiceNumber}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-500">Customer:</span>
            <span className="font-medium">{payment.customerName}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-500">Total Amount:</span>
            <span className="font-semibold">KES {payment.amount.toLocaleString()}</span>
          </div>
          {payment.paidAmount > 0 && (
            <div className="flex justify-between items-center text-green-600">
              <span>Paid Amount:</span>
              <span className="font-semibold">KES {payment.paidAmount.toLocaleString()}</span>
            </div>
          )}
          {payment.remainingAmount > 0 && (
            <div className="flex justify-between items-center text-amber-600">
              <span>Remaining:</span>
              <span className="font-semibold">KES {payment.remainingAmount.toLocaleString()}</span>
            </div>
          )}
          <div className="flex justify-between items-center">
            <span className="text-gray-500">Status:</span>
            {getStatusBadge()}
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-500">Due Date:</span>
            <span>{new Date(payment.dueDate).toLocaleDateString()}</span>
          </div>
          {payment.paymentDate && (
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Payment Date:</span>
              <span>{new Date(payment.paymentDate).toLocaleString()}</span>
            </div>
          )}
          {payment.paymentMethod && (
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Payment Method:</span>
              <span className="capitalize">{payment.paymentMethod}</span>
            </div>
          )}
          {payment.transactionId && (
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Transaction ID:</span>
              <span className="font-mono text-sm">{payment.transactionId}</span>
            </div>
          )}
          {payment.mpesaReceipt && (
            <div className="flex justify-between items-center">
              <span className="text-gray-500">M-PESA Receipt:</span>
              <span className="font-mono text-sm">{payment.mpesaReceipt}</span>
            </div>
          )}
        </div>

        <div className="p-5 border-t border-gray-200 dark:border-gray-800">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// Main Payments Page
export default function PaymentsPage() {
  const [invoices, setInvoices] = useState<PaymentRecord[]>(mockInvoices);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [selectedInvoice, setSelectedInvoice] = useState<PaymentRecord | null>(null);
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Calculate summary stats
  const totalDue = invoices.reduce((sum, inv) => sum + inv.remainingAmount, 0);
  const totalPaid = invoices.reduce((sum, inv) => sum + inv.paidAmount, 0);
  const overdueInvoices = invoices.filter(inv => inv.status === 'overdue').length;
  const paidInvoices = invoices.filter(inv => inv.status === 'paid').length;

  // Filter invoices
  const filteredInvoices = invoices.filter(inv => {
    const matchesSearch = inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         inv.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         inv.customerEmail.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || inv.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage);
  const paginatedInvoices = filteredInvoices.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getStatusBadge = (status: PaymentRecord['status']) => {
    switch (status) {
      case 'paid':
        return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700"><CheckCircle className="w-3 h-3" /> Paid</span>;
      case 'partial':
        return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700"><Clock className="w-3 h-3" /> Partial</span>;
      case 'pending':
        return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700"><Clock className="w-3 h-3" /> Pending</span>;
      case 'overdue':
        return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700"><AlertCircle className="w-3 h-3" /> Overdue</span>;
    }
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'mpesa': return <Smartphone className="w-4 h-4" />;
      case 'bank': return <Building2 className="w-4 h-4" />;
      case 'cash': return <Banknote className="w-4 h-4" />;
      case 'card': return <CreditCard className="w-4 h-4" />;
      default: return <Receipt className="w-4 h-4" />;
    }
  };

  const handleRecordPayment = (invoice: PaymentRecord) => {
    setSelectedInvoice(invoice);
    setShowRecordModal(true);
  };

  const handleViewDetails = (invoice: PaymentRecord) => {
    setSelectedInvoice(invoice);
    setShowDetailsModal(true);
  };

  const handlePaymentSuccess = () => {
    // Simulate updating the invoice list
    if (selectedInvoice) {
      const updatedInvoices = invoices.map(inv => {
        if (inv.id === selectedInvoice.id) {
          return {
            ...inv,
            paidAmount: inv.amount,
            remainingAmount: 0,
            status: 'paid' as const,
            paymentDate: new Date().toISOString(),
          };
        }
        return inv;
      });
      setInvoices(updatedInvoices);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900">
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Payments</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Manage and record invoice payments
            </p>
          </div>
          <button
            className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white rounded-lg font-medium flex items-center gap-2 transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            Sync Payments
          </button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <DollarSign className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Total Due</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">KES {totalDue.toLocaleString()}</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Total Paid</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">KES {totalPaid.toLocaleString()}</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <Wallet className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Paid Invoices</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{paidInvoices}</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Overdue</p>
                <p className="text-xl font-bold text-red-600">{overdueInvoices}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by invoice #, customer name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
          >
            <option value="">All Status</option>
            <option value="paid">Paid</option>
            <option value="partial">Partial</option>
            <option value="pending">Pending</option>
            <option value="overdue">Overdue</option>
          </select>
        </div>

        {/* Payments Table */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice #</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Paid</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Due</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Method</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                {paginatedInvoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Receipt className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{invoice.invoiceNumber}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{invoice.customerName}</p>
                        <p className="text-xs text-gray-500">{invoice.customerEmail}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-semibold">KES {invoice.amount.toLocaleString()}</td>
                    <td className="px-6 py-4 text-right text-sm text-green-600">KES {invoice.paidAmount.toLocaleString()}</td>
                    <td className="px-6 py-4 text-right text-sm text-amber-600">KES {invoice.remainingAmount.toLocaleString()}</td>
                    <td className="px-6 py-4">{getStatusBadge(invoice.status)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        {getPaymentMethodIcon(invoice.paymentMethod)}
                        <span className="text-sm capitalize">{invoice.paymentMethod}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(invoice.dueDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={() => handleViewDetails(invoice)}
                          className="p-1.5 hover:bg-blue-100 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4 text-blue-500" />
                        </button>
                        {invoice.status !== 'paid' && (
                          <button
                            onClick={() => handleRecordPayment(invoice)}
                            className="p-1.5 hover:bg-green-100 rounded-lg transition-colors"
                            title="Record Payment"
                          >
                            <DollarSign className="w-4 h-4 text-green-500" />
                          </button>
                        )}
                        <button className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors" title="Download Receipt">
                          <Download className="w-4 h-4 text-gray-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border rounded-lg disabled:opacity-50 hover:bg-gray-100"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border rounded-lg disabled:opacity-50 hover:bg-gray-100"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <RecordPaymentModal
        isOpen={showRecordModal}
        onClose={() => setShowRecordModal(false)}
        invoice={selectedInvoice}
        onSuccess={handlePaymentSuccess}
      />
      <PaymentDetailsModal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        payment={selectedInvoice}
      />
    </div>
  );
}