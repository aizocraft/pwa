'use client'

import { ShoppingCart, CheckCircle, Clock, Package, Truck, ArrowUp, ArrowDown, Calendar, Filter, ChevronDown, ChevronRight, DollarSign, Search, X, Mail, Phone, Eye, Star } from 'lucide-react';
import Link from 'next/link';
import { Order } from '@/types/order';
import { useAuth } from '@/lib/auth'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useMemo } from 'react';
import { getUserOrders, getGuestOrders } from '@/lib/api';

// Extended type for localStorage guest orders
interface GuestOrder extends Order {
  savedAt?: string;
  guestEmail?: string;
  guestPhone?: string;
  guestName?: string;
  itemsCount?: number;
}

const getStatusConfig = (status: Order['status']) => {
  switch (status) {
    case 'pending': 
      return { icon: Clock, color: 'bg-amber-500/10 text-amber-600 border-amber-200 dark:bg-amber-500/20 dark:text-amber-400 dark:border-amber-500/30', label: 'Pending' };
    case 'processing': 
      return { icon: Package, color: 'bg-blue-500/10 text-blue-600 border-blue-200 dark:bg-blue-500/20 dark:text-blue-400 dark:border-blue-500/30', label: 'Processing' };
    case 'paid': 
      return { icon: CheckCircle, color: 'bg-emerald-500/10 text-emerald-600 border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/30', label: 'Paid' };
    case 'shipped': 
      return { icon: Truck, color: 'bg-purple-500/10 text-purple-600 border-purple-200 dark:bg-purple-500/20 dark:text-purple-400 dark:border-purple-500/30', label: 'Shipped' };
    case 'delivered': 
      return { icon: CheckCircle, color: 'bg-green-500/10 text-green-600 border-green-200 dark:bg-green-500/20 dark:text-green-400 dark:border-green-500/30', label: 'Delivered' };
    case 'cancelled': 
      return { icon: Clock, color: 'bg-red-500/10 text-red-600 border-red-200 dark:bg-red-500/20 dark:text-red-400 dark:border-red-500/30', label: 'Cancelled' };
    case 'refunded': 
      return { icon: DollarSign, color: 'bg-gray-500/10 text-gray-600 border-gray-200 dark:bg-gray-500/20 dark:text-gray-400 dark:border-gray-500/30', label: 'Refunded' };
    default: 
      return { icon: Clock, color: 'bg-gray-500/10 text-gray-600 border-gray-200 dark:bg-gray-500/20 dark:text-gray-400 dark:border-gray-500/30', label: 'Unknown' };
  }
};

const StatusIcon = ({ status }: { status: Order['status'] }) => {
  const { icon: Icon } = getStatusConfig(status);
  return <Icon className="w-3.5 h-3.5" />;
};

