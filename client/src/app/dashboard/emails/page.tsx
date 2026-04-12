// src/app/dashboard/emails/page.tsx
'use client'

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mail, Send, User, Package, Truck, CheckCircle, XCircle,
  Loader2, Copy, Check, AlertCircle, ChevronRight, Sparkles,
  Inbox, Users, ShoppingBag, TrendingUp, Calendar, Clock,
  Eye, EyeOff, Plus, Minus, Trash2, RefreshCw, Download,
  MessageSquare, Heart, Star, Zap, Shield, Award
} from 'lucide-react';
import toast from 'react-hot-toast';
import { 
  sendTestEmail, 
  sendWelcomeEmail,
  sendOrderConfirmationEmail,
  sendOrderStatusUpdateEmail
} from '@/lib/api';

// Types
interface TestEmailData {
  to: string;
  subject: string;
  message: string;
}

interface WelcomeEmailData {
  email: string;
  name: string;
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
}

interface OrderStatusData {
  orderId: string;
  status: string;
  trackingNumber: string;
  estimatedDelivery: string;
  notes: string;
}

interface EmailTemplate {
  id: string;
  name: string;
  description: string;
  icon: any;
  color: string;
  bgGradient: string;
  stats: {
    sent: number;
    openRate: string;
    clickRate: string;
  };
}

