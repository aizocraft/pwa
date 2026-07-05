'use client'

import Image from 'next/image'
import { useParams, useRouter } from 'next/navigation'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { getOrder, cancelOrder } from '@/lib/api'
import { Order } from '@/types/order'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ArrowLeft, MapPin, Phone, Mail, CreditCard, Truck, Package, 
  CheckCircle, Clock, Download, Printer, Share2, RefreshCw, 
  XCircle, Calendar as CalendarIcon, ShoppingBag, User, Copy, Check,
  Receipt, FileText, Building2, Globe, FileImage
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
    pending: { icon: Clock, color: 'bg-amber-500/10 text-amber-600 border-amber-200 dark:bg-amber-500/20 dark:text-amber-400 dark:border-amber-500/30', label: 'Pending Payment' },
    processing: { icon: Package, color: 'bg-blue-500/10 text-blue-600 border-blue-200 dark:bg-blue-500/20 dark:text-blue-400 dark:border-blue-500/30', label: 'Processing' },
    paid: { icon: CheckCircle, color: 'bg-emerald-500/10 text-emerald-600 border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/30', label: 'Paid' },
    shipped: { icon: Truck, color: 'bg-purple-500/10 text-purple-600 border-purple-200 dark:bg-purple-500/20 dark:text-purple-400 dark:border-purple-500/30', label: 'Shipped' },
    delivered: { icon: CheckCircle, color: 'bg-green-500/10 text-green-600 border-green-200 dark:bg-green-500/20 dark:text-green-400 dark:border-green-500/30', label: 'Delivered' },
    cancelled: { icon: XCircle, color: 'bg-red-500/10 text-red-600 border-red-200 dark:bg-red-500/20 dark:text-red-400 dark:border-red-500/30', label: 'Cancelled' },
    refunded: { icon: RefreshCw, color: 'bg-gray-500/10 text-gray-600 border-gray-200 dark:bg-gray-500/20 dark:text-gray-400 dark:border-gray-500/30', label: 'Refunded' }
  };
  const { icon: Icon, color, label } = config[status] || config.pending;
  return (
    <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium border ${color} transition-all duration-300 hover:scale-105`}>
      <Icon className="w-4 h-4 mr-2" />
      {label}
    </span>
  );
};

// Invoice/Receipt Content Component
const DocumentContent = ({ order, settings, logoUrl, isPaid }: { order: Order; settings: any; logoUrl: string | null; isPaid: boolean }) => {
  const getItemPrice = (item: any) => {
    return item.sellingPrice || item.price || 0;
  };

  const getItemTotal = (item: any) => {
    const price = getItemPrice(item);
    return price * (item.qty || 0);
  };

  const subtotal = order.subtotal || order.items.reduce((sum, item) => sum + getItemTotal(item), 0);
  const shippingCost = order.shippingCost || 0;
  const tax = order.tax || 0;
  const total = order.total || subtotal + shippingCost + tax;
  const companyName = settings?.companyName || 'MY COMPANY';
  const companyPhone = settings?.phone || '';
  const companyEmail = settings?.email || '';
  const slogan = settings?.slogan || '';

  const customerName = order.user?.name || order.guestInfo?.name || order.shippingAddress?.fullName || 'Guest Customer';
  const customerEmail = order.user?.email || order.guestInfo?.email || order.shippingAddress?.email || '';
  const customerPhone = order.guestInfo?.phone || order.shippingAddress?.phone || '';

  const itemsPerPage = 15;
  const itemChunks = [];
  for (let i = 0; i < order.items.length; i += itemsPerPage) {
    itemChunks.push(order.items.slice(i, i + itemsPerPage));
  }

  const documentTitle = isPaid ? 'RECEIPT' : 'INVOICE';

  return (
    <div className="bg-white" style={{ fontFamily: "'Times New Roman', Times, serif" }}>
      <div className="p-6" style={{ padding: '1.5cm' }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'flex-start',
          borderBottom: '3px solid #1a472a',
          paddingBottom: '16px',
          marginBottom: '16px',
          pageBreakInside: 'avoid'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexShrink: 0 }}>
            {logoUrl ? (
              <img 
                src={logoUrl} 
                alt={companyName} 
                style={{ 
                  height: '90px', 
                  width: 'auto', 
                  maxWidth: '180px',
                  objectFit: 'contain',
                  imageRendering: 'crisp-edges'
                }} 
              />
            ) : (
              <h2 style={{ fontSize: '20pt', fontWeight: 'bold', color: '#1a472a', margin: 0, lineHeight: 1.1 }}>{companyName}</h2>
            )}
          </div>
          <div style={{ textAlign: 'right' }}>
            <h1 style={{ fontSize: '22pt', fontWeight: 'bold', color: '#1a472a', margin: 0, letterSpacing: '1px' }}>
              {documentTitle}
            </h1>
            <div style={{ fontSize: '9pt', color: '#666', marginTop: '4px' }}>
              #{order.orderNumber || order._id.slice(-8).toUpperCase()}
            </div>
            <div style={{ fontSize: '8pt', color: '#999' }}>
              {new Date(order.createdAt).toLocaleDateString()}
            </div>
          </div>
        </div>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr 1fr', 
          gap: '10px',
          marginBottom: '20px',
          fontSize: '9pt'
        }}>
          <div>
            <div style={{ fontWeight: 'bold', color: '#1a472a', borderBottom: '1px solid #e0e0e0', paddingBottom: '4px', marginBottom: '6px' }}>
              BILL TO
            </div>
            <div style={{ lineHeight: 1.4 }}>
              <div style={{ fontWeight: 'bold' }}>{customerName}</div>
              {customerEmail && <div style={{ color: '#666', fontSize: '8pt' }}>{customerEmail}</div>}
              {customerPhone && <div style={{ color: '#666', fontSize: '8pt' }}>{customerPhone}</div>}
              {!order.userId && order.guestInfo && (
                <div style={{ color: '#b45309', fontSize: '7pt', marginTop: '2px' }}>Guest Checkout</div>
              )}
            </div>
          </div>

          <div>
            <div style={{ fontWeight: 'bold', color: '#1a472a', borderBottom: '1px solid #e0e0e0', paddingBottom: '4px', marginBottom: '6px' }}>
              SHIP TO
            </div>
            <div style={{ lineHeight: 1.4 }}>
              <div style={{ fontSize: '8pt' }}>{order.shippingAddress.address1}</div>
              {order.shippingAddress.address2 && <div style={{ fontSize: '8pt' }}>{order.shippingAddress.address2}</div>}
              <div style={{ fontSize: '8pt' }}>
                {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}
              </div>
              <div style={{ fontSize: '8pt' }}>{order.shippingAddress.country}</div>
            </div>
          </div>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '9pt', marginBottom: '10px' }}>
          <thead>
            <tr style={{ backgroundColor: '#f5f5f0', borderBottom: '2px solid #1a472a' }}>
              <th style={{ padding: '8px 6px', textAlign: 'left', fontWeight: 'bold', color: '#333', width: '45%' }}>Item</th>
              <th style={{ padding: '8px 6px', textAlign: 'center', fontWeight: 'bold', color: '#333', width: '10%' }}>Qty</th>
              <th style={{ padding: '8px 6px', textAlign: 'right', fontWeight: 'bold', color: '#333', width: '20%' }}>Price</th>
              <th style={{ padding: '8px 6px', textAlign: 'right', fontWeight: 'bold', color: '#333', width: '25%' }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {itemChunks[0]?.map((item, idx) => {
              const price = getItemPrice(item);
              const itemTotal = getItemTotal(item);
              return (
                <tr key={idx} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '8px 6px' }}>
                    <div style={{ fontWeight: 'bold' }}>{item.name}</div>
                    <div style={{ fontSize: '7pt', color: '#888' }}>{item.slug}</div>
                  </td>
                  <td style={{ padding: '8px 6px', textAlign: 'center' }}>{item.qty}</td>
                  <td style={{ padding: '8px 6px', textAlign: 'right' }}>
                    Ksh {price.toLocaleString()}
                  </td>
                  <td style={{ padding: '8px 6px', textAlign: 'right', fontWeight: 'bold' }}>
                    Ksh {itemTotal.toLocaleString()}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
          <div style={{ width: '220px', fontSize: '9pt' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
              <span style={{ color: '#666' }}>Subtotal:</span>
              <span>Ksh {subtotal.toLocaleString()}</span>
            </div>
            {shippingCost > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                <span style={{ color: '#666' }}>Shipping:</span>
                <span>Ksh {shippingCost.toLocaleString()}</span>
              </div>
            )}
            {tax > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                <span style={{ color: '#666' }}>VAT:</span>
                <span>Ksh {tax.toLocaleString()}</span>
              </div>
            )}
            {order.discount > 0 && (
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                padding: '4px 0',
                backgroundColor: '#d1fae5',
                borderRadius: '4px',
                margin: '4px 0'
              }}>
                <span style={{ color: '#065f46', fontWeight: '500' }}>
                  Discount: {(order as any).promoCode?.code || 'Promo'}
                </span>
                <span style={{ color: '#065f46', fontWeight: 'bold' }}>
                  -Ksh {order.discount.toLocaleString()}
                </span>
              </div>
            )}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              padding: '6px 0 3px', 
              marginTop: '4px',
              borderTop: '2px solid #1a472a',
              fontSize: '11pt',
              fontWeight: 'bold'
            }}>
              <span>TOTAL:</span>
              <span style={{ color: '#1a472a' }}>Ksh {total.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div style={{ 
          display: 'flex', 
          gap: '20px', 
          padding: '8px 0',
          borderTop: '1px solid #e0e0e0',
          fontSize: '8pt',
          flexWrap: 'wrap'
        }}>
          <div><span style={{ fontWeight: 'bold' }}>Payment:</span> {
            order.paymentMethod === 'cod' ? 'Cash on Delivery' : 
            order.paymentMethod === 'mpesa' ? 'M-PESA' : 'Card'
          }</div>
          <div>
            <span style={{ fontWeight: 'bold' }}>Status:</span>{' '}
            <span style={{ 
              color: (order.paymentStatus as string) === 'paid' ? '#1a472a' : 
                     (order.paymentStatus as string) === 'refunded' ? '#dc2626' : '#d97706',
              fontWeight: 'bold'
            }}>
              {order.paymentStatus?.toUpperCase() || 'PENDING'}
            </span>
          </div>
          {order.paymentDetails?.transactionId && (
            <div><span style={{ fontWeight: 'bold' }}>Txn:</span> <span style={{ fontFamily: 'monospace', fontSize: '7pt' }}>{order.paymentDetails.transactionId}</span></div>
          )}
          {order.trackingNumber && (
            <div><span style={{ fontWeight: 'bold' }}>Tracking:</span> {order.trackingNumber}</div>
          )}
        </div>

        <div style={{ 
          marginTop: '20px',
          paddingTop: '12px',
          borderTop: '1px solid #e0e0e0',
          textAlign: 'center',
          fontSize: '8pt',
          color: '#888'
        }}>
          {(companyPhone || companyEmail) && (
            <div style={{ marginBottom: '6px' }}>
              {companyPhone && <span>{companyPhone}</span>}
              {companyPhone && companyEmail && <span> | </span>}
              {companyEmail && <span>{companyEmail}</span>}
            </div>
          )}
          {slogan && <div style={{ fontStyle: 'italic', marginBottom: '6px' }}>{slogan}</div>}
          <div style={{ fontWeight: 'bold', color: '#1a472a' }}>
            {isPaid ? '✓ Payment Confirmed - Thank you for your business!' : 'Thank you for your business!'}
          </div>
        </div>
      </div>

      {itemChunks.slice(1).map((chunk, pageIndex) => (
        <div key={pageIndex} style={{ pageBreakBefore: 'always', padding: '1.5cm' }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            borderBottom: '1px solid #ddd',
            paddingBottom: '8px',
            marginBottom: '12px'
          }}>
            <div>
              {logoUrl ? (
                <img src={logoUrl} alt={companyName} style={{ height: '35px', width: 'auto', objectFit: 'contain' }} />
              ) : (
                <span style={{ fontSize: '12pt', fontWeight: 'bold', color: '#1a472a' }}>{companyName}</span>
              )}
            </div>
            <div style={{ fontSize: '8pt', color: '#888' }}>
              {documentTitle} - Page {pageIndex + 2} of {itemChunks.length}
            </div>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '9pt' }}>
            <thead>
              <tr style={{ backgroundColor: '#f5f5f0', borderBottom: '2px solid #1a472a' }}>
                <th style={{ padding: '8px 6px', textAlign: 'left', width: '45%' }}>Item</th>
                <th style={{ padding: '8px 6px', textAlign: 'center', width: '10%' }}>Qty</th>
                <th style={{ padding: '8px 6px', textAlign: 'right', width: '20%' }}>Price</th>
                <th style={{ padding: '8px 6px', textAlign: 'right', width: '25%' }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {chunk.map((item, idx) => {
                const price = getItemPrice(item);
                const itemTotal = getItemTotal(item);
                return (
                  <tr key={idx} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '8px 6px' }}>
                      <div style={{ fontWeight: 'bold' }}>{item.name}</div>
                      <div style={{ fontSize: '7pt', color: '#888' }}>{item.slug}</div>
                    </td>
                    <td style={{ padding: '8px 6px', textAlign: 'center' }}>{item.qty}</td>
                    <td style={{ padding: '8px 6px', textAlign: 'right' }}>
                      Ksh {price.toLocaleString()}
                    </td>
                    <td style={{ padding: '8px 6px', textAlign: 'right', fontWeight: 'bold' }}>
                      Ksh {itemTotal.toLocaleString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div style={{ textAlign: 'center', fontSize: '7pt', color: '#aaa', marginTop: '20px' }}>
            Continued from previous page...
          </div>
        </div>
      ))}
    </div>
  );
};

export default function UserOrderDetails() {
  const params = useParams()
  const router = useRouter()
  const queryClient = useQueryClient()
  const orderId = params.id as string
  const [isCancelling, setIsCancelling] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [copied, setCopied] = useState(false)
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)
  const invoiceRef = useRef<any>(null)
  
  const { data: settings } = useCompanySettings()
  const logoUrl = getLogoUrl(settings || null)

  const { data: order, isLoading, refetch } = useQuery({
    queryKey: ['userOrder', orderId],
    queryFn: () => getOrder(orderId),
    retry: 1,
  })

  const isPaid = order?.paymentStatus === 'completed' || order?.status === 'paid' || order?.status === 'delivered'

  const handleCancelOrder = async () => {
    if (!confirm('Are you sure you want to cancel this order?')) return
    
    setIsCancelling(true)
    try {
      await cancelOrder(orderId)
      toast.success('Order cancelled successfully')
      await refetch()
      queryClient.invalidateQueries({ queryKey: ['userOrder'] })
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to cancel order')
    } finally {
      setIsCancelling(false)
    }
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    toast.loading('Refreshing order details...', { id: 'refresh' })
    try {
      await refetch()
      toast.success('Order details refreshed!', { id: 'refresh' })
    } catch (error) {
      toast.error('Failed to refresh', { id: 'refresh' })
    } finally {
      setIsRefreshing(false)
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

  const handleShare = () => {
    const url = window.location.href
    if (navigator.share && navigator.canShare({ url })) {
      navigator.share({
        title: `${isPaid ? 'Receipt' : 'Invoice'} ${order?.orderNumber || orderId}`,
        text: `${isPaid ? 'Receipt' : 'Invoice'} for order #${order?.orderNumber || orderId.slice(-8)}`,
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


  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-gray-950">
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
      <div className="min-h-screen flex items-center justify-center p-8 bg-slate-50 dark:bg-gray-950">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md text-center"
        >
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 0.5 }}
          >
            <Package className="w-20 h-20 text-gray-400 mx-auto mb-6" strokeWidth={1.5} />
          </motion.div>
          <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-4">Order not found</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-8">The order you're looking for doesn't exist or you don't have permission to view it.</p>
          <Link 
            href="/orders"
            className="inline-flex items-center gap-2 px-8 py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-2xl shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Orders
          </Link>
        </motion.div>
      </div>
    )
  }

  const canCancel = ['pending', 'processing'].includes(order.status) && !isPaid
 

  const customerName = order.user?.name || order.guestInfo?.name || order.shippingAddress?.fullName || 'Guest Customer'
  const customerEmail = order.user?.email || order.guestInfo?.email || order.shippingAddress?.email || ''
  const customerPhone = order.guestInfo?.phone || order.shippingAddress?.phone || ''

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-950">
      {/* Hidden Document Template for PDF/PNG */}
      <div className="fixed left-[-9999px] top-0">
        <div ref={invoiceRef}>
          <DocumentContent order={order} settings={settings} logoUrl={logoUrl} isPaid={isPaid} />
        </div>
      </div>

      {/* Header */}
      <div className="relative overflow-hidden border-b border-gray-200/50 dark:border-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
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
                <div className="text-2xl sm:text-3xl lg:text-4xl font-black text-emerald-600 dark:text-emerald-400">
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

                <div className="flex gap-1">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleDownloadPDF}
                    disabled={isGeneratingPDF}
                    className="flex-1 p-2 sm:p-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white transition-all duration-300 shadow-lg group relative text-xs"
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
                    className="p-2 sm:p-3 rounded-xl bg-blue-500 hover:bg-blue-600 text-white transition-all duration-300 shadow-lg group relative text-xs"
                  >
                    <FileImage className="w-3 h-3 sm:w-4 sm:h-4 mx-auto group-hover:scale-110 transition-transform duration-300" />
                  </motion.button>
                </div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="p-2 sm:p-3 rounded-xl bg-white/50 dark:bg-gray-800/50 hover:bg-white/80 dark:hover:bg-gray-700/50 transition-all duration-300 border border-gray-200 dark:border-gray-700 group relative"
                >
                  <RefreshCw className={`w-4 h-4 sm:w-5 sm:h-5 ${isRefreshing ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
                  <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                    Refresh
                  </span>
                </motion.button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Order Items */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-2 space-y-6"
          >
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
                      <div className="relative flex-shrink-0 w-40 h-40 sm:w-56 sm:h-56 rounded-2xl overflow-hidden bg-gray-50 dark:bg-slate-800 shadow-lg ring-1 ring-gray-200/50 dark:ring-gray-700/50 hover:shadow-2xl hover:ring-emerald-200/50 dark:hover:ring-emerald-400/30 group/image transition-all duration-500 hover:scale-105 hover:rotate-1 mx-auto sm:mx-0">
                        {(() => {
                          let imageUrl = '/logo.png';
                          try {
                            if (item.image) {
                              if (typeof item.image === 'string') {
                                imageUrl = item.image;
                              } else {
                                const img = item.image as any;
                                if (img?.url) {
                                  imageUrl = img.url;
                                } else if (img?.fileId) {
                                  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
                                  imageUrl = `${apiUrl}/products/image/${img.fileId}`;
                                }
                              }
                            }
                          } catch (error) {
                            console.error('Error getting image URL:', error);
                            imageUrl = '/logo.png';
                          }
                          return (
                            <Image
                              src={imageUrl}
                              alt={item.name}
                              fill
                              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 224px, 224px"
                              className="object-cover transition-transform duration-500 group-hover/image:scale-110"
                              priority={index === 0}
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = '/logo.png';
                              }}
                              unoptimized={true}
                            />
                          );
                        })()}
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
                              <span className="text-gray-600 dark:text-gray-300">Ksh {item.sellingPrice}</span>
                              <span className="text-gray-400">×</span>
                              <span className="font-semibold text-gray-900 dark:text-white">{item.qty}</span>
                            </div>
                          </div>
                          <div className="text-center sm:text-right">
                            <div className="text-lg sm:text-xl font-black text-gray-900 dark:text-white">
                              Ksh {(item.sellingPrice * item.qty).toLocaleString()}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="p-4 sm:p-6 bg-gray-50 dark:bg-gray-800/30 border-t border-gray-200/50 dark:border-gray-700">
                <div className="space-y-2 max-w-md ml-auto">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                    <span className="font-medium">Ksh {(order.subtotal || order.total).toLocaleString()}</span>
                  </div>
                  {order.shippingCost > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Shipping</span>
                      <span className="font-medium">Ksh {order.shippingCost.toLocaleString()}</span>
                    </div>
                  )}
                  {order.tax > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Tax (VAT)</span>
                      <span className="font-medium">Ksh {order.tax.toLocaleString()}</span>
                    </div>
                  )}
                  {order.discount > 0 && (
                    <div className="flex justify-between text-sm bg-emerald-50 dark:bg-emerald-950/30 p-2 rounded-lg">
                      <span className="text-gray-600 dark:text-gray-400">
                        Discount {(order as any).promoCode?.code || 'Promo'}
                      </span>
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                        -Ksh {order.discount.toLocaleString()}
                      </span>
                    </div>
                  )}
                  <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between text-lg sm:text-xl font-black">
                      <span className="text-gray-900 dark:text-white">Total</span>
                      <span className="text-emerald-600 dark:text-emerald-400">
                        Ksh {order.total.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="no-print grid grid-cols-2 gap-3 sm:gap-4">
              <Link href="/orders" className="w-full">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 sm:p-4 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 text-sm sm:text-base"
                >
                  <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                  Back to Orders
                </motion.button>
              </Link>

              {canCancel && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleCancelOrder}
                  disabled={isCancelling}
                  className="flex items-center justify-center gap-2 px-4 py-3 sm:p-4 bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 font-semibold rounded-xl border border-red-200 dark:border-red-800 transition-all duration-300 disabled:opacity-50 text-sm sm:text-base"
                >
                  {isCancelling ? (
                    <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                  ) : (
                    <XCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                  )}
                  Cancel Order
                </motion.button>
              )}
            </div>
          </motion.div>

          {/* Sidebar */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-6 lg:sticky lg:top-24"
          >
            {/* Customer Information */}
            <div className="bg-white/80 dark:bg-gray-900/50 backdrop-blur-xl rounded-2xl p-4 sm:p-6 border border-white/50 shadow-xl hover:shadow-2xl transition-shadow duration-300">
              <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <User className="w-5 h-5" />
                Customer Information
              </h3>
              <div className="space-y-3">
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Name</div>
                  <div className="font-semibold text-gray-900 dark:text-white">{customerName}</div>
                </div>
                {customerEmail && (
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Email</div>
                    <div className="font-semibold text-gray-900 dark:text-white flex items-center gap-1 break-all">
                      <Mail className="w-4 h-4 flex-shrink-0" />
                      <span>{customerEmail}</span>
                    </div>
                  </div>
                )}
                {customerPhone && (
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Phone</div>
                    <div className="font-semibold text-gray-900 dark:text-white flex items-center gap-1">
                      <Phone className="w-4 h-4" />
                      <span>{customerPhone}</span>
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

            {/* Payment Information */}
            <div className="bg-white/80 dark:bg-gray-900/50 backdrop-blur-xl rounded-2xl p-4 sm:p-6 border border-white/50 shadow-xl hover:shadow-2xl transition-shadow duration-300">
              <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Payment Information
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between py-2 flex-wrap gap-2">
                  <span className="text-gray-600 dark:text-gray-400">Method:</span>
                  <span className="font-semibold text-gray-900 dark:text-white capitalize">
                    {order.paymentMethod === 'cod' ? 'Cash on Delivery' : order.paymentMethod === 'mpesa' ? 'M-Pesa' : 'Card Payment'}
                  </span>
                </div>
                {(order as any).shippingArea && (
                  <div className="flex justify-between py-2 flex-wrap gap-2">
                    <span className="text-gray-600 dark:text-gray-400">Shipping Area:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{(order as any).shippingArea.name} (KES {order.shippingCost.toLocaleString()})</span>
                  </div>
                )}
                {(order as any).promoCode && (
                  <div className="flex justify-between py-2 flex-wrap gap-2 bg-emerald-50 dark:bg-emerald-950/30 p-2 rounded">
                    <span className="text-gray-600 dark:text-gray-400">Promo:</span>
                    <span className="font-semibold text-emerald-700 dark:text-emerald-300">{(order as any).promoCode.code} (-KES {(order as any).discount?.toLocaleString()})</span>
                  </div>
                )}
                <div className="flex justify-between py-2 border-t border-gray-200/50 dark:border-gray-700 flex-wrap gap-2">
                  <span className="text-gray-600 dark:text-gray-400">Status:</span>
                  <span className={`font-semibold ${
                    order.paymentStatus === 'completed' ? 'text-emerald-600' : 
                    order.paymentStatus === 'failed' ? 'text-red-600' : 'text-amber-600'
                  }`}>
                    {order.paymentStatus?.toUpperCase() || 'PENDING'}
                  </span>
                </div>
                {order.paymentDetails?.transactionId && (
                  <div className="flex justify-between py-2 text-sm flex-wrap gap-2">
                    <span className="text-gray-600 dark:text-gray-400">Transaction ID:</span>
                    <span className="font-mono text-xs break-all">{order.paymentDetails.transactionId}</span>
                  </div>
                )}
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

            {/* Tracking Information */}
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
    </div>
  )
}