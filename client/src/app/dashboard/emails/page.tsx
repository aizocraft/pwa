// src/app/dashboard/emails/page.tsx
'use client'

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mail, Send, User, Package, Truck, CheckCircle, XCircle,
  Loader2, Copy, Check, AlertCircle, ChevronRight, Sparkles,
  Inbox, Users, ShoppingBag, TrendingUp, Calendar, Clock,
  Eye, EyeOff, Plus, Minus, Trash2, RefreshCw, Download,
  MessageSquare, Heart, Star, Zap, Shield, Award, Building2,
  UserPlus, UserCheck, Crown, Search, Filter, ChevronDown,
  Crown as CrownIcon, Rocket, Gift, Megaphone, Headphones,
  Settings, Globe, Phone, Mail as MailIcon, MapPin, Clock as ClockIcon,
  Handshake
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { 
  sendTestEmail, 
  sendWelcomeEmail,
  sendOrderConfirmationEmail,
  sendOrderStatusUpdateEmail
} from '@/lib/api';
import { getUsers, getAdminOrders } from '@/lib/api';
import type { User as UserType } from '@/types/user';
import type { Order } from '@/types/order';

// ==================== TYPES ====================
interface TestEmailData {
  to: string;
  subject: string;
  message: string;
  isHtml: boolean;
}

interface WelcomeEmailData {
  email: string;
  name: string;
  template: 'new-user' | 'sales-team' | 'vip' | 'partner';
  subject?: string;
  customMessage?: string;
}

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

interface OrderConfirmationData {
  orderId: string;
  customerName: string;
  customerEmail: string;
  total: string;
  items: OrderItem[];
  notes?: string;
}

interface OrderStatusData {
  orderId: string;
  status: string;
  trackingNumber: string;
  estimatedDelivery: string;
  notes: string;
}

// ==================== WELCOME TEMPLATES ====================
const welcomeTemplates = [
  { 
    id: 'new-user', 
    label: 'New User Welcome',
    icon: UserPlus,
    subject: 'Welcome to Plasma Water Africa! 🌊',
    description: 'Standard welcome for new customers',
    preview: 'Thank you for joining our community...',
    color: '#0043b3'
  },
  { 
    id: 'sales-team', 
    label: 'Sales Team Onboarding',
    icon: Rocket,
    subject: 'Welcome to the Sales Team! 🚀',
    description: 'Onboarding for new sales representatives',
    preview: 'Excited to have you on our sales team...',
    color: '#009dff'
  },
  { 
    id: 'vip', 
    label: 'VIP Welcome',
    icon: CrownIcon,
    subject: 'Exclusive VIP Welcome! 👑',
    description: 'Premium welcome for VIP customers',
    preview: 'You have been selected for our VIP program...',
    color: '#f59e0b'
  },
  { 
    id: 'partner', 
    label: 'Partner Welcome',
    icon: Handshake,
    subject: 'Welcome to the Partner Program! 🤝',
    description: 'Onboarding for business partners',
    preview: 'We\'re excited to partner with you...',
    color: '#10b981'
  }
];

// ==================== STATUS OPTIONS ====================
const statusOptions = [
  { value: 'pending', label: 'Pending', color: '#ffab00', icon: Clock },
  { value: 'processing', label: 'Processing', color: '#009dff', icon: Settings },
  { value: 'shipped', label: 'Shipped', color: '#0043b3', icon: Truck },
  { value: 'delivered', label: 'Delivered', color: '#10b981', icon: CheckCircle },
  { value: 'cancelled', label: 'Cancelled', color: '#ff1744', icon: XCircle }
];

// ==================== TABS ====================
const tabs = [
  { id: 'test', name: 'Test Email', icon: MailIcon, description: 'Send a test email to verify configuration' },
  { id: 'welcome', name: 'Welcome Emails', icon: UserPlus, description: 'Send welcome emails to new users' },
  { id: 'order-confirm', name: 'Order Confirmation', icon: ShoppingBag, description: 'Send order confirmations to customers' },
  { id: 'order-status', name: 'Order Status', icon: Truck, description: 'Send status updates for orders' }
];

