'use client'

import { useState, useEffect } from 'react'
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
  MoreVertical,
  Plus,
  Edit,
  Trash2,
  FileText,
  Send,
  Printer,
  Eye,
  AlertCircle,
  CreditCard,
  Smartphone,
  Home,
  UserPlus,
  Settings,
  LogOut,
  Menu,
  X,
  LayoutDashboard,
  ShoppingBag,
  FileSpreadsheet,
  Receipt,
  Users2,
  TicketCheck,
  Truck,
  ChevronLeft,
  ChevronRight,
  PieChart,
  LineChart,
  BarChart,
  Activity,
  Target,
  Award,
  TrendingDown,
  RefreshCw,
  Save,
  XCircle as XCircleIcon,
  Check,
  Minus,
  Plus as PlusIcon,
  Trash,
  Edit3,
  Copy,
  ExternalLink,
  Grid,
  List,
  Filter as FilterIcon,
  Calendar as CalendarIcon,
  Download as DownloadIcon
} from 'lucide-react'

// ==================== TYPES ====================
interface Customer {
  id: string
  name: string
  email: string
  phone: string
  location: string
  totalSpent: number
  lastOrder: string
  status: 'active' | 'inactive'
  createdAt: string
  notes?: string
  avatar?: string
}

interface Product {
  id: string
  name: string
  price: number
  category: string
  stock: number
  sku: string
  description?: string
  image?: string
}

interface QuotationItem {
  productId: string
  name: string
  qty: number
  price: number
  total: number
  customPrice?: boolean
}

interface Quotation {
  id: string
  quoteNumber: string
  customerId: string
  customerName: string
  customerEmail: string
  customerPhone: string
  items: QuotationItem[]
  subtotal: number
  tax: number
  taxRate: number
  discount: number
  discountType?: 'percentage' | 'fixed'
  discountReason?: string
  total: number
  status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired' | 'converted'
  createdAt: string
  validUntil: string
  notes?: string
  terms?: string
  createdBy: string
  createdByName: string
}

interface Transaction {
  id: string
  transactionId: string
  orderId: string
  quoteId?: string
  customerId: string
  customerName: string
  amount: number
  paymentMethod: 'mpesa' | 'cash' | 'card' | 'bank'
  status: 'pending' | 'completed' | 'failed' | 'refunded'
  reference?: string
  mpesaReceipt?: string
  cardLast4?: string
  bankReference?: string
  createdAt: string
  notes?: string
  recordedBy: string
  recordedByName: string
}

interface Order {
  id: string
  orderNumber: string
  quoteId?: string
  customerId: string
  customerName: string
  items: QuotationItem[]
  subtotal: number
  tax: number
  discount: number
  total: number
  status: 'pending' | 'processing' | 'paid' | 'shipped' | 'delivered' | 'cancelled'
  paymentMethod: 'mpesa' | 'cash' | 'card' | 'bank'
  paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded'
  shippingAddress: {
    fullName: string
    address: string
    city: string
    phone: string
    email?: string
  }
  createdAt: string
  deliveredAt?: string
  notes?: string
  trackingNumber?: string
  createdBy: string
}

interface SalesAnalytics {
  daily: { date: string; revenue: number; orders: number }[]
  weekly: { week: string; revenue: number; orders: number }[]
  monthly: { month: string; revenue: number; orders: number }[]
  yearly: { year: string; revenue: number; orders: number }[]
  topProducts: { name: string; revenue: number; quantity: number }[]
  topCustomers: { name: string; revenue: number; orders: number }[]
  conversionRate: number
  averageOrderValue: number
  projectedRevenue: number
  growthRate: number
  salesByCategory: { category: string; revenue: number; percentage: number }[]
  paymentMethodBreakdown: { method: string; revenue: number; count: number }[]
  statusBreakdown: { status: string; count: number; revenue: number }[]
}

interface SalesRepPerformance {
  id: string
  name: string
  revenue: number
  orders: number
  quotes: number
  conversionRate: number
  avatar?: string
}

// ==================== MOCK DATA ====================
const mockCustomers: Customer[] = [
  { id: 'CUST-001', name: 'John Smith', email: 'john.smith@email.com', phone: '+254712345678', location: 'Nairobi, Kenya', totalSpent: 124500, lastOrder: '2024-01-15', status: 'active', createdAt: '2023-06-10', notes: 'VIP customer - prefers solar products' },
  { id: 'CUST-002', name: 'Sarah Johnson', email: 'sarah.j@email.com', phone: '+254723456789', location: 'Mombasa, Kenya', totalSpent: 87500, lastOrder: '2024-01-14', status: 'active', createdAt: '2023-08-15' },
  { id: 'CUST-003', name: 'Michael Brown', email: 'michael.b@email.com', phone: '+254734567890', location: 'Kisumu, Kenya', totalSpent: 32000, lastOrder: '2024-01-10', status: 'inactive', createdAt: '2023-10-20' },
  { id: 'CUST-004', name: 'Emily Davis', email: 'emily.d@email.com', phone: '+254745678901', location: 'Nakuru, Kenya', totalSpent: 56000, lastOrder: '2024-01-12', status: 'active', createdAt: '2023-09-05' },
  { id: 'CUST-005', name: 'David Wilson', email: 'david.w@email.com', phone: '+254756789012', location: 'Eldoret, Kenya', totalSpent: 98000, lastOrder: '2024-01-13', status: 'active', createdAt: '2023-07-18' },
  { id: 'CUST-006', name: 'Alice Wonderland', email: 'alice@example.com', phone: '+254767890123', location: 'Nyeri, Kenya', totalSpent: 45000, lastOrder: '2024-01-09', status: 'active', createdAt: '2023-11-20' },
  { id: 'CUST-007', name: 'Bob Marley', email: 'bob@example.com', phone: '+254778901234', location: 'Nairobi, Kenya', totalSpent: 150000, lastOrder: '2024-01-16', status: 'active', createdAt: '2023-05-15' }
]

