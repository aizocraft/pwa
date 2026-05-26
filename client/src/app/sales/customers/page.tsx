// app/sales/customers/page.tsx
'use client';

import { useState, useEffect } from 'react';
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
  ChevronRight,
  Receipt,
  Users
} from 'lucide-react';
import {
  listSalesCustomers,
  createSalesCustomer,
  updateSalesCustomer,
  type SalesCustomer
} from '@/lib/sales';
import { useAuth } from '@/lib/auth';
import { toast } from 'react-hot-toast';

// Local types for transactions
interface CustomerTransaction {
  id: string;
  type: 'payment' | 'order';
  amount: number;
  status: 'completed' | 'pending' | 'failed';
  date: string;
  reference?: string;
}

export default function SalesCustomers() {
  const { user } = useAuth();
  const [customers, setCustomers] = useState<SalesCustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<SalesCustomer | null>(null);
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

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const { customers: data } = await listSalesCustomers({ search: searchTerm || undefined });
      setCustomers(data);
    } catch (error) {
      console.error('Failed to fetch customers:', error);
      toast.error('Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const debounce = setTimeout(() => {
      if (searchTerm !== undefined) fetchCustomers();
    }, 500);
    return () => clearTimeout(debounce);
  }, [searchTerm]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCustomer) {
        await updateSalesCustomer(editingCustomer._id, formData);
        toast.success('Customer updated successfully');
      } else {
        await createSalesCustomer(formData);
        toast.success('Customer created successfully');
      }
      setShowModal(false);
      resetForm();
      fetchCustomers();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Operation failed');
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
    // Mock transactions - replace with actual API call when available
    const mockTransactions: CustomerTransaction[] = [
      {
        id: '1',
        type: 'order',
        amount: 15000,
        status: 'completed',
        date: new Date().toISOString(),
        reference: 'ORD-001'
      },
      {
        id: '2',
        type: 'payment',
        amount: 15000,
        status: 'completed',
        date: new Date(Date.now() - 86400000).toISOString(),
        reference: 'PAY-001'
      }
    ];
    setCustomerTransactions(mockTransactions);
  };

  const getStatusColor = (status: string) => {
    return status === 'active'
      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
      : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400';
  };

  const getCustomerLoyaltyLevel = (totalSpent: number) => {
    if (totalSpent >= 100000) return { level: 'Platinum', color: 'text-purple-600', icon: Star };
    if (totalSpent >= 50000) return { level: 'Gold', color: 'text-yellow-600', icon: Star };
    if (totalSpent >= 25000) return { level: 'Silver', color: 'text-gray-500', icon: Star };
    return { level: 'Bronze', color: 'text-amber-600', icon: Star };
  };

  // Helper to get total orders (using quotations count as proxy)
  const getTotalOrders = (customer: SalesCustomer) => {
    return customer.quotationsCount || 0;
  };

  // Helper to get last order date
  const getLastOrderDate = (customer: SalesCustomer) => {
    return customer.lastQuotationDate || customer.updatedAt;
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Customers</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Manage your customer relationships and track their activity
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white rounded-lg font-medium flex items-center gap-2 transition-all duration-300 shadow-lg hover:shadow-xl"
        >
          <UserPlus className="w-4 h-4" />
          Add Customer
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search customers by name, email, or phone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
        />
      </div>

      {/* Customers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {customers.map((customer) => {
          const loyalty = getCustomerLoyaltyLevel(customer.totalSpent || 0);
          const LoyaltyIcon = loyalty.icon;
          const totalOrders = getTotalOrders(customer);
          const lastOrderDate = getLastOrderDate(customer);
          
          return (
            <div
              key={customer._id}
              className="group bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 hover:shadow-xl transition-all duration-300 overflow-hidden"
            >
              {/* Header with gradient */}
              <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                    {customer.name.charAt(0)}
                  </div>
                  <div className="flex gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(customer.status)}`}>
                      {customer.status}
                    </span>
                    <button
                      onClick={() => openDetailsModal(customer)}
                      className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <LoyaltyIcon className={`w-4 h-4 ${loyalty.color}`} />
                  <span className={`text-sm font-semibold ${loyalty.color}`}>{loyalty.level}</span>
                </div>
              </div>

              {/* Customer Info */}
              <div className="p-6">
                <h3 className="font-bold text-gray-900 dark:text-white text-xl mb-2">{customer.name}</h3>
                
                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  {customer.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 flex-shrink-0" />
                      <span className="truncate">{customer.email}</span>
                    </div>
                  )}
                  {customer.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>{customer.phone}</span>
                    </div>
                  )}
                  {customer.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                      <span className="truncate">{customer.location}</span>
                    </div>
                  )}
                </div>

                {/* Spending Stats */}
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-800">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs text-gray-500">Total Spent</span>
                    <span className="font-bold text-lg text-cyan-600 dark:text-cyan-400">
                      KES {customer.totalSpent?.toLocaleString() || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">Total Orders</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {totalOrders}
                    </span>
                  </div>
                  {lastOrderDate && (
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-xs text-gray-500">Last Order</span>
                      <span className="text-xs text-gray-600 dark:text-gray-400">
                        {new Date(lastOrderDate).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-800 flex gap-2">
                  <button
                    onClick={() => openEditModal(customer)}
                    className="flex-1 px-3 py-2 text-sm bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <Edit className="w-4 h-4" /> Edit
                  </button>
                  <button
                    onClick={() => {
                      window.location.href = `/sales/quotations?customerId=${customer._id}`;
                    }}
                    className="flex-1 px-3 py-2 text-sm bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-all duration-300 flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
                  >
                    <FileText className="w-4 h-4" /> Quote
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {customers.length === 0 && (
        <div className="text-center py-12 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
          <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No customers found</p>
          <button
            onClick={() => setShowModal(true)}
            className="mt-4 px-4 py-2 bg-cyan-600 text-white rounded-lg inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Add your first customer
          </button>
        </div>
      )}

      {/* Customer Modal (Add/Edit) */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center sticky top-0 bg-white dark:bg-gray-900">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {editingCustomer ? 'Edit Customer' : 'Add Customer'}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg dark:bg-gray-800 focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg dark:bg-gray-800 focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Phone</label>
                <input
                  type="tel"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg dark:bg-gray-800 focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Location</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg dark:bg-gray-800 focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg dark:bg-gray-800 focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Notes</label>
                <textarea
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg dark:bg-gray-800 focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="submit" className="flex-1 px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-lg hover:from-cyan-700 hover:to-blue-700 transition-all duration-300 shadow-md">
                  {editingCustomer ? 'Update' : 'Create'} Customer
                </button>
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Customer Details Modal with Transactions */}
      {showDetailsModal && selectedCustomer && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6 border-b border-gray-200 dark:border-gray-800 sticky top-0 bg-white dark:bg-gray-900 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Customer Details</h2>
                <p className="text-sm text-gray-500">Complete customer information and transaction history</p>
              </div>
              <button onClick={() => setShowDetailsModal(false)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Customer Info Card */}
              <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-xl p-6">
                <div className="flex items-start gap-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center text-white font-bold text-3xl shadow-lg">
                    {selectedCustomer.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{selectedCustomer.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedCustomer.status)}`}>
                            {selectedCustomer.status}
                          </span>
                          {(() => {
                            const loyalty = getCustomerLoyaltyLevel(selectedCustomer.totalSpent || 0);
                            const LoyaltyIcon = loyalty.icon;
                            return (
                              <div className="flex items-center gap-1">
                                <LoyaltyIcon className={`w-4 h-4 ${loyalty.color}`} />
                                <span className={`text-sm font-semibold ${loyalty.color}`}>{loyalty.level}</span>
                              </div>
                            );
                          })()}
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          window.location.href = `/sales/quotations?customerId=${selectedCustomer._id}`;
                        }}
                        className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-lg hover:from-cyan-700 hover:to-blue-700 transition-all flex items-center gap-2"
                      >
                        <FileText className="w-4 h-4" /> New Quotation
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                      <div>
                        <p className="text-xs text-gray-500">Email</p>
                        <p className="text-sm font-medium flex items-center gap-1">
                          <Mail className="w-3 h-3" /> {selectedCustomer.email || 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Phone</p>
                        <p className="text-sm font-medium flex items-center gap-1">
                          <Phone className="w-3 h-3" /> {selectedCustomer.phone || 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Location</p>
                        <p className="text-sm font-medium flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> {selectedCustomer.location || 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Customer Since</p>
                        <p className="text-sm font-medium flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> {new Date(selectedCustomer.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Spending Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 text-center">
                  <DollarSign className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-green-600">KES {selectedCustomer.totalSpent?.toLocaleString() || 0}</p>
                  <p className="text-xs text-gray-500">Total Spent</p>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 text-center">
                  <ShoppingBag className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-blue-600">{selectedCustomer.quotationsCount || 0}</p>
                  <p className="text-xs text-gray-500">Total Orders</p>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4 text-center">
                  <TrendingUp className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-purple-600">
                    KES {Math.round((selectedCustomer.totalSpent || 0) / ((selectedCustomer.quotationsCount || 1))).toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500">Average Order Value</p>
                </div>
              </div>

              {/* Transaction History */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Receipt className="w-5 h-5 text-cyan-600" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Transaction History</h3>
                  </div>
                  <span className="text-xs text-gray-500">{customerTransactions.length} transactions</span>
                </div>

                {customerTransactions.length > 0 ? (
                  <div className="space-y-3">
                    {customerTransactions.map((transaction, idx) => (
                      <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl hover:shadow-md transition-all">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            transaction.type === 'payment' ? 'bg-green-100 dark:bg-green-900/30' : 'bg-blue-100 dark:bg-blue-900/30'
                          }`}>
                            {transaction.type === 'payment' ? (
                              <CreditCard className="w-5 h-5 text-green-600" />
                            ) : (
                              <Package className="w-5 h-5 text-blue-600" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {transaction.type === 'payment' ? 'Payment Received' : 'Order Placed'}
                            </p>
                            <p className="text-xs text-gray-500 flex items-center gap-2">
                              <Clock className="w-3 h-3" />
                              {new Date(transaction.date).toLocaleString()}
                              {transaction.reference && <span>• Ref: {transaction.reference}</span>}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-gray-900 dark:text-white">
                            KES {transaction.amount.toLocaleString()}
                          </p>
                          <p className={`text-xs ${
                            transaction.status === 'completed' ? 'text-green-600' :
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
                    <button
                      onClick={() => {
                        window.location.href = `/sales/quotations?customerId=${selectedCustomer._id}`;
                      }}
                      className="mt-3 text-sm text-cyan-600 hover:text-cyan-700 flex items-center gap-1 justify-center"
                    >
                      Create first quotation <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>

              {/* Notes Section */}
              {selectedCustomer.notes && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-4">
                  <p className="text-sm font-medium text-yellow-800 dark:text-yellow-400 mb-1">Notes</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{selectedCustomer.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}