'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
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
  X,
  Package as PackageIcon,
  Mail,
  Phone,
  User,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Download,
  Calendar,
  Filter
} from 'lucide-react';
import { getAdminOrders, getOrderPaymentSummary, recordManualPayment, updateOrderStatus } from '@/lib/api';
import { type Transaction } from '@/lib/sales';
import { toast } from 'react-hot-toast';
import { OrderStatusBadge } from '@/components/OrderStatusBadge';

// Define local order type based on what getAdminOrders returns
interface OrderItem {
  name: string;
  qty: number;
  price: number;
  sellingPrice?: number;
}

interface OrderData {
  _id: string;
  orderNumber: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  customerLocation?: string;
  items?: OrderItem[];
  total: number;
  subtotal?: number;
  shippingCost?: number;
  tax?: number;
  discount?: number;
  status: string;
  paymentStatus: string;
  paymentMethod?: string;
  amountPaid?: number;
  balanceDue?: number;
  shippingAddress?: {
    fullName: string;
    email: string;
    phone: string;
    city: string;
    address1: string;
  };
  guestInfo?: {
    name: string;
    email: string;
    phone: string;
  };
  userId?: {
    name: string;
    email: string;
  } | string;
  createdAt: string;
  updatedAt: string;
}

interface OrderWithDetails extends OrderData {
  amountPaid: number;
  balanceDue: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  subtotal: number;
  shippingCost: number;
  tax: number;
  discount: number;
}

// Helper function to get customer name
const getCustomerName = (order: OrderData): string => {
  if (order.customerName) return order.customerName;
  if (order.userId && typeof order.userId === 'object' && 'name' in order.userId) {
    return (order.userId as any).name;
  }
  if (order.guestInfo?.name) {
    return order.guestInfo.name;
  }
  if (order.shippingAddress?.fullName) {
    return order.shippingAddress.fullName;
  }
  return 'Guest';
};

// Helper function to get customer email
const getCustomerEmail = (order: OrderData): string => {
  if (order.customerEmail) return order.customerEmail;
  if (order.userId && typeof order.userId === 'object' && 'email' in order.userId) {
    return (order.userId as any).email;
  }
  if (order.guestInfo?.email) {
    return order.guestInfo.email;
  }
  if (order.shippingAddress?.email) {
    return order.shippingAddress.email;
  }
  return '';
};

// Helper function to get customer phone
const getCustomerPhone = (order: OrderData): string => {
  if (order.customerPhone) return order.customerPhone;
  if (order.guestInfo?.phone) {
    return order.guestInfo.phone;
  }
  if (order.shippingAddress?.phone) {
    return order.shippingAddress.phone;
  }
  return '';
};

// Helper to get subtotal safely
const getSubtotal = (order: OrderData): number => {
  if (order.subtotal !== undefined && order.subtotal !== null) return order.subtotal;
  // Calculate from items if available
  if (order.items && order.items.length > 0) {
    return order.items.reduce((sum, item) => {
      const price = item.sellingPrice || item.price || 0;
      return sum + (price * (item.qty || 0));
    }, 0);
  }
  // Fallback to total minus estimated tax/shipping
  return order.total || 0;
};

// Helper to get shipping cost safely
const getShippingCost = (order: OrderData): number => {
  return order.shippingCost || 0;
};

// Helper to get tax safely
const getTax = (order: OrderData): number => {
  return order.tax || 0;
};

// Helper to get discount safely
const getDiscount = (order: OrderData): number => {
  return order.discount || 0;
};

