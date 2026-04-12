'use client';

import React, { useState } from 'react';
import { 
  sendTestEmail, 
  sendWelcomeEmail,
  sendOrderConfirmationEmail,
  sendOrderStatusUpdateEmail
} from '@/lib/api';

const EmailTestPage = () => {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('test');
  const [response, setResponse] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  
  // Test Email State
  const [testEmail, setTestEmail] = useState({
    to: '',
    subject: '',
    message: ''
  });

  // Welcome Email State - FIXED: Changed from 'to' to 'email'
  const [welcomeEmail, setWelcomeEmail] = useState({
    email: '',  // Changed from 'to' to 'email'
    name: ''
  });

  // Order Confirmation State - FIXED: Need full order details
  const [orderConfirmation, setOrderConfirmation] = useState({
    orderId: '',
    customerName: '',
    customerEmail: '',
    total: '',
    items: [{ name: '', quantity: 1, price: 0 }]
  });

  // Order Status State
  const [orderStatus, setOrderStatus] = useState({
    orderId: '',
    status: '',
    trackingNumber: '',
    estimatedDelivery: '',
    notes: ''
  });

  const showResponse = (type: 'success' | 'error', message: string) => {
    setResponse({ type, message });
    setTimeout(() => setResponse(null), 5000);
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
      // Send with 'email' field instead of 'to'
      await sendWelcomeEmail({ email: welcomeEmail.email, name: welcomeEmail.name });
      showResponse('success', 'Welcome email sent successfully!');
      setWelcomeEmail({ email: '', name: '' });
    } catch (error: any) {
      console.error('Welcome email error:', error);
      showResponse('error', error.response?.data?.error || 'Failed to send welcome email');
    } finally {
      setLoading(false);
    }
  };

  const handleOrderConfirmation = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Send complete order details
      const orderData = {
        orderId: orderConfirmation.orderId,
        customerName: orderConfirmation.customerName,
        customerEmail: orderConfirmation.customerEmail,
        total: parseFloat(orderConfirmation.total) || 0,
        status: 'confirmed',
        items: orderConfirmation.items
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
      console.error('Order confirmation error:', error);
      showResponse('error', error.response?.data?.error || 'Failed to send order confirmation');
    } finally {
      setLoading(false);
    }
  };

  // Add order item
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

  const updateOrderItem = (index: number, field: string, value: any) => {
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

  const tabs = [
    { id: 'test', name: 'Test Email', icon: '📧' },
    { id: 'welcome', name: 'Welcome Email', icon: '👋' },
    { id: 'order-confirm', name: 'Order Confirm', icon: '✅' },
    { id: 'order-status', name: 'Order Status', icon: '📦' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
      <div className="max-w-5xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Email Testing Dashboard</h1>
          <p className="text-gray-600">Test all email functionality with Brevo integration</p>
        </div>

        {/* Response Message */}
        {response && (
          <div className={`mb-6 p-4 rounded-lg ${
            response.type === 'success' 
              ? 'bg-green-50 border border-green-200 text-green-700' 
              : 'bg-red-50 border border-red-200 text-red-700'
          }`}>
            <div className="flex items-center">
              {response.type === 'success' ? '✅' : '❌'}
              <span className="ml-2">{response.message}</span>
            </div>
          </div>
        )}

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Tabs */}
          <div className="border-b border-gray-200 bg-gray-50">
            <nav className="flex overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center px-6 py-4 text-sm font-medium transition-all duration-200
                    ${activeTab === tab.id
                      ? 'bg-white text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }
                  `}
                >
                  <span className="text-xl mr-2">{tab.icon}</span>
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="p-8">
            {/* Test Email Tab */}
            {activeTab === 'test' && (
              <form onSubmit={handleTestEmail} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Recipient Email *
                  </label>
                  <input
                    type="email"
                    value={testEmail.to}
                    onChange={(e) => setTestEmail({ ...testEmail, to: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    required
                    placeholder="recipient@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subject *
                  </label>
                  <input
                    type="text"
                    value={testEmail.subject}
                    onChange={(e) => setTestEmail({ ...testEmail, subject: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    required
                    placeholder="Test Email Subject"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message *
                  </label>
                  <textarea
                    value={testEmail.message}
                    onChange={(e) => setTestEmail({ ...testEmail, message: e.target.value })}
                    rows={6}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    required
                    placeholder="Your message here..."
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-4 rounded-lg hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium"
                >
                  {loading ? 'Sending...' : '📧 Send Test Email'}
                </button>
              </form>
            )}

            {/* Welcome Email Tab - FIXED */}
            {activeTab === 'welcome' && (
              <form onSubmit={handleWelcomeEmail} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Recipient Email *
                  </label>
                  <input
                    type="email"
                    value={welcomeEmail.email}
                    onChange={(e) => setWelcomeEmail({ ...welcomeEmail, email: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                    required
                    placeholder="newuser@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    User Name *
                  </label>
                  <input
                    type="text"
                    value={welcomeEmail.name}
                    onChange={(e) => setWelcomeEmail({ ...welcomeEmail, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                    required
                    placeholder="John Doe"
                  />
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <p className="text-sm text-purple-800">
                    <strong>📧 Email Preview:</strong> Welcome email will be sent to {welcomeEmail.email || '[email]'} with personalized greeting for {welcomeEmail.name || '[name]'}
                  </p>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white py-3 px-4 rounded-lg hover:from-purple-700 hover:to-purple-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium"
                >
                  {loading ? 'Sending...' : '👋 Send Welcome Email'}
                </button>
              </form>
            )}

            {/* Order Confirmation Tab - FIXED with full form */}
            {activeTab === 'order-confirm' && (
              <form onSubmit={handleOrderConfirmation} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Order ID *
                  </label>
                  <input
                    type="text"
                    value={orderConfirmation.orderId}
                    onChange={(e) => setOrderConfirmation({ ...orderConfirmation, orderId: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                    required
                    placeholder="ORDER-12345"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Customer Name *
                  </label>
                  <input
                    type="text"
                    value={orderConfirmation.customerName}
                    onChange={(e) => setOrderConfirmation({ ...orderConfirmation, customerName: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                    required
                    placeholder="John Doe"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Customer Email *
                  </label>
                  <input
                    type="email"
                    value={orderConfirmation.customerEmail}
                    onChange={(e) => setOrderConfirmation({ ...orderConfirmation, customerEmail: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                    required
                    placeholder="customer@example.com"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Total Amount (KES) *
                  </label>
                  <input
                    type="number"
                    value={orderConfirmation.total}
                    onChange={(e) => setOrderConfirmation({ ...orderConfirmation, total: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                    required
                    placeholder="5000"
                    step="0.01"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Order Items *
                  </label>
                  <div className="space-y-3">
                    {orderConfirmation.items.map((item, index) => (
                      <div key={index} className="flex gap-3 items-start">
                        <input
                          type="text"
                          value={item.name}
                          onChange={(e) => updateOrderItem(index, 'name', e.target.value)}
                          placeholder="Product name"
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                          required
                        />
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateOrderItem(index, 'quantity', parseInt(e.target.value))}
                          placeholder="Qty"
                          className="w-24 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                          required
                          min="1"
                        />
                        <input
                          type="number"
                          value={item.price}
                          onChange={(e) => updateOrderItem(index, 'price', parseFloat(e.target.value))}
                          placeholder="Price"
                          className="w-32 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                          required
                          step="0.01"
                        />
                        {index > 0 && (
                          <button
                            type="button"
                            onClick={() => removeOrderItem(index)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={addOrderItem}
                    className="mt-3 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                  >
                    + Add Item
                  </button>
                </div>

                <div className="bg-indigo-50 p-4 rounded-lg">
                  <p className="text-sm text-indigo-800">
                    <strong>✅ Note:</strong> This will send an order confirmation email with all the details above.
                  </p>
                </div>
                
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 text-white py-3 px-4 rounded-lg hover:from-indigo-700 hover:to-indigo-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium"
                >
                  {loading ? 'Sending...' : '✅ Send Order Confirmation'}
                </button>
              </form>
            )}

            {/* Order Status Tab */}
            {activeTab === 'order-status' && (
              <form onSubmit={handleOrderStatusUpdate} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Order ID *
                  </label>
                  <input
                    type="text"
                    value={orderStatus.orderId}
                    onChange={(e) => setOrderStatus({ ...orderStatus, orderId: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                    required
                    placeholder="ORDER-12345"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status *
                  </label>
                  <select
                    value={orderStatus.status}
                    onChange={(e) => setOrderStatus({ ...orderStatus, status: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                    required
                  >
                    <option value="">Select Status</option>
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tracking Number (Optional)
                  </label>
                  <input
                    type="text"
                    value={orderStatus.trackingNumber}
                    onChange={(e) => setOrderStatus({ ...orderStatus, trackingNumber: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                    placeholder="TRK-123456789"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estimated Delivery (Optional)
                  </label>
                  <input
                    type="date"
                    value={orderStatus.estimatedDelivery}
                    onChange={(e) => setOrderStatus({ ...orderStatus, estimatedDelivery: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Additional Notes (Optional)
                  </label>
                  <textarea
                    value={orderStatus.notes}
                    onChange={(e) => setOrderStatus({ ...orderStatus, notes: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                    placeholder="Any additional information for the customer..."
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-orange-600 to-orange-700 text-white py-3 px-4 rounded-lg hover:from-orange-700 hover:to-orange-800 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium"
                >
                  {loading ? 'Sending...' : '📦 Send Status Update'}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Info Footer */}
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>⚠️ Make sure your Brevo API key is configured in the backend .env file</p>
          <p className="mt-1">All emails are sent using Brevo's transactional email service</p>
        </div>
      </div>
    </div>
  );
};

export default EmailTestPage;