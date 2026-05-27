'use client';

import { useState, useEffect } from 'react';
import { 
  Plus, Search, Edit, Trash2, Eye, Mail, Phone, MapPin, 
  Building2, Package, DollarSign, Calendar, Truck, X, 
  Loader2, RefreshCw, Filter, ChevronDown, CheckCircle, 
  XCircle, Clock, TrendingUp, MoreVertical, AlertCircle
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { getSuppliers, createSupplier, updateSupplier, deleteSupplier, getSupplierStats } from '@/lib/api';

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

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [showModal, setShowModal] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [stats, setStats] = useState<any>(null);
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

  useEffect(() => {
    fetchSuppliers();
    fetchStats();
  }, [searchTerm, statusFilter]);

// Fix the fetchSuppliers function - ensure response matches Supplier type
const fetchSuppliers = async () => {
  try {
    setLoading(true);
    const response = await getSuppliers({ search: searchTerm || undefined, status: statusFilter || undefined });
    // Map the response to ensure all required fields exist
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
};

  const fetchStats = async () => {
    try {
      const response = await getSupplierStats();
      setStats(response.summary);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingSupplier) {
        await updateSupplier(editingSupplier._id, formData);
        toast.success('Supplier updated successfully');
      } else {
        await createSupplier(formData);
        toast.success('Supplier created successfully');
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
      toast.success('Supplier deleted successfully');
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


  const getStatusBadge = (status: string) => {
    if (status === 'active') {
      return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"><CheckCircle className="w-3 h-3" /> Active</span>;
    }
    return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"><XCircle className="w-3 h-3" /> Inactive</span>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Suppliers</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage your product suppliers and purchasing relationships
          </p>
        </div>
        <button
          onClick={() => { resetForm(); setShowModal(true); }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-medium transition-all"
        >
          <Plus className="w-4 h-4" />
          Add Supplier
        </button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Building2 className="w-5 h-5 text-blue-600" />
              </div>
              <span className="text-2xl font-bold">{stats.totalSuppliers || 0}</span>
            </div>
            <p className="text-sm text-gray-500 mt-2">Total Suppliers</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                <CheckCircle className="w-5 h-5 text-emerald-600" />
              </div>
              <span className="text-2xl font-bold">{stats.activeSuppliers || 0}</span>
            </div>
            <p className="text-sm text-gray-500 mt-2">Active Suppliers</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <DollarSign className="w-5 h-5 text-purple-600" />
              </div>
              <span className="text-2xl font-bold">KSh {stats.totalPurchaseVolume?.toLocaleString() || 0}</span>
            </div>
            <p className="text-sm text-gray-500 mt-2">Total Purchases</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                <Package className="w-5 h-5 text-amber-600" />
              </div>
              <span className="text-2xl font-bold">{suppliers.length}</span>
            </div>
            <p className="text-sm text-gray-500 mt-2">Products Supplied</p>
          </div>
        </div>
      )}

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search suppliers by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        <button onClick={fetchSuppliers} className="px-4 py-2 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Suppliers Table */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-cyan-600" />
        </div>
      ) : suppliers.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl">
          <Building2 className="w-12 h-12 mx-auto text-gray-400 mb-3" />
          <p className="text-gray-500">No suppliers found</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Supplier</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment Terms</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Lead Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Purchases</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {suppliers.map((supplier) => (
                  <tr key={supplier._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{supplier.name}</p>
                        {supplier.address?.city && (
                          <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                            <MapPin className="w-3 h-3" /> {supplier.address.city}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        {supplier.email && (
                          <p className="text-sm flex items-center gap-1"><Mail className="w-3 h-3" /> {supplier.email}</p>
                        )}
                        {supplier.phone && (
                          <p className="text-sm flex items-center gap-1"><Phone className="w-3 h-3" /> {supplier.phone}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">{supplier.paymentTerms || 'Net 30'}</td>
                    <td className="px-6 py-4 text-sm">{supplier.leadTime || 7} days</td>
                    <td className="px-6 py-4 text-sm font-semibold">KSh {supplier.totalPurchases?.toLocaleString() || 0}</td>
                    <td className="px-6 py-4">{getStatusBadge(supplier.status)}</td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button onClick={() => openEditModal(supplier)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(supplier._id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white dark:bg-gray-800">
              <h2 className="text-xl font-bold">{editingSupplier ? 'Edit Supplier' : 'Add Supplier'}</h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Company Name *</label>
                <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-2 border rounded-lg dark:bg-gray-900" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full px-4 py-2 border rounded-lg dark:bg-gray-900" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Phone</label>
                  <input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full px-4 py-2 border rounded-lg dark:bg-gray-900" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">City</label>
                  <input type="text" value={formData.address.city} onChange={(e) => setFormData({ ...formData, address: { ...formData.address, city: e.target.value } })} className="w-full px-4 py-2 border rounded-lg dark:bg-gray-900" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Payment Terms</label>
                  <select value={formData.paymentTerms} onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })} className="w-full px-4 py-2 border rounded-lg dark:bg-gray-900">
                    <option>Net 15</option>
                    <option>Net 30</option>
                    <option>Net 45</option>
                    <option>Net 60</option>
                    <option>COD</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Lead Time (days)</label>
                  <input type="number" value={formData.leadTime} onChange={(e) => setFormData({ ...formData, leadTime: Number(e.target.value) })} className="w-full px-4 py-2 border rounded-lg dark:bg-gray-900" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Status</label>
                  <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value as any })} className="w-full px-4 py-2 border rounded-lg dark:bg-gray-900">
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Notes</label>
                <textarea rows={3} value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} className="w-full px-4 py-2 border rounded-lg dark:bg-gray-900" />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="submit" className="flex-1 py-3 bg-cyan-600 text-white rounded-lg font-medium">
                  {editingSupplier ? 'Update Supplier' : 'Create Supplier'}
                </button>
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3 border rounded-lg">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}