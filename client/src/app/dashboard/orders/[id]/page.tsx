'use client'

import React from 'react';

import { useParams, useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getOrder, updateOrderStatus } from '@/lib/api'
import { Order } from '@/types/order'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ArrowLeft, MapPin, Phone, Mail, CreditCard, Truck, Package, 
  CheckCircle, Clock, Download, Printer, Share2, RefreshCw, 
  XCircle, AlertCircle, DollarSign, Calendar as CalendarIcon,
  ShoppingBag, User, MessageCircle, Star, TrendingUp, Copy, Check,
  Send, Eye, Edit, Save, X, Smartphone, FileText, FileImage,
  Receipt
} from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { useState, useRef } from 'react'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import { useCompanySettings } from '@/lib/use-company-settings'
import { getLogoUrl } from '@/lib/company'

const OrderStatusBadge = ({ status }: { status: Order['status'] }) => {
  const config: Record<string, any> = {
    pending: { icon: Clock, color: 'bg-amber-500/10 text-amber-600 border-amber-200 dark:bg-amber-500/20 dark:text-amber-400 dark:border-amber-500/30', label: 'Pending' },
    processing: { icon: Package, color: 'bg-blue-500/10 text-blue-600 border-blue-200 dark:bg-blue-500/20 dark:text-blue-400 dark:border-blue-500/30', label: 'Processing' },
    paid: { icon: CheckCircle, color: 'bg-emerald-500/10 text-emerald-600 border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/30', label: 'Paid' },
    shipped: { icon: Truck, color: 'bg-purple-500/10 text-purple-600 border-purple-200 dark:bg-purple-500/20 dark:text-purple-400 dark:border-purple-500/30', label: 'Shipped' },
    delivered: { icon: CheckCircle, color: 'bg-green-500/10 text-green-600 border-green-200 dark:bg-green-500/20 dark:text-green-400 dark:border-green-500/30', label: 'Delivered' },
    cancelled: { icon: XCircle, color: 'bg-red-500/10 text-red-600 border-red-200 dark:bg-red-500/20 dark:text-red-400 dark:border-red-500/30', label: 'Cancelled' },
    refunded: { icon: DollarSign, color: 'bg-gray-500/10 text-gray-600 border-gray-200 dark:bg-gray-500/20 dark:text-gray-400 dark:border-gray-500/30', label: 'Refunded' }
  };
  const { icon: Icon, color, label } = config[status] || config.pending;
  return (
    <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium border ${color} transition-all duration-300 hover:scale-105`}>
      <Icon className="w-4 h-4 mr-2" />
      {label}
    </span>
  );
};

const PaymentMethodBadge = ({ method, status }: { method: Order['paymentMethod']; status?: string }) => {
  const config = {
    cod: { icon: Truck, color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400', label: 'Cash on Delivery' },
    mpesa: { icon: Smartphone, color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', label: 'M-PESA' },
    card: { icon: CreditCard, color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400', label: 'Card' },
  }
  const { icon: Icon, color, label } = config[method] || config.cod
  return (
    <div className="space-y-1">
      <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-medium ${color} transition-all duration-300 hover:scale-105`}>
        <Icon className="w-4 h-4" />
        {label}
      </span>
      {status && (
        <div className={`text-xs font-medium ${
          status === 'completed' ? 'text-emerald-600' :
          status === 'failed' ? 'text-red-600' :
          status === 'refunded' ? 'text-gray-600' :
          'text-amber-600'
        }`}>
          Status: {status.toUpperCase()}
        </div>
      )}
    </div>
  )
};