const mockProducts: Product[] = [
  { id: 'PROD-001', name: 'Solar Panel 300W Monocrystalline', price: 12500, category: 'Solar', stock: 45, sku: 'SOL-300', description: 'High-efficiency monocrystalline solar panel' },
  { id: 'PROD-002', name: 'Borehole Pump 2HP Submersible', price: 38500, category: 'Drilling', stock: 12, sku: 'DRL-2HP', description: 'Heavy-duty submersible pump for deep boreholes' },
  { id: 'PROD-003', name: 'Inverter 5KW Hybrid', price: 28500, category: 'Solar', stock: 23, sku: 'INV-5K', description: 'Pure sine wave hybrid inverter' },
  { id: 'PROD-004', name: 'Battery 200Ah Deep Cycle', price: 18500, category: 'Solar', stock: 18, sku: 'BAT-200', description: 'Deep cycle gel battery' },
  { id: 'PROD-005', name: 'PVC Pipe 6" Schedule 40', price: 850, category: 'Drilling', stock: 200, sku: 'PVC-6', description: 'High-pressure PVC pipe' },
  { id: 'PROD-006', name: 'Solar Water Heater 200L', price: 45000, category: 'Solar', stock: 8, sku: 'SWH-200', description: 'Complete solar water heating system' },
  { id: 'PROD-007', name: 'Control Panel for Borehole', price: 12500, category: 'Drilling', stock: 15, sku: 'CTL-BH', description: 'Automatic pump control panel' }
]

// Current user
const currentUser = { id: 'SALES-001', name: 'Sarah Admin', role: 'admin', avatar: 'SA' }