// Status update component
const StatusUpdateDropdown = ({ 
  orderId, 
  currentStatus, 
  onStatusChange 
}: { 
  orderId: string;
  currentStatus: string;
  onStatusChange: (id: string, status: string) => Promise<void>;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const statusOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'processing', label: 'Processing' },
    { value: 'shipped', label: 'Shipped' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' },
    { value: 'refunded', label: 'Refunded' },
  ];

  const handleSelect = async (status: string) => {
    if (status === currentStatus) {
      setIsOpen(false);
      return;
    }
    setIsUpdating(true);
    try {
      await onStatusChange(orderId, status);
      toast.success(`Status updated to ${status}`);
    } catch (error) {
      toast.error('Failed to update status');
    } finally {
      setIsUpdating(false);
      setIsOpen(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isUpdating}
        className="px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white bg-gray-100 dark:bg-gray-800 rounded-lg transition-colors"
      >
        {isUpdating ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Update'}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-36 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50 overflow-hidden">
          {statusOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => handleSelect(option.value)}
              className={`w-full text-left px-3 py-2 text-xs hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                currentStatus === option.value ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// Payment method badge
const PaymentMethodBadge = ({ method }: { method: string }) => {
  const config: Record<string, { icon: any; label: string }> = {
    cod: { icon: Truck, label: 'Cash on Delivery' },
    mpesa: { icon: Smartphone, label: 'M-PESA' },
    card: { icon: CreditCard, label: 'Card' },
    cash: { icon: DollarSign, label: 'Cash' },
    bank_transfer: { icon: CreditCard, label: 'Bank Transfer' },
  };
  const { icon: Icon, label } = config[method] || config.cod;
  return (
    <span className="inline-flex items-center gap-1.5 px-2 py-1 text-xs font-medium text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 rounded-lg">
      <Icon className="w-3 h-3" />
      {label}
    </span>
  );
};

export default function SalesOrders() {
  const [orders, setOrders] = useState<OrderWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilterPeriod, setDateFilterPeriod] = useState<'all' | 'today' | 'yesterday' | '7d' | '30d' | 'month' | 'year' | 'custom'>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
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
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportType, setExportType] = useState<'all' | 'filtered' | 'dateRange'>('filtered');
  const [exportStartDate, setExportStartDate] = useState('');
  const [exportEndDate, setExportEndDate] = useState('');
  const [exportStatus, setExportStatus] = useState('');
  
  const itemsPerPage = 10;

  useEffect(() => {
    fetchOrders();
  }, [searchTerm, statusFilter, currentPage, startDate, endDate]);

  const getDateString = (date: Date) => date.toISOString().split('T')[0];

  const applyDateFilter = (period: 'all' | 'today' | 'yesterday' | '7d' | '30d' | 'month' | 'year' | 'custom') => {
    const now = new Date();
    let start = '';
    let end = '';

    if (period === 'today') {
      start = getDateString(now);
      end = getDateString(now);
    } else if (period === 'yesterday') {
      const yesterday = new Date(now);
      yesterday.setDate(now.getDate() - 1);
      start = getDateString(yesterday);
      end = getDateString(yesterday);
    } else if (period === '7d') {
      const weekAgo = new Date(now);
      weekAgo.setDate(now.getDate() - 6);
      start = getDateString(weekAgo);
      end = getDateString(now);
    } else if (period === '30d') {
      const monthAgo = new Date(now);
      monthAgo.setDate(now.getDate() - 29);
      start = getDateString(monthAgo);
      end = getDateString(now);
    } else if (period === 'month') {
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      start = getDateString(monthStart);
      end = getDateString(now);
    } else if (period === 'year') {
      const yearStart = new Date(now.getFullYear(), 0, 1);
      start = getDateString(yearStart);
      end = getDateString(now);
    }

    setDateFilterPeriod(period);
    setStartDate(start);
    setEndDate(end);
    setCurrentPage(1);
  };

  const clearDateFilters = () => {
    setDateFilterPeriod('all');
    setStartDate('');
    setEndDate('');
    setCurrentPage(1);
  };

  // Format currency for CSV
  const formatCurrency = (amount: number) => {
    return `"KES ${amount.toLocaleString()}"`;
  };

  // Escape CSV field
  const escapeCSV = (value: any) => {
    if (value === null || value === undefined) return '""';
    const str = String(value);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return `"${str}"`;
  };

  // Export orders to CSV
  const handleExportOrders = async () => {
    setExportLoading(true);
    try {
      // Determine which orders to export
      let ordersToExport = orders;
      
      if (exportType === 'all') {
        // Fetch all orders (paginated)
        let allOrders: any[] = [];
        let page = 1;
        let hasMore = true;
        
        while (hasMore) {
          const response = await getAdminOrders({
            limit: 100,
            page: page,
            search: searchTerm || undefined,
            status: exportStatus || undefined,
            startDate: exportStartDate || undefined,
            endDate: exportEndDate || undefined
          });
          
          const data = response.orders || [];
          allOrders = [...allOrders, ...data];
          
          if (response.pagination && page >= response.pagination.pages) {
            hasMore = false;
          } else {
            page++;
          }
        }
        
        ordersToExport = allOrders.map((order: any) => ({
          ...order,
          customerName: getCustomerName(order),
          customerEmail: getCustomerEmail(order),
          customerPhone: getCustomerPhone(order),
          amountPaid: order.amountPaid || 0,
          balanceDue: Math.max(0, (order.balanceDue || order.total || 0) - (order.amountPaid || 0)),
          subtotal: getSubtotal(order),
          shippingCost: getShippingCost(order),
          tax: getTax(order),
          discount: getDiscount(order)
        }));
      } else if (exportType === 'dateRange') {
        // Fetch orders for custom date range
        const response = await getAdminOrders({
          limit: 1000,
          page: 1,
          startDate: exportStartDate || undefined,
          endDate: exportEndDate || undefined,
          status: exportStatus || undefined
        });
        
        ordersToExport = (response.orders || []).map((order: any) => ({
          ...order,
          customerName: getCustomerName(order),
          customerEmail: getCustomerEmail(order),
          customerPhone: getCustomerPhone(order),
          amountPaid: order.amountPaid || 0,
          balanceDue: Math.max(0, (order.balanceDue || order.total || 0) - (order.amountPaid || 0)),
          subtotal: getSubtotal(order),
          shippingCost: getShippingCost(order),
          tax: getTax(order),
          discount: getDiscount(order)
        }));
      } else {
        // Filtered (current view) - ensure all orders have the fields
        ordersToExport = orders.map(order => ({
          ...order,
          subtotal: getSubtotal(order),
          shippingCost: getShippingCost(order),
          tax: getTax(order),
          discount: getDiscount(order)
        }));
      }

      // Build CSV headers
      const headers = [
        'Order Number',
        'Customer Name',
        'Customer Email',
        'Customer Phone',
        'Customer Location',
        'Items Count',
        'Subtotal (KES)',
        'Shipping Cost (KES)',
        'Tax (KES)',
        'Discount (KES)',
        'Total (KES)',
        'Amount Paid (KES)',
        'Balance Due (KES)',
        'Payment Method',
        'Order Status',
        'Payment Status',
        'Created Date',
        'Updated Date'
      ];

      // Build CSV rows
      const rows = ordersToExport.map((order) => [
        escapeCSV(order.orderNumber || order._id.slice(-8)),
        escapeCSV(order.customerName),
        escapeCSV(order.customerEmail || 'N/A'),
        escapeCSV(order.customerPhone || 'N/A'),
        escapeCSV(order.shippingAddress?.city || order.customerLocation || 'N/A'),
        order.items?.length || 0,
        formatCurrency(order.subtotal || 0),
        formatCurrency(order.shippingCost || 0),
        formatCurrency(order.tax || 0),
        formatCurrency(order.discount || 0),
        formatCurrency(order.total || 0),
        formatCurrency(order.amountPaid || 0),
        formatCurrency(Math.max(0, (order.total || 0) - (order.amountPaid || 0))),
        escapeCSV(order.paymentMethod || 'N/A'),
        escapeCSV(order.status || 'N/A'),
        escapeCSV(order.paymentStatus || 'N/A'),
        escapeCSV(order.createdAt ? new Date(order.createdAt).toLocaleString() : 'N/A'),
        escapeCSV(order.updatedAt ? new Date(order.updatedAt).toLocaleString() : 'N/A')
      ]);

      // Combine headers and rows
      const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
      
      // Create and download file
      const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Generate filename
      let filename = 'orders';
      if (exportType === 'all') {
        filename += '-all';
      } else if (exportType === 'dateRange' && exportStartDate && exportEndDate) {
        filename += `-${exportStartDate}-to-${exportEndDate}`;
      } else if (startDate && endDate) {
        filename += `-${startDate}-to-${endDate}`;
      } else {
        filename += `-${new Date().toISOString().split('T')[0]}`;
      }
      
      if (exportStatus) {
        filename += `-${exportStatus}`;
      }
      
      link.download = `${filename}.csv`;
      link.click();
      URL.revokeObjectURL(url);
      
      toast.success(`Exported ${ordersToExport.length} orders successfully`);
      setShowExportModal(false);
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Failed to export orders');
    } finally {
      setExportLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await getAdminOrders({ 
        limit: itemsPerPage,
        page: currentPage,
        search: searchTerm || undefined,
        status: statusFilter || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined
      });
      
      const ordersData = response.orders || [];
      const ordersWithDetails: OrderWithDetails[] = ordersData.map((order: any) => ({
        ...order,
        customerName: getCustomerName(order),
        customerEmail: getCustomerEmail(order),
        customerPhone: getCustomerPhone(order),
        amountPaid: order.amountPaid || 0,
        balanceDue: Math.max(0, (order.balanceDue || order.total || 0) - (order.amountPaid || 0)),
        subtotal: getSubtotal(order),
        shippingCost: getShippingCost(order),
        tax: getTax(order),
        discount: getDiscount(order)
      }));
      
      setOrders(ordersWithDetails);
      setTotalPages(response.pagination?.pages || 1);
      setTotalOrders(response.pagination?.total || 0);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setUpdatingStatus(true);
    try {
      await updateOrderStatus(orderId, newStatus as any);
      await fetchOrders();
    } catch (error) {
      console.error('Failed to update status:', error);
      throw error;
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleViewTransactions = async (order: OrderWithDetails) => {
    setSelectedOrder(order);
    try {
      const data = await getOrderPaymentSummary(order._id);
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
      await recordManualPayment({
        orderId: selectedOrder._id,
        amount: amount,
        paymentMethod: transactionForm.paymentMethod,
        reference: transactionForm.reference || undefined,
        notes: transactionForm.notes || undefined
      });
      
      toast.success(`Payment of KES ${amount.toLocaleString()} recorded successfully`);
      
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
      
      await fetchOrders();
      
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

  const getPaymentIcon = (method: string) => {
    switch (method) {
      case 'mpesa': return <Smartphone className="w-4 h-4" />;
      case 'card': return <CreditCard className="w-4 h-4" />;
      case 'cash': return <DollarSign className="w-4 h-4" />;
      default: return <CreditCard className="w-4 h-4" />;
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

  const filteredOrders = orders;

  const calculateBalance = (order: OrderWithDetails) => {
    const total = order.total || 0;
    const paid = order.amountPaid || 0;
    return Math.max(0, total - paid);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Orders</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {totalOrders.toLocaleString()} total orders
            {startDate && endDate && ` (${formatDate(startDate)} - ${formatDate(endDate)})`}
          </p>
        </div>
        <div className="flex flex-row flex-wrap gap-2 items-center">
          <button
            onClick={() => setShowExportModal(true)}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium flex items-center gap-2 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
          <button
            onClick={fetchOrders}
            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-medium flex items-center gap-2 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by order #, customer name, email, or phone..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-cyan-500"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="paid">Paid</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
            <option value="refunded">Refunded</option>
          </select>
        </div>

        {/* Date Filter Buttons */}
        <div className="flex flex-wrap gap-2 items-center">
          <Calendar className="w-4 h-4 text-gray-400 mr-1" />
          <button
            onClick={() => applyDateFilter('all')}
            className={`px-3 py-1.5 rounded-lg border text-sm font-medium transition ${dateFilterPeriod === 'all' ? 'bg-cyan-600 text-white border-cyan-600' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
          >
            All
          </button>
          <button
            onClick={() => applyDateFilter('today')}
            className={`px-3 py-1.5 rounded-lg border text-sm font-medium transition ${dateFilterPeriod === 'today' ? 'bg-cyan-600 text-white border-cyan-600' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
          >
            Today
          </button>
          <button
            onClick={() => applyDateFilter('yesterday')}
            className={`px-3 py-1.5 rounded-lg border text-sm font-medium transition ${dateFilterPeriod === 'yesterday' ? 'bg-cyan-600 text-white border-cyan-600' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
          >
            Yesterday
          </button>
          <button
            onClick={() => applyDateFilter('7d')}
            className={`px-3 py-1.5 rounded-lg border text-sm font-medium transition ${dateFilterPeriod === '7d' ? 'bg-cyan-600 text-white border-cyan-600' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
          >
            7 Days
          </button>
          <button
            onClick={() => applyDateFilter('30d')}
            className={`px-3 py-1.5 rounded-lg border text-sm font-medium transition ${dateFilterPeriod === '30d' ? 'bg-cyan-600 text-white border-cyan-600' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
          >
            30 Days
          </button>
          <button
            onClick={() => applyDateFilter('month')}
            className={`px-3 py-1.5 rounded-lg border text-sm font-medium transition ${dateFilterPeriod === 'month' ? 'bg-cyan-600 text-white border-cyan-600' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
          >
            This Month
          </button>
          <button
            onClick={() => applyDateFilter('year')}
            className={`px-3 py-1.5 rounded-lg border text-sm font-medium transition ${dateFilterPeriod === 'year' ? 'bg-cyan-600 text-white border-cyan-600' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
          >
            This Year
          </button>
          <button
            onClick={() => applyDateFilter('custom')}
            className={`px-3 py-1.5 rounded-lg border text-sm font-medium transition ${dateFilterPeriod === 'custom' ? 'bg-cyan-600 text-white border-cyan-600' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
          >
            Custom
          </button>
          <button
            onClick={clearDateFilters}
            className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <X className="w-3 h-3" />
          </button>
        </div>

        {/* Custom Date Range */}
        {dateFilterPeriod === 'custom' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md">
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => { setStartDate(e.target.value); setDateFilterPeriod('custom'); setCurrentPage(1); }}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => { setEndDate(e.target.value); setDateFilterPeriod('custom'); setCurrentPage(1); }}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
          </div>
        )}
      </div>

      {/* Orders Table */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-16">
            <PackageIcon className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">No orders found</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {searchTerm || statusFilter || startDate ? 'Try adjusting your filters' : 'No orders yet'}
            </p>
          </div>
        ) : (
          <>
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Payment</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                  {filteredOrders.map((order) => {
                    const balance = calculateBalance(order);
                    return (
                      <tr key={order._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                        <td className="px-6 py-4">
                          <span className="font-mono text-xs font-medium text-gray-900 dark:text-white">
                            #{order.orderNumber || order._id.slice(-8)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-900 dark:text-white text-sm">
                            {order.customerName}
                          </div>
                          {order.customerEmail && (
                            <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                              <Mail className="w-3 h-3" />
                              {order.customerEmail}
                            </div>
                          )}
                          {order.customerPhone && (
                            <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                              <Phone className="w-3 h-3" />
                              {order.customerPhone}
                            </div>
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
                          <PaymentMethodBadge method={order.paymentMethod || 'cod'} />
                        </td>
                        <td className="px-6 py-4">
                          <OrderStatusBadge status={order.status as any} />
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                          {formatDate(order.createdAt)}
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
                            <Link
                              href={`/dashboard/orders/${order._id}`}
                              className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                              title="View Order Details"
                            >
                              <Eye className="w-4 h-4 text-gray-500" />
                            </Link>
                            <StatusUpdateDropdown 
                              orderId={order._id}
                              currentStatus={order.status}
                              onStatusChange={handleStatusChange}
                            />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-xs text-gray-500">
                  Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalOrders)} of {totalOrders}
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-1.5 rounded disabled:opacity-50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-1.5 rounded disabled:opacity-50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center sticky top-0 bg-white dark:bg-gray-900">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Export Orders
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Download orders as CSV file
                </p>
              </div>
              <button
                onClick={() => setShowExportModal(false)}
                className="p-1 hover:bg-gray-100 rounded"
                disabled={exportLoading}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Export Type Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Export Type
                </label>
                <div className="grid grid-cols-1 gap-2">
                  <button
                    onClick={() => setExportType('filtered')}
                    className={`p-3 rounded-lg border text-left transition ${
                      exportType === 'filtered' 
                        ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-900/20' 
                        : 'border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                  >
                    <div className="font-medium text-gray-900 dark:text-white">Current View</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Export orders currently displayed ({orders.length} orders)
                    </div>
                  </button>
                  <button
                    onClick={() => setExportType('all')}
                    className={`p-3 rounded-lg border text-left transition ${
                      exportType === 'all' 
                        ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-900/20' 
                        : 'border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                  >
                    <div className="font-medium text-gray-900 dark:text-white">All Orders</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Export all orders ({totalOrders} total)
                    </div>
                  </button>
                  <button
                    onClick={() => setExportType('dateRange')}
                    className={`p-3 rounded-lg border text-left transition ${
                      exportType === 'dateRange' 
                        ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-900/20' 
                        : 'border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                  >
                    <div className="font-medium text-gray-900 dark:text-white">Custom Date Range</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Select specific date range
                    </div>
                  </button>
                </div>
              </div>

              {/* Date Range for Custom Export */}
              {exportType === 'dateRange' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={exportStartDate}
                      onChange={(e) => setExportStartDate(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={exportEndDate}
                      onChange={(e) => setExportEndDate(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
              )}

              {/* Status Filter for Export */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Filter by Status (Optional)
                </label>
                <select
                  value={exportStatus}
                  onChange={(e) => setExportStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  <option value="">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="paid">Paid</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="refunded">Refunded</option>
                </select>
              </div>

              {/* Export Button */}
              <button
                onClick={handleExportOrders}
                disabled={exportLoading || (exportType === 'dateRange' && (!exportStartDate || !exportEndDate))}
                className="w-full px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {exportLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    Export CSV
                  </>
                )}
              </button>

              <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                CSV will include: Order #, Customer, Email, Phone, Items, Subtotal, Shipping, Tax, Discount, Total, Paid, Balance, Payment Method, Status, Created Date
              </p>
            </div>
          </div>
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
                  <div className="space-y-3 max-h-60 overflow-y-auto">
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

              {/* Record New Payment */}
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
                          className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800"
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