export default function EmailsPage() {
  const [activeTab, setActiveTab] = useState('test');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [response, setResponse] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  
  // Test Email State
  const [testEmail, setTestEmail] = useState<TestEmailData>({
    to: '',
    subject: '',
    message: ''
  });

  // Welcome Email State
  const [welcomeEmail, setWelcomeEmail] = useState<WelcomeEmailData>({
    email: '',
    name: ''
  });

  // Order Confirmation State
  const [orderConfirmation, setOrderConfirmation] = useState<OrderConfirmationData>({
    orderId: '',
    customerName: '',
    customerEmail: '',
    total: '',
    items: [{ name: '', quantity: 1, price: 0 }]
  });

  // Order Status State
  const [orderStatus, setOrderStatus] = useState<OrderStatusData>({
    orderId: '',
    status: '',
    trackingNumber: '',
    estimatedDelivery: '',
    notes: ''
  });

  // Email templates
  const templates: EmailTemplate[] = [
    {
      id: 'test',
      name: 'Test Email',
      description: 'Send a test email to verify configuration',
      icon: Mail,
      color: 'blue',
      bgGradient: 'from-blue-500 to-indigo-600',
      stats: { sent: 0, openRate: 'N/A', clickRate: 'N/A' }
    },
    {
      id: 'welcome',
      name: 'Welcome Email',
      description: 'Send welcome emails to new users',
      icon: User,
      color: 'purple',
      bgGradient: 'from-purple-500 to-pink-600',
      stats: { sent: 0, openRate: 'N/A', clickRate: 'N/A' }
    },
    {
      id: 'order-confirm',
      name: 'Order Confirmation',
      description: 'Send order confirmation emails',
      icon: ShoppingBag,
      color: 'indigo',
      bgGradient: 'from-indigo-500 to-purple-600',
      stats: { sent: 0, openRate: 'N/A', clickRate: 'N/A' }
    },
    {
      id: 'order-status',
      name: 'Order Status',
      description: 'Send order status updates',
      icon: Truck,
      color: 'orange',
      bgGradient: 'from-orange-500 to-red-600',
      stats: { sent: 0, openRate: 'N/A', clickRate: 'N/A' }
    }
  ];

  const statusOptions = [
    { value: 'pending', label: 'Pending', color: 'yellow' },
    { value: 'processing', label: 'Processing', color: 'blue' },
    { value: 'shipped', label: 'Shipped', color: 'purple' },
    { value: 'delivered', label: 'Delivered', color: 'green' },
    { value: 'cancelled', label: 'Cancelled', color: 'red' }
  ];

  const showResponse = (type: 'success' | 'error', message: string) => {
    setResponse({ type, message });
    setTimeout(() => setResponse(null), 5000);
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopied(null), 2000);
  };

  const handleTestEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await sendTestEmail(testEmail);
      showResponse('success', 'Test email sent successfully!');
      setTestEmail({ to: '', subject: '', message: '' });
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
      await sendWelcomeEmail({ email: welcomeEmail.email, name: welcomeEmail.name });
      showResponse('success', 'Welcome email sent successfully!');
      setWelcomeEmail({ email: '', name: '' });
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
      showResponse('success', 'Order confirmation email sent successfully!');
      setOrderConfirmation({ 
        orderId: '', 
        customerName: '', 
        customerEmail: '', 
        total: '',
        items: [{ name: '', quantity: 1, price: 0 }]
      });
    } catch (error: any) {
      showResponse('error', error.response?.data?.error || 'Failed to send order confirmation');
    } finally {
      setLoading(false);
    }
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

  const handleOrderStatusUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await sendOrderStatusUpdateEmail(orderStatus);
      showResponse('success', 'Order status update email sent successfully!');
      setOrderStatus({ orderId: '', status: '', trackingNumber: '', estimatedDelivery: '', notes: '' });
    } catch (error: any) {
      showResponse('error', error.response?.data?.error || 'Failed to send status update');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const option = statusOptions.find(s => s.value === status);
    switch(option?.color) {
      case 'yellow': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'blue': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'purple': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
      case 'green': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'red': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
    }
  };

  const getTotal = () => {
    return orderConfirmation.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const tabs = [
    { id: 'test', name: 'Test Email', icon: Mail, color: 'blue' },
    { id: 'welcome', name: 'Welcome Email', icon: User, color: 'purple' },
    { id: 'order-confirm', name: 'Order Confirmation', icon: ShoppingBag, color: 'indigo' },
    { id: 'order-status', name: 'Order Status', icon: Truck, color: 'orange' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <Mail className="w-8 h-8 text-blue-600" />
                Email Management
              </h1>
              <p className="text-gray-500 dark:text-gray-400 mt-2">
                Send and manage transactional emails
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => window.location.reload()}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
            </div>
          </div>
        </motion.div>

        {/* Response Message */}
        <AnimatePresence>
          {response && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`mb-6 p-4 rounded-xl ${
                response.type === 'success' 
                  ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                  : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
              }`}
            >
              <div className="flex items-center gap-3">
                {response.type === 'success' ? (
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                )}
                <span className={`text-sm ${
                  response.type === 'success' 
                    ? 'text-green-700 dark:text-green-400' 
                    : 'text-red-700 dark:text-red-400'
                }`}>
                  {response.message}
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
        >
          {templates.map((template, idx) => {
            const Icon = template.icon;
            return (
              <motion.div
                key={template.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
                whileHover={{ y: -4 }}
                className={`bg-gradient-to-r ${template.bgGradient} rounded-xl p-5 text-white shadow-lg cursor-pointer transition-all duration-300`}
                onClick={() => setActiveTab(template.id)}
              >
                <div className="flex items-center justify-between mb-3">
                  <Icon className="w-8 h-8 opacity-90" />
                  <ChevronRight className="w-5 h-5 opacity-70" />
                </div>
                <h3 className="font-semibold text-lg">{template.name}</h3>
                <p className="text-white/80 text-sm mt-1">{template.description}</p>
                <div className="mt-3 flex items-center gap-2 text-xs text-white/70">
                  <span>Click to send</span>
                  <Sparkles className="w-3 h-3" />
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Main Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 overflow-hidden"
        >
          {/* Tabs */}
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
                      flex items-center gap-2 px-6 py-4 text-sm font-medium transition-all duration-200
                      ${isActive
                        ? `bg-white dark:bg-gray-900 text-${tab.color}-600 border-b-2 border-${tab.color}-600`
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
                      }
                    `}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.name}
                    {isActive && (
                      <motion.div
                        layoutId="activeTab"
                        className={`absolute bottom-0 left-0 right-0 h-0.5 bg-${tab.color}-600`}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      />
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Content */}
          <div className="p-6 lg:p-8">
            <AnimatePresence mode="wait">
              {/* Test Email Tab */}
              {activeTab === 'test' && (
                <motion.form
                  key="test"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  onSubmit={handleTestEmail}
                  className="space-y-6"
                >
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Recipient Email *
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="email"
                        value={testEmail.to}
                        onChange={(e) => setTestEmail({ ...testEmail, to: e.target.value })}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                        required
                        placeholder="recipient@example.com"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Subject *
                    </label>
                    <input
                      type="text"
                      value={testEmail.subject}
                      onChange={(e) => setTestEmail({ ...testEmail, subject: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                      required
                      placeholder="Test Email Subject"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Message *
                    </label>
                    <textarea
                      value={testEmail.message}
                      onChange={(e) => setTestEmail({ ...testEmail, message: e.target.value })}
                      rows={6}
                      className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                      required
                      placeholder="Your message here..."
                    />
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3 px-4 rounded-xl font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                  >
                    {loading ? (
                      <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        <Send className="w-4 h-4" />
                        Send Test Email
                      </span>
                    )}
                  </motion.button>
                </motion.form>
              )}

              {/* Welcome Email Tab */}
              {activeTab === 'welcome' && (
                <motion.form
                  key="welcome"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  onSubmit={handleWelcomeEmail}
                  className="space-y-6"
                >
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Recipient Email *
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="email"
                        value={welcomeEmail.email}
                        onChange={(e) => setWelcomeEmail({ ...welcomeEmail, email: e.target.value })}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-200"
                        required
                        placeholder="newuser@example.com"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      User Name *
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        value={welcomeEmail.name}
                        onChange={(e) => setWelcomeEmail({ ...welcomeEmail, name: e.target.value })}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-200"
                        required
                        placeholder="John Doe"
                      />
                    </div>
                  </div>
                  <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4 border border-purple-200 dark:border-purple-800">
                    <p className="text-sm text-purple-800 dark:text-purple-300">
                      <strong>📧 Email Preview:</strong> Welcome email will be sent to <strong>{welcomeEmail.email || '[email]'}</strong> with personalized greeting for <strong>{welcomeEmail.name || '[name]'}</strong>
                    </p>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-3 px-4 rounded-xl font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                  >
                    {loading ? (
                      <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        <User className="w-4 h-4" />
                        Send Welcome Email
                      </span>
                    )}
                  </motion.button>
                </motion.form>
              )}

              {/* Order Confirmation Tab */}
              {activeTab === 'order-confirm' && (
                <motion.form
                  key="order-confirm"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  onSubmit={handleOrderConfirmation}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Order ID *
                      </label>
                      <div className="relative">
                        <Package className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          value={orderConfirmation.orderId}
                          onChange={(e) => setOrderConfirmation({ ...orderConfirmation, orderId: e.target.value })}
                          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200"
                          required
                          placeholder="ORDER-12345"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Total Amount (KES) *
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">KSh</span>
                        <input
                          type="number"
                          value={orderConfirmation.total}
                          onChange={(e) => setOrderConfirmation({ ...orderConfirmation, total: e.target.value })}
                          className="w-full pl-12 pr-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200"
                          required
                          placeholder="5000"
                          step="0.01"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Customer Name *
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          value={orderConfirmation.customerName}
                          onChange={(e) => setOrderConfirmation({ ...orderConfirmation, customerName: e.target.value })}
                          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200"
                          required
                          placeholder="John Doe"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Customer Email *
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="email"
                          value={orderConfirmation.customerEmail}
                          onChange={(e) => setOrderConfirmation({ ...orderConfirmation, customerEmail: e.target.value })}
                          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200"
                          required
                          placeholder="customer@example.com"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      Order Items *
                    </label>
                    <div className="space-y-3">
                      {orderConfirmation.items.map((item, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="flex gap-3 items-start"
                        >
                          <input
                            type="text"
                            value={item.name}
                            onChange={(e) => updateOrderItem(index, 'name', e.target.value)}
                            placeholder="Product name"
                            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white dark:bg-gray-800"
                            required
                          />
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => updateOrderItem(index, 'quantity', parseInt(e.target.value))}
                            placeholder="Qty"
                            className="w-24 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white dark:bg-gray-800"
                            required
                            min="1"
                          />
                          <input
                            type="number"
                            value={item.price}
                            onChange={(e) => updateOrderItem(index, 'price', parseFloat(e.target.value))}
                            placeholder="Price"
                            className="w-32 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white dark:bg-gray-800"
                            required
                            step="0.01"
                          />
                          {index > 0 && (
                            <button
                              type="button"
                              onClick={() => removeOrderItem(index)}
                              className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </motion.div>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={addOrderItem}
                      className="mt-3 text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
                    >
                      <Plus className="w-4 h-4" />
                      Add Item
                    </button>
                  </div>

                  <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-4 border border-indigo-200 dark:border-indigo-800">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-indigo-800 dark:text-indigo-300">Total:</span>
                      <span className="text-lg font-bold text-indigo-800 dark:text-indigo-300">
                        KSh {getTotal().toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-3 px-4 rounded-xl font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                  >
                    {loading ? (
                      <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        <ShoppingBag className="w-4 h-4" />
                        Send Order Confirmation
                      </span>
                    )}
                  </motion.button>
                </motion.form>
              )}

              {/* Order Status Tab */}
              {activeTab === 'order-status' && (
                <motion.form
                  key="order-status"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  onSubmit={handleOrderStatusUpdate}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Order ID *
                      </label>
                      <div className="relative">
                        <Package className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          value={orderStatus.orderId}
                          onChange={(e) => setOrderStatus({ ...orderStatus, orderId: e.target.value })}
                          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all duration-200"
                          required
                          placeholder="ORDER-12345"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Status *
                      </label>
                      <select
                        value={orderStatus.status}
                        onChange={(e) => setOrderStatus({ ...orderStatus, status: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all duration-200"
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
                    <div className="relative">
                      <Truck className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        value={orderStatus.trackingNumber}
                        onChange={(e) => setOrderStatus({ ...orderStatus, trackingNumber: e.target.value })}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all duration-200"
                        placeholder="TRK-123456789"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Estimated Delivery (Optional)
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="date"
                        value={orderStatus.estimatedDelivery}
                        onChange={(e) => setOrderStatus({ ...orderStatus, estimatedDelivery: e.target.value })}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all duration-200"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Additional Notes (Optional)
                    </label>
                    <textarea
                      value={orderStatus.notes}
                      onChange={(e) => setOrderStatus({ ...orderStatus, notes: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all duration-200"
                      placeholder="Any additional information for the customer..."
                    />
                  </div>

                  {orderStatus.status && (
                    <div className="bg-orange-50 dark:bg-orange-900/20 rounded-xl p-4 border border-orange-200 dark:border-orange-800">
                      <div className="flex items-center gap-3">
                        <div className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(orderStatus.status)}`}>
                          {statusOptions.find(s => s.value === orderStatus.status)?.label}
                        </div>
                        <span className="text-sm text-orange-700 dark:text-orange-300">
                          Status update email will be sent to the customer
                        </span>
                      </div>
                    </div>
                  )}

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white py-3 px-4 rounded-xl font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                  >
                    {loading ? (
                      <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        <Truck className="w-4 h-4" />
                        Send Status Update
                      </span>
                    )}
                  </motion.button>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Info Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400"
        >
          <p className="flex items-center justify-center gap-2">
            <Shield className="w-4 h-4" />
            All emails are sent using Brevo's transactional email service
          </p>
          <p className="mt-1 text-xs">
            Make sure your Brevo API key is configured in the backend .env file
          </p>
        </motion.div>
      </div>
    </div>
  );
}