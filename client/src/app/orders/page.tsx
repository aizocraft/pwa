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
      return { icon: Clock, color: 'bg-amber-500/10 text-amber-600 border-amber-200 dark:bg-amber-500/20 dark:text-amber-400 dark:border-amber-500/30', label: 'Pending Payment', gradient: 'from-amber-500 to-orange-500' };
    case 'processing': 
      return { icon: Package, color: 'bg-blue-500/10 text-blue-600 border-blue-200 dark:bg-blue-500/20 dark:text-blue-400 dark:border-blue-500/30', label: 'Processing', gradient: 'from-blue-500 to-cyan-500' };
    case 'paid': 
      return { icon: CheckCircle, color: 'bg-emerald-500/10 text-emerald-600 border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/30', label: 'Paid', gradient: 'from-emerald-500 to-teal-500' };
    case 'shipped': 
      return { icon: Truck, color: 'bg-purple-500/10 text-purple-600 border-purple-200 dark:bg-purple-500/20 dark:text-purple-400 dark:border-purple-500/30', label: 'Shipped', gradient: 'from-purple-500 to-pink-500' };
    case 'delivered': 
      return { icon: CheckCircle, color: 'bg-green-500/10 text-green-600 border-green-200 dark:bg-green-500/20 dark:text-green-400 dark:border-green-500/30', label: 'Delivered', gradient: 'from-green-500 to-emerald-500' };
    case 'cancelled': 
      return { icon: Clock, color: 'bg-red-500/10 text-red-600 border-red-200 dark:bg-red-500/20 dark:text-red-400 dark:border-red-500/30', label: 'Cancelled', gradient: 'from-red-500 to-rose-500' };
    case 'refunded': 
      return { icon: DollarSign, color: 'bg-gray-500/10 text-gray-600 border-gray-200 dark:bg-gray-500/20 dark:text-gray-400 dark:border-gray-500/30', label: 'Refunded', gradient: 'from-gray-500 to-slate-500' };
    default: 
      return { icon: Clock, color: 'bg-gray-500/10 text-gray-600 border-gray-200 dark:bg-gray-500/20 dark:text-gray-400 dark:border-gray-500/30', label: 'Unknown', gradient: 'from-gray-500 to-slate-500' };
  }
};

