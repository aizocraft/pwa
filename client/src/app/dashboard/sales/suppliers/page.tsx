'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Plus, Search, Edit, Trash2, Eye, Mail, Phone, MapPin, 
  Building2, Package, DollarSign, Calendar, Truck, X, 
  Loader2, RefreshCw, Filter, ChevronDown, CheckCircle, 
  XCircle, Clock, TrendingUp, MoreVertical, AlertCircle,
  Grid3x3, List, LayoutGrid, Download, Upload, FileSpreadsheet,
  ChevronLeft, ChevronRight, Info, HelpCircle, Settings,
  Star, StarHalf, StarOff, Award, Crown, Medal, Trophy,
  ExternalLink, Copy, Check, Printer, Share2, Globe,
  Briefcase, Users, UserPlus, UserCheck, UserX, Shield,
  Zap, Flame, Sparkles, Gem, Diamond, Layers, Network
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { getSuppliers, createSupplier, updateSupplier, deleteSupplier, getSupplierStats } from '@/lib/api';

// ==================== TYPES ====================
interface Supplier {
  _id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: {
    street?: string;
    city?: string;
    country?: string;
    zipCode?: string;
  };
  paymentTerms?: string;
  leadTime?: number;
  notes?: string;
  status: 'active' | 'inactive';
  totalPurchases: number;
  lastPurchaseDate?: string;
  productsSupplied?: string[];
  createdAt: string;
  updatedAt: string;
}