export default function OrdersPage() {
  const { user, isLoggedIn, loading: authLoading } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isGuestMode, setIsGuestMode] = useState(false);
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | Order['status']>('all');
  const [sortBy, setSortBy] = useState<'date' | 'total'>('date');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [rawOrders, setRawOrders] = useState<GuestOrder[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedEmail = localStorage.getItem('last_guest_email');
      const savedPhone = localStorage.getItem('last_guest_phone');
      if (savedEmail && savedPhone && !isLoggedIn) {
        setGuestEmail(savedEmail);
        setGuestPhone(savedPhone);
      }
    }
  }, [isLoggedIn]);

  useEffect(() => {
    if (authLoading) return;
    if (isLoggedIn) {
      fetchOrders();
    } else if (guestEmail && guestPhone) {
      fetchOrders();
    }
  }, [isLoggedIn, authLoading, guestEmail, guestPhone]);

  const fetchOrders = async () => {
    setLoadingOrders(true);
    setError(null);
    try {
      let data: GuestOrder[] = [];
      if (isLoggedIn) {
        const orders = await getUserOrders();
        data = orders as GuestOrder[];
      } else if (guestEmail && guestPhone) {
        try {
          const apiOrders = await getGuestOrders(guestEmail, guestPhone);
          data = apiOrders as GuestOrder[];
        } catch (apiError) {
          console.log('Falling back to localStorage orders');
          data = [];
        }
        
        if (!data || data.length === 0) {
          const localOrders = JSON.parse(localStorage.getItem('guest_orders') || '[]');
          const matchedOrders = localOrders.filter(
            (order: GuestOrder) => order.guestEmail === guestEmail && order.guestPhone === guestPhone
          );
          data = matchedOrders;
        }
      } else {
        setRawOrders([]);
        setLoadingOrders(false);
        return;
      }
      setRawOrders(data || []);
    } catch (err: any) {
      console.error('Failed to fetch orders', err);
      if (!isLoggedIn) {
        const localOrders = JSON.parse(localStorage.getItem('guest_orders') || '[]');
        const matchedOrders = localOrders.filter(
          (order: GuestOrder) => order.guestEmail === guestEmail && order.guestPhone === guestPhone
        );
        if (matchedOrders.length > 0) {
          setRawOrders(matchedOrders);
          setError(null);
        } else {
          setError(err.response?.data?.error || 'Failed to load orders');
        }
      } else {
        setError(err.response?.data?.error || 'Failed to load orders');
      }
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleGuestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (guestEmail && guestPhone) {
      localStorage.setItem('last_guest_email', guestEmail);
      localStorage.setItem('last_guest_phone', guestPhone);
      fetchOrders();
    }
  };

  const orders = useMemo(() => 
    rawOrders.map(order => ({
      ...order,
      orderNumber: order.orderNumber || `ORD-${order._id?.slice(-8).toUpperCase() || Math.random().toString(36).substr(2, 8).toUpperCase()}`,
      itemsCount: order.items?.reduce((sum, item) => sum + item.qty, 0) || order.itemsCount || 0,
      date: order.createdAt || order.savedAt || new Date().toISOString()
    })), 
  [rawOrders]
  );

  const filteredOrders = useMemo(() => {
    let filtered = [...orders];
    
    if (filterStatus !== 'all') {
      filtered = filtered.filter(order => order.status === filterStatus);
    }
    
    if (searchQuery) {
      filtered = filtered.filter(order => 
        order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order._id?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    return filtered.sort((a, b) => {
      let aVal: number, bVal: number;
      if (sortBy === 'date') {
        aVal = new Date(a.createdAt || a.savedAt || a.date).getTime();
        bVal = new Date(b.createdAt || b.savedAt || b.date).getTime();
      } else {
        aVal = a.total || 0;
        bVal = b.total || 0;
      }
      return sortDir === 'desc' ? bVal - aVal : aVal - bVal;
    });
  }, [orders, filterStatus, sortBy, sortDir, searchQuery]);

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    processing: orders.filter(o => o.status === 'processing').length,
    paid: orders.filter(o => o.status === 'paid').length,
    shipped: orders.filter(o => o.status === 'shipped').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    cancelled: orders.filter(o => o.status === 'cancelled').length,
    totalSpent: orders.reduce((sum, o) => sum + (o.total || 0), 0)
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="relative inline-block">
              <div className="w-16 h-16 border-4 border-emerald-200 dark:border-emerald-900 rounded-full"></div>
              <div className="absolute top-0 left-0 w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Guest mode login form
  if (!isLoggedIn && !isGuestMode) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-gray-950">
        <div className="max-w-md mx-auto px-4 py-16">
          <div className="relative group">
            <div className="relative bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-2xl p-8 border border-gray-200 dark:border-gray-700 shadow-xl">
              <div className="text-center mb-6">
                <Package className="w-16 h-16 text-emerald-500 mx-auto mb-3" strokeWidth={1.5} />
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Order History
                </h1>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => router.push('/auth/login')}
                  className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl transition-all transform hover:scale-105 shadow-lg"
                >
                  Sign In
                </button>
                
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300 dark:border-gray-700"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white/90 dark:bg-gray-900/90 text-gray-500">or</span>
                  </div>
                </div>

                <button
                  onClick={() => setIsGuestMode(true)}
                  className="w-full py-2.5 bg-white/50 dark:bg-gray-800/50 hover:bg-white/70 dark:hover:bg-gray-700/50 text-gray-700 dark:text-gray-300 font-semibold rounded-xl border border-gray-200 dark:border-gray-700 transition-all flex items-center justify-center gap-2"
                >
                  <Eye className="w-4 h-4" />
                  Continue as Guest
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Guest info form
  if (!isLoggedIn && isGuestMode && (!guestEmail || !guestPhone) && rawOrders.length === 0 && !loadingOrders) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-gray-950">
        <div className="max-w-md mx-auto px-4 py-16">
          <div className="relative group">
            <div className="relative bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-2xl p-8 border border-gray-200 dark:border-gray-700 shadow-xl">
              <div className="text-center mb-6">
                <div className="w-16 h-16 mx-auto mb-3 bg-emerald-100 dark:bg-emerald-950/50 rounded-full flex items-center justify-center">
                  <Eye className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Find Orders</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Enter your details to view orders</p>
              </div>

              <form onSubmit={handleGuestSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="email"
                      value={guestEmail}
                      onChange={(e) => setGuestEmail(e.target.value)}
                      required
                      className="w-full pl-10 pr-4 py-2.5 bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all text-sm"
                      placeholder="your@email.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Phone
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="tel"
                      value={guestPhone}
                      onChange={(e) => setGuestPhone(e.target.value)}
                      required
                      className="w-full pl-10 pr-4 py-2.5 bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all text-sm"
                      placeholder="0712345678"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsGuestMode(false)}
                    className="flex-1 py-2.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-xl transition-all text-sm"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl transition-all transform hover:scale-105 shadow-lg text-sm"
                  >
                    View Orders
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loadingOrders) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="relative inline-block">
              <div className="w-16 h-16 border-4 border-emerald-200 dark:border-emerald-900 rounded-full"></div>
              <div className="absolute top-0 left-0 w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error && rawOrders.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-gray-950">
        <div className="max-w-md mx-auto px-4 py-16">
          <div className="relative group">
            <div className="relative bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-2xl p-8 border border-gray-200 dark:border-gray-700 shadow-xl text-center">
              <Package className="w-16 h-16 text-red-500 mx-auto mb-3" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Error</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{error}</p>
              <button
                onClick={() => {
                  if (isLoggedIn) {
                    fetchOrders();
                  } else {
                    setIsGuestMode(false);
                    setGuestEmail('');
                    setGuestPhone('');
                  }
                }}
                className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-semibold text-sm shadow-lg transition-all"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (filteredOrders.length === 0 && !searchQuery && filterStatus === 'all') {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-gray-950">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <ShoppingCart className="mx-auto h-24 w-24 text-gray-400 dark:text-gray-600 mb-4" strokeWidth={1.5} />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
              No Orders Yet
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              {isLoggedIn 
                ? "Start shopping to see your order history"
                : "No orders found for these details"}
            </p>
            <Link
              href="/products"
              className="inline-flex items-center px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
            >
              Start Shopping
              <ShoppingCart className="ml-2 w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-950">
      {/* Compact Header */}
      <div className="relative border-b border-gray-200/50 dark:border-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 text-xs font-medium mb-3">
              <Star className="w-3 h-3 fill-current" />
              <span>Order History</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
              My Orders
            </h1>
          </div>

          {/* Compact Stats Cards - Auto width */}
          <div className="flex flex-wrap gap-3 justify-center mt-6">
            <div className="bg-white/80 dark:bg-gray-900/50 backdrop-blur-xl rounded-xl px-4 py-2 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center gap-2">
                <span className="text-xl font-black text-gray-900 dark:text-white">{stats.total}</span>
                <span className="text-xs text-gray-600 dark:text-gray-400">Total</span>
              </div>
            </div>
            {stats.pending > 0 && (
              <div className="bg-amber-50 dark:bg-amber-950/30 rounded-xl px-4 py-2 border border-amber-200 dark:border-amber-800/50 shadow-sm">
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                  <span className="text-sm font-semibold text-amber-700 dark:text-amber-400">{stats.pending}</span>
                </div>
              </div>
            )}
            {stats.processing > 0 && (
              <div className="bg-blue-50 dark:bg-blue-950/30 rounded-xl px-4 py-2 border border-blue-200 dark:border-blue-800/50 shadow-sm">
                <div className="flex items-center gap-2">
                  <Package className="w-3.5 h-3.5 text-blue-600" />
                  <span className="text-sm font-semibold text-blue-700 dark:text-blue-400">{stats.processing}</span>
                </div>
              </div>
            )}
            {stats.shipped > 0 && (
              <div className="bg-purple-50 dark:bg-purple-950/30 rounded-xl px-4 py-2 border border-purple-200 dark:border-purple-800/50 shadow-sm">
                <div className="flex items-center gap-2">
                  <Truck className="w-3.5 h-3.5 text-purple-600" />
                  <span className="text-sm font-semibold text-purple-700 dark:text-purple-400">{stats.shipped}</span>
                </div>
              </div>
            )}
            {stats.delivered > 0 && (
              <div className="bg-green-50 dark:bg-green-950/30 rounded-xl px-4 py-2 border border-green-200 dark:border-green-800/50 shadow-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-green-600" />
                  <span className="text-sm font-semibold text-green-700 dark:text-green-400">{stats.delivered}</span>
                </div>
              </div>
            )}
            {stats.cancelled > 0 && (
              <div className="bg-red-50 dark:bg-red-950/30 rounded-xl px-4 py-2 border border-red-200 dark:border-red-800/50 shadow-sm">
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-red-600" />
                  <span className="text-sm font-semibold text-red-700 dark:text-red-400">{stats.cancelled}</span>
                </div>
              </div>
            )}
            <div className="bg-emerald-50 dark:bg-emerald-950/30 rounded-xl px-4 py-2 border border-emerald-200 dark:border-emerald-800/30 shadow-sm">
              <div className="flex items-center gap-2">
                <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                  Ksh.{stats.totalSpent.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Search and Filters */}
        <div className="bg-white/80 dark:bg-gray-900/50 backdrop-blur-xl rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-lg mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by order number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-8 py-2 bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all text-sm"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                >
                  <X className="w-3.5 h-3.5 text-gray-400 hover:text-gray-600" />
                </button>
              )}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setViewMode(viewMode === 'table' ? 'grid' : 'table')}
                className="px-3 py-2 bg-white/50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm hover:bg-white/70 transition-all"
              >
                {viewMode === 'table' ? 'Grid' : 'Table'}
              </button>
              
              <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="sm:hidden flex items-center gap-2 px-4 py-2 bg-white/50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 text-sm"
              >
                <Filter className="w-4 h-4" />
                Filter
                <ChevronDown className={`w-3 h-3 transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} />
              </button>
            </div>
          </div>

          <div className={`${isFilterOpen ? 'flex' : 'hidden'} sm:flex flex-wrap gap-2 mt-3`}>
            {(['all', 'pending', 'processing', 'paid', 'shipped', 'delivered', 'cancelled'] as const).map((status) => {
              const count = status === 'all' ? stats.total : stats[status as keyof typeof stats] || 0;
              const isActive = filterStatus === status;
              if (count === 0 && status !== 'all') return null;
              return (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status === 'all' ? 'all' : status)}
                  className={`px-3 py-1.5 rounded-lg font-medium text-xs transition-all duration-200 flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-emerald-500 text-white shadow-md'
                      : 'bg-white/50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 hover:bg-white/70 border border-gray-200/50 dark:border-gray-700'
                  }`}
                >
                  {status !== 'all' && <StatusIcon status={status as Order['status']} />}
                  <span className="capitalize">{status === 'all' ? 'All' : status}</span>
                  <span className={`text-xs ${isActive ? 'text-white/80' : 'text-gray-500'}`}>({count})</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Orders Display */}
        {viewMode === 'table' ? (
          <div className="bg-white/80 dark:bg-gray-900/50 backdrop-blur-xl rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400">Order</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 hidden md:table-cell">
                      <button className="flex items-center gap-1 hover:text-emerald-600" onClick={() => { setSortBy('date'); setSortDir(sortDir === 'desc' ? 'asc' : 'desc'); }}>
                        Date
                        {sortBy === 'date' && (sortDir === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />)}
                      </button>
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 hidden lg:table-cell">Items</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-400">
                      <button className="flex items-center gap-1 justify-end hover:text-emerald-600" onClick={() => { setSortBy('total'); setSortDir(sortDir === 'desc' ? 'asc' : 'desc'); }}>
                        Total
                        {sortBy === 'total' && (sortDir === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />)}
                      </button>
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-400">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200/50 dark:divide-gray-700/50">
                  {filteredOrders.map((order) => {
                    const { color, label } = getStatusConfig(order.status);
                    return (
                      <tr key={order._id || order.orderNumber} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="font-mono font-semibold text-sm text-gray-900 dark:text-white">{order.orderNumber}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 md:hidden mt-0.5">
                            {new Date(order.createdAt || order.savedAt || order.date).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap hidden md:table-cell">
                          <div className="text-sm text-gray-600 dark:text-gray-300">
                            {new Date(order.createdAt || order.savedAt || order.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${color}`}>
                            <StatusIcon status={order.status} />
                            <span className="ml-1">{label}</span>
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap hidden lg:table-cell">
                          <span className="text-sm text-gray-700 dark:text-gray-300">{order.itemsCount} items</span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-right">
                          <div className="text-base font-bold text-gray-900 dark:text-white">Ksh.{order.total?.toFixed(2) || '0'}</div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-right">
                          <Link href={`/orders/${order._id}`} className="inline-flex items-center px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-medium rounded-lg transition-all shadow-md hover:shadow-lg">
                            View
                            <ChevronRight className="ml-1 w-3 h-3" />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredOrders.map((order) => {
              const { color, label } = getStatusConfig(order.status);
              return (
                <div key={order._id || order.orderNumber} className="group relative bg-white/80 dark:bg-gray-900/50 backdrop-blur-xl rounded-xl border border-gray-200 dark:border-gray-700 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-500"></div>
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="font-mono font-semibold text-xs text-gray-900 dark:text-white">{order.orderNumber}</div>
                        <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          <Calendar className="w-3 h-3" />
                          {new Date(order.createdAt || order.savedAt || order.date).toLocaleDateString()}
                        </div>
                      </div>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${color}`}>
                        <StatusIcon status={order.status} />
                        <span className="ml-1">{label}</span>
                      </span>
                    </div>

                    <div className="space-y-2 mb-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Items:</span>
                        <span className="font-medium text-gray-900 dark:text-white">{order.itemsCount}</span>
                      </div>
                      <div className="flex justify-between items-end">
                        <span className="text-gray-600 dark:text-gray-400 text-sm">Total:</span>
                        <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                          Ksh.{order.total?.toFixed(2) || '0'}
                        </span>
                      </div>
                    </div>

                    <Link href={`/orders/${order._id}`} className="w-full inline-flex items-center justify-center gap-1 px-3 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-medium rounded-lg transition-all shadow-md hover:shadow-lg">
                      View Details
                      <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {filteredOrders.length === 0 && searchQuery && (
          <div className="text-center py-12">
            <Search className="w-12 h-12 text-gray-400 mx-auto mb-3" strokeWidth={1.5} />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">No orders found</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Try adjusting your search</p>
            <button onClick={() => { setSearchQuery(''); setFilterStatus('all'); }} className="mt-3 text-emerald-600 hover:text-emerald-700 text-sm font-medium inline-flex items-center gap-1">
              Clear filters
              <X className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}