const StatusIcon = ({ status }: { status: Order['status'] }) => {
  const { icon: Icon } = getStatusConfig(status);
  return <Icon className="w-4 h-4" />;
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

  // Fix hydration by setting mounted state
  useEffect(() => {
    setMounted(true);
  }, []);

  // Load guest orders from localStorage on mount
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

  // Don't render until mounted to prevent hydration errors
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-emerald-50/30 dark:from-gray-950 dark:via-slate-900 dark:to-emerald-950/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <div className="relative inline-block">
              <div className="w-24 h-24 border-4 border-emerald-200 dark:border-emerald-900 rounded-full"></div>
              <div className="absolute top-0 left-0 w-24 h-24 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Guest mode login form
  if (!isLoggedIn && !isGuestMode) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-emerald-50/30 dark:from-gray-950 dark:via-slate-900 dark:to-emerald-950/30">
        <div className="max-w-md mx-auto px-4 py-24">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 via-blue-500 to-purple-500 rounded-3xl blur-xl opacity-30 group-hover:opacity-50 transition duration-1000"></div>
            <div className="relative bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-2xl p-8 border border-white/50 shadow-xl">
              <div className="text-center mb-8">
                <div className="relative inline-block">
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full blur-2xl opacity-20"></div>
                  <Package className="relative w-20 h-20 text-emerald-500 mx-auto mb-4" strokeWidth={1.5} />
                </div>
                <h1 className="text-3xl font-black bg-gradient-to-r from-gray-900 via-emerald-800 to-blue-900 dark:from-white dark:via-emerald-400 dark:to-blue-400 bg-clip-text text-transparent mb-2">
                  My Orders
                </h1>
                <p className="text-gray-600 dark:text-gray-400">View your order history and track deliveries</p>
              </div>

              <div className="space-y-4">
                <button
                  onClick={() => router.push('/auth/login')}
                  className="w-full py-3 bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 text-white font-semibold rounded-xl transition-all transform hover:scale-105 shadow-lg"
                >
                  Sign In to View Orders
                </button>
                
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300 dark:border-gray-700"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white/90 dark:bg-gray-900/90 text-gray-500">or continue as guest</span>
                  </div>
                </div>

                <button
                  onClick={() => setIsGuestMode(true)}
                  className="w-full py-3 bg-white/50 dark:bg-gray-800/50 hover:bg-white/70 dark:hover:bg-gray-700/50 text-gray-700 dark:text-gray-300 font-semibold rounded-xl border border-gray-200 dark:border-gray-700 transition-all flex items-center justify-center gap-2"
                >
                  <Eye className="w-5 h-5" />
                  View Orders as Guest
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-emerald-50/30 dark:from-gray-950 dark:via-slate-900 dark:to-emerald-950/30">
        <div className="max-w-md mx-auto px-4 py-24">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 via-blue-500 to-purple-500 rounded-3xl blur-xl opacity-30 group-hover:opacity-50 transition duration-1000"></div>
            <div className="relative bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-2xl p-8 border border-white/50 shadow-xl">
              <div className="text-center mb-8">
                <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-emerald-100 to-blue-100 dark:from-emerald-950/50 dark:to-blue-950/50 rounded-full flex items-center justify-center">
                  <Eye className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h1 className="text-2xl font-black text-gray-900 dark:text-white mb-2">Find Your Orders</h1>
                <p className="text-gray-600 dark:text-gray-400">Enter your email and phone number to view orders</p>
              </div>

              <form onSubmit={handleGuestSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email Address
                  </label>
                  <div className="relative group">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
                    <input
                      type="email"
                      value={guestEmail}
                      onChange={(e) => setGuestEmail(e.target.value)}
                      required
                      className="w-full pl-10 pr-4 py-3 bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                      placeholder="your@email.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Phone Number
                  </label>
                  <div className="relative group">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
                    <input
                      type="tel"
                      value={guestPhone}
                      onChange={(e) => setGuestPhone(e.target.value)}
                      required
                      className="w-full pl-10 pr-4 py-3 bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                      placeholder="0712345678"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsGuestMode(false)}
                    className="flex-1 py-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-xl transition-all"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 text-white font-semibold rounded-xl transition-all transform hover:scale-105 shadow-lg"
                  >
                    View Orders
                  </button>
                </div>
              </form>

              {(() => {
                const recentEmail = typeof window !== 'undefined' ? localStorage.getItem('last_guest_email') : null;
                const recentPhone = typeof window !== 'undefined' ? localStorage.getItem('last_guest_phone') : null;
                if (recentEmail && recentPhone && (recentEmail !== guestEmail || recentPhone !== guestPhone)) {
                  return (
                    <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                      <p className="text-xs text-gray-500 dark:text-gray-400 text-center mb-2">Recently used</p>
                      <button
                        onClick={() => {
                          setGuestEmail(recentEmail);
                          setGuestPhone(recentPhone);
                          fetchOrders();
                        }}
                        className="w-full py-2 text-sm text-emerald-600 hover:text-emerald-700 font-medium"
                      >
                        {recentEmail} • {recentPhone}
                      </button>
                    </div>
                  );
                }
                return null;
              })()}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loadingOrders) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-emerald-50/30 dark:from-gray-950 dark:via-slate-900 dark:to-emerald-950/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <div className="relative inline-block">
              <div className="w-24 h-24 border-4 border-emerald-200 dark:border-emerald-900 rounded-full"></div>
              <div className="absolute top-0 left-0 w-24 h-24 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <h2 className="mt-8 text-2xl font-bold text-gray-900 dark:text-white">Loading orders...</h2>
            <p className="mt-2 text-gray-600 dark:text-gray-400">Fetching your order history</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && rawOrders.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-emerald-50/30 dark:from-gray-950 dark:via-slate-900 dark:to-emerald-950/30">
        <div className="max-w-md mx-auto px-4 py-24">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-red-500 to-orange-500 rounded-3xl blur-xl opacity-30"></div>
            <div className="relative bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-2xl p-8 border border-white/50 shadow-xl text-center">
              <div className="w-20 h-20 mx-auto mb-4 bg-red-100 dark:bg-red-950/50 rounded-full flex items-center justify-center">
                <Package className="w-10 h-10 text-red-600 dark:text-red-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Error Loading Orders</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
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
                className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-blue-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-emerald-50/30 dark:from-gray-950 dark:via-slate-900 dark:to-emerald-950/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <div className="relative inline-block mb-8">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full blur-2xl opacity-20"></div>
              <ShoppingCart className="relative mx-auto h-32 w-32 text-gray-400 dark:text-gray-600" strokeWidth={1.5} />
            </div>
            <h1 className="text-5xl sm:text-6xl font-black bg-gradient-to-r from-gray-900 via-emerald-800 to-blue-900 dark:from-white dark:via-emerald-400 dark:to-blue-400 bg-clip-text text-transparent mb-6">
              No orders yet
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-md mx-auto">
              {isLoggedIn 
                ? "You haven't placed any orders. Start shopping to see your order history here."
                : "No orders found for this email and phone number."}
            </p>
            {!isLoggedIn && (
              <button
                onClick={() => {
                  setIsGuestMode(false);
                  setGuestEmail('');
                  setGuestPhone('');
                }}
                className="inline-flex items-center px-8 py-4 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold text-lg rounded-2xl shadow-xl transition-all mb-4 mr-4"
              >
                Try Different Details
              </button>
            )}
            <Link
              href="/products"
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 text-white font-bold text-lg rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
            >
              Start Shopping
              <ShoppingCart className="ml-2 w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-emerald-50/30 dark:from-gray-950 dark:via-slate-900 dark:to-emerald-950/30">
      {/* Hero Section with Stats */}
      <div className="relative overflow-hidden border-b border-gray-200/50 dark:border-gray-800/50">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-blue-500/5 to-purple-500/10"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 text-sm font-medium mb-4">
              <Star className="w-4 h-4 fill-current" />
              <span>Order History</span>
            </div>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black bg-gradient-to-r from-gray-900 via-emerald-800 to-blue-900 dark:from-white dark:via-emerald-400 dark:to-blue-400 bg-clip-text text-transparent mb-6">
              {isLoggedIn ? 'Your Orders' : 'Guest Orders'}
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              {isLoggedIn 
                ? "Track and manage all your orders. View details, track delivery, and reorder with ease."
                : `Viewing orders for ${guestEmail}`}
            </p>
            {!isLoggedIn && (
              <button
                onClick={() => {
                  setIsGuestMode(false);
                  setGuestEmail('');
                  setGuestPhone('');
                }}
                className="mt-4 inline-flex items-center gap-1 text-sm text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
              >
                ← Switch to different account
              </button>
            )}
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-4 mt-12">
            <div className="bg-white/80 dark:bg-gray-900/50 backdrop-blur-xl rounded-2xl p-4 border border-white/50 shadow-lg hover:shadow-xl transition-all group">
              <div className="text-2xl font-black text-gray-900 dark:text-white group-hover:text-emerald-600 transition-colors">{stats.total}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Orders</div>
            </div>
            <div className="bg-white/80 dark:bg-gray-900/50 backdrop-blur-xl rounded-2xl p-4 border border-white/50 shadow-lg hover:shadow-xl transition-all group">
              <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">Ksh.{stats.totalSpent.toFixed(0)}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Spent</div>
            </div>
            <div className="bg-white/80 dark:bg-gray-900/50 backdrop-blur-xl rounded-2xl p-4 border border-white/50 shadow-lg hover:shadow-xl transition-all group">
              <div className="text-2xl font-black text-amber-600 dark:text-amber-400">{stats.pending}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Pending</div>
            </div>
            <div className="bg-white/80 dark:bg-gray-900/50 backdrop-blur-xl rounded-2xl p-4 border border-white/50 shadow-lg hover:shadow-xl transition-all group">
              <div className="text-2xl font-black text-blue-600 dark:text-blue-400">{stats.processing}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Processing</div>
            </div>
            <div className="bg-white/80 dark:bg-gray-900/50 backdrop-blur-xl rounded-2xl p-4 border border-white/50 shadow-lg hover:shadow-xl transition-all group">
              <div className="text-2xl font-black text-purple-600 dark:text-purple-400">{stats.shipped}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Shipped</div>
            </div>
            <div className="bg-white/80 dark:bg-gray-900/50 backdrop-blur-xl rounded-2xl p-4 border border-white/50 shadow-lg hover:shadow-xl transition-all group">
              <div className="text-2xl font-black text-green-600 dark:text-green-400">{stats.delivered}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Delivered</div>
            </div>
            <div className="bg-white/80 dark:bg-gray-900/50 backdrop-blur-xl rounded-2xl p-4 border border-white/50 shadow-lg hover:shadow-xl transition-all group">
              <div className="text-2xl font-black text-red-600 dark:text-red-400">{stats.cancelled}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Cancelled</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Search and Filters */}
        <div className="bg-white/80 dark:bg-gray-900/50 backdrop-blur-xl rounded-2xl p-4 sm:p-6 border border-white/50 shadow-xl mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative group">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
              <input
                type="text"
                placeholder="Search by order number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-10 py-3 bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 hover:scale-110 transition-transform"
                >
                  <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                </button>
              )}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setViewMode(viewMode === 'table' ? 'grid' : 'table')}
                className="px-4 py-2 bg-white/50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-white/70 transition-all"
              >
                {viewMode === 'table' ? 'Grid View' : 'Table View'}
              </button>
              
              <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="sm:hidden flex items-center justify-center gap-2 px-6 py-3 bg-white/50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700"
              >
                <Filter className="w-5 h-5" />
                <span>Filters</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} />
              </button>
            </div>
          </div>

          <div className={`${isFilterOpen ? 'flex' : 'hidden'} sm:flex flex-wrap gap-2 mt-4`}>
            {(['all', 'pending', 'processing', 'paid', 'shipped', 'delivered', 'cancelled'] as const).map((status) => {
              const count = status === 'all' ? stats.total : stats[status as keyof typeof stats] || 0;
              const isActive = filterStatus === status;
              return (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status === 'all' ? 'all' : status)}
                  className={`px-4 py-2 rounded-xl font-medium text-sm transition-all duration-200 flex items-center gap-2 ${
                    isActive
                      ? 'bg-gradient-to-r from-emerald-500 to-blue-500 text-white shadow-lg shadow-emerald-500/25'
                      : 'bg-white/50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 hover:bg-white/70 dark:hover:bg-gray-700/50 border border-gray-200/50 dark:border-gray-700'
                  }`}
                >
                  {status !== 'all' && <StatusIcon status={status as Order['status']} />}
                  <span className="capitalize">{status}</span>
                  <span className={`text-xs ${isActive ? 'text-white/80' : 'text-gray-500'}`}>({count})</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Orders Display */}
        {viewMode === 'table' ? (
          <div className="bg-white/80 dark:bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-white/50 shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="px-4 sm:px-6 py-4 text-left text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                      Order
                    </th>
                    <th className="px-4 sm:px-6 py-4 text-left text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider hidden md:table-cell">
                      <button
                        className="flex items-center gap-1 hover:text-emerald-600 transition-colors"
                        onClick={() => {
                          setSortBy('date');
                          setSortDir(sortDir === 'desc' ? 'asc' : 'desc');
                        }}
                      >
                        Date
                        {sortBy === 'date' && (sortDir === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />)}
                      </button>
                    </th>
                    <th className="px-4 sm:px-6 py-4 text-left text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 sm:px-6 py-4 text-left text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider hidden lg:table-cell">
                      Items
                    </th>
                    <th className="px-4 sm:px-6 py-4 text-right text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                      <button
                        className="flex items-center gap-1 justify-end hover:text-emerald-600 transition-colors"
                        onClick={() => {
                          setSortBy('total');
                          setSortDir(sortDir === 'desc' ? 'asc' : 'desc');
                        }}
                      >
                        Total
                        {sortBy === 'total' && (sortDir === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />)}
                      </button>
                    </th>
                    <th className="px-4 sm:px-6 py-4 text-right text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200/50 dark:divide-gray-700/50">
                  {filteredOrders.map((order) => {
                    const { icon: StatusIcon, color, label } = getStatusConfig(order.status);
                    return (
                      <tr key={order._id || order.orderNumber} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors group">
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                          <div className="font-mono font-bold text-sm text-gray-900 dark:text-white">{order.orderNumber}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 md:hidden mt-1">
                            {new Date(order.createdAt || order.savedAt || order.date).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap hidden md:table-cell">
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                            <Calendar className="w-4 h-4" />
                            {new Date(order.createdAt || order.savedAt || order.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </div>
                        </td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${color}`}>
                            <StatusIcon />
                            <span className="ml-1.5">{label}</span>
                          </span>
                        </td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap hidden lg:table-cell">
                          <span className="text-sm text-gray-700 dark:text-gray-300">{order.itemsCount} items</span>
                        </td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-right">
                          <div className="text-lg font-black text-gray-900 dark:text-white">Ksh.{order.total?.toFixed(2) || '0.00'}</div>
                        </td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-right">
                          <Link
                            href={`/orders/${order._id}`}
                            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 text-white text-sm font-medium rounded-xl transition-all shadow-md hover:shadow-lg"
                          >
                            View Details
                            <ChevronRight className="ml-1 w-4 h-4" />
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredOrders.map((order) => {
              const { icon: StatusIcon, color, label, gradient } = getStatusConfig(order.status);
              return (
                <div key={order._id || order.orderNumber} className="group relative bg-white/80 dark:bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-white/50 shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden">
                  <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${gradient}`}></div>
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="font-mono font-bold text-sm text-gray-900 dark:text-white">{order.orderNumber}</div>
                        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mt-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(order.createdAt || order.savedAt || order.date).toLocaleDateString()}
                        </div>
                      </div>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${color}`}>
                        <StatusIcon />
                        <span className="ml-1">{label}</span>
                      </span>
                    </div>

                    <div className="space-y-3 mb-6">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Items:</span>
                        <span className="font-medium text-gray-900 dark:text-white">{order.itemsCount}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Total:</span>
                        <span className="text-xl font-black bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
                          Ksh.{order.total?.toFixed(2) || '0.00'}
                        </span>
                      </div>
                    </div>

                    <Link
                      href={`/orders/${order._id}`}
                      className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 text-white text-sm font-medium rounded-xl transition-all shadow-md hover:shadow-lg group"
                    >
                      View Details
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {filteredOrders.length === 0 && searchQuery && (
          <div className="text-center py-16">
            <div className="text-gray-400 mb-4">
              <Search className="w-16 h-16 mx-auto" strokeWidth={1.5} />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No orders found</h3>
            <p className="text-gray-600 dark:text-gray-400">Try adjusting your search or filter</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setFilterStatus('all');
              }}
              className="mt-4 text-emerald-600 hover:text-emerald-700 font-medium inline-flex items-center gap-1"
            >
              Clear all filters
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}