interface SupplierStats {
  totalSuppliers: number;
  activeSuppliers: number;
  inactiveSuppliers: number;
  suspendedSuppliers: number;
  totalPurchaseVolume: number;
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

// ==================== SUPPLIER CARD ====================
const SupplierCard = ({ 
  supplier, 
  onEdit, 
  onDelete, 
  onView 
}: { 
  supplier: Supplier; 
  onEdit: (s: Supplier) => void; 
  onDelete: (id: string) => void; 
  onView: (s: Supplier) => void;
}) => {
  const [showActions, setShowActions] = useState(false);

  return (
    <div className="group bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
              {supplier.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white text-lg leading-tight">
                {supplier.name}
              </h3>
              {supplier.address?.city && (
                <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3 h-3" />
                  {supplier.address.city}, {supplier.address.country || 'KE'}
                </p>
              )}
            </div>
          </div>
          <StatusBadge status={supplier.status} />
        </div>
      </div>

      {/* Body */}
      <div className="p-5 space-y-3">
        {/* Contact Info */}
        <div className="space-y-1.5">
          {supplier.email && (
            <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
              <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <span className="truncate">{supplier.email}</span>
            </p>
          )}
          {supplier.phone && (
            <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
              <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <span>{supplier.phone}</span>
            </p>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-2 pt-3 border-t border-gray-100 dark:border-gray-800">
          <div className="text-center p-2 rounded-xl bg-gray-50 dark:bg-gray-800/50">
            <p className="text-xs text-gray-500 dark:text-gray-400">Purchases</p>
            <p className="text-sm font-bold text-[#0043b3] dark:text-[#009dff]">
              KSh {supplier.totalPurchases?.toLocaleString() || 0}
            </p>
          </div>
          <div className="text-center p-2 rounded-xl bg-gray-50 dark:bg-gray-800/50">
            <p className="text-xs text-gray-500 dark:text-gray-400">Lead Time</p>
            <p className="text-sm font-bold text-gray-900 dark:text-white">
              {supplier.leadTime || 7} days
            </p>
          </div>
        </div>

        {/* Payment Terms & Last Purchase */}
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {supplier.paymentTerms || 'Net 30'}
          </span>
          {supplier.lastPurchaseDate && (
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {new Date(supplier.lastPurchaseDate).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="px-5 py-3 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
        <button
          onClick={() => onView(supplier)}
          className="text-sm text-[#0043b3] hover:text-[#000063] dark:text-[#009dff] dark:hover:text-[#0043b3] font-medium flex items-center gap-1 transition-colors"
        >
          <Eye className="w-4 h-4" />
          View Details
        </button>
        <div className="flex gap-1">
          <button
            onClick={() => onEdit(supplier)}
            className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-colors"
            title="Edit"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(supplier._id)}
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

// ==================== SUPPLIER TABLE ROW ====================
const SupplierTableRow = ({ 
  supplier, 
  onEdit, 
  onDelete, 
  onView 
}: { 
  supplier: Supplier; 
  onEdit: (s: Supplier) => void; 
  onDelete: (id: string) => void; 
  onView: (s: Supplier) => void;
}) => {
  return (
    <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            {supplier.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-medium text-gray-900 dark:text-white">{supplier.name}</p>
            {supplier.address?.city && (
              <p className="text-xs text-gray-500 flex items-center gap-1">
                <MapPin className="w-3 h-3" /> {supplier.address.city}
              </p>
            )}
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="space-y-0.5">
          {supplier.email && (
            <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
              <Mail className="w-3 h-3 flex-shrink-0" /> {supplier.email}
            </p>
          )}
          {supplier.phone && (
            <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
              <Phone className="w-3 h-3 flex-shrink-0" /> {supplier.phone}
            </p>
          )}
        </div>
      </td>
      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{supplier.paymentTerms || 'Net 30'}</td>
      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{supplier.leadTime || 7} days</td>
      <td className="px-4 py-3 text-sm font-semibold text-[#0043b3] dark:text-[#009dff]">
        KSh {supplier.totalPurchases?.toLocaleString() || 0}
      </td>
      <td className="px-4 py-3">
        <StatusBadge status={supplier.status} />
      </td>
      <td className="px-4 py-3 text-right">
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={() => onView(supplier)}
            className="p-1.5 text-gray-500 hover:text-[#0043b3] dark:hover:text-[#009dff] rounded-lg transition-colors"
            title="View"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => onEdit(supplier)}
            className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
            title="Edit"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(supplier._id)}
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
export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showModal, setShowModal] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [stats, setStats] = useState<SupplierStats | null>(null);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: { street: '', city: '', country: 'KE', zipCode: '' },
    paymentTerms: 'Net 30',
    leadTime: 7,
    notes: '',
    status: 'active' as 'active' | 'inactive'
  });

  // ==================== FETCH DATA ====================
  const fetchSuppliers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getSuppliers({ 
        search: searchTerm || undefined, 
        status: statusFilter || undefined 
      });
      
      const mappedSuppliers: Supplier[] = (response.suppliers || []).map((s: any) => ({
        _id: s._id,
        name: s.name,
        email: s.email,
        phone: s.phone,
        address: s.address || { street: '', city: '', country: 'KE', zipCode: '' },
        paymentTerms: s.paymentTerms || 'Net 30',
        leadTime: s.leadTime || 7,
        notes: s.notes || '',
        status: s.status || 'active',
        totalPurchases: s.totalPurchases || 0,
        lastPurchaseDate: s.lastPurchaseDate,
        productsSupplied: s.productsSupplied || [],
        createdAt: s.createdAt || new Date().toISOString(),
        updatedAt: s.updatedAt || new Date().toISOString()
      }));
      
      setSuppliers(mappedSuppliers);
    } catch (error) {
      toast.error('Failed to fetch suppliers');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, statusFilter]);

const fetchStats = useCallback(async () => {
  try {
    const response = await getSupplierStats();
    setStats(response.summary);
  } catch (error) {
    console.error('Failed to fetch stats:', error);
  }
}, []);

  useEffect(() => {
    const debounce = setTimeout(() => {
      fetchSuppliers();
    }, 300);
    return () => clearTimeout(debounce);
  }, [fetchSuppliers]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // ==================== HANDLERS ====================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingSupplier) {
        await updateSupplier(editingSupplier._id, formData);
        
      } else {
        await createSupplier(formData);
      }
      setShowModal(false);
      resetForm();
      fetchSuppliers();
      fetchStats();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Operation failed');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this supplier?')) return;
    try {
      await deleteSupplier(id);
      fetchSuppliers();
      fetchStats();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Delete failed');
    }
  };

