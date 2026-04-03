'use client'

import { useState } from 'react'
import {
  ShoppingCart,
  Users,
  DollarSign,
  TrendingUp,
  Package,
  Clock,
  CheckCircle,
  XCircle,
  Search,
  Filter,
  Download,
  ChevronDown,
  Star,
  Phone,
  Mail,
  MapPin,
  Calendar,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  MoreVertical
} from 'lucide-react'

export default function SalesDashboard() {
  const [dateRange, setDateRange] = useState('weekly')
  const [searchTerm, setSearchTerm] = useState('')

  // Sample sales data
  const salesData = {
    metrics: {
      totalRevenue: 28450,
      totalOrders: 342,
      totalCustomers: 156,
      conversionRate: 24.8,
      revenueChange: 12.5,
      ordersChange: 8.3,
      customersChange: 15.2,
      conversionChange: 5.1
    },
    recentOrders: [
      {
        id: 'ORD-001',
        customer: 'John Smith',
        email: 'john.smith@email.com',
        amount: 299.99,
        status: 'completed',
        date: '2024-01-15T10:30:00',
        items: 3
      },
      {
        id: 'ORD-002',
        customer: 'Sarah Johnson',
        email: 'sarah.j@email.com',
        amount: 149.50,
        status: 'pending',
        date: '2024-01-15T09:15:00',
        items: 2
      },
      {
        id: 'ORD-003',
        customer: 'Michael Brown',
        email: 'michael.b@email.com',
        amount: 599.99,
        status: 'shipped',
        date: '2024-01-14T16:45:00',
        items: 5
      },
      {
        id: 'ORD-004',
        customer: 'Emily Davis',
        email: 'emily.d@email.com',
        amount: 89.99,
        status: 'completed',
        date: '2024-01-14T14:20:00',
        items: 1
      },
      {
        id: 'ORD-005',
        customer: 'David Wilson',
        email: 'david.w@email.com',
        amount: 425.00,
        status: 'cancelled',
        date: '2024-01-13T11:00:00',
        items: 4
      }
    ],
    topProducts: [
      { name: 'Premium Headphones', sales: 145, revenue: 14500, trend: 'up' },
      { name: 'Wireless Mouse', sales: 234, revenue: 4680, trend: 'up' },
      { name: 'Mechanical Keyboard', sales: 98, revenue: 9800, trend: 'down' },
      { name: 'USB-C Hub', sales: 167, revenue: 5010, trend: 'up' },
      { name: 'Monitor Stand', sales: 89, revenue: 2670, trend: 'down' }
    ],
    recentCustomers: [
      {
        id: 1,
        name: 'Alice Wonderland',
        email: 'alice@example.com',
        phone: '+1 234-567-8901',
        location: 'New York, NY',
        totalSpent: 12450,
        lastOrder: '2024-01-15',
        status: 'active'
      },
      {
        id: 2,
        name: 'Bob Marley',
        email: 'bob@example.com',
        phone: '+1 234-567-8902',
        location: 'Los Angeles, CA',
        totalSpent: 8750,
        lastOrder: '2024-01-14',
        status: 'active'
      },
      {
        id: 3,
        name: 'Charlie Chaplin',
        email: 'charlie@example.com',
        phone: '+1 234-567-8903',
        location: 'Chicago, IL',
        totalSpent: 3200,
        lastOrder: '2024-01-10',
        status: 'inactive'
      }
    ]
  }

  const getStatusColor = (status: string) => {
    const colors = {
      completed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
      shipped: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
    }
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'completed': return <CheckCircle className="w-4 h-4" />
      case 'pending': return <Clock className="w-4 h-4" />
      case 'shipped': return <Package className="w-4 h-4" />
      case 'cancelled': return <XCircle className="w-4 h-4" />
      default: return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Sales Dashboard
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Welcome back, Sarah! Here's your sales overview for today.
              </p>
            </div>
            <div className="flex gap-3">
              <button className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 flex items-center gap-2">
                <Download className="w-4 h-4" />
                Export Report
              </button>
              <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all duration-200 flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Filter
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Revenue */}
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6 hover:shadow-md transition-shadow duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <DollarSign className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <span className={`text-sm font-medium flex items-center gap-1 ${salesData.metrics.revenueChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {salesData.metrics.revenueChange >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {Math.abs(salesData.metrics.revenueChange)}%
              </span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
              ${salesData.metrics.totalRevenue.toLocaleString()}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Total Revenue</p>
          </div>

          {/* Total Orders */}
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6 hover:shadow-md transition-shadow duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <ShoppingCart className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <span className={`text-sm font-medium flex items-center gap-1 ${salesData.metrics.ordersChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {salesData.metrics.ordersChange >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {Math.abs(salesData.metrics.ordersChange)}%
              </span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
              {salesData.metrics.totalOrders}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Total Orders</p>
          </div>

          {/* Total Customers */}
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6 hover:shadow-md transition-shadow duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <span className={`text-sm font-medium flex items-center gap-1 ${salesData.metrics.customersChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {salesData.metrics.customersChange >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {Math.abs(salesData.metrics.customersChange)}%
              </span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
              {salesData.metrics.totalCustomers}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Active Customers</p>
          </div>

          {/* Conversion Rate */}
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6 hover:shadow-md transition-shadow duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                <TrendingUp className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
              <span className={`text-sm font-medium flex items-center gap-1 ${salesData.metrics.conversionChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {salesData.metrics.conversionChange >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {Math.abs(salesData.metrics.conversionChange)}%
              </span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
              {salesData.metrics.conversionRate}%
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Conversion Rate</p>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Recent Orders - Takes 2/3 of space */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800">
              <div className="p-6 border-b border-gray-200 dark:border-gray-800">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Recent Orders
                  </h2>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search orders..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9 pr-4 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-800/50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Order ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Customer</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                    {salesData.recentOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors duration-200">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                          {order.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                          {order.customer}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-white">
                          ${order.amount.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                            {getStatusIcon(order.status)}
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                          {new Date(order.date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <button className="text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium">
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="p-4 border-t border-gray-200 dark:border-gray-800">
                <button className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium">
                  View All Orders →
                </button>
              </div>
            </div>
          </div>

          {/* Top Products */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800">
              <div className="p-6 border-b border-gray-200 dark:border-gray-800">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Top Products
                </h2>
              </div>
              <div className="p-6 space-y-4">
                {salesData.topProducts.map((product, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {product.name}
                        </p>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-gray-900 dark:text-white">
                            ${product.revenue.toLocaleString()}
                          </span>
                          {product.trend === 'up' ? (
                            <ArrowUpRight className="w-4 h-4 text-green-500" />
                          ) : (
                            <ArrowDownRight className="w-4 h-4 text-red-500" />
                          )}
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                        <span>{product.sales} units sold</span>
                        <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                          <div 
                            className="bg-blue-600 h-1.5 rounded-full" 
                            style={{ width: `${(product.sales / 234) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Recent Customers Section */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800">
          <div className="p-6 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Recent Customers
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Customers who made purchases in the last 30 days
                </p>
              </div>
              <button className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium">
                View All
              </button>
            </div>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-800">
            {salesData.recentCustomers.map((customer) => (
              <div key={customer.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors duration-200">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                        {customer.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {customer.name}
                        </h3>
                        <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                          <span className="flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {customer.email}
                          </span>
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {customer.phone}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm">
                      <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                        <MapPin className="w-3 h-3" />
                        {customer.location}
                      </div>
                      <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                        <DollarSign className="w-3 h-3" />
                        ${customer.totalSpent.toLocaleString()} spent
                      </div>
                      <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                        <Calendar className="w-3 h-3" />
                        Last order: {new Date(customer.lastOrder).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                      customer.status === 'active' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
                    }`}>
                      {customer.status}
                    </span>
                    <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                      <MoreVertical className="w-4 h-4 text-gray-500" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions Bar */}
        <div className="fixed bottom-8 right-8 flex gap-3">
          <button className="p-3 bg-white dark:bg-gray-900 rounded-full shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-200 hover:scale-105">
            <Phone className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          </button>
          <button className="p-3 bg-blue-600 rounded-full shadow-lg hover:bg-blue-700 transition-all duration-200 hover:scale-105">
            <Star className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>
    </div>
  )
}