// app/sales/invoices/page.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Search,
  Eye,
  Send,
  Printer,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  FileText,
  Calendar,
  User,
  Package,
  Truck,
  X,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Download,
  Wallet,
  TrendingUp,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { useCompanySettings } from '@/lib/use-company-settings';
import { getLogoUrl } from '@/lib/company';
import { toast } from 'react-hot-toast';
import { generateInvoicePDF } from './components/InvoicePDF';
import { RecordPaymentModal } from '../../../components/RecordPaymentModal';
import api from '@/lib/api';
import type { Invoice } from '@/lib/sales';

export default function InvoicesPage() {
  const { user } = useAuth();
  const { data: settings } = useCompanySettings();
  const logoUrl = getLogoUrl(settings || null);
  
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingInvoice, setViewingInvoice] = useState<Invoice | null>(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedInvoiceForPayment, setSelectedInvoiceForPayment] = useState<{
    id: string;
    number: string;
    total: number;
    amountPaid: number;
    balanceDue: number;
  } | null>(null);
  const [showCreateOrderModal, setShowCreateOrderModal] = useState(false);
  const [creatingOrderId, setCreatingOrderId] = useState<string | null>(null);
  
  const itemsPerPage = 10;
  const searchTimeoutRef = useRef<NodeJS.Timeout>();

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => {
      setCurrentPage(1);
      fetchInvoices();
    }, 500);
  };

  useEffect(() => {
    fetchInvoices();
  }, [searchTerm, statusFilter, paymentStatusFilter, currentPage]);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const response = await api.get('/sales/invoices', {
        params: {
          search: searchTerm || undefined,
          status: statusFilter || undefined,
          paymentStatus: paymentStatusFilter || undefined,
          page: currentPage,
          limit: itemsPerPage,
        },
      });
      setInvoices(response.data.invoices);
      setTotalPages(response.data.pagination?.pages || 1);
    } catch (error) {
      console.error('Failed to fetch invoices:', error);
      toast.error('Failed to load invoices');
    } finally {
      setLoading(false);
    }
  };

  const handleSendEmail = async (id: string) => {
    setSendingId(id);
    try {
      await api.post(`/sales/invoices/${id}/send`);
      toast.success('Invoice sent successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to send invoice');
    } finally {
      setSendingId(null);
    }
  };

  const handlePrintPDF = async (invoice: Invoice) => {
    setIsGeneratingPDF(true);
    const loadingToast = toast.loading('Generating PDF...');

    try {
      const pdfBlob = await generateInvoicePDF(invoice, settings, logoUrl);
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Invoice-${invoice.invoiceNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success('PDF generated!', { id: loadingToast });
    } catch (error) {
      console.error('PDF generation failed:', error);
      toast.error('Failed to generate PDF', { id: loadingToast });
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleCreateOrder = async (invoiceId: string) => {
    if (!confirm('Create an order from this invoice? This will deduct stock and create a fulfillment order.')) {
      return;
    }
    
    setCreatingOrderId(invoiceId);
    try {
      const response = await api.post(`/sales/invoices/${invoiceId}/create-order`, {
        paymentMethod: 'cod'
      });
      
      toast.success(`Order created: ${response.data.order.orderNumber}`);
      fetchInvoices();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to create order');
    } finally {
      setCreatingOrderId(null);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      draft: 'bg-gray-100 text-gray-700',
      sent: 'bg-blue-100 text-blue-700',
      paid: 'bg-green-100 text-green-700',
      partially_paid: 'bg-yellow-100 text-yellow-700',
      overdue: 'bg-red-100 text-red-700',
      cancelled: 'bg-gray-100 text-gray-700',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const getPaymentStatusBadge = (status: string) => {
    const config: Record<string, { color: string; icon: JSX.Element; text: string }> = {
      paid: { color: 'bg-green-100 text-green-700', icon: <CheckCircle className="w-3 h-3" />, text: 'Paid' },
      unpaid: { color: 'bg-red-100 text-red-700', icon: <XCircle className="w-3 h-3" />, text: 'Unpaid' },
      partially_paid: { color: 'bg-yellow-100 text-yellow-700', icon: <Clock className="w-3 h-3" />, text: 'Partially Paid' },
      overpaid: { color: 'bg-orange-100 text-orange-700', icon: <TrendingUp className="w-3 h-3" />, text: 'Overpaid' },
    };
    return config[status] || config.unpaid;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-12 h-12 animate-spin text-cyan-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900">
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Invoices</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Manage invoices generated from accepted quotations
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={fetchInvoices}
              className="px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg font-medium flex items-center gap-2 transition-all"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by invoice #, customer..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-cyan-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
          >
            <option value="">All Status</option>
            <option value="draft">Draft</option>
            <option value="sent">Sent</option>
            <option value="paid">Paid</option>
            <option value="partially_paid">Partially Paid</option>
            <option value="overdue">Overdue</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <select
            value={paymentStatusFilter}
            onChange={(e) => setPaymentStatusFilter(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
          >
            <option value="">All Payment Status</option>
            <option value="unpaid">Unpaid</option>
            <option value="partially_paid">Partially Paid</option>
            <option value="paid">Paid</option>
            <option value="overpaid">Overpaid</option>
          </select>
          <button
            onClick={fetchInvoices}
            className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Invoices Table */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Invoice #</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Items</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Due Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                {invoices.map((invoice) => {
                  const paymentBadge = getPaymentStatusBadge(invoice.paymentStatus);
                  const isOverdue = new Date(invoice.dueDate) < new Date() && invoice.paymentStatus !== 'paid';
                  return (
                    <tr key={invoice._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-purple-500" />
                          <span className="text-sm font-medium text-gray-900 dark:text-white">{invoice.invoiceNumber}</span>
                        </div>
                        <div className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Quote: {invoice.quotationNumber}</div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{invoice.customerName}</p>
                        {invoice.customerEmail && (
                          <p className="text-xs text-gray-500 dark:text-gray-400">{invoice.customerEmail}</p>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{invoice.items.length} items</td>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white">KES {invoice.total?.toLocaleString() || 0}</td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(invoice.status)}`}>
                            {invoice.status === 'paid' && <CheckCircle className="w-3 h-3" />}
                            {invoice.status === 'overdue' && <AlertCircle className="w-3 h-3" />}
                            {invoice.status}
                          </span>
                          <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${paymentBadge.color}`}>
                            {paymentBadge.icon}
                            {paymentBadge.text}
                          </div>
                          {invoice.balanceDue > 0 && invoice.balanceDue < invoice.total && (
                            <div className="text-xs text-amber-600 dark:text-amber-400">
                              Balance: KES {invoice.balanceDue.toLocaleString()}
                            </div>
                          )}
                          {isOverdue && (
                            <div className="text-xs text-red-600 dark:text-red-400">⚠ OVERDUE</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                        {new Date(invoice.dueDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button 
                            onClick={() => {
                              setViewingInvoice(invoice);
                              setShowViewModal(true);
                            }} 
                            className="p-1.5 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors" 
                            title="View"
                          >
                            <Eye className="w-4 h-4 text-blue-500" />
                          </button>
                          <button 
                            onClick={() => handleSendEmail(invoice._id)} 
                            disabled={sendingId === invoice._id}
                            className="p-1.5 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-lg transition-colors" 
                            title="Send Email"
                          >
                            {sendingId === invoice._id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 text-green-500" />}
                          </button>
                          <button 
                            onClick={() => handlePrintPDF(invoice)} 
                            disabled={isGeneratingPDF} 
                            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors" 
                            title="Download PDF"
                          >
                            <Printer className="w-4 h-4 text-gray-500" />
                          </button>
                          {invoice.paymentStatus !== 'paid' && (
                            <button
                              onClick={() => {
                                setSelectedInvoiceForPayment({
                                  id: invoice._id,
                                  number: invoice.invoiceNumber,
                                  total: invoice.total,
                                  amountPaid: invoice.amountPaid,
                                  balanceDue: invoice.balanceDue,
                                });
                                setShowPaymentModal(true);
                              }}
                              className="p-1.5 hover:bg-amber-100 dark:hover:bg-amber-900/30 rounded-lg transition-colors"
                              title="Record Payment"
                            >
                              <Wallet className="w-4 h-4 text-amber-500" />
                            </button>
                          )}
                          {invoice.paymentStatus === 'paid' && !invoice.orderId && (
                            <button
                              onClick={() => handleCreateOrder(invoice._id)}
                              disabled={creatingOrderId === invoice._id}
                              className="p-1.5 hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-lg transition-colors"
                              title="Create Order"
                            >
                              {creatingOrderId === invoice._id ? (
                                <Loader2 className="w-4 h-4 animate-spin text-purple-500" />
                              ) : (
                                <Package className="w-4 h-4 text-purple-500" />
                              )}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border border-gray-300 dark:border-gray-700 rounded-lg disabled:opacity-50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border border-gray-300 dark:border-gray-700 rounded-lg disabled:opacity-50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* View Invoice Modal */}
      {showViewModal && viewingInvoice && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6 border-b border-gray-200 dark:border-gray-800 sticky top-0 bg-white dark:bg-gray-900 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Invoice Details</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">{viewingInvoice.invoiceNumber}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handlePrintPDF(viewingInvoice)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors" title="Download PDF">
                  <Printer className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>
                <button onClick={() => handleSendEmail(viewingInvoice._id)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors" title="Send Email">
                  <Send className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>
                <button onClick={() => setShowViewModal(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                  <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                  <h3 className="font-semibold flex items-center gap-2 mb-3 text-gray-900 dark:text-white">
                    <User className="w-4 h-4" /> Customer Information
                  </h3>
                  <div className="space-y-2 text-sm">
                    <p><strong>Name:</strong> {viewingInvoice.customerName}</p>
                    {viewingInvoice.customerEmail && <p><strong>Email:</strong> {viewingInvoice.customerEmail}</p>}
                    {viewingInvoice.customerPhone && <p><strong>Phone:</strong> {viewingInvoice.customerPhone}</p>}
                    {viewingInvoice.customerLocation && <p><strong>Location:</strong> {viewingInvoice.customerLocation}</p>}
                  </div>
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                  <h3 className="font-semibold flex items-center gap-2 mb-3 text-gray-900 dark:text-white">
                    <Calendar className="w-4 h-4" /> Invoice Information
                  </h3>
                  <div className="space-y-2 text-sm">
                    <p><strong>Invoice Number:</strong> {viewingInvoice.invoiceNumber}</p>
                    <p><strong>Quotation Ref:</strong> {viewingInvoice.quotationNumber}</p>
                    <p><strong>Issue Date:</strong> {new Date(viewingInvoice.issueDate).toLocaleDateString()}</p>
                    <p><strong>Due Date:</strong> {new Date(viewingInvoice.dueDate).toLocaleDateString()}</p>
                    <p><strong>Payment Status:</strong> {viewingInvoice.paymentStatus}</p>
                    <p><strong>Amount Paid:</strong> KES {viewingInvoice.amountPaid?.toLocaleString() || 0}</p>
                    <p><strong>Balance Due:</strong> KES {viewingInvoice.balanceDue?.toLocaleString() || 0}</p>
                  </div>
                </div>
              </div>

{((viewingInvoice.transportCost ?? 0) > 0 || viewingInvoice.transportDescription) && (
  <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4">
    <h3 className="font-semibold flex items-center gap-2 mb-3 text-gray-900 dark:text-white">
      <Truck className="w-4 h-4 text-amber-600" /> Transport Information
    </h3>
    <div className="space-y-1 text-sm">
      {(viewingInvoice.transportCost ?? 0) > 0 && (
        <p><strong>Cost:</strong> KES {(viewingInvoice.transportCost ?? 0).toLocaleString()}</p>
      )}
      {viewingInvoice.transportDescription && (
        <p><strong>Description:</strong> {viewingInvoice.transportDescription}</p>
      )}
    </div>
  </div>
)}
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2 text-gray-900 dark:text-white">
                  <Package className="w-4 h-4" /> Items
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                      <tr>
                        <th className="px-4 py-2 text-left text-sm">Item</th>
                        <th className="px-4 py-2 text-center text-sm">Qty</th>
                        <th className="px-4 py-2 text-right text-sm">Unit Price</th>
                        <th className="px-4 py-2 text-right text-sm">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {viewingInvoice.items.map((item, idx) => (
                        <tr key={idx} className="border-t dark:border-gray-800">
                          <td className="px-4 py-2">{item.name}</td>
                          <td className="px-4 py-2 text-center">{item.qty}</td>
                          <td className="px-4 py-2 text-right">KES {item.price.toLocaleString()}</td>
                          <td className="px-4 py-2 text-right font-semibold">KES {(item.price * item.qty).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <div className="space-y-2 text-right max-w-md ml-auto">
                  <div className="flex justify-between py-1">
                    <span>Subtotal:</span>
                    <span className="font-semibold">KES {viewingInvoice.subtotal?.toLocaleString() || 0}</span>
                  </div>
                  {viewingInvoice.discount > 0 && (
                    <div className="flex justify-between py-1 text-green-600">
                      <span>Discount:</span>
                      <span>-KES {viewingInvoice.discount.toLocaleString()}</span>
                    </div>
                  )}
{(viewingInvoice.transportCost ?? 0) > 0 && (
  <div className="flex justify-between py-1">
    <span>Transport:</span>
    <span>KES {(viewingInvoice.transportCost ?? 0).toLocaleString()}</span>
  </div>
)}
                  <div className="flex justify-between py-1">
                    <span>Tax (16%):</span>
                    <span>KES {viewingInvoice.tax?.toLocaleString() || 0}</span>
                  </div>
                  <div className="flex justify-between pt-2 mt-2 border-t-2 border-gray-200">
                    <span className="text-lg font-bold">Total Amount:</span>
                    <span className="text-2xl font-bold text-cyan-600">KES {viewingInvoice.total?.toLocaleString() || 0}</span>
                  </div>
                </div>
              </div>

              {viewingInvoice.notes && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 border-l-4 border-yellow-500">
                  <h3 className="font-semibold mb-2">Notes</h3>
                  <p className="text-sm">{viewingInvoice.notes}</p>
                </div>
              )}
              {viewingInvoice.terms && (
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 border-l-4 border-gray-500">
                  <h3 className="font-semibold mb-2">Terms & Conditions</h3>
                  <p className="text-sm">{viewingInvoice.terms}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
{showPaymentModal && selectedInvoiceForPayment && (
  <RecordPaymentModal
    isOpen={showPaymentModal}
    onClose={() => {
      setShowPaymentModal(false);
      setSelectedInvoiceForPayment(null);
    }}
    onSuccess={() => {
      fetchInvoices();
    }}
    invoiceId={selectedInvoiceForPayment.id}
    invoiceNumber={selectedInvoiceForPayment.number}
    totalAmount={selectedInvoiceForPayment.total}
    amountPaid={selectedInvoiceForPayment.amountPaid}
    balanceDue={selectedInvoiceForPayment.balanceDue}
  />
)}
    </div>
  );
}