// ==================== MAIN COMPONENT ====================
export default function SalesDashboard() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'customers' | 'quotations' | 'transactions' | 'orders' | 'analytics'>('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [dateRange, setDateRange] = useState<'week' | 'month' | 'quarter' | 'year'>('month')
  
  // Modal states
  const [showCustomerModal, setShowCustomerModal] = useState(false)
  const [showQuoteModal, setShowQuoteModal] = useState(false)
  const [showTransactionModal, setShowTransactionModal] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null)
  const [editingQuote, setEditingQuote] = useState<Quotation | null>(null)
  
  // Data states
  const [customers, setCustomers] = useState<Customer[]>(mockCustomers)
  const [products, setProducts] = useState<Product[]>(mockProducts)
  const [quotations, setQuotations] = useState<Quotation[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [salesReps, setSalesReps] = useState<SalesRepPerformance[]>([
    { id: 'SALES-001', name: 'Sarah Admin', revenue: 450000, orders: 45, quotes: 52, conversionRate: 86.5 },
    { id: 'SALES-002', name: 'John Sales', revenue: 320000, orders: 38, quotes: 44, conversionRate: 86.4 }
  ])
  
  // Current user role
  const [userRole, setUserRole] = useState<'admin' | 'sales'>('admin')
  
  // Analytics data
  const [analytics, setAnalytics] = useState<SalesAnalytics | null>(null)

  // Initialize mock data
  useEffect(() => {
    // Generate sample quotations
    const sampleQuotations: Quotation[] = [
      {
        id: 'QUOTE-001', quoteNumber: 'QT-2024-001', customerId: 'CUST-001', customerName: 'John Smith',
        customerEmail: 'john.smith@email.com', customerPhone: '+254712345678',
        items: [
          { productId: 'PROD-001', name: 'Solar Panel 300W Monocrystalline', qty: 4, price: 12500, total: 50000 },
          { productId: 'PROD-003', name: 'Inverter 5KW Hybrid', qty: 1, price: 28500, total: 28500 }
        ],
        subtotal: 78500, tax: 12560, taxRate: 0.16, discount: 5000, total: 86060,
        status: 'sent', createdAt: '2024-01-10', validUntil: '2024-02-10',
        notes: 'Installation included', createdBy: currentUser.id, createdByName: currentUser.name
      },
      {
        id: 'QUOTE-002', quoteNumber: 'QT-2024-002', customerId: 'CUST-002', customerName: 'Sarah Johnson',
        customerEmail: 'sarah.j@email.com', customerPhone: '+254723456789',
        items: [
          { productId: 'PROD-002', name: 'Borehole Pump 2HP Submersible', qty: 1, price: 38500, total: 38500 },
          { productId: 'PROD-005', name: 'PVC Pipe 6" Schedule 40', qty: 50, price: 850, total: 42500 }
        ],
        subtotal: 81000, tax: 12960, taxRate: 0.16, discount: 0, total: 93960,
        status: 'accepted', createdAt: '2024-01-08', validUntil: '2024-02-08',
        createdBy: currentUser.id, createdByName: currentUser.name
      },
      {
        id: 'QUOTE-003', quoteNumber: 'QT-2024-003', customerId: 'CUST-004', customerName: 'Emily Davis',
        customerEmail: 'emily.d@email.com', customerPhone: '+254745678901',
        items: [
          { productId: 'PROD-006', name: 'Solar Water Heater 200L', qty: 1, price: 45000, total: 45000 },
          { productId: 'PROD-004', name: 'Battery 200Ah Deep Cycle', qty: 2, price: 18500, total: 37000 }
        ],
        subtotal: 82000, tax: 13120, taxRate: 0.16, discount: 0, total: 95120,
        status: 'draft', createdAt: '2024-01-12', validUntil: '2024-02-12',
        createdBy: currentUser.id, createdByName: currentUser.name
      }
    ]
    setQuotations(sampleQuotations)
    
    // Generate sample transactions
    const sampleTransactions: Transaction[] = [
      { id: 'TXN-001', transactionId: 'MPESA-123456', orderId: 'ORD-001', quoteId: 'QUOTE-001', customerId: 'CUST-001', customerName: 'John Smith', amount: 86060, paymentMethod: 'mpesa', status: 'completed', reference: 'QWE123XYZ', mpesaReceipt: 'MPESA-RCPT-001', createdAt: '2024-01-15', recordedBy: currentUser.id, recordedByName: currentUser.name },
      { id: 'TXN-002', transactionId: 'TXN-789012', orderId: 'ORD-002', quoteId: 'QUOTE-002', customerId: 'CUST-002', customerName: 'Sarah Johnson', amount: 93960, paymentMethod: 'bank', status: 'completed', reference: 'TRF-789012', bankReference: 'BANK-REF-001', createdAt: '2024-01-14', recordedBy: currentUser.id, recordedByName: currentUser.name }
    ]
    setTransactions(sampleTransactions)
    
    // Generate sample orders
    const sampleOrders: Order[] = [
      {
        id: 'ORD-001', orderNumber: 'ORD-2024-001', quoteId: 'QUOTE-001', customerId: 'CUST-001', customerName: 'John Smith',
        items: [
          { productId: 'PROD-001', name: 'Solar Panel 300W Monocrystalline', qty: 4, price: 12500, total: 50000 },
          { productId: 'PROD-003', name: 'Inverter 5KW Hybrid', qty: 1, price: 28500, total: 28500 }
        ],
        subtotal: 78500, tax: 12560, discount: 5000, total: 86060,
        status: 'delivered', paymentMethod: 'mpesa', paymentStatus: 'completed',
        shippingAddress: { fullName: 'John Smith', address: '123 Main St', city: 'Nairobi', phone: '+254712345678', email: 'john@email.com' },
        createdAt: '2024-01-15', deliveredAt: '2024-01-20', createdBy: currentUser.id
      }
    ]
    setOrders(sampleOrders)
    
    // Generate analytics
    generateAnalytics(sampleTransactions, sampleOrders, sampleQuotations)
  }, [])
  
  const generateAnalytics = (transactions: Transaction[], orders: Order[], quotations: Quotation[]) => {
    const completedTransactions = transactions.filter(t => t.status === 'completed')
    const totalRevenue = completedTransactions.reduce((sum, t) => sum + t.amount, 0)
    const totalOrders = orders.length
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0
    
    // Generate daily data for last 30 days
    const daily = []
    for (let i = 29; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      const dayRevenue = completedTransactions.filter(t => t.createdAt === dateStr).reduce((sum, t) => sum + t.amount, 0)
      const dayOrders = orders.filter(o => o.createdAt === dateStr).length
      daily.push({ date: dateStr, revenue: dayRevenue, orders: dayOrders })
    }
    
    // Top products
    const productRevenue = new Map<string, { revenue: number; quantity: number }>()
    orders.forEach(order => {
      order.items.forEach(item => {
        const existing = productRevenue.get(item.name) || { revenue: 0, quantity: 0 }
        productRevenue.set(item.name, {
          revenue: existing.revenue + item.total,
          quantity: existing.quantity + item.qty
        })
      })
    })
    const topProducts = Array.from(productRevenue.entries()).map(([name, data]) => ({
      name, revenue: data.revenue, quantity: data.quantity
    })).sort((a, b) => b.revenue - a.revenue).slice(0, 5)
    
    // Top customers
    const customerRevenue = new Map<string, { revenue: number; orders: number }>()
    orders.forEach(order => {
      const existing = customerRevenue.get(order.customerName) || { revenue: 0, orders: 0 }
      customerRevenue.set(order.customerName, {
        revenue: existing.revenue + order.total,
        orders: existing.orders + 1
      })
    })
    const topCustomers = Array.from(customerRevenue.entries()).map(([name, data]) => ({
      name, revenue: data.revenue, orders: data.orders
    })).sort((a, b) => b.revenue - a.revenue).slice(0, 5)
    
    // Sales by category
    const categoryRevenue = new Map<string, number>()
    orders.forEach(order => {
      order.items.forEach(item => {
        const product = mockProducts.find(p => p.name === item.name)
        if (product) {
          const existing = categoryRevenue.get(product.category) || 0
          categoryRevenue.set(product.category, existing + item.total)
        }
      })
    })
    const salesByCategory = Array.from(categoryRevenue.entries()).map(([category, revenue]) => ({
      category, revenue, percentage: (revenue / totalRevenue) * 100
    }))
    
    // Payment method breakdown
    const paymentMethodData = new Map<string, { revenue: number; count: number }>()
    completedTransactions.forEach(t => {
      const existing = paymentMethodData.get(t.paymentMethod) || { revenue: 0, count: 0 }
      paymentMethodData.set(t.paymentMethod, {
        revenue: existing.revenue + t.amount,
        count: existing.count + 1
      })
    })
    const paymentMethodBreakdown = Array.from(paymentMethodData.entries()).map(([method, data]) => ({
      method: method as any, revenue: data.revenue, count: data.count
    }))
    
    // Status breakdown
    const statusData = new Map<string, { count: number; revenue: number }>()
    orders.forEach(order => {
      const existing = statusData.get(order.status) || { count: 0, revenue: 0 }
      statusData.set(order.status, {
        count: existing.count + 1,
        revenue: existing.revenue + order.total
      })
    })
    const statusBreakdown = Array.from(statusData.entries()).map(([status, data]) => ({
      status, count: data.count, revenue: data.revenue
    }))
    
    // Quote to order conversion rate
    const convertedQuotes = quotations.filter(q => q.status === 'accepted' || q.status === 'converted').length
    const conversionRate = quotations.length > 0 ? (convertedQuotes / quotations.length) * 100 : 0
    
    setAnalytics({
      daily, weekly: [], monthly: [], yearly: [],
      topProducts, topCustomers, conversionRate, averageOrderValue,
      projectedRevenue: totalRevenue * 1.15, growthRate: 12.5,
      salesByCategory, paymentMethodBreakdown, statusBreakdown
    })
  }
  
  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      active: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      inactive: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400',
      completed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
      failed: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
      refunded: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
      sent: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      accepted: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      rejected: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
      expired: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400',
      draft: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
      converted: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
      paid: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      shipped: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      delivered: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
      cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
      processing: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400'
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }
  
  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, role: ['admin', 'sales'] },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, role: ['admin'] },
    { id: 'customers', label: 'Customers', icon: Users2, role: ['admin', 'sales'] },
    { id: 'quotations', label: 'Quotations', icon: FileSpreadsheet, role: ['admin', 'sales'] },
    { id: 'orders', label: 'Orders', icon: ShoppingBag, role: ['admin', 'sales'] },
    { id: 'transactions', label: 'Transactions', icon: Receipt, role: ['admin'] }
  ]
  
  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone.includes(searchTerm)
  )
  
  // Calculate metrics
  const completedTransactions = transactions.filter(t => t.status === 'completed')
  const totalRevenue = completedTransactions.reduce((sum, t) => sum + t.amount, 0)
  const pendingQuotes = quotations.filter(q => q.status === 'sent').length
  const activeCustomers = customers.filter(c => c.status === 'active').length
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900">
      {/* Sidebar */}
      <aside className={`fixed left-0 top-0 h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transition-all duration-300 z-30 ${sidebarOpen ? 'w-64' : 'w-20'}`}>
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
            {sidebarOpen ? (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold text-gray-900 dark:text-white">SalesHub Pro</span>
              </div>
            ) : (
              <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center mx-auto">
                <DollarSign className="w-4 h-4 text-white" />
              </div>
            )}
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
              {sidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
          </div>
          
          <nav className="flex-1 p-4 space-y-1">
            {sidebarItems.filter(item => item.role.includes(userRole)).map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                  activeTab === item.id
                    ? 'bg-cyan-50 dark:bg-cyan-900/20 text-cyan-600 dark:text-cyan-400'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <item.icon className="w-5 h-5" />
                {sidebarOpen && <span className="text-sm font-medium">{item.label}</span>}
              </button>
            ))}
          </nav>
          
          <div className="p-4 border-t border-gray-200 dark:border-gray-800">
            <div className={`flex items-center gap-3 ${!sidebarOpen && 'justify-center'}`}>
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                {currentUser.avatar}
              </div>
              {sidebarOpen && (
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{currentUser.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{userRole}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </aside>
      
      {/* Main Content */}
      <main className={`transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
        <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-20">
          <div className="px-6 py-4 flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white capitalize">{activeTab}</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {activeTab === 'dashboard' && 'Welcome back! Here\'s your sales overview'}
                {activeTab === 'analytics' && 'Deep dive into your sales performance'}
                {activeTab === 'customers' && 'Manage your customer relationships'}
                {activeTab === 'quotations' && 'Create and manage quotes with custom pricing'}
                {activeTab === 'orders' && 'Monitor and manage orders'}
                {activeTab === 'transactions' && 'Track all financial transactions'}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 pr-4 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent w-64"
                />
              </div>
              <button
                onClick={() => userRole === 'admin' ? setUserRole('sales') : setUserRole('admin')}
                className="px-3 py-2 text-sm bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                Switch to {userRole === 'admin' ? 'Sales' : 'Admin'}
              </button>
            </div>
          </div>
        </header>
        
        <div className="p-6">
          {/* Dashboard View */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                      <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
                    </div>
                    <span className="text-sm font-medium text-green-600 flex items-center gap-1">
                      <ArrowUpRight className="w-3 h-3" /> 12.5%
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                    KES {totalRevenue.toLocaleString()}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Total Revenue</p>
                </div>
                
                <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                      <ShoppingCart className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <span className="text-sm font-medium text-green-600 flex items-center gap-1">
                      <ArrowUpRight className="w-3 h-3" /> 8.3%
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{orders.length}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Total Orders</p>
                </div>
                
                <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                      <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <span className="text-sm font-medium text-green-600 flex items-center gap-1">
                      <ArrowUpRight className="w-3 h-3" /> 15.2%
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{activeCustomers}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Active Customers</p>
                </div>
                
                <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                      <FileSpreadsheet className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                    </div>
                    <span className="text-sm font-medium text-green-600 flex items-center gap-1">
                      <ArrowUpRight className="w-3 h-3" /> 5.1%
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{pendingQuotes}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Pending Quotes</p>
                </div>
                
                <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                      <TrendingUp className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <span className="text-sm font-medium text-green-600 flex items-center gap-1">
                      <ArrowUpRight className="w-3 h-3" /> 86.5%
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{analytics?.conversionRate.toFixed(1)}%</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Conversion Rate</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800">
                  <div className="p-6 border-b border-gray-200 dark:border-gray-800">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Orders</h2>
                  </div>
                  <div className="divide-y divide-gray-200 dark:divide-gray-800">
                    {orders.slice(0, 3).map((order) => (
                      <div key={order.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">{order.orderNumber}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{order.customerName}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-gray-900 dark:text-white">KES {order.total.toLocaleString()}</p>
                            <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                              {order.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800">
                  <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Customers</h2>
                    <button onClick={() => setShowCustomerModal(true)} className="text-sm text-cyan-600 hover:text-cyan-700">
                      <UserPlus className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="divide-y divide-gray-200 dark:divide-gray-800">
                    {customers.slice(0, 3).map((customer) => (
                      <div key={customer.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">{customer.name}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{customer.email}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-gray-900 dark:text-white">KES {customer.totalSpent.toLocaleString()}</p>
                            <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(customer.status)}`}>
                              {customer.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Analytics View - Admin Only */}
          {activeTab === 'analytics' && userRole === 'admin' && analytics && (
            <div className="space-y-6">
              {/* Performance Overview */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                      <Target className="w-5 h-5 text-blue-600" />
                    </div>
                    <span className="text-sm text-gray-500">Average Order Value</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">KES {analytics.averageOrderValue.toLocaleString()}</p>
                </div>
                
                <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                      <Activity className="w-5 h-5 text-green-600" />
                    </div>
                    <span className="text-sm text-gray-500">Conversion Rate</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{analytics.conversionRate.toFixed(1)}%</p>
                </div>
                
                <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                      <TrendingUp className="w-5 h-5 text-purple-600" />
                    </div>
                    <span className="text-sm text-gray-500">Growth Rate</span>
                  </div>
                  <p className="text-2xl font-bold text-green-600">+{analytics.growthRate}%</p>
                </div>
                
                <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                      <Award className="w-5 h-5 text-orange-600" />
                    </div>
                    <span className="text-sm text-gray-500">Projected Revenue</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">KES {analytics.projectedRevenue.toLocaleString()}</p>
                </div>
              </div>
              
              {/* Charts Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Products */}
                <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800">
                  <div className="p-6 border-b border-gray-200 dark:border-gray-800">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Top Performing Products</h2>
                  </div>
                  <div className="p-6 space-y-4">
                    {analytics.topProducts.map((product, idx) => (
                      <div key={idx} className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{product.name}</p>
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">KES {product.revenue.toLocaleString()}</p>
                          </div>
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <span>{product.quantity} units sold</span>
                            <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                              <div className="bg-cyan-600 h-1.5 rounded-full" style={{ width: `${(product.revenue / analytics.topProducts[0].revenue) * 100}%` }} />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Sales by Category */}
                <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800">
                  <div className="p-6 border-b border-gray-200 dark:border-gray-800">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Sales by Category</h2>
                  </div>
                  <div className="p-6 space-y-4">
                    {analytics.salesByCategory.map((category, idx) => (
                      <div key={idx}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-gray-700 dark:text-gray-300">{category.category}</span>
                          <span className="text-sm font-semibold text-gray-900 dark:text-white">{category.percentage.toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div className="bg-gradient-to-r from-cyan-500 to-blue-600 h-2 rounded-full" style={{ width: `${category.percentage}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Payment Method Breakdown */}
                <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800">
                  <div className="p-6 border-b border-gray-200 dark:border-gray-800">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Payment Methods</h2>
                  </div>
                  <div className="p-6 space-y-4">
                    {analytics.paymentMethodBreakdown.map((method, idx) => (
                      <div key={idx} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {method.method === 'mpesa' && <Smartphone className="w-4 h-4 text-green-600" />}
                          {method.method === 'cash' && <DollarSign className="w-4 h-4 text-green-600" />}
                          {method.method === 'card' && <CreditCard className="w-4 h-4 text-blue-600" />}
                          {method.method === 'bank' && <Home className="w-4 h-4 text-purple-600" />}
                          <span className="text-sm capitalize text-gray-700 dark:text-gray-300">{method.method}</span>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">KES {method.revenue.toLocaleString()}</p>
                          <p className="text-xs text-gray-500">{method.count} transactions</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Top Customers */}
                <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800">
                  <div className="p-6 border-b border-gray-200 dark:border-gray-800">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Top Customers</h2>
                  </div>
                  <div className="divide-y divide-gray-200 dark:divide-gray-800">
                    {analytics.topCustomers.map((customer, idx) => (
                      <div key={idx} className="p-4 flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{customer.name}</p>
                          <p className="text-xs text-gray-500">{customer.orders} orders</p>
                        </div>
                        <p className="font-semibold text-gray-900 dark:text-white">KES {customer.revenue.toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Sales Rep Performance */}
              <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800">
                <div className="p-6 border-b border-gray-200 dark:border-gray-800">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Sales Representative Performance</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-800/50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Sales Rep</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Revenue</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Orders</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Quotes</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Conversion</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                      {salesReps.map((rep) => (
                        <tr key={rep.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                                {rep.name.charAt(0)}{rep.name.split(' ')[1]?.charAt(0)}
                              </div>
                              <span className="font-medium text-gray-900 dark:text-white">{rep.name}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 font-semibold text-gray-900">KES {rep.revenue.toLocaleString()}</td>
                          <td className="px-6 py-4 text-gray-600">{rep.orders}</td>
                          <td className="px-6 py-4 text-gray-600">{rep.quotes}</td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-green-600">{rep.conversionRate}%</span>
                              <div className="w-16 bg-gray-200 rounded-full h-1.5">
                                <div className="bg-green-500 h-1.5 rounded-full" style={{ width: `${rep.conversionRate}%` }} />
                              </div>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
          
          {/* Customers View */}
          {activeTab === 'customers' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <button
                  onClick={() => { setEditingCustomer(null); setShowCustomerModal(true); }}
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-medium flex items-center gap-2 transition-colors"
                >
                  <UserPlus className="w-4 h-4" />
                  Add Customer
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCustomers.map((customer) => (
                  <div key={customer.id} className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6 hover:shadow-md transition-all duration-300">
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                        {customer.name.charAt(0)}
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(customer.status)}`}>
                        {customer.status}
                      </span>
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-white text-lg mb-1">{customer.name}</h3>
                    <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-2"><Mail className="w-3 h-3" /><span>{customer.email}</span></div>
                      <div className="flex items-center gap-2"><Phone className="w-3 h-3" /><span>{customer.phone}</span></div>
                      <div className="flex items-center gap-2"><MapPin className="w-3 h-3" /><span>{customer.location}</span></div>
                      <div className="flex items-center gap-2"><DollarSign className="w-3 h-3" /><span>KES {customer.totalSpent.toLocaleString()} spent</span></div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-800 flex gap-2">
                      <button onClick={() => { setEditingCustomer(customer); setShowCustomerModal(true); }} className="flex-1 px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 transition-colors">
                        <Edit className="w-4 h-4 inline mr-1" /> Edit
                      </button>
                      <button onClick={() => { setEditingQuote(null); setShowQuoteModal(true); }} className="flex-1 px-3 py-1.5 text-sm bg-cyan-50 dark:bg-cyan-900/20 text-cyan-600 rounded-lg hover:bg-cyan-100 transition-colors">
                        <FileText className="w-4 h-4 inline mr-1" /> Quote
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Quotations View */}
          {activeTab === 'quotations' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <button onClick={() => { setEditingQuote(null); setShowQuoteModal(true); }} className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-medium flex items-center gap-2 transition-colors">
                  <Plus className="w-4 h-4" /> Create Quotation
                </button>
              </div>
              
              <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-800/50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Quote #</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Customer</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Valid Until</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                    {quotations.map((quote) => (
                      <tr key={quote.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{quote.quoteNumber}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{quote.customerName}</td>
                        <td className="px-6 py-4 text-sm font-semibold text-gray-900">KES {quote.total.toLocaleString()}</td>
                        <td className="px-6 py-4"><span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(quote.status)}`}>{quote.status}</span></td>
                        <td className="px-6 py-4 text-sm text-gray-600">{new Date(quote.validUntil).toLocaleDateString()}</td>
                        <td className="px-6 py-4"><div className="flex gap-2"><button className="p-1 hover:bg-gray-100 rounded"><Eye className="w-4 h-4 text-gray-500" /></button><button className="p-1 hover:bg-gray-100 rounded"><Printer className="w-4 h-4 text-gray-500" /></button><button className="p-1 hover:bg-gray-100 rounded"><Send className="w-4 h-4 text-gray-500" /></button></div></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          
          {/* Orders View */}
          {activeTab === 'orders' && (
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Order #</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Items</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Total</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Payment</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{order.orderNumber}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{order.customerName}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{order.items.length} items</td>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900">KES {order.total.toLocaleString()}</td>
                      <td className="px-6 py-4"><span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>{order.status}</span></td>
                      <td className="px-6 py-4"><span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.paymentStatus)}`}>{order.paymentStatus}</span></td>
                      <td className="px-6 py-4"><div className="flex gap-2"><button className="p-1 hover:bg-gray-100 rounded"><Eye className="w-4 h-4 text-gray-500" /></button><button className="p-1 hover:bg-gray-100 rounded"><Truck className="w-4 h-4 text-gray-500" /></button></div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          {/* Transactions View - Admin Only */}
          {activeTab === 'transactions' && userRole === 'admin' && (
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Transaction ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Method</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                  {transactions.map((transaction) => (
                    <tr key={transaction.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="px-6 py-4 text-sm font-mono text-gray-900">{transaction.transactionId}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{transaction.customerName}</td>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900">KES {transaction.amount.toLocaleString()}</td>
                      <td className="px-6 py-4 text-sm text-gray-600 capitalize">{transaction.paymentMethod}</td>
                      <td className="px-6 py-4"><span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>{transaction.status}</span></td>
                      <td className="px-6 py-4 text-sm text-gray-600">{new Date(transaction.createdAt).toLocaleDateString()}</td>
                      <td className="px-6 py-4"><button className="p-1 hover:bg-gray-100 rounded"><Receipt className="w-4 h-4 text-gray-500" /></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
      
      {/* Customer Modal */}
      {showCustomerModal && (
        <CustomerModal
          customer={editingCustomer}
          onClose={() => setShowCustomerModal(false)}
          onSave={(customer) => {
            if (editingCustomer) {
              setCustomers(customers.map(c => c.id === customer.id ? customer : c))
            } else {
              setCustomers([...customers, { ...customer, id: `CUST-${String(customers.length + 1).padStart(3, '0')}`, createdAt: new Date().toISOString().split('T')[0], totalSpent: 0 }])
            }
            setShowCustomerModal(false)
          }}
        />
      )}
      
      {/* Quotation Modal */}
      {showQuoteModal && (
        <QuotationModal
          quote={editingQuote}
          customers={customers}
          products={products}
          onClose={() => setShowQuoteModal(false)}
          onSave={(quote) => {
            if (editingQuote) {
              setQuotations(quotations.map(q => q.id === quote.id ? quote : q))
            } else {
              setQuotations([...quotations, { ...quote, id: `QUOTE-${String(quotations.length + 1).padStart(3, '0')}`, quoteNumber: `QT-2024-${String(quotations.length + 1).padStart(3, '0')}`, createdAt: new Date().toISOString().split('T')[0], validUntil: new Date(Date.now() + 30*24*60*60*1000).toISOString().split('T')[0], createdBy: currentUser.id, createdByName: currentUser.name }])
            }
            setShowQuoteModal(false)
          }}
        />
      )}
    </div>
  )
}

// ==================== CUSTOMER MODAL ====================
function CustomerModal({ customer, onClose, onSave }: { customer: Customer | null; onClose: () => void; onSave: (customer: Customer) => void }) {
  const [formData, setFormData] = useState<Partial<Customer>>(customer || {
    name: '', email: '', phone: '', location: '', status: 'active', notes: ''
  })
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({ ...formData, id: customer?.id || '', totalSpent: customer?.totalSpent || 0, lastOrder: customer?.lastOrder || '', createdAt: customer?.createdAt || '' } as Customer)
  }
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">{customer ? 'Edit Customer' : 'Add Customer'}</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div><label className="block text-sm font-medium mb-1">Full Name</label><input type="text" required className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} /></div>
          <div><label className="block text-sm font-medium mb-1">Email</label><input type="email" required className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} /></div>
          <div><label className="block text-sm font-medium mb-1">Phone</label><input type="tel" required className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} /></div>
          <div><label className="block text-sm font-medium mb-1">Location</label><input type="text" required className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} /></div>
          <div><label className="block text-sm font-medium mb-1">Status</label><select className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as 'active' | 'inactive'})}><option value="active">Active</option><option value="inactive">Inactive</option></select></div>
          <div><label className="block text-sm font-medium mb-1">Notes</label><textarea rows={3} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800" value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} /></div>
          <div className="flex gap-3 pt-4"><button type="submit" className="flex-1 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700">Save Customer</button><button type="button" onClick={onClose} className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50">Cancel</button></div>
        </form>
      </div>
    </div>
  )
}

// ==================== QUOTATION MODAL ====================
function QuotationModal({ quote, customers, products, onClose, onSave }: { quote: Quotation | null; customers: Customer[]; products: Product[]; onClose: () => void; onSave: (quote: Quotation) => void }) {
  const [selectedCustomer, setSelectedCustomer] = useState<string>(quote?.customerId || '')
  const [items, setItems] = useState<QuotationItem[]>(quote?.items || [])
  const [discount, setDiscount] = useState<number>(quote?.discount || 0)
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>(quote?.discountType || 'fixed')
  const [notes, setNotes] = useState<string>(quote?.notes || '')
  const [selectedProduct, setSelectedProduct] = useState<string>('')
  const [customPrice, setCustomPrice] = useState<number | null>(null)
  const [quantity, setQuantity] = useState<number>(1)
  
  const selectedCustomerData = customers.find(c => c.id === selectedCustomer)
  const subtotal = items.reduce((sum, item) => sum + item.total, 0)
  const taxRate = 0.16
  const discountAmount = discountType === 'percentage' ? subtotal * (discount / 100) : discount
  const tax = (subtotal - discountAmount) * taxRate
  const total = subtotal - discountAmount + tax
  
  const addProduct = () => {
    const product = products.find(p => p.id === selectedProduct)
    if (product && quantity > 0) {
      const price = customPrice !== null ? customPrice : product.price
      setItems([...items, {
        productId: product.id, name: product.name, qty: quantity, price: price, total: price * quantity, customPrice: customPrice !== null
      }])
      setSelectedProduct('')
      setCustomPrice(null)
      setQuantity(1)
    }
  }
  
  const removeItem = (index: number) => setItems(items.filter((_, i) => i !== index))
  const updateItemQty = (index: number, qty: number) => {
    const newItems = [...items]
    newItems[index].qty = qty
    newItems[index].total = newItems[index].price * qty
    setItems(newItems)
  }
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedCustomerData) return
    onSave({
      id: quote?.id || '', quoteNumber: quote?.quoteNumber || '', customerId: selectedCustomer, customerName: selectedCustomerData.name,
      customerEmail: selectedCustomerData.email, customerPhone: selectedCustomerData.phone, items, subtotal, tax, taxRate,
      discount: discountAmount, discountType, discountReason: '', total, status: 'draft', createdAt: quote?.createdAt || '',
      validUntil: quote?.validUntil || '', notes, terms: '', createdBy: '', createdByName: ''
    })
  }
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center sticky top-0 bg-white dark:bg-gray-900">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">{quote ? 'Edit Quotation' : 'Create Quotation'}</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div><label className="block text-sm font-medium mb-1">Select Customer</label><select required className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800" value={selectedCustomer} onChange={e => setSelectedCustomer(e.target.value)}><option value="">Choose a customer...</option>{customers.map(c => <option key={c.id} value={c.id}>{c.name} - {c.email}</option>)}</select></div>
          {selectedCustomerData && <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg"><p className="text-sm"><strong>Customer:</strong> {selectedCustomerData.name}</p><p className="text-sm text-gray-500">{selectedCustomerData.email} | {selectedCustomerData.phone}</p></div>}
          
          <div className="border rounded-lg p-4 space-y-4">
            <h3 className="font-semibold">Add Products</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <select className="px-3 py-2 border rounded-lg" value={selectedProduct} onChange={e => setSelectedProduct(e.target.value)}><option value="">Select product</option>{products.map(p => <option key={p.id} value={p.id}>{p.name} - KES {p.price.toLocaleString()}</option>)}</select>
              <input type="number" placeholder="Custom Price" className="px-3 py-2 border rounded-lg" value={customPrice || ''} onChange={e => setCustomPrice(e.target.value ? Number(e.target.value) : null)} />
              <input type="number" placeholder="Quantity" className="px-3 py-2 border rounded-lg" value={quantity} onChange={e => setQuantity(Number(e.target.value))} />
              <button type="button" onClick={addProduct} className="px-4 py-2 bg-cyan-600 text-white rounded-lg"><PlusIcon className="w-4 h-4 inline" /> Add</button>
            </div>
          </div>
          
          {items.length > 0 && <div className="overflow-x-auto"><table className="w-full"><thead><tr><th className="text-left py-2">Product</th><th className="text-center">Qty</th><th className="text-right">Price</th><th className="text-right">Total</th><th></th></tr></thead><tbody>{items.map((item, idx) => (<tr key={idx}><td className="py-2">{item.name}{item.customPrice && <span className="text-xs text-blue-500 ml-2">(Custom)</span>}</td><td className="text-center"><input type="number" value={item.qty} onChange={e => updateItemQty(idx, Number(e.target.value))} className="w-16 px-2 py-1 border rounded text-center" /></td><td className="text-right">KES {item.price.toLocaleString()}</td><td className="text-right font-semibold">KES {item.total.toLocaleString()}</td><td><button type="button" onClick={() => removeItem(idx)} className="text-red-500"><Trash className="w-4 h-4" /></button></td></tr>))}</tbody></table></div>}
          
          <div className="border-t pt-4 space-y-2">
            <div className="flex justify-between"><span>Subtotal:</span><span>KES {subtotal.toLocaleString()}</span></div>
            <div className="flex items-center justify-between gap-4"><span>Discount:</span><div className="flex gap-2"><input type="number" value={discount} onChange={e => setDiscount(Number(e.target.value))} className="w-24 px-2 py-1 border rounded" /><select value={discountType} onChange={e => setDiscountType(e.target.value as any)} className="px-2 py-1 border rounded"><option value="fixed">KES</option><option value="percentage">%</option></select></div></div>
            <div className="flex justify-between"><span>Tax ({(taxRate*100).toFixed(0)}%):</span><span>KES {tax.toLocaleString()}</span></div>
            <div className="flex justify-between font-bold text-lg pt-2 border-t"><span>Total:</span><span>KES {total.toLocaleString()}</span></div>
          </div>
          
          <div><label className="block text-sm font-medium mb-1">Notes</label><textarea rows={3} className="w-full px-3 py-2 border rounded-lg" value={notes} onChange={e => setNotes(e.target.value)} /></div>
          <div className="flex gap-3"><button type="submit" className="flex-1 px-4 py-2 bg-cyan-600 text-white rounded-lg">{quote ? 'Update' : 'Create'} Quotation</button><button type="button" onClick={onClose} className="flex-1 px-4 py-2 border rounded-lg">Cancel</button></div>
        </form>
      </div>
    </div>
  )
}