// ==================== MAIN COMPONENT ====================
export default function EmailsPage() {
  const [activeTab, setActiveTab] = useState('test');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  
  // ==================== USERS & ORDERS STATE ====================
  const [users, setUsers] = useState<UserType[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const [orderSearch, setOrderSearch] = useState('');
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showOrderDropdown, setShowOrderDropdown] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<string | null>(null);
  
  // ==================== TEST EMAIL STATE ====================
  const [testEmail, setTestEmail] = useState<TestEmailData>({
    to: '',
    subject: '',
    message: '',
    isHtml: false
  });

  // ==================== WELCOME EMAIL STATE ====================
  const [welcomeEmail, setWelcomeEmail] = useState<WelcomeEmailData>({
    email: '',
    name: '',
    template: 'new-user',
    subject: '',
    customMessage: ''
  });

  // ==================== ORDER CONFIRMATION STATE ====================
  const [orderConfirmation, setOrderConfirmation] = useState<OrderConfirmationData>({
    orderId: '',
    customerName: '',
    customerEmail: '',
    total: '',
    items: [{ name: '', quantity: 1, price: 0 }],
    notes: ''
  });

  // ==================== ORDER STATUS STATE ====================
  const [orderStatus, setOrderStatus] = useState<OrderStatusData>({
    orderId: '',
    status: '',
    trackingNumber: '',
    estimatedDelivery: '',
    notes: ''
  });

  // ==================== FETCH USERS ====================
  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const response = await getUsers({ limit: 50, search: userSearch || undefined });
      setUsers(response.users || []);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoadingUsers(false);
    }
  };

  // ==================== FETCH ORDERS ====================
  const fetchOrders = async () => {
    setLoadingOrders(true);
    try {
      const response = await getAdminOrders({ limit: 50, search: orderSearch || undefined });
      setOrders(response.orders || []);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoadingOrders(false);
    }
  };

  // ==================== DEBOUNCE SEARCH ====================
  useEffect(() => {
    if (activeTab === 'welcome') {
      const timeout = setTimeout(() => fetchUsers(), 300);
      return () => clearTimeout(timeout);
    }
  }, [userSearch]);

  useEffect(() => {
    if (activeTab === 'order-confirm' || activeTab === 'order-status') {
      const timeout = setTimeout(() => fetchOrders(), 300);
      return () => clearTimeout(timeout);
    }
  }, [orderSearch]);

  // ==================== SELECT USER ====================
  const handleSelectUser = (user: UserType) => {
    setSelectedUser(user);
    setWelcomeEmail({
      ...welcomeEmail,
      email: user.email,
      name: user.name
    });
    setUserSearch(user.name);
    setShowUserDropdown(false);
  };

  // ==================== SELECT ORDER ====================
  const handleSelectOrder = (order: Order) => {
    setSelectedOrder(order);
    const customerName = order.user?.name || order.guestInfo?.name || order.shippingAddress?.fullName || 'Customer';
    const customerEmail = order.user?.email || order.guestInfo?.email || order.shippingAddress?.email || '';
    const items = order.items.map(item => ({
      name: item.name,
      quantity: item.qty,
      price: item.sellingPrice || 0
    }));

    setOrderConfirmation({
      orderId: order.orderNumber || order._id,
      customerName,
      customerEmail,
      total: order.total.toString(),
      items: items.length > 0 ? items : [{ name: '', quantity: 1, price: 0 }],
      notes: order.notes || ''
    });

    setOrderStatus(prev => ({
      ...prev,
      orderId: order.orderNumber || order._id
    }));

    setOrderSearch(order.orderNumber || order._id);
    setShowOrderDropdown(false);
  };

  // ==================== FORM HANDLERS ====================
  const handleTestEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await sendTestEmail({
        to: testEmail.to,
        subject: testEmail.subject,
        message: testEmail.message
      });
      showResponse('success', 'Test email sent successfully!');
      setTestEmail({ to: '', subject: '', message: '', isHtml: false });
    } catch (error: any) {
      showResponse('error', error.response?.data?.error || 'Failed to send test email');
    } finally {
      setLoading(false);
    }
  };

  const handleWelcomeEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const template = welcomeTemplates.find(t => t.id === welcomeEmail.template);
      await sendWelcomeEmail({ 
        email: welcomeEmail.email, 
        name: welcomeEmail.name 
      });
      showResponse('success', `${template?.label} email sent successfully to ${welcomeEmail.email}!`);
      setWelcomeEmail({ email: '', name: '', template: 'new-user', subject: '', customMessage: '' });
      setUserSearch('');
      setSelectedUser(null);
    } catch (error: any) {
      showResponse('error', error.response?.data?.error || 'Failed to send welcome email');
    } finally {
      setLoading(false);
    }
  };

  const handleOrderConfirmation = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const orderData = {
        orderId: orderConfirmation.orderId,
        customerName: orderConfirmation.customerName,
        customerEmail: orderConfirmation.customerEmail,
        total: parseFloat(orderConfirmation.total) || 0,
        status: 'confirmed',
        items: orderConfirmation.items.filter(item => item.name)
      };
      
      await sendOrderConfirmationEmail(orderData);
      showResponse('success', `Order confirmation sent to ${orderConfirmation.customerEmail}!`);
      setOrderConfirmation({ 
        orderId: '', 
        customerName: '', 
        customerEmail: '', 
        total: '',
        items: [{ name: '', quantity: 1, price: 0 }],
        notes: ''
      });
      setOrderSearch('');
      setSelectedOrder(null);
    } catch (error: any) {
      showResponse('error', error.response?.data?.error || 'Failed to send order confirmation');
    } finally {
      setLoading(false);
    }
  };

  const handleOrderStatusUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await sendOrderStatusUpdateEmail(orderStatus);
      showResponse('success', `Status update sent for order ${orderStatus.orderId}!`);
      setOrderStatus({ orderId: '', status: '', trackingNumber: '', estimatedDelivery: '', notes: '' });
      setOrderSearch('');
      setSelectedOrder(null);
    } catch (error: any) {
      showResponse('error', error.response?.data?.error || 'Failed to send status update');
    } finally {
      setLoading(false);
    }
  };

  // ==================== UTILITY FUNCTIONS ====================
  const showResponse = (type: 'success' | 'error', message: string) => {
    setResponse({ type, message });
    setTimeout(() => setResponse(null), 5000);
  };

  const addOrderItem = () => {
    setOrderConfirmation(prev => ({
      ...prev,
      items: [...prev.items, { name: '', quantity: 1, price: 0 }]
    }));
  };

  const removeOrderItem = (index: number) => {
    setOrderConfirmation(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const updateOrderItem = (index: number, field: keyof OrderItem, value: any) => {
    setOrderConfirmation(prev => ({
      ...prev,
      items: prev.items.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const getTotal = () => {
    return orderConfirmation.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const getStatusColor = (status: string) => {
    const option = statusOptions.find(s => s.value === status);
    return option?.color || '#6b7280';
  };

  const getStatusLabel = (status: string) => {
    const option = statusOptions.find(s => s.value === status);
    return option?.label || status;
  };

  // ==================== RENDER ====================
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a1a]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        
        {/* ==================== HEADER ==================== */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-[#000063] dark:text-white flex items-center gap-3">
                <div className="p-2 bg-[#0043b3]/10 dark:bg-[#0043b3]/20 rounded-xl">
                  <Mail className="w-7 h-7 text-[#0043b3]" />
                </div>
                Email Management
              </h1>
              <p className="text-gray-500 dark:text-gray-400 mt-2">
                Send and manage transactional emails with ease
              </p>
            </div>
          </div>
        </div>

        {/* ==================== RESPONSE MESSAGE ==================== */}
        <AnimatePresence>
          {response && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`mb-6 p-4 rounded-xl border ${
                response.type === 'success' 
                  ? 'bg-[#00c853]/5 dark:bg-[#00c853]/10 border-[#00c853]/20'
                  : 'bg-[#ff1744]/5 dark:bg-[#ff1744]/10 border-[#ff1744]/20'
              }`}
            >
              <div className="flex items-center gap-3">
                {response.type === 'success' ? (
                  <CheckCircle className="w-5 h-5 text-[#00c853]" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-[#ff1744]" />
                )}
                <span className={`text-sm ${
                  response.type === 'success' 
                    ? 'text-[#00c853]' 
                    : 'text-[#ff1744]'
                }`}>
                  {response.message}
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ==================== MAIN CARD ==================== */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
          
          {/* ==================== TABS ==================== */}
          <div className="border-b border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50">
            <nav className="flex overflow-x-auto">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      group relative flex items-center gap-3 px-6 py-4 text-sm font-medium transition-all duration-200 whitespace-nowrap
                      ${isActive
                        ? 'text-[#0043b3]'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                      }
                    `}
                  >
                    <div className={`
                      p-1.5 rounded-lg transition-all duration-200
                      ${isActive 
                        ? 'bg-[#0043b3]/10 text-[#0043b3]' 
                        : 'bg-transparent text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300'
                      }
                    `}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <div className="font-medium">{tab.name}</div>
                      <div className={`text-xs transition-colors duration-200 ${
                        isActive ? 'text-[#0043b3]/70' : 'text-gray-400 dark:text-gray-500'
                      }`}>
                        {tab.description}
                      </div>
                    </div>
                    {isActive && (
                      <motion.div
                        layoutId="activeTabIndicator"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0043b3]"
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      />
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* ==================== CONTENT ==================== */}
          <div className="p-6 lg:p-8">
            <AnimatePresence mode="wait">
              
              {/* ===== TEST EMAIL ===== */}
              {activeTab === 'test' && (
                <motion.form
                  key="test"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  onSubmit={handleTestEmail}
                  className="space-y-6 max-w-2xl"
                >
                  <div className="bg-[#0043b3]/5 dark:bg-[#0043b3]/10 rounded-xl p-4 border border-[#0043b3]/20">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-[#0043b3]/10 rounded-lg">
                        <Mail className="w-4 h-4 text-[#0043b3]" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          <span className="font-medium">Test Email</span> — Send a test email to verify your email configuration is working properly.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Recipient Email <span className="text-[#ff1744]">*</span>
                    </label>
                    <div className="relative">
                      <MailIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="email"
                        value={testEmail.to}
                        onChange={(e) => setTestEmail({ ...testEmail, to: e.target.value })}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 focus:ring-2 focus:ring-[#0043b3]/20 focus:border-[#0043b3] transition-all"
                        required
                        placeholder="recipient@example.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Subject <span className="text-[#ff1744]">*</span>
                    </label>
                    <input
                      type="text"
                      value={testEmail.subject}
                      onChange={(e) => setTestEmail({ ...testEmail, subject: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 focus:ring-2 focus:ring-[#0043b3]/20 focus:border-[#0043b3] transition-all"
                      required
                      placeholder="Test Email Subject"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Message <span className="text-[#ff1744]">*</span>
                    </label>
                    <textarea
                      value={testEmail.message}
                      onChange={(e) => setTestEmail({ ...testEmail, message: e.target.value })}
                      rows={6}
                      className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 focus:ring-2 focus:ring-[#0043b3]/20 focus:border-[#0043b3] transition-all"
                      required
                      placeholder="Your message here..."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#0043b3] hover:bg-[#000063] text-white py-3.5 px-4 rounded-xl font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#0043b3]/20 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Send Test Email
                      </>
                    )}
                  </button>
                </motion.form>
              )}

              {/* ===== WELCOME EMAIL ===== */}
              {activeTab === 'welcome' && (
                <motion.form
                  key="welcome"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  onSubmit={handleWelcomeEmail}
                  className="space-y-6 max-w-2xl"
                >
                  <div className="bg-[#0043b3]/5 dark:bg-[#0043b3]/10 rounded-xl p-4 border border-[#0043b3]/20">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-[#0043b3]/10 rounded-lg">
                        <UserPlus className="w-4 h-4 text-[#0043b3]" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          <span className="font-medium">Welcome Email</span> — Send a personalized welcome email to new users, sales team members, or VIP customers.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Template Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      Select Template <span className="text-[#ff1744]">*</span>
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {welcomeTemplates.map((template) => {
                        const Icon = template.icon;
                        const isSelected = welcomeEmail.template === template.id;
                        return (
                          <button
                            key={template.id}
                            type="button"
                            onClick={() => {
                              setWelcomeEmail({ 
                                ...welcomeEmail, 
                                template: template.id as any,
                                subject: template.subject 
                              });
                              setPreviewTemplate(template.id);
                            }}
                            className={`group relative p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                              isSelected
                                ? 'border-[#0043b3] bg-[#0043b3]/5 dark:bg-[#0043b3]/10 shadow-lg shadow-[#0043b3]/10'
                                : 'border-gray-200 dark:border-gray-700 hover:border-[#0043b3]/50 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                            }`}
                            style={{
                              borderColor: isSelected ? template.color : undefined,
                            }}
                          >
                            <div className="flex items-start gap-3">
                              <div className={`p-2 rounded-lg transition-colors ${
                                isSelected ? 'bg-[#0043b3]/10' : 'bg-gray-100 dark:bg-gray-800'
                              }`}>
                                <Icon className={`w-5 h-5 ${
                                  isSelected ? 'text-[#0043b3]' : 'text-gray-400'
                                }`} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                  {template.label}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                  {template.description}
                                </div>
                                <div className="text-xs text-[#0043b3]/70 mt-1 truncate">
                                  {template.subject}
                                </div>
                              </div>
                              {isSelected && (
                                <CheckCircle className="w-4 h-4 text-[#0043b3] flex-shrink-0" />
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* User Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Select User
                    </label>
                    <div className="relative">
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          value={userSearch}
                          onChange={(e) => setUserSearch(e.target.value)}
                          onFocus={() => setShowUserDropdown(true)}
                          placeholder="Search users by name or email..."
                          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 focus:ring-2 focus:ring-[#0043b3]/20 focus:border-[#0043b3] transition-all"
                        />
                        {loadingUsers && (
                          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-gray-400" />
                        )}
                      </div>
                      
                      {showUserDropdown && users.length > 0 && (
                        <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg max-h-60 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-700">
                          {users.map((user) => (
                            <button
                              key={user._id}
                              type="button"
                              onClick={() => handleSelectUser(user)}
                              className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-3"
                            >
                              <div className="w-9 h-9 rounded-full bg-[#0043b3]/10 dark:bg-[#0043b3]/20 flex items-center justify-center text-[#0043b3] font-semibold text-sm flex-shrink-0">
                                {user.name.charAt(0).toUpperCase()}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                  {user.name}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                  {user.email}
                                </div>
                              </div>
                              {selectedUser?._id === user._id && (
                                <CheckCircle className="w-4 h-4 text-[#0043b3] flex-shrink-0" />
                              )}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      Start typing to search existing users, or manually enter email below
                    </p>
                  </div>

                  {/* Manual Entry */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Email <span className="text-[#ff1744]">*</span>
                      </label>
                      <input
                        type="email"
                        value={welcomeEmail.email}
                        onChange={(e) => setWelcomeEmail({ ...welcomeEmail, email: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 focus:ring-2 focus:ring-[#0043b3]/20 focus:border-[#0043b3] transition-all"
                        required
                        placeholder="user@example.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Name <span className="text-[#ff1744]">*</span>
                      </label>
                      <input
                        type="text"
                        value={welcomeEmail.name}
                        onChange={(e) => setWelcomeEmail({ ...welcomeEmail, name: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 focus:ring-2 focus:ring-[#0043b3]/20 focus:border-[#0043b3] transition-all"
                        required
                        placeholder="John Doe"
                      />
                    </div>
                  </div>

                  {/* Template Preview */}
                  {previewTemplate && (
                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                      <div className="flex items-center gap-2 mb-3">
                        <Eye className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Email Preview</span>
                      </div>
                      <div className="bg-white dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                          Subject: {welcomeTemplates.find(t => t.id === previewTemplate)?.subject}
                        </div>
                        <div className="text-sm text-gray-700 dark:text-gray-300">
                          Dear <strong>{welcomeEmail.name || '[Name]'}</strong>,
                        </div>
                        <div className="text-sm text-gray-700 dark:text-gray-300 mt-2">
                          {welcomeTemplates.find(t => t.id === previewTemplate)?.preview}
                        </div>
                        <div className="text-xs text-gray-400 dark:text-gray-500 mt-3 pt-2 border-t border-gray-200 dark:border-gray-700">
                          <span className="text-[#0043b3]">✓</span> This is a preview. Actual email will have full HTML formatting.
                        </div>
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#0043b3] hover:bg-[#000063] text-white py-3.5 px-4 rounded-xl font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#0043b3]/20 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4" />
                        Send Welcome Email
                      </>
                    )}
                  </button>
                </motion.form>
              )}

              {/* ===== ORDER CONFIRMATION ===== */}
              {activeTab === 'order-confirm' && (
                <motion.form
                  key="order-confirm"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  onSubmit={handleOrderConfirmation}
                  className="space-y-6 max-w-3xl"
                >
                  <div className="bg-[#0043b3]/5 dark:bg-[#0043b3]/10 rounded-xl p-4 border border-[#0043b3]/20">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-[#0043b3]/10 rounded-lg">
                        <ShoppingBag className="w-4 h-4 text-[#0043b3]" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          <span className="font-medium">Order Confirmation</span> — Send an order confirmation email to customers with their order details and items.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Order Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Select Order
                    </label>
                    <div className="relative">
                      <div className="relative">
                        <Package className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          value={orderSearch}
                          onChange={(e) => setOrderSearch(e.target.value)}
                          onFocus={() => setShowOrderDropdown(true)}
                          placeholder="Search by order number or customer..."
                          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 focus:ring-2 focus:ring-[#0043b3]/20 focus:border-[#0043b3] transition-all"
                        />
                        {loadingOrders && (
                          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-gray-400" />
                        )}
                      </div>
                      
                      {showOrderDropdown && orders.length > 0 && (
                        <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg max-h-60 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-700">
                          {orders.map((order) => {
                            const customerName = order.user?.name || order.guestInfo?.name || order.shippingAddress?.fullName || 'Guest';
                            return (
                              <button
                                key={order._id}
                                type="button"
                                onClick={() => handleSelectOrder(order)}
                                className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                              >
                                <div className="flex justify-between items-center">
                                  <div>
                                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                                      #{order.orderNumber || order._id.slice(-8)}
                                    </div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">{customerName}</div>
                                  </div>
                                  <div className="text-right">
                                    <div className="text-sm font-semibold text-[#0043b3]">
                                      KSh {order.total.toLocaleString()}
                                    </div>
                                    <div className="text-xs text-gray-400">{order.items?.length || 0} items</div>
                                  </div>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      Start typing to search existing orders, or manually enter details below
                    </p>
                  </div>

                  {/* Manual Entry */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Order ID <span className="text-[#ff1744]">*</span>
                      </label>
                      <input
                        type="text"
                        value={orderConfirmation.orderId}
                        onChange={(e) => setOrderConfirmation({ ...orderConfirmation, orderId: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 focus:ring-2 focus:ring-[#0043b3]/20 focus:border-[#0043b3] transition-all"
                        required
                        placeholder="ORDER-12345"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Total Amount (KES) <span className="text-[#ff1744]">*</span>
                      </label>
                      <input
                        type="number"
                        value={orderConfirmation.total}
                        onChange={(e) => setOrderConfirmation({ ...orderConfirmation, total: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 focus:ring-2 focus:ring-[#0043b3]/20 focus:border-[#0043b3] transition-all"
                        required
                        placeholder="5000"
                        step="0.01"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Customer Name <span className="text-[#ff1744]">*</span>
                      </label>
                      <input
                        type="text"
                        value={orderConfirmation.customerName}
                        onChange={(e) => setOrderConfirmation({ ...orderConfirmation, customerName: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 focus:ring-2 focus:ring-[#0043b3]/20 focus:border-[#0043b3] transition-all"
                        required
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Customer Email <span className="text-[#ff1744]">*</span>
                      </label>
                      <input
                        type="email"
                        value={orderConfirmation.customerEmail}
                        onChange={(e) => setOrderConfirmation({ ...orderConfirmation, customerEmail: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 focus:ring-2 focus:ring-[#0043b3]/20 focus:border-[#0043b3] transition-all"
                        required
                        placeholder="customer@example.com"
                      />
                    </div>
                  </div>

                  {/* Order Items */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      Order Items <span className="text-[#ff1744]">*</span>
                    </label>
                    <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                      {orderConfirmation.items.map((item, index) => (
                        <div key={index} className="flex gap-3 items-start bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                          <input
                            type="text"
                            value={item.name}
                            onChange={(e) => updateOrderItem(index, 'name', e.target.value)}
                            placeholder="Product name"
                            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-[#0043b3]/20 focus:border-[#0043b3] bg-white dark:bg-gray-800 text-sm"
                            required
                          />
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => updateOrderItem(index, 'quantity', parseInt(e.target.value))}
                            placeholder="Qty"
                            className="w-20 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-[#0043b3]/20 focus:border-[#0043b3] bg-white dark:bg-gray-800 text-sm text-center"
                            required
                            min="1"
                          />
                          <input
                            type="number"
                            value={item.price}
                            onChange={(e) => updateOrderItem(index, 'price', parseFloat(e.target.value))}
                            placeholder="Price"
                            className="w-28 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-[#0043b3]/20 focus:border-[#0043b3] bg-white dark:bg-gray-800 text-sm text-right"
                            required
                            step="0.01"
                          />
                          {index > 0 && (
                            <button
                              type="button"
                              onClick={() => removeOrderItem(index)}
                              className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors flex-shrink-0"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={addOrderItem}
                      className="mt-3 text-sm text-[#0043b3] hover:text-[#000063] font-medium flex items-center gap-1"
                    >
                      <Plus className="w-4 h-4" />
                      Add Item
                    </button>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Additional Notes (Optional)
                    </label>
                    <textarea
                      value={orderConfirmation.notes}
                      onChange={(e) => setOrderConfirmation({ ...orderConfirmation, notes: e.target.value })}
                      rows={2}
                      className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 focus:ring-2 focus:ring-[#0043b3]/20 focus:border-[#0043b3] transition-all"
                      placeholder="Any additional notes for the customer..."
                    />
                  </div>

                  {/* Total */}
                  <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Order Total:</span>
                      <span className="text-xl font-bold text-[#000063] dark:text-white">
                        KSh {getTotal().toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#0043b3] hover:bg-[#000063] text-white py-3.5 px-4 rounded-xl font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#0043b3]/20 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <ShoppingBag className="w-4 h-4" />
                        Send Order Confirmation
                      </>
                    )}
                  </button>
                </motion.form>
              )}

              {/* ===== ORDER STATUS ===== */}
              {activeTab === 'order-status' && (
                <motion.form
                  key="order-status"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  onSubmit={handleOrderStatusUpdate}
                  className="space-y-6 max-w-2xl"
                >
                  <div className="bg-[#0043b3]/5 dark:bg-[#0043b3]/10 rounded-xl p-4 border border-[#0043b3]/20">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-[#0043b3]/10 rounded-lg">
                        <Truck className="w-4 h-4 text-[#0043b3]" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          <span className="font-medium">Order Status Update</span> — Send customers real-time updates on their order status with tracking information.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Order Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Select Order
                    </label>
                    <div className="relative">
                      <div className="relative">
                        <Package className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          value={orderSearch}
                          onChange={(e) => setOrderSearch(e.target.value)}
                          onFocus={() => setShowOrderDropdown(true)}
                          placeholder="Search by order number or customer..."
                          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 focus:ring-2 focus:ring-[#0043b3]/20 focus:border-[#0043b3] transition-all"
                        />
                        {loadingOrders && (
                          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-gray-400" />
                        )}
                      </div>
                      
                      {showOrderDropdown && orders.length > 0 && (
                        <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg max-h-60 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-700">
                          {orders.map((order) => {
                            const customerName = order.user?.name || order.guestInfo?.name || order.shippingAddress?.fullName || 'Guest';
                            return (
                              <button
                                key={order._id}
                                type="button"
                                onClick={() => handleSelectOrder(order)}
                                className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                              >
                                <div className="flex justify-between items-center">
                                  <div>
                                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                                      #{order.orderNumber || order._id.slice(-8)}
                                    </div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">{customerName}</div>
                                  </div>
                                  <div className="text-right">
                                    <div className="text-sm font-semibold text-[#0043b3]">
                                      KSh {order.total.toLocaleString()}
                                    </div>
                                    <div className="text-xs text-gray-400">{order.items?.length || 0} items</div>
                                  </div>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Order ID <span className="text-[#ff1744]">*</span>
                      </label>
                      <input
                        type="text"
                        value={orderStatus.orderId}
                        onChange={(e) => setOrderStatus({ ...orderStatus, orderId: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 focus:ring-2 focus:ring-[#0043b3]/20 focus:border-[#0043b3] transition-all"
                        required
                        placeholder="ORDER-12345"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Status <span className="text-[#ff1744]">*</span>
                      </label>
                      <select
                        value={orderStatus.status}
                        onChange={(e) => setOrderStatus({ ...orderStatus, status: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 focus:ring-2 focus:ring-[#0043b3]/20 focus:border-[#0043b3] transition-all"
                        required
                      >
                        <option value="">Select Status</option>
                        {statusOptions.map(option => (
                          <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Tracking Number (Optional)
                    </label>
                    <input
                      type="text"
                      value={orderStatus.trackingNumber}
                      onChange={(e) => setOrderStatus({ ...orderStatus, trackingNumber: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 focus:ring-2 focus:ring-[#0043b3]/20 focus:border-[#0043b3] transition-all"
                      placeholder="TRK-123456789"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Estimated Delivery (Optional)
                    </label>
                    <input
                      type="date"
                      value={orderStatus.estimatedDelivery}
                      onChange={(e) => setOrderStatus({ ...orderStatus, estimatedDelivery: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 focus:ring-2 focus:ring-[#0043b3]/20 focus:border-[#0043b3] transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Additional Notes (Optional)
                    </label>
                    <textarea
                      value={orderStatus.notes}
                      onChange={(e) => setOrderStatus({ ...orderStatus, notes: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 focus:ring-2 focus:ring-[#0043b3]/20 focus:border-[#0043b3] transition-all"
                      placeholder="Any additional information for the customer..."
                    />
                  </div>

                  {orderStatus.status && (
                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                      <div className="flex items-center gap-3">
                        <div 
                          className="px-3 py-1.5 rounded-full text-xs font-medium text-white flex items-center gap-1.5"
                          style={{ backgroundColor: getStatusColor(orderStatus.status) }}
                        >
                          {(() => {
                            const StatusIcon = statusOptions.find(s => s.value === orderStatus.status)?.icon || Truck;
                            return <StatusIcon className="w-3 h-3" />;
                          })()}
                          {getStatusLabel(orderStatus.status)}
                        </div>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Status update email will be sent to the customer
                        </span>
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#0043b3] hover:bg-[#000063] text-white py-3.5 px-4 rounded-xl font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#0043b3]/20 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <Truck className="w-4 h-4" />
                        Send Status Update
                      </>
                    )}
                  </button>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* ==================== FOOTER ==================== */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-400 dark:text-gray-500">
            All emails are sent using the configured email service. 
            <span className="inline-block mx-1">•</span>
            <span className="text-[#0043b3]">✓</span> Test email to verify configuration
            <span className="inline-block mx-1">•</span>
            <span className="text-[#0043b3]">✓</span> Templates are fully customizable
          </p>
        </div>
      </div>
    </div>
  );
}