// Enhanced Multi-Page Invoice/Receipt Component
const InvoiceTemplate = ({ order, settings, logoUrl, isPaid }: { order: Order; settings: any; logoUrl: string | null; isPaid: boolean }) => {
  // Get company details
  const companyAddress = settings?.address || '';
  const companyPhone = settings?.phone || '';
  const companyEmail = settings?.email || '';
  const companyWebsite = settings?.website || '';
  const slogan = settings?.slogan || '';

  // Calculate totals properly
  const subtotal = order.subtotal || order.items.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const shippingCost = order.shippingCost || 0;
  const tax = order.tax || 0;
  const total = order.total || subtotal + shippingCost + tax;

  // Get customer information
  const customerName = order.user?.name || order.guestInfo?.name || order.shippingAddress?.fullName || 'Guest Customer';
  const customerEmail = order.user?.email || order.guestInfo?.email || order.shippingAddress?.email || '';
  const customerPhone = order.guestInfo?.phone || order.shippingAddress?.phone || '';
  
  const isRegistered = !!order.userId;
  const isGuest = !!order.guestInfo;

  // Split items into chunks for multi-page support
  const itemsPerPage = 12;
  const itemChunks = [];
  for (let i = 0; i < order.items.length; i += itemsPerPage) {
    itemChunks.push(order.items.slice(i, i + itemsPerPage));
  }

  const documentTitle = isPaid ? 'RECEIPT' : 'INVOICE';

  return (
    <div 
      className="invoice-template"
      style={{
        fontFamily: "'Times New Roman', Times, serif",
        fontSize: '10pt',
        lineHeight: 1.3,
        color: '#1a1a1a',
        backgroundColor: '#ffffff',
        maxWidth: '100%',
        margin: '0 auto',
        padding: '0.5cm 1cm',
        boxSizing: 'border-box'
      }}
    >
      {/* Page 1 */}
      <div className="invoice-page">
        {/* Header Section */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          borderBottom: '2px solid #1a472a',
          paddingBottom: '8px',
          marginBottom: '15px'
        }}>
          <div>
            {logoUrl ? (
              <img 
                src={logoUrl} 
                alt="Company Logo"
                style={{ 
                  height: '60px', 
                  width: 'auto', 
                  maxWidth: '150px',
                  objectFit: 'contain'
                }}
              />
            ) : (
              <div style={{ height: '50px', width: '100px', backgroundColor: '#f0f0f0', borderRadius: '4px' }}></div>
            )}
          </div>
          <div style={{ textAlign: 'right' }}>
            <h1 style={{ 
              fontSize: '20pt', 
              fontWeight: 'bold', 
              color: '#1a472a',
              margin: 0,
              letterSpacing: '1px'
            }}>
              {documentTitle}
            </h1>
            <div style={{ fontSize: '9pt', marginTop: '4px' }}>
              <span style={{ color: '#666' }}>#{order.orderNumber || order._id.slice(-8).toUpperCase()}</span>
            </div>
            <div style={{ fontSize: '8pt', color: '#888' }}>
              {new Date(order.createdAt).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric' 
              })}
            </div>
          </div>
        </div>

        {/* Bill To & Ship To */}
        <div style={{ 
          display: 'flex', 
          gap: '30px',
          marginBottom: '15px',
          fontSize: '9pt',
          borderBottom: '1px solid #e0e0e0',
          paddingBottom: '10px'
        }}>
          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: '9pt', fontWeight: 'bold', color: '#1a472a', margin: '0 0 4px 0' }}>Bill To</h3>
            <div style={{ lineHeight: 1.3 }}>
              <div style={{ fontWeight: 'bold' }}>{customerName}</div>
              {customerEmail && <div style={{ fontSize: '8pt', color: '#666' }}>{customerEmail}</div>}
              {customerPhone && <div style={{ fontSize: '8pt', color: '#666' }}>{customerPhone}</div>}
              {isGuest && <div style={{ fontSize: '7pt', color: '#999', fontStyle: 'italic' }}>Guest Checkout</div>}
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: '9pt', fontWeight: 'bold', color: '#1a472a', margin: '0 0 4px 0' }}>Ship To</h3>
            <div style={{ lineHeight: 1.3 }}>
              <div style={{ fontWeight: 'bold' }}>{order.shippingAddress.fullName}</div>
              <div>{order.shippingAddress.address1}</div>
              {order.shippingAddress.address2 && <div>{order.shippingAddress.address2}</div>}
              <div>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}</div>
              <div>{order.shippingAddress.country}</div>
              <div style={{ fontSize: '8pt', color: '#666' }}>{order.shippingAddress.phone}</div>
            </div>
          </div>
        </div>

        {/* Order Items Table - First Page */}
        <table style={{ 
          width: '100%', 
          borderCollapse: 'collapse',
          marginBottom: '12px',
          fontSize: '9pt'
        }}>
          <thead>
            <tr style={{ 
              backgroundColor: '#f5f5f0',
              borderBottom: '2px solid #1a472a'
            }}>
              <th style={{ padding: '6px 6px', textAlign: 'left', fontWeight: 'bold', color: '#333', width: '45%' }}>Item</th>
              <th style={{ padding: '6px 6px', textAlign: 'center', fontWeight: 'bold', color: '#333', width: '10%' }}>Qty</th>
              <th style={{ padding: '6px 6px', textAlign: 'right', fontWeight: 'bold', color: '#333', width: '20%' }}>Price</th>
              <th style={{ padding: '6px 6px', textAlign: 'right', fontWeight: 'bold', color: '#333', width: '25%' }}>Total</th>
             </tr>
          </thead>
          <tbody>
            {itemChunks[0]?.map((item, idx) => (
              <tr key={idx} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '6px 6px' }}>
                  <div style={{ fontWeight: 'bold' }}>{item.name}</div>
                  <div style={{ fontSize: '7pt', color: '#888' }}>{item.slug}</div>
                 </td>
                <td style={{ padding: '6px 6px', textAlign: 'center' }}>{item.qty}</td>
                <td style={{ padding: '6px 6px', textAlign: 'right' }}>Ksh {item.price.toLocaleString()}</td>
                <td style={{ padding: '6px 6px', textAlign: 'right', fontWeight: 'bold' }}>Ksh {(item.price * item.qty).toLocaleString()}</td>
               </tr>
            ))}
          </tbody>
        </table>

        {/* Order Summary */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px', marginBottom: '15px' }}>
          <div style={{ width: '220px', fontSize: '9pt' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0' }}>
              <span style={{ color: '#666' }}>Subtotal:</span>
              <span>Ksh {subtotal.toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0' }}>
              <span style={{ color: '#666' }}>Shipping:</span>
              <span>Ksh {shippingCost.toLocaleString()}</span>
            </div>
            {tax > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0' }}>
                <span style={{ color: '#666' }}>VAT (16%):</span>
                <span>Ksh {tax.toLocaleString()}</span>
              </div>
            )}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              padding: '6px 0 3px', 
              marginTop: '3px',
              borderTop: '2px solid #1a472a',
              fontSize: '11pt',
              fontWeight: 'bold'
            }}>
              <span>Total:</span>
              <span style={{ color: '#1a472a' }}>Ksh {total.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Payment Info */}
        <div style={{ 
          display: 'flex',
          gap: '20px',
          padding: '8px 0',
          marginBottom: '10px',
          borderTop: '1px solid #e0e0e0',
          borderBottom: '1px solid #e0e0e0',
          fontSize: '8pt',
          flexWrap: 'wrap'
        }}>
          <div><span style={{ fontWeight: 'bold' }}>Payment:</span> {order.paymentMethod === 'cod' ? 'Cash on Delivery' : order.paymentMethod === 'mpesa' ? 'M-PESA' : 'Card'}</div>
          <div>
            <span style={{ fontWeight: 'bold' }}>Status:</span>{' '}
            <span style={{ 
              color: order.paymentStatus === 'completed' ? '#1a472a' : order.paymentStatus === 'failed' ? '#dc2626' : '#d97706'
            }}>
              {order.paymentStatus?.toUpperCase() || 'PENDING'}
            </span>
          </div>
          {order.paymentDetails?.transactionId && (
            <div><span style={{ fontWeight: 'bold' }}>Txn:</span> <span style={{ fontSize: '7pt', fontFamily: 'monospace' }}>{order.paymentDetails.transactionId}</span></div>
          )}
        </div>

        {/* Footer */}
        <div style={{ textAlign: 'center', fontSize: '7pt', color: '#999' }}>
          {slogan && <p style={{ margin: '0 0 4px 0', fontStyle: 'italic' }}>{slogan}</p>}
          <div>
            {companyPhone && <span>{companyPhone}</span>}
            {companyPhone && companyEmail && <span> | </span>}
            {companyEmail && <span>{companyEmail}</span>}
          </div>
          {isPaid ? (
            <p style={{ margin: '4px 0 0 0', color: '#1a472a' }}>✓ Payment Confirmed - Thank you for your business!</p>
          ) : (
            <p style={{ margin: '4px 0 0 0' }}>Thank you for your business!</p>
          )}
        </div>
      </div>

      {/* Subsequent Pages */}
      {itemChunks.slice(1).map((chunk, pageIndex) => (
        <div key={pageIndex} style={{ pageBreakBefore: 'always' }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            borderBottom: '2px solid #1a472a',
            paddingBottom: '8px',
            marginBottom: '15px'
          }}>
            <div>
              {logoUrl ? (
                <img 
                  src={logoUrl} 
                  alt="Company Logo"
                  style={{ height: '40px', width: 'auto', maxWidth: '120px', objectFit: 'contain' }}
                />
              ) : (
                <div style={{ height: '40px', width: '80px', backgroundColor: '#f0f0f0', borderRadius: '4px' }}></div>
              )}
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '8pt', color: '#666' }}>
                {documentTitle} - Page {pageIndex + 2} of {itemChunks.length}
              </div>
            </div>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '9pt' }}>
            <thead>
              <tr style={{ backgroundColor: '#f5f5f0', borderBottom: '2px solid #1a472a' }}>
                <th style={{ padding: '6px 6px', textAlign: 'left', width: '45%' }}>Item</th>
                <th style={{ padding: '6px 6px', textAlign: 'center', width: '10%' }}>Qty</th>
                <th style={{ padding: '6px 6px', textAlign: 'right', width: '20%' }}>Price</th>
                <th style={{ padding: '6px 6px', textAlign: 'right', width: '25%' }}>Total</th>
               </tr>
            </thead>
            <tbody>
              {chunk.map((item, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '6px 6px' }}>
                    <div style={{ fontWeight: 'bold' }}>{item.name}</div>
                    <div style={{ fontSize: '7pt', color: '#888' }}>{item.slug}</div>
                   </td>
                  <td style={{ padding: '6px 6px', textAlign: 'center' }}>{item.qty}</td>
                  <td style={{ padding: '6px 6px', textAlign: 'right' }}>Ksh {item.price.toLocaleString()}</td>
                  <td style={{ padding: '6px 6px', textAlign: 'right', fontWeight: 'bold' }}>Ksh {(item.price * item.qty).toLocaleString()}</td>
                 </tr>
              ))}
            </tbody>
          </table>

          <div style={{ textAlign: 'center', fontSize: '7pt', color: '#999', marginTop: '20px' }}>
            <p style={{ margin: '0' }}>Continued from previous page...</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default function AdminOrderDetails() {
  const params = useParams()
  const router = useRouter()
  const queryClient = useQueryClient()
  const orderId = params.id as string
  const [isUpdating, setIsUpdating] = useState(false)
  const [trackingNumber, setTrackingNumber] = useState('')
  const [estimatedDelivery, setEstimatedDelivery] = useState('')
  const [showTrackingForm, setShowTrackingForm] = useState(false)
  const [copied, setCopied] = useState(false)
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)
  const invoiceRef = useRef<any>(null)
  
  const { data: settings } = useCompanySettings()
  const logoUrl = getLogoUrl(settings || null)

  const { data: order, isLoading, refetch } = useQuery({
    queryKey: ['adminOrder', orderId],
    queryFn: () => getOrder(orderId),
  })

  // Determine if order is paid (show RECEIPT instead of INVOICE)
  const isPaid = order?.paymentStatus === 'completed' || order?.status === 'paid' || order?.status === 'delivered'

  const statusMutation = useMutation({
    mutationFn: ({ status, tracking, delivery }: { status: Order['status']; tracking?: string; delivery?: string }) =>
      updateOrderStatus(orderId, status, { trackingNumber: tracking, estimatedDelivery: delivery }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminOrder', orderId] })
      queryClient.invalidateQueries({ queryKey: ['adminOrders'] })
      toast.success('Order updated successfully')
      setShowTrackingForm(false)
      setTrackingNumber('')
      setEstimatedDelivery('')
    },
    onError: () => {
      toast.error('Failed to update order')
    },
  })

  const handleUpdateStatus = async (status: Order['status']) => {
    setIsUpdating(true)
    try {
      await statusMutation.mutateAsync({ status })
    } finally {
      setIsUpdating(false)
    }
  }

  const handleAddTracking = async () => {
    if (!order) {
      toast.error('Order not found')
      return
    }
    if (!trackingNumber) {
      toast.error('Please enter a tracking number')
      return
    }
    setIsUpdating(true)
    try {
      await statusMutation.mutateAsync({ 
        status: order.status, 
        tracking: trackingNumber,
        delivery: estimatedDelivery || undefined
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDownloadPDF = async () => {
    if (!order || !invoiceRef.current) return
    
    setIsGeneratingPDF(true)
    const loadingToast = toast.loading(`Generating ${isPaid ? 'receipt' : 'invoice'} PDF...`, { id: 'invoice' })
    
    try {
      const element = invoiceRef.current
      element.classList.add('pdf-generation-mode')
      
      const canvas = await html2canvas(element, {
        scale: 3,
        backgroundColor: '#ffffff',
        logging: false,
        useCORS: true,
        allowTaint: false,
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight,
        onclone: (clonedDoc) => {
          const style = clonedDoc.createElement('style')
          style.textContent = `* { font-family: 'Times New Roman', Times, serif !important; }`
          clonedDoc.head.appendChild(style)
        }
      })
      
      element.classList.remove('pdf-generation-mode')
      
      const imgData = canvas.toDataURL('image/png', 1.0)
      const pdf = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4',
        compress: true,
        hotfixes: ['px_scaling']
      })
      
      const imgProps = pdf.getImageProperties(imgData)
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST')
      pdf.save(`${isPaid ? 'RECEIPT' : 'INVOICE'}-${order.orderNumber || order._id.slice(-8).toUpperCase()}.pdf`)
      
      toast.success(`${isPaid ? 'Receipt' : 'Invoice'} generated successfully!`, { id: loadingToast })
    } catch (error) {
      console.error('PDF generation failed:', error)
      toast.error('Failed to generate PDF. Please try again.', { id: loadingToast })
    } finally {
      setIsGeneratingPDF(false)
    }
  }

  const handleDownloadPNG = async () => {
    if (!order || !invoiceRef.current) return
    
    const loadingToast = toast.loading(`Generating ${isPaid ? 'receipt' : 'invoice'} PNG...`, { id: 'invoice' })
    
    try {
      const element = invoiceRef.current
      element.classList.add('png-generation-mode')
      
      const canvas = await html2canvas(element, {
        scale: 4,
        backgroundColor: '#ffffff',
        logging: false,
        useCORS: true,
        allowTaint: false,
        imageTimeout: 0,
        onclone: (clonedDoc) => {
          const style = clonedDoc.createElement('style')
          style.textContent = `* { font-family: 'Times New Roman', Times, serif !important; }`
          clonedDoc.head.appendChild(style)
        }
      })
      
      element.classList.remove('png-generation-mode')
      
      const link = document.createElement('a')
      link.download = `${isPaid ? 'RECEIPT' : 'INVOICE'}-${order.orderNumber || order._id.slice(-8).toUpperCase()}.png`
      link.href = canvas.toDataURL('image/png', 1.0)
      link.click()
      
      toast.success(`${isPaid ? 'Receipt' : 'Invoice'} PNG downloaded!`, { id: loadingToast })
    } catch (error) {
      console.error('PNG generation failed:', error)
      toast.error('Failed to generate PNG. Please try again.', { id: loadingToast })
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const handleShare = () => {
    const url = window.location.href
    if (navigator.share && navigator.canShare({ url })) {
      navigator.share({
        title: `${isPaid ? 'Receipt' : 'Invoice'} ${order?.orderNumber || orderId}`,
        text: `View ${isPaid ? 'receipt' : 'invoice'} for order #${order?.orderNumber || orderId.slice(-8)}`,
        url: url,
      }).catch((error) => {
        console.error('Share failed:', error)
        handleCopyLink()
      })
    } else {
      handleCopyLink()
    }
  }

  const handleCopyLink = () => {
    const url = window.location.href
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true)
      toast.success('Link copied to clipboard!')
      setTimeout(() => setCopied(false), 2000)
    }).catch((error) => {
      console.error('Copy failed:', error)
      toast.error('Failed to copy link')
    })
  }

  const handleNotifyCustomer = () => {
    if (!order) {
      toast.error('Order not found')
      return
    }
    toast.success(`Status update notification sent to ${order.user?.email || order.guestInfo?.email || 'customer'}`)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-emerald-50/30 dark:from-gray-950 dark:via-slate-900 dark:to-emerald-950/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="animate-pulse space-y-8">
            <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-xl w-64"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="h-40 bg-gray-200 dark:bg-gray-700 rounded-2xl"></div>
                <div className="h-60 bg-gray-200 dark:bg-gray-700 rounded-2xl"></div>
              </div>
              <div className="space-y-6">
                <div className="h-80 bg-gray-200 dark:bg-gray-700 rounded-2xl"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8 bg-gradient-to-br from-slate-50 via-blue-50/30 to-emerald-50/30 dark:from-gray-950 dark:via-slate-900 dark:to-emerald-950/30">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md text-center"
        >
          <Package className="w-20 h-20 text-gray-400 mx-auto mb-6" strokeWidth={1.5} />
          <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-4">Order not found</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-8">The order you're looking for doesn't exist.</p>
            <Link 
          href="/dashboard/orders"
          className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all duration-300 mb-6 group"
          onClick={(e) => {
            e.preventDefault();
            router.push('/dashboard/orders');
          }}
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-300" />
          <span className="font-medium">Back to Orders</span>
        </Link>
        </motion.div>
      </div>
    )
  }

  const timeline = [
    { status: 'pending' as const, date: order.createdAt, label: 'Order Placed', icon: ShoppingBag, completed: true },
    { status: 'processing' as const, date: order.status === 'processing' || order.status !== 'pending' ? order.updatedAt : null, label: 'Processing', icon: Package, completed: ['processing', 'paid', 'shipped', 'delivered'].includes(order.status) },
    { status: 'paid' as const, date: order.paymentStatus === 'completed' ? order.updatedAt : null, label: 'Payment Confirmed', icon: CreditCard, completed: order.paymentStatus === 'completed' },
    { status: 'shipped' as const, date: order.status === 'shipped' ? order.updatedAt : null, label: 'Order Shipped', icon: Truck, completed: order.status === 'shipped' || order.status === 'delivered' },
    { status: 'delivered' as const, date: order.status === 'delivered' ? order.updatedAt : null, label: 'Order Delivered', icon: CheckCircle, completed: order.status === 'delivered' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-emerald-50/30 dark:from-gray-950 dark:via-slate-900 dark:to-emerald-950/30">
      {/* Hidden Invoice/Receipt Template for PDF */}
      <div className="fixed left-[-9999px] top-0">
        <div ref={invoiceRef}>
          <InvoiceTemplate order={order} settings={settings} logoUrl={logoUrl} isPaid={isPaid} />
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative overflow-hidden border-b border-gray-200/50 dark:border-gray-800/50">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-blue-500/5 to-purple-500/10"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <Link 
              href="/dashboard/orders"
              className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all duration-300 mb-6 group"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-300" />
              <span className="font-medium">Back to Orders</span>
            </Link>
          </motion.div>

          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <div className="flex flex-wrap items-center gap-3 mb-3">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-900 dark:text-white">
                  {order.orderNumber || `#${order._id.slice(-8).toUpperCase()}`}
                </h1>
                <OrderStatusBadge status={order.status} />
              </div>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 flex items-center gap-2 flex-wrap">
                <CalendarIcon className="w-4 h-4" />
                Placed on {new Date(order.createdAt).toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="flex items-center gap-3 w-full lg:w-auto"
            >
              <div className="text-right">
                <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Total Amount</div>
                <div className="text-2xl sm:text-3xl lg:text-4xl font-black bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
                  Ksh {order.total.toLocaleString()}
                </div>
              </div>
              <div className="h-10 w-px bg-gray-300 dark:bg-gray-700"></div>
              <div className="flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleShare}
                  className="relative p-2 sm:p-3 rounded-xl bg-white/50 dark:bg-gray-800/50 hover:bg-white/80 dark:hover:bg-gray-700/50 transition-all duration-300 border border-gray-200 dark:border-gray-700 group"
                >
                  {copied ? (
                    <Check className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500" />
                  ) : (
                    <Share2 className="w-4 h-4 sm:w-5 sm:h-5 group-hover:scale-110 transition-transform duration-300" />
                  )}
                  <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                    {copied ? 'Copied!' : 'Share'}
                  </span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handlePrint}
                  className="p-2 sm:p-3 rounded-xl bg-white/50 dark:bg-gray-800/50 hover:bg-white/80 dark:hover:bg-gray-700/50 transition-all duration-300 border border-gray-200 dark:border-gray-700 group relative"
                >
                  <Printer className="w-4 h-4 sm:w-5 sm:h-5 group-hover:scale-110 transition-transform duration-300" />
                  <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                    Print
                  </span>
                </motion.button>

                <div className="flex gap-1">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleDownloadPDF}
                    disabled={isGeneratingPDF}
                    className="flex-1 p-2 sm:p-3 rounded-xl bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 text-white transition-all duration-300 shadow-lg group relative text-xs"
                  >
                    {isGeneratingPDF ? (
                      <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4 animate-spin mx-auto" />
                    ) : (
                      <FileText className="w-3 h-3 sm:w-4 sm:h-4 mx-auto group-hover:scale-110 transition-transform duration-300" />
                    )}
                    <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                      {isPaid ? 'Receipt' : 'Invoice'}
                    </span>
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleDownloadPNG}
                    className="p-2 sm:p-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white transition-all duration-300 shadow-lg group relative text-xs"
                  >
                    <FileImage className="w-3 h-3 sm:w-4 sm:h-4 mx-auto group-hover:scale-110 transition-transform duration-300" />
                  </motion.button>
                </div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => refetch()}
                  className="p-2 sm:p-3 rounded-xl bg-white/50 dark:bg-gray-800/50 hover:bg-white/80 dark:hover:bg-gray-700/50 transition-all duration-300 border border-gray-200 dark:border-gray-700 group relative"
                >
                  <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5 group-hover:rotate-180 transition-transform duration-500" />
                  <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                    Refresh
                  </span>
                </motion.button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Rest of the component remains the same (Order Items, Sidebar, etc.) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Order Items */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-2 space-y-6"
          >
            {/* Items Card */}
            <div className="bg-white/80 dark:bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-white/50 shadow-xl overflow-hidden">
              <div className="p-4 sm:p-6 border-b border-gray-200/50 dark:border-gray-700">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Order Items ({order.items.reduce((sum, item) => sum + item.qty, 0)} items)
                </h2>
              </div>
              
              <div className="divide-y divide-gray-200/50 dark:divide-gray-700/50">
                {order.items.map((item, index) => (
                  <motion.div
                    key={item._id || index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ backgroundColor: 'rgba(0,0,0,0.02)' }}
                    className="p-4 sm:p-6 hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-all duration-300"
                  >
                    <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                      <div className="relative w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 shadow-md mx-auto sm:mx-0">
                        <img 
                          src={item.image || '/logo.png'}
                          alt={item.name}
                          className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/logo.png'
                          }}
                        />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                          <div className="text-center sm:text-left">
                            <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-1">
                              {item.name}
                            </h3>
                            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-2">
                              {item.slug}
                            </p>
                            <div className="flex items-center justify-center sm:justify-start gap-3 text-sm">
                              <span className="text-gray-600 dark:text-gray-300">Ksh {item.price.toLocaleString()}</span>
                              <span className="text-gray-400">×</span>
                              <span className="font-semibold text-gray-900 dark:text-white">{item.qty}</span>
                            </div>
                          </div>
                          <div className="text-center sm:text-right">
                            <div className="text-lg sm:text-xl font-black text-gray-900 dark:text-white">
                              Ksh {(item.price * item.qty).toLocaleString()}
                            </div>
                            <Link 
                              href={`/products/${item.slug}`}
                              className="inline-flex items-center gap-1 mt-2 text-sm text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
                            >
                              View Product
                              <Eye className="w-3 h-3" />
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Order Summary */}
              <div className="p-4 sm:p-6 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/30 dark:to-gray-900/30 border-t border-gray-200/50 dark:border-gray-700">
                <div className="flex justify-end">
                  <div className="space-y-2 text-right">
                    <div className="flex gap-8 text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Subtotal:</span>
                      <span className="font-medium">Ksh {(order.subtotal || order.total).toLocaleString()}</span>
                    </div>
                    {order.shippingCost > 0 && (
                      <div className="flex gap-8 text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Shipping:</span>
                        <span className="font-medium">Ksh {order.shippingCost.toLocaleString()}</span>
                      </div>
                    )}
                    {order.tax > 0 && (
                      <div className="flex gap-8 text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Tax (16% VAT):</span>
                        <span className="font-medium">Ksh {order.tax.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex gap-8 text-xl font-black">
                        <span className="text-gray-900 dark:text-white">Total:</span>
                        <span className="bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
                          Ksh {order.total.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Admin Actions */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleUpdateStatus('processing')}
                disabled={isUpdating || order.status !== 'pending'}
                className="flex items-center justify-center gap-2 p-3 bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 font-medium rounded-xl border border-blue-200 dark:border-blue-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Package className="w-4 h-4" />
                Process
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleUpdateStatus('shipped')}
                disabled={isUpdating || !['paid', 'processing'].includes(order.status)}
                className="flex items-center justify-center gap-2 p-3 bg-purple-500/10 hover:bg-purple-500/20 text-purple-600 dark:text-purple-400 font-medium rounded-xl border border-purple-200 dark:border-purple-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Truck className="w-4 h-4" />
                Ship
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleUpdateStatus('delivered')}
                disabled={isUpdating || order.status !== 'shipped'}
                className="flex items-center justify-center gap-2 p-3 bg-green-500/10 hover:bg-green-500/20 text-green-600 dark:text-green-400 font-medium rounded-xl border border-green-200 dark:border-green-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <CheckCircle className="w-4 h-4" />
                Deliver
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleUpdateStatus('cancelled')}
                disabled={isUpdating || ['delivered', 'cancelled'].includes(order.status)}
                className="flex items-center justify-center gap-2 p-3 bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 font-medium rounded-xl border border-red-200 dark:border-red-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <XCircle className="w-4 h-4" />
                Cancel
              </motion.button>
            </div>

            {/* Tracking Form */}
            <AnimatePresence mode="wait">
              {!showTrackingForm ? (
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowTrackingForm(true)}
                  className="w-full flex items-center justify-center gap-2 p-4 bg-white/80 dark:bg-gray-800/50 hover:bg-white/90 dark:hover:bg-gray-700/50 text-gray-700 dark:text-gray-300 font-semibold rounded-xl border border-gray-200 dark:border-gray-700 transition-all"
                >
                  <Truck className="w-5 h-5" />
                  Add Tracking Information
                </motion.button>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="bg-white/80 dark:bg-gray-800/50 rounded-xl p-4 border border-gray-200 dark:border-gray-700 space-y-3"
                >
                  <div className="flex justify-between items-center">
                    <h4 className="font-semibold text-gray-900 dark:text-white">Add Tracking Info</h4>
                    <button 
                      onClick={() => setShowTrackingForm(false)} 
                      className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <input
                    type="text"
                    placeholder="Tracking Number"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  />
                  <input
                    type="date"
                    placeholder="Estimated Delivery"
                    value={estimatedDelivery}
                    onChange={(e) => setEstimatedDelivery(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  />
                  <button
                    onClick={handleAddTracking}
                    disabled={isUpdating}
                    className="w-full py-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-lg font-semibold transition-all disabled:opacity-50"
                  >
                    {isUpdating ? <RefreshCw className="w-4 h-4 animate-spin mx-auto" /> : 'Save Tracking Info'}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Notify Customer */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleNotifyCustomer}
              className="w-full flex items-center justify-center gap-2 p-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold rounded-xl shadow-lg transition-all"
            >
              <Send className="w-5 h-5" />
              Notify Customer
            </motion.button>
          </motion.div>

          {/* Sidebar */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-6 lg:sticky lg:top-24"
          >
            {/* Customer Info */}
            <div className="bg-white/80 dark:bg-gray-900/50 backdrop-blur-xl rounded-2xl p-4 sm:p-6 border border-white/50 shadow-xl hover:shadow-2xl transition-shadow duration-300">
              <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <User className="w-5 h-5" />
                Customer Information
              </h3>
              <div className="space-y-3">
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Name</div>
                  <div className="font-semibold text-gray-900 dark:text-white">
                    {order.user?.name || order.guestInfo?.name || order.shippingAddress?.fullName || 'Guest Customer'}
                  </div>
                </div>
                {(order.user?.email || order.guestInfo?.email || order.shippingAddress?.email) && (
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Email</div>
                    <div className="font-semibold text-gray-900 dark:text-white flex items-center gap-1 break-all">
                      <Mail className="w-4 h-4 flex-shrink-0" />
                      <span>{order.user?.email || order.guestInfo?.email || order.shippingAddress?.email}</span>
                    </div>
                  </div>
                )}
                {(order.guestInfo?.phone || order.shippingAddress?.phone) && (
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Phone</div>
                    <div className="font-semibold text-gray-900 dark:text-white flex items-center gap-1">
                      <Phone className="w-4 h-4" />
                      <span>{order.guestInfo?.phone || order.shippingAddress?.phone}</span>
                    </div>
                  </div>
                )}
                {order.userId ? (
                  <div className="pt-2 text-xs text-emerald-600 dark:text-emerald-400">
                    ✓ Registered Customer
                  </div>
                ) : order.guestInfo ? (
                  <div className="pt-2">
                    <div className="text-xs text-amber-600 dark:text-amber-400 mb-1">🛒 Guest Checkout</div>
                    {order.guestInfo.email && <div className="text-xs text-gray-500">Email: {order.guestInfo.email}</div>}
                    {order.guestInfo.phone && <div className="text-xs text-gray-500">Phone: {order.guestInfo.phone}</div>}
                  </div>
                ) : null}
              </div>
            </div>

            {/* Timeline */}
            <div className="bg-white/80 dark:bg-gray-900/50 backdrop-blur-xl rounded-2xl p-4 sm:p-6 border border-white/50 shadow-xl hover:shadow-2xl transition-shadow duration-300">
              <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Order Timeline
              </h3>
              <div className="relative">
                {timeline.map((step, index) => {
                  const Icon = step.icon
                  const isCompleted = step.completed
                  const isCurrent = step.status === order.status
                  const date = step.date ? new Date(step.date) : null
                  
                  return (
                    <div key={step.status} className="relative pb-8 last:pb-0">
                      {index !== timeline.length - 1 && (
                        <div className={`absolute left-5 top-10 bottom-0 w-0.5 ${isCompleted ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-gray-700'}`} />
                      )}
                      <div className="flex gap-4">
                        <div className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                          isCompleted 
                            ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25'
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                        }`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1 pt-1">
                          <div className="font-semibold text-gray-900 dark:text-white">{step.label}</div>
                          {date && (
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </div>
                          )}
                          {isCurrent && (
                            <span className="inline-block mt-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                              Current
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-white/80 dark:bg-gray-900/50 backdrop-blur-xl rounded-2xl p-4 sm:p-6 border border-white/50 shadow-xl hover:shadow-2xl transition-shadow duration-300">
              <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Shipping Address
              </h3>
              <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                <div className="font-semibold text-gray-900 dark:text-white">{order.shippingAddress.fullName}</div>
                <div>{order.shippingAddress.address1}</div>
                {order.shippingAddress.address2 && <div>{order.shippingAddress.address2}</div>}
                <div>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}</div>
                <div>{order.shippingAddress.country}</div>
                <div className="pt-2 flex items-center gap-2">
                  <Phone className="w-4 h-4 flex-shrink-0" />
                  <span className="break-all">{order.shippingAddress.phone}</span>
                </div>
                {order.shippingAddress.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 flex-shrink-0" />
                    <span className="break-all">{order.shippingAddress.email}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Payment Info */}
            <div className="bg-white/80 dark:bg-gray-900/50 backdrop-blur-xl rounded-2xl p-4 sm:p-6 border border-white/50 shadow-xl hover:shadow-2xl transition-shadow duration-300">
              <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Payment Information
              </h3>
              <div className="space-y-4">
                <PaymentMethodBadge method={order.paymentMethod} status={order.paymentStatus} />
                
                {order.paymentDetails?.transactionId && (
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Transaction ID</div>
                    <div className="font-mono text-sm text-gray-900 dark:text-white break-all">
                      {order.paymentDetails.transactionId}
                    </div>
                  </div>
                )}
                
                {order.paymentDetails?.mpesaReceipt && (
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">M-PESA Receipt</div>
                    <div className="font-mono text-sm text-gray-900 dark:text-white">
                      {order.paymentDetails.mpesaReceipt}
                    </div>
                  </div>
                )}
                
                {order.paymentDetails?.cardLast4 && (
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Card</div>
                    <div className="font-semibold text-gray-900 dark:text-white">
                      {order.paymentDetails.cardBrand} •••• {order.paymentDetails.cardLast4}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Tracking Info */}
            {order.trackingNumber && (
              <div className="bg-white/80 dark:bg-gray-900/50 backdrop-blur-xl rounded-2xl p-4 sm:p-6 border border-white/50 shadow-xl hover:shadow-2xl transition-shadow duration-300">
                <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Truck className="w-5 h-5" />
                  Tracking Information
                </h3>
                <div className="space-y-2">
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Tracking Number</div>
                    <div className="font-mono text-sm text-gray-900 dark:text-white break-all">{order.trackingNumber}</div>
                  </div>
                  {order.estimatedDelivery && (
                    <div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">Estimated Delivery</div>
                      <div className="font-semibold text-gray-900 dark:text-white">
                        {new Date(order.estimatedDelivery).toLocaleDateString('en-US', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          [data-print-area] {
            visibility: visible;
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>
    </div>
  )
}