  const resetForm = () => {
    setEditingSupplier(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      address: { street: '', city: '', country: 'KE', zipCode: '' },
      paymentTerms: 'Net 30',
      leadTime: 7,
      notes: '',
      status: 'active'
    });
  };

  const openEditModal = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setFormData({
      name: supplier.name,
      email: supplier.email || '',
      phone: supplier.phone || '',
      address: {
        street: supplier.address?.street || '',
        city: supplier.address?.city || '',
        country: supplier.address?.country || 'KE',
        zipCode: supplier.address?.zipCode || ''
      },
      paymentTerms: supplier.paymentTerms || 'Net 30',
      leadTime: supplier.leadTime || 7,
      notes: supplier.notes || '',
      status: supplier.status
    });
    setShowModal(true);
  };

  const openDetailsModal = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setShowDetailsModal(true);
  };

  // ==================== COMPUTED ====================
  const filteredSuppliers = useMemo(() => {
    return suppliers.filter(s => {
      const matchesSearch = 
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s.email?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
        (s.phone?.includes(searchTerm) || false);
      const matchesStatus = !statusFilter || s.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [suppliers, searchTerm, statusFilter]);

  // ==================== LOADING ====================
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-10 h-10 animate-spin text-[#0043b3]" />
          <p className="text-sm text-gray-500 dark:text-gray-400">Loading suppliers...</p>
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
            <Building2 className="w-6 h-6 text-[#0043b3]" />
            Suppliers
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage your product suppliers and purchasing relationships
          </p>
        </div>
        <button
          onClick={() => { resetForm(); setShowModal(true); }}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white rounded-xl font-medium transition-all shadow-sm hover:shadow-md"
        >
          <Plus className="w-4 h-4" />
          Add Supplier
        </button>
      </div>

      {/* ==================== STATS CARDS ==================== */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <span className="text-2xl font-bold text-[#000063] dark:text-white">{stats.totalSuppliers || 0}</span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Total Suppliers</p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <span className="text-2xl font-bold text-[#000063] dark:text-white">{stats.activeSuppliers || 0}</span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Active Suppliers</p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <DollarSign className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <span className="text-2xl font-bold text-[#000063] dark:text-white">
                KSh {stats.totalPurchaseVolume?.toLocaleString() || 0}
              </span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Total Purchases</p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                <Package className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <span className="text-2xl font-bold text-[#000063] dark:text-white">{filteredSuppliers.length}</span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Products Supplied</p>
          </div>
        </div>
      )}

      {/* ==================== SEARCH & FILTERS ==================== */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search suppliers by name, email, or phone..."
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
            onClick={fetchSuppliers} 
            className="p-2.5 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          </button>
        </div>
      </div>

      {/* ==================== RESULTS COUNT ==================== */}
      <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
        <span>{filteredSuppliers.length} supplier{filteredSuppliers.length !== 1 ? 's' : ''} found</span>
        {searchTerm && (
          <button 
            onClick={() => setSearchTerm('')} 
            className="text-[#0043b3] hover:text-[#000063] dark:text-[#009dff] flex items-center gap-1"
          >
            <X className="w-3 h-3" /> Clear search
          </button>
        )}
      </div>

      {/* ==================== SUPPLIERS GRID ==================== */}
      {filteredSuppliers.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800">
          <Building2 className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
          <p className="text-gray-500 dark:text-gray-400 font-medium">No suppliers found</p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Try adjusting your search or filters</p>
          <button
            onClick={() => { resetForm(); setShowModal(true); }}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 text-[#0043b3] hover:text-[#000063] dark:text-[#009dff] font-medium"
          >
            <Plus className="w-4 h-4" /> Add your first supplier
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredSuppliers.map((supplier) => (
            <SupplierCard
              key={supplier._id}
              supplier={supplier}
              onEdit={openEditModal}
              onDelete={handleDelete}
              onView={openDetailsModal}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Supplier</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Contact</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Payment Terms</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Lead Time</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total Purchases</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {filteredSuppliers.map((supplier) => (
                  <SupplierTableRow
                    key={supplier._id}
                    supplier={supplier}
                    onEdit={openEditModal}
                    onDelete={handleDelete}
                    onView={openDetailsModal}
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
                  {editingSupplier ? 'Edit Supplier' : 'Add Supplier'}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {editingSupplier ? 'Update supplier information' : 'Create a new supplier'}
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
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Company Name *</label>
                <input 
                  type="text" 
                  required 
                  value={formData.name} 
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
                  className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#0043b3] focus:border-transparent transition-all"
                  placeholder="Enter company name"
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
                    placeholder="supplier@example.com"
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
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">City</label>
                  <input 
                    type="text" 
                    value={formData.address.city} 
                    onChange={(e) => setFormData({ ...formData, address: { ...formData.address, city: e.target.value } })} 
                    className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#0043b3] focus:border-transparent transition-all"
                    placeholder="Nairobi"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Payment Terms</label>
                  <select 
                    value={formData.paymentTerms} 
                    onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })} 
                    className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#0043b3] focus:border-transparent transition-all"
                  >
                    <option>Net 15</option>
                    <option>Net 30</option>
                    <option>Net 45</option>
                    <option>Net 60</option>
                    <option>COD</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Lead Time (days)</label>
                  <input 
                    type="number" 
                    value={formData.leadTime} 
                    onChange={(e) => setFormData({ ...formData, leadTime: Number(e.target.value) })} 
                    className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#0043b3] focus:border-transparent transition-all"
                    min="1"
                    max="90"
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
                  placeholder="Additional notes about this supplier..."
                />
              </div>
              <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
                <button 
                  type="submit" 
                  className="flex-1 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white rounded-xl font-medium transition-all shadow-sm hover:shadow-md"
                >
                  {editingSupplier ? 'Update Supplier' : 'Create Supplier'}
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
      {showDetailsModal && selectedSupplier && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center sticky top-0 bg-white dark:bg-gray-900 z-10">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Supplier Details</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Complete supplier information</p>
              </div>
              <button 
                onClick={() => setShowDetailsModal(false)} 
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
              >
                <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              {/* Header */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                  {selectedSupplier.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{selectedSupplier.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <StatusBadge status={selectedSupplier.status} />
                    <span className="text-xs text-gray-400">•</span>
                    <span className="text-xs text-gray-500">ID: {selectedSupplier._id.slice(-8).toUpperCase()}</span>
                  </div>
                </div>
              </div>

              {/* Contact Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Email</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    {selectedSupplier.email || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Phone</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-400" />
                    {selectedSupplier.phone || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Location</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    {selectedSupplier.address?.city || 'N/A'}
                    {selectedSupplier.address?.country && `, ${selectedSupplier.address.country}`}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Member Since</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    {new Date(selectedSupplier.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                  <p className="text-2xl font-bold text-[#0043b3] dark:text-[#009dff]">
                    KSh {selectedSupplier.totalPurchases?.toLocaleString() || 0}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Total Purchases</p>
                </div>
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{selectedSupplier.leadTime || 7}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Lead Time (days)</p>
                </div>
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{selectedSupplier.productsSupplied?.length || 0}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Products Supplied</p>
                </div>
              </div>

              {/* Payment Terms & Notes */}
              <div className="space-y-2 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Payment Terms</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{selectedSupplier.paymentTerms || 'Net 30'}</span>
                </div>
                {selectedSupplier.notes && (
                  <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Notes</p>
                    <p className="text-sm text-gray-900 dark:text-white mt-1">{selectedSupplier.notes}</p>
                  </div>
                )}
                {selectedSupplier.lastPurchaseDate && (
                  <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Last Purchase</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {new Date(selectedSupplier.lastPurchaseDate).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
                <button
                  onClick={() => {
                    setShowDetailsModal(false);
                    openEditModal(selectedSupplier);
                  }}
                  className="flex-1 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white rounded-xl font-medium transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2"
                >
                  <Edit className="w-4 h-4" /> Edit Supplier
                </button>
                <button
                  onClick={() => {
                    setShowDetailsModal(false);
                    handleDelete(selectedSupplier._id);
                  }}
                  className="flex-1 py-3 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
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