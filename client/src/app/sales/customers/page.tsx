'use client';

import Link from 'next/link';
import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  UserPlus,
  Edit,
  FileText,
  Mail,
  Phone,
  MapPin,
  DollarSign,
  Search,
  Plus,
  X,
  CreditCard,
  ShoppingBag,
  Calendar,
  TrendingUp,
  Star,
  Clock,
  Package,
  Eye,
  Receipt,
  Users,
  Grid3x3,
  List,
  RefreshCw,
  CheckCircle,
  XCircle,
  Award,
  Crown,
  Medal,
  Trophy,
  Gem,
  Diamond,
  Sparkles,
  Zap,
  Flame,
  MoreVertical,
  Trash2,
  UserCheck,
  UserX,
  Building2,
  Activity,
  BarChart3,
  PieChart,
  Loader2,
  AlertCircle,
  Info,
  HelpCircle,
  Settings,
  Download,
  Upload,
  FileSpreadsheet,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Copy,
  Check,
  Printer,
  Share2,
  Globe
} from 'lucide-react';
// app/sales/customers/page.tsx - Update imports

import {
  getSalesCustomer,
  getSalesCustomerOrders,
  getSalesCustomerQuotations,
  getSalesCustomerInvoices,
  getActiveSalesCustomers,
  getTopSalesCustomers,
  getSalesCustomerStats,
  toggleSalesCustomerStatus,
  deleteSalesCustomer,
} from '@/lib/api';

import {
  listSalesCustomers,
  createSalesCustomer,
  updateSalesCustomer,
  type SalesCustomer,
} from '@/lib/sales';
import { useAuth } from '@/lib/auth';
import { toast } from 'react-hot-toast';

// ==================== TYPES ====================
interface CustomerStats {
  totalCustomers: number;
  activeCustomers: number;
  inactiveCustomers: number;
  totalRevenue: number;
  avgCustomerValue: number;
  newCustomersThisMonth: number;
}

interface CustomerTransaction {
  id: string;
  type: 'payment' | 'order' | 'quotation' | 'invoice';
  amount: number;
  status: 'completed' | 'pending' | 'failed' | 'paid' | 'unpaid';
  date: string;
  reference?: string;
}

// ==================== STATUS BADGE ====================
const StatusBadge = ({ status }: { status: string }) => {
  const configs: Record<string, { icon: any; label: string; className: string }> = {
    active: {
      icon: CheckCircle,
      label: 'Active',
      className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
    },
    inactive: {
      icon: XCircle,
      label: 'Inactive',
      className: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400 border-gray-200 dark:border-gray-700'
    }
  };

  const config = configs[status] || configs.inactive;
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${config.className}`}>
      <Icon className="w-3 h-3" />
      {config.label}
    </span>
  );
};

// ==================== LOYALTY BADGE ====================
const LoyaltyBadge = ({ totalSpent }: { totalSpent: number }) => {
  const levels = [
    { min: 100000, label: 'Platinum', icon: Crown, color: 'text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/30 border-purple-200 dark:border-purple-800' },
    { min: 50000, label: 'Gold', icon: Medal, color: 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/30 border-yellow-200 dark:border-yellow-800' },
    { min: 25000, label: 'Silver', icon: Award, color: 'text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700' },
    { min: 0, label: 'Bronze', icon: Star, color: 'text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30 border-amber-200 dark:border-amber-800' }
  ];

  const level = levels.find(l => totalSpent >= l.min) || levels[levels.length - 1];
  const Icon = level.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${level.color}`}>
      <Icon className="w-3 h-3" />
      {level.label}
    </span>
  );
};

// ==================== CUSTOMER CARD ====================
const CustomerCard = ({ 
  customer, 
  onEdit, 
  onDelete, 
  onView,
  onToggleStatus
}: { 
  customer: SalesCustomer; 
  onEdit: (c: SalesCustomer) => void; 
  onDelete: (id: string) => void; 
  onView: (c: SalesCustomer) => void;
  onToggleStatus: (id: string, status: 'active' | 'inactive') => void;
}) => {
  const totalOrders = customer.quotationsCount || 0;
  const lastOrderDate = customer.lastQuotationDate || customer.updatedAt;

  return (
    <div className="group bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-md flex-shrink-0">
              {customer.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white text-lg leading-tight">
                {customer.name}
              </h3>
              {customer.location && (
                <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3 h-3" />
                  {customer.location}
                </p>
              )}
            </div>
          </div>
          <div className="flex flex-col items-end gap-1.5">
            <StatusBadge status={customer.status} />
            <LoyaltyBadge totalSpent={customer.totalSpent || 0} />
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-5 space-y-3">
        {/* Contact Info */}
        <div className="space-y-1.5">
          {customer.email && (
            <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
              <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <span className="truncate">{customer.email}</span>
            </p>
          )}
          {customer.phone && (
            <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
              <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <span>{customer.phone}</span>
            </p>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-2 pt-3 border-t border-gray-100 dark:border-gray-800">
          <div className="text-center p-2 rounded-xl bg-gray-50 dark:bg-gray-800/50">
            <p className="text-xs text-gray-500 dark:text-gray-400">Total Spent</p>
            <p className="text-sm font-bold text-[#0043b3] dark:text-[#009dff]">
              KES {customer.totalSpent?.toLocaleString() || 0}
            </p>
          </div>
          <div className="text-center p-2 rounded-xl bg-gray-50 dark:bg-gray-800/50">
            <p className="text-xs text-gray-500 dark:text-gray-400">Orders</p>
            <p className="text-sm font-bold text-gray-900 dark:text-white">
              {totalOrders}
            </p>
          </div>
        </div>

        {/* Last Order */}
        {lastOrderDate && (
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              Last Order
            </span>
            <span>{new Date(lastOrderDate).toLocaleDateString()}</span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="px-5 py-3 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
        <button
          onClick={() => onView(customer)}
          className="text-sm text-[#0043b3] hover:text-[#000063] dark:text-[#009dff] dark:hover:text-[#0043b3] font-medium flex items-center gap-1 transition-colors"
        >
          <Eye className="w-4 h-4" />
          View Details
        </button>
        <div className="flex gap-1">
          <button
            onClick={() => onToggleStatus(customer._id, customer.status === 'active' ? 'inactive' : 'active')}
            className={`p-2 rounded-xl transition-colors ${
              customer.status === 'active' 
                ? 'text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20' 
                : 'text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20'
            }`}
            title={customer.status === 'active' ? 'Deactivate' : 'Activate'}
          >
            {customer.status === 'active' ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
          </button>
          <button
            onClick={() => onEdit(customer)}
            className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-colors"
            title="Edit"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(customer._id)}
            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

// ==================== CUSTOMER TABLE ROW ====================
const CustomerTableRow = ({ 
  customer, 
  onEdit, 
  onDelete, 
  onView,
  onToggleStatus
}: { 
  customer: SalesCustomer; 
  onEdit: (c: SalesCustomer) => void; 
  onDelete: (id: string) => void; 
  onView: (c: SalesCustomer) => void;
  onToggleStatus: (id: string, status: 'active' | 'inactive') => void;
}) => {
  const totalOrders = customer.quotationsCount || 0;
  const lastOrderDate = customer.lastQuotationDate || customer.updatedAt;

  return (
    <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            {customer.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-medium text-gray-900 dark:text-white">{customer.name}</p>
            {customer.location && (
              <p className="text-xs text-gray-500 flex items-center gap-1">
                <MapPin className="w-3 h-3" /> {customer.location}
              </p>
            )}
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="space-y-0.5">
          {customer.email && (
            <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
              <Mail className="w-3 h-3 flex-shrink-0" /> {customer.email}
            </p>
          )}
          {customer.phone && (
            <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
              <Phone className="w-3 h-3 flex-shrink-0" /> {customer.phone}
            </p>
          )}
        </div>
      </td>
      <td className="px-4 py-3">
        <span className="font-semibold text-[#0043b3] dark:text-[#009dff]">
          KES {customer.totalSpent?.toLocaleString() || 0}
        </span>
      </td>
      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{totalOrders}</td>
      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
        {lastOrderDate ? new Date(lastOrderDate).toLocaleDateString() : 'N/A'}
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <StatusBadge status={customer.status} />
          <LoyaltyBadge totalSpent={customer.totalSpent || 0} />
        </div>
      </td>
      <td className="px-4 py-3 text-right">
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={() => onView(customer)}
            className="p-1.5 text-gray-500 hover:text-[#0043b3] dark:hover:text-[#009dff] rounded-lg transition-colors"
            title="View"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => onToggleStatus(customer._id, customer.status === 'active' ? 'inactive' : 'active')}
            className={`p-1.5 rounded-lg transition-colors ${
              customer.status === 'active' 
                ? 'text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20' 
                : 'text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20'
            }`}
            title={customer.status === 'active' ? 'Deactivate' : 'Activate'}
          >
            {customer.status === 'active' ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
          </button>
          <button
            onClick={() => onEdit(customer)}
            className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
            title="Edit"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(customer._id)}
            className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
};

// ==================== MAIN PAGE ====================
export default function SalesCustomers() {
  const { user } = useAuth();
  const [customers, setCustomers] = useState<SalesCustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showModal, setShowModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<SalesCustomer | null>(null);
  const [stats, setStats] = useState<CustomerStats | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<SalesCustomer | null>(null);
  const [customerTransactions, setCustomerTransactions] = useState<CustomerTransaction[]>([]);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    notes: '',
    status: 'active' as 'active' | 'inactive'
  });

  // ==================== FETCH DATA ====================
  const fetchCustomers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await listSalesCustomers({ 
        search: searchTerm || undefined,
        status: statusFilter || undefined
      });
      setCustomers(response.customers || []);
    } catch (error) {
      console.error('Failed to fetch customers:', error);
      toast.error('Failed to load customers');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, statusFilter]);

  const fetchStats = useCallback(async () => {
    try {
      const response = await getSalesCustomerStats();
      setStats(response.stats);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  }, []);

  useEffect(() => {
    const debounce = setTimeout(() => {
      fetchCustomers();
    }, 300);
    return () => clearTimeout(debounce);
  }, [fetchCustomers]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // ==================== HANDLERS ====================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const toastId = toast.loading(editingCustomer ? 'Updating customer...' : 'Creating customer...');
    try {
      if (editingCustomer) {
        await updateSalesCustomer(editingCustomer._id, formData);
        toast.success('Customer updated successfully', { id: toastId, duration: 4500 });
      } else {
        await createSalesCustomer(formData);
        toast.success('Customer created successfully', { id: toastId, duration: 4500 });
      }
      setShowModal(false);
      resetForm();
      fetchCustomers();
      fetchStats();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Operation failed', { id: toastId, duration: 5000 });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this customer?')) return;
    const toastId = toast.loading('Deleting customer...');
    try {
      await deleteSalesCustomer(id);
      toast.success('Customer deleted successfully', { id: toastId, duration: 4500 });
      fetchCustomers();
      fetchStats();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Delete failed', { id: toastId, duration: 5000 });
    }
  };

  const handleToggleStatus = async (id: string, status: 'active' | 'inactive') => {
    const toastId = toast.loading('Updating status...');
    try {
      await toggleSalesCustomerStatus(id, status);
      toast.success('Customer status updated successfully', { id: toastId, duration: 4500 });
      fetchCustomers();
      fetchStats();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to update status', { id: toastId, duration: 5000 });
    }
  };

  const resetForm = () => {
    setEditingCustomer(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      location: '',
      notes: '',
      status: 'active'
    });
  };

  const openEditModal = (customer: SalesCustomer) => {
    setEditingCustomer(customer);
    setFormData({
      name: customer.name,
      email: customer.email || '',
      phone: customer.phone || '',
      location: customer.location || '',
      notes: customer.notes || '',
      status: customer.status
    });
    setShowModal(true);
  };

  const openDetailsModal = async (customer: SalesCustomer) => {
    setSelectedCustomer(customer);
    setShowDetailsModal(true);
    
    try {
      // Fetch real transactions
      const [orders, quotations, invoices] = await Promise.all([
        getSalesCustomerOrders(customer._id, { limit: 5 }),
        getSalesCustomerQuotations(customer._id, { limit: 5 }),
        getSalesCustomerInvoices(customer._id, { limit: 5 })
      ]);

      const transactions: CustomerTransaction[] = [
        ...(orders?.orders || []).map((o: any) => ({
          id: o._id,
          type: 'order' as const,
          amount: o.total || 0,
          status: o.paymentStatus === 'completed' ? 'completed' : 'pending',
          date: o.createdAt,
          reference: o.orderNumber
        })),
        ...(quotations?.quotations || []).map((q: any) => ({
          id: q._id,
          type: 'quotation' as const,
          amount: q.total || 0,
          status: q.status === 'accepted' ? 'completed' : 'pending',
          date: q.createdAt,
          reference: q.quoteNumber
        })),
        ...(invoices?.invoices || []).map((i: any) => ({
          id: i._id,
          type: 'invoice' as const,
          amount: i.total || 0,
          status: i.paymentStatus === 'paid' ? 'completed' : 'pending',
          date: i.createdAt,
          reference: i.invoiceNumber
        }))
      ];

      setCustomerTransactions(transactions.sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      ));
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
      setCustomerTransactions([]);
    }
  };

  // ==================== COMPUTED ====================
  const filteredCustomers = useMemo(() => {
    return customers.filter(c => {
      const matchesSearch = 
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.email?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
        (c.phone?.includes(searchTerm) || false);
      const matchesStatus = !statusFilter || c.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [customers, searchTerm, statusFilter]);

  // ==================== LOADING ====================
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-10 h-10 animate-spin text-[#0043b3]" />
          <p className="text-sm text-gray-500 dark:text-gray-400">Loading customers...</p>
        </div>
      </div>
    );
  }

  // ==================== RENDER ====================
  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6">
      {/* ==================== HEADER ==================== */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#000063] dark:text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-[#0043b3]" />
            Customers
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage your customer relationships and track their activity
          </p>
        </div>
        <button
          onClick={() => { resetForm(); setShowModal(true); }}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white rounded-xl font-medium transition-all shadow-sm hover:shadow-md"
        >
          <UserPlus className="w-4 h-4" />
          Add Customer
        </button>
      </div>

      {/* ==================== STATS CARDS ==================== */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <span className="text-2xl font-bold text-[#000063] dark:text-white">{stats.totalCustomers || 0}</span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Total Customers</p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                <UserCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <span className="text-2xl font-bold text-[#000063] dark:text-white">{stats.activeCustomers || 0}</span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Active Customers</p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <DollarSign className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <span className="text-2xl font-bold text-[#000063] dark:text-white">
                KES {stats.totalRevenue?.toLocaleString() || 0}
              </span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Total Revenue</p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                <TrendingUp className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <span className="text-2xl font-bold text-[#000063] dark:text-white">{stats.newCustomersThisMonth || 0}</span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">New This Month</p>
          </div>
        </div>
      )}

      {/* ==================== SEARCH & FILTERS ==================== */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search customers by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-[#0043b3] focus:border-transparent transition-all"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#0043b3] focus:border-transparent transition-all min-w-[120px]"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <div className="flex bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-all ${
                viewMode === 'grid' 
                  ? 'bg-[#0043b3] text-white shadow-sm' 
                  : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
              title="Grid View"
            >
              <Grid3x3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-all ${
                viewMode === 'list' 
                  ? 'bg-[#0043b3] text-white shadow-sm' 
                  : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
          <button 
            onClick={fetchCustomers} 
            className="p-2.5 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          </button>
        </div>
      </div>

      {/* ==================== RESULTS COUNT ==================== */}
      <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
        <span>{filteredCustomers.length} customer{filteredCustomers.length !== 1 ? 's' : ''} found</span>
        {searchTerm && (
          <button 
            onClick={() => setSearchTerm('')} 
            className="text-[#0043b3] hover:text-[#000063] dark:text-[#009dff] flex items-center gap-1"
          >
            <X className="w-3 h-3" /> Clear search
          </button>
        )}
      </div>

      {/* ==================== CUSTOMERS GRID ==================== */}
      {filteredCustomers.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800">
          <Users className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
          <p className="text-gray-500 dark:text-gray-400 font-medium">No customers found</p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Try adjusting your search or filters</p>
          <button
            onClick={() => { resetForm(); setShowModal(true); }}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 text-[#0043b3] hover:text-[#000063] dark:text-[#009dff] font-medium"
          >
            <Plus className="w-4 h-4" /> Add your first customer
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredCustomers.map((customer) => (
            <CustomerCard
              key={customer._id}
              customer={customer}
              onEdit={openEditModal}
              onDelete={handleDelete}
              onView={openDetailsModal}
              onToggleStatus={handleToggleStatus}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Customer</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Contact</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total Spent</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Orders</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Last Order</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {filteredCustomers.map((customer) => (
                  <CustomerTableRow
                    key={customer._id}
                    customer={customer}
                    onEdit={openEditModal}
                    onDelete={handleDelete}
                    onView={openDetailsModal}
                    onToggleStatus={handleToggleStatus}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ==================== ADD/EDIT MODAL ==================== */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center sticky top-0 bg-white dark:bg-gray-900 z-10">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {editingCustomer ? 'Edit Customer' : 'Add Customer'}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {editingCustomer ? 'Update customer information' : 'Create a new customer'}
                </p>
              </div>
              <button 
                onClick={() => setShowModal(false)} 
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
              >
                <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Full Name *</label>
                <input 
                  type="text" 
                  required 
                  value={formData.name} 
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
                  className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#0043b3] focus:border-transparent transition-all"
                  placeholder="Enter customer name"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email</label>
                  <input 
                    type="email" 
                    value={formData.email} 
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })} 
                    className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#0043b3] focus:border-transparent transition-all"
                    placeholder="customer@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Phone</label>
                  <input 
                    type="tel" 
                    value={formData.phone} 
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })} 
                    className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#0043b3] focus:border-transparent transition-all"
                    placeholder="+254 700 000 000"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Location</label>
                  <input 
                    type="text" 
                    value={formData.location} 
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })} 
                    className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#0043b3] focus:border-transparent transition-all"
                    placeholder="City, Country"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Status</label>
                  <select 
                    value={formData.status} 
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })} 
                    className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#0043b3] focus:border-transparent transition-all"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Notes</label>
                <textarea 
                  rows={3} 
                  value={formData.notes} 
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })} 
                  className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#0043b3] focus:border-transparent transition-all"
                  placeholder="Additional notes about this customer..."
                />
              </div>
              <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
                <button 
                  type="submit" 
                  className="flex-1 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white rounded-xl font-medium transition-all shadow-sm hover:shadow-md"
                >
                  {editingCustomer ? 'Update Customer' : 'Create Customer'}
                </button>
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)} 
                  className="flex-1 py-3 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl font-medium transition-colors text-gray-700 dark:text-gray-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== DETAILS MODAL ==================== */}
      {showDetailsModal && selectedCustomer && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center sticky top-0 bg-white dark:bg-gray-900 z-10">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Customer Details</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Complete customer information and transaction history</p>
              </div>
              <button 
                onClick={() => setShowDetailsModal(false)} 
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
              >
                <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Customer Info Card */}
              <div className="rounded-2xl p-5 border-2 border-[#0043b3] bg-gradient-to-br from-[#0043b3]/5 to-transparent dark:from-[#0043b3]/10">
                <div className="flex items-start gap-6">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-3xl shadow-lg flex-shrink-0">
                    {selectedCustomer.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{selectedCustomer.name}</h3>
                        <div className="flex flex-wrap items-center gap-2 mt-1">
                          <StatusBadge status={selectedCustomer.status} />
                          <LoyaltyBadge totalSpent={selectedCustomer.totalSpent || 0} />
                          <span className="text-xs text-gray-400">•</span>
                          <span className="text-xs text-gray-500">ID: {selectedCustomer._id.slice(-8).toUpperCase()}</span>
                        </div>
                      </div>
                      <Link
                        href={`/sales/quotations/new?customerId=${selectedCustomer._id}`}
                        className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white rounded-xl font-medium transition-all shadow-sm hover:shadow-md flex items-center gap-2 text-sm"
                      >
                        <FileText className="w-4 h-4" /> New Quotation
                      </Link>
                    </div>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Email</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-1 truncate">
                          <Mail className="w-3 h-3 flex-shrink-0 text-gray-400" />
                          {selectedCustomer.email || 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Phone</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-1">
                          <Phone className="w-3 h-3 flex-shrink-0 text-gray-400" />
                          {selectedCustomer.phone || 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Location</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-1 truncate">
                          <MapPin className="w-3 h-3 flex-shrink-0 text-gray-400" />
                          {selectedCustomer.location || 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Customer Since</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-1">
                          <Calendar className="w-3 h-3 flex-shrink-0 text-gray-400" />
                          {new Date(selectedCustomer.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Spending Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 text-center border border-green-200 dark:border-green-800">
                  <DollarSign className="w-8 h-8 text-green-600 dark:text-green-400 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    KES {selectedCustomer.totalSpent?.toLocaleString() || 0}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Total Spent</p>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 text-center border border-blue-200 dark:border-blue-800">
                  <ShoppingBag className="w-8 h-8 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {selectedCustomer.quotationsCount || 0}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Total Orders</p>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4 text-center border border-purple-200 dark:border-purple-800">
                  <TrendingUp className="w-8 h-8 text-purple-600 dark:text-purple-400 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    KES {Math.round((selectedCustomer.totalSpent || 0) / Math.max((selectedCustomer.quotationsCount || 1), 1)).toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Average Order Value</p>
                </div>
              </div>

              {/* Transaction History */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Receipt className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Transaction History</h3>
                  </div>
                  <span className="text-xs text-gray-500">{customerTransactions.length} transactions</span>
                </div>

                {customerTransactions.length > 0 ? (
                  <div className="space-y-2 max-h-80 overflow-y-auto pr-2">
                    {customerTransactions.map((transaction, idx) => (
                      <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl hover:shadow-md transition-all">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                            transaction.type === 'payment' ? 'bg-green-100 dark:bg-green-900/30' :
                            transaction.type === 'order' ? 'bg-blue-100 dark:bg-blue-900/30' :
                            transaction.type === 'quotation' ? 'bg-purple-100 dark:bg-purple-900/30' :
                            'bg-amber-100 dark:bg-amber-900/30'
                          }`}>
                            {transaction.type === 'payment' && <CreditCard className="w-5 h-5 text-green-600 dark:text-green-400" />}
                            {transaction.type === 'order' && <Package className="w-5 h-5 text-blue-600 dark:text-blue-400" />}
                            {transaction.type === 'quotation' && <FileText className="w-5 h-5 text-purple-600 dark:text-purple-400" />}
                            {transaction.type === 'invoice' && <Receipt className="w-5 h-5 text-amber-600 dark:text-amber-400" />}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-gray-900 dark:text-white capitalize">
                              {transaction.type}
                            </p>
                            <p className="text-xs text-gray-500 flex items-center gap-2 flex-wrap">
                              <Clock className="w-3 h-3 flex-shrink-0" />
                              {new Date(transaction.date).toLocaleString()}
                              {transaction.reference && <span className="truncate">• Ref: {transaction.reference}</span>}
                            </p>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0 ml-4">
                          <p className="font-bold text-gray-900 dark:text-white">
                            KES {transaction.amount.toLocaleString()}
                          </p>
                          <p className={`text-xs ${
                            transaction.status === 'completed' || transaction.status === 'paid' ? 'text-green-600' :
                            transaction.status === 'pending' ? 'text-yellow-600' : 'text-red-600'
                          }`}>
                            {transaction.status}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 bg-gray-50 dark:bg-gray-800 rounded-xl">
                    <Receipt className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500">No transactions found</p>
                  </div>
                )}
              </div>

              {/* Notes Section */}
              {selectedCustomer.notes && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-4 border border-yellow-200 dark:border-yellow-800">
                  <p className="text-sm font-medium text-yellow-800 dark:text-yellow-400 mb-1">Notes</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{selectedCustomer.notes}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
                <button
                  onClick={() => {
                    setShowDetailsModal(false);
                    openEditModal(selectedCustomer);
                  }}
                  className="flex-1 min-w-[120px] py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white rounded-xl font-medium transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2"
                >
                  <Edit className="w-4 h-4" /> Edit Customer
                </button>
                <button
                  onClick={() => {
                    setShowDetailsModal(false);
                    handleToggleStatus(selectedCustomer._id, selectedCustomer.status === 'active' ? 'inactive' : 'active');
                  }}
                  className={`flex-1 min-w-[120px] py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 border ${
                    selectedCustomer.status === 'active'
                      ? 'border-amber-200 dark:border-amber-800 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20'
                      : 'border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20'
                  }`}
                >
                  {selectedCustomer.status === 'active' ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                  {selectedCustomer.status === 'active' ? 'Deactivate' : 'Activate'}
                </button>
                <button
                  onClick={() => {
                    setShowDetailsModal(false);
                    handleDelete(selectedCustomer._id);
                  }}
                  className="flex-1 min-w-[120px] py-3 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4" /> Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}