'use client'

import React from 'react';
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getOrder, updateOrderStatus } from "@/lib/api";
import { Order } from "@/types/order";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, MapPin, Phone, Mail, CreditCard, Truck, Package,
  CheckCircle, Clock, Download, Printer, Share2, RefreshCw, Loader2,
  XCircle, DollarSign, Calendar as CalendarIcon,
  ShoppingBag, User, Copy, Check, Send, Eye, Edit, Save, X, Smartphone, FileText, FileImage,
  Receipt
} from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import { useState, useRef } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { useCompanySettings } from "@/lib/use-company-settings";
import { getLogoUrl } from "@/lib/company";

const OrderStatusBadge = ({ status }: { status: Order["status"] }) => {
  const config: Record<string, any> = {
    pending: { icon: Clock, color: "bg-amber-500/10 text-amber-600 border-amber-200 dark:bg-amber-500/20 dark:text-amber-400 dark:border-amber-500/30", label: "Pending" },
    processing: { icon: Package, color: "bg-blue-500/10 text-blue-600 border-blue-200 dark:bg-blue-500/20 dark:text-blue-400 dark:border-blue-500/30", label: "Processing" },
    paid: { icon: CheckCircle, color: "bg-emerald-500/10 text-emerald-600 border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/30", label: "Paid" },
    shipped: { icon: Truck, color: "bg-purple-500/10 text-purple-600 border-purple-200 dark:bg-purple-500/20 dark:text-purple-400 dark:border-purple-500/30", label: "Shipped" },
    delivered: { icon: CheckCircle, color: "bg-green-500/10 text-green-600 border-green-200 dark:bg-green-500/20 dark:text-green-400 dark:border-green-500/30", label: "Delivered" },
    cancelled: { icon: XCircle, color: "bg-red-500/10 text-red-600 border-red-200 dark:bg-red-500/20 dark:text-red-400 dark:border-red-500/30", label: "Cancelled" },
    refunded: { icon: DollarSign, color: "bg-gray-500/10 text-gray-600 border-gray-200 dark:bg-gray-500/20 dark:text-gray-400 dark:border-gray-500/30", label: "Refunded" }
  };
  const { icon: Icon, color, label } = config[status] || config.pending;
  return (
    <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium border ${color} transition-all duration-300 hover:scale-105`}>
      <Icon className="w-4 h-4 mr-2" />
      {label}
    </span>
  );
};

// Helper function to get customer name
const getCustomerName = (order: Order): string => {
  if (order.userId && typeof order.userId === 'object' && 'name' in order.userId) {
    return (order.userId as any).name
  }
  if (order.guestInfo?.name) {
    return order.guestInfo.name
  }
  if (order.shippingAddress?.fullName) {
    return order.shippingAddress.fullName
  }
  return 'Guest'
}

// Helper function to get customer email
const getCustomerEmail = (order: Order): string | null => {
  if (order.userId && typeof order.userId === 'object' && 'email' in order.userId) {
    return (order.userId as any).email
  }
  if (order.guestInfo?.email) {
    return order.guestInfo.email
  }
  if (order.shippingAddress?.email) {
    return order.shippingAddress.email
  }
  return null
}

// Helper function to get item image URL
const getItemImageUrl = (item: any): string => {
  if (!item.image) return '/placeholder-product.jpg';
  
  // If it's a string URL
  if (typeof item.image === 'string') {
    return item.image;
  }
  
  // If it's an object with url property
  if (item.image.url) {
    return item.image.url;
  }
  
  // If it's a GridFS file
  if (item.image.fileId) {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
    return `${apiUrl}/products/image/${item.image.fileId}`;
  }
  
  // If it's from populated product
  if (item.productId?.images?.[0]) {
    const img = item.productId.images[0];
    if (img.url) return img.url;
    if (img.fileId) {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
      return `${apiUrl}/products/image/${img.fileId}`;
    }
  }
  
  return '/placeholder-product.jpg';
};

const InvoiceTemplate = ({ order, settings, logoUrl, isPaid }: { order: Order; settings: any; logoUrl: string | null; isPaid: boolean }) => {
  const companyPhone = settings?.phone || "";
  const companyEmail = settings?.email || "";
  const slogan = settings?.slogan || "";
  const subtotal = order.subtotal || order.items.reduce((sum: number, item: any) => sum + (item.sellingPrice * item.qty), 0);
  const shippingCost = order.shippingCost || 0;
  const tax = order.tax || 0;
  const total = order.total || subtotal + shippingCost + tax;
  const customerName = getCustomerName(order);
  const customerEmail = getCustomerEmail(order) || "";
  const customerPhone = order.guestInfo?.phone || order.shippingAddress?.phone || "";
  const itemsPerPage = 12;
  const itemChunks = [];
  for (let i = 0; i < order.items.length; i += itemsPerPage) {
    itemChunks.push(order.items.slice(i, i + itemsPerPage));
  }
  const documentTitle = isPaid ? "RECEIPT" : "INVOICE";

  return (
    <div 
      className="invoice-template"
      style={{
        fontFamily: "'Times New Roman', Times, serif",
        fontSize: "10pt",
        lineHeight: 1.3,
        color: "#1a1a1a",
        backgroundColor: "#ffffff",
        maxWidth: "100%",
        margin: "0 auto",
        padding: "0.5cm 1cm",
        boxSizing: "border-box"
      }}
    >
      <div className="invoice-page">
        <div style={{ 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center",
          borderBottom: "2px solid #1a472a",
          paddingBottom: "8px",
          marginBottom: "15px"
        }}>
          <div>
            {logoUrl ? (
              <img 
                src={logoUrl} 
                alt="Company Logo"
                style={{ 
                  height: "60px", 
                  width: "auto", 
                  maxWidth: "150px",
                  objectFit: "contain"
                }}
              />
            ) : (
              <div style={{ height: "50px", width: "100px", backgroundColor: "#f0f0f0", borderRadius: "4px" }}></div>
            )}
          </div>
          <div style={{ textAlign: "right" }}>
            <h1 style={{ 
              fontSize: "20pt", 
              fontWeight: "bold", 
              color: "#1a472a",
              margin: 0,
              letterSpacing: "1px"
            }}>
              {documentTitle}
            </h1>
            <div style={{ fontSize: "9pt", marginTop: "4px" }}>
              <span style={{ color: "#666" }}>#{order.orderNumber || order._id.slice(-8).toUpperCase()}</span>
            </div>
            <div style={{ fontSize: "8pt", color: "#888" }}>
              {new Date(order.createdAt).toLocaleDateString("en-US", { 
                year: "numeric", 
                month: "short", 
                day: "numeric" 
              })}
            </div>
          </div>
        </div>
        <div style={{ 
          display: "flex", 
          gap: "30px",
          marginBottom: "15px",
          fontSize: "9pt",
          borderBottom: "1px solid #e0e0e0",
          paddingBottom: "10px"
        }}>
          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: "9pt", fontWeight: "bold", color: "#1a472a", margin: "0 0 4px 0" }}>Bill To</h3>
            <div style={{ lineHeight: 1.3 }}>
              <div style={{ fontWeight: "bold" }}>{customerName}</div>
              {customerEmail && <div style={{ fontSize: "8pt", color: "#666" }}>{customerEmail}</div>}
              {customerPhone && <div style={{ fontSize: "8pt", color: "#666" }}>{customerPhone}</div>}
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: "9pt", fontWeight: "bold", color: "#1a472a", margin: "0 0 4px 0" }}>Ship To</h3>
            <div style={{ lineHeight: 1.3 }}>
              <div style={{ fontWeight: "bold" }}>{order.shippingAddress.fullName}</div>
              <div>{order.shippingAddress.address1}</div>
              {order.shippingAddress.address2 && <div>{order.shippingAddress.address2}</div>}
              <div>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}</div>
              <div>{order.shippingAddress.country}</div>
              <div style={{ fontSize: "8pt", color: "#666" }}>{order.shippingAddress.phone}</div>
            </div>
          </div>
        </div>
        <table style={{ 
          width: "100%", 
          borderCollapse: "collapse",
          marginBottom: "12px",
          fontSize: "9pt"
        }}>
          <thead>
            <tr style={{ 
              backgroundColor: "#f5f5f0",
              borderBottom: "2px solid #1a472a"
            }}>
              <th style={{ padding: "6px 6px", textAlign: "left", fontWeight: "bold", color: "#333", width: "45%" }}>Item</th>
              <th style={{ padding: "6px 6px", textAlign: "center", fontWeight: "bold", color: "#333", width: "10%" }}>Qty</th>
              <th style={{ padding: "6px 6px", textAlign: "right", fontWeight: "bold", color: "#333", width: "20%" }}>Price</th>
              <th style={{ padding: "6px 6px", textAlign: "right", fontWeight: "bold", color: "#333", width: "25%" }}>Total</th>
             </tr>
          </thead>
          <tbody>
            {itemChunks[0]?.map((item, idx) => (
              <tr key={idx} style={{ borderBottom: "1px solid #eee" }}>
                <td style={{ padding: "6px 6px" }}>
                  <div style={{ fontWeight: "bold" }}>{item.name}</div>
                  <div style={{ fontSize: "7pt", color: "#888" }}>{item.slug || 'N/A'}</div>
                 </td>
                <td style={{ padding: "6px 6px", textAlign: "center" }}>{item.qty}</td>
                <td style={{ padding: "6px 6px", textAlign: "right" }}>Ksh {item.sellingPrice.toLocaleString()}</td>
                <td style={{ padding: "6px 6px", textAlign: "right", fontWeight: "bold" }}>Ksh {(item.sellingPrice * item.qty).toLocaleString()}</td>
               </tr>
            ))}
          </tbody>
         </table>
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "10px", marginBottom: "15px" }}>
            <div style={{ width: "220px", fontSize: "9pt" }}>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "3px 0" }}>
                <span style={{ color: "#666" }}>Subtotal:</span>
                <span>Ksh {subtotal.toLocaleString()}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "3px 0" }}>
                <span style={{ color: "#666" }}>Shipping:</span>
                <span>Ksh {shippingCost.toLocaleString()}</span>
              </div>
              {tax > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between", padding: "3px 0" }}>
                  <span style={{ color: "#666" }}>VAT:</span>
                  <span>Ksh {tax.toLocaleString()}</span>
                </div>
              )}
              {order.discount > 0 && (
                <div style={{ 
                  display: "flex", 
                  justifyContent: "space-between", 
                  padding: "3px 0",
                  backgroundColor: "#d1fae5",
                  borderRadius: "4px",
                  margin: "3px 0"
                }}>
                  <span style={{ color: "#065f46", fontWeight: "500" }}>
                    Discount: {(order as any).appliedPromoCode?.code || "Promo"}
                  </span>
                  <span style={{ color: "#065f46", fontWeight: "bold" }}>
                    -Ksh {order.discount.toLocaleString()}
                  </span>
                </div>
              )}
              <div style={{ 
                display: "flex", 
                justifyContent: "space-between", 
                padding: "6px 0 3px", 
                marginTop: "3px",
                borderTop: "2px solid #1a472a",
                fontSize: "11pt",
                fontWeight: "bold"
              }}>
                <span>Total:</span>
                <span style={{ color: "#1a472a" }}>Ksh {total.toLocaleString()}</span>
              </div>
            </div>
        </div>
        <div style={{ 
          display: "flex",
          gap: "20px",
          padding: "8px 0",
          marginBottom: "10px",
          borderTop: "1px solid #e0e0e0",
          borderBottom: "1px solid #e0e0e0",
          fontSize: "8pt",
          flexWrap: "wrap"
        }}>
          <div><span style={{ fontWeight: "bold" }}>Payment:</span> {order.paymentMethod === "cod" ? "Cash on Delivery" : order.paymentMethod === "mpesa" ? "M-PESA" : "Card"}</div>
          <div>
            <span style={{ fontWeight: "bold" }}>Status:</span>{" "}
            <span style={{ 
              color: order.paymentStatus === "completed" ? "#1a472a" : order.paymentStatus === "failed" ? "#dc2626" : "#d97706"
            }}>
              {order.paymentStatus?.toUpperCase() || "PENDING"}
            </span>
          </div>
          {order.paymentDetails?.transactionId && (
            <div><span style={{ fontWeight: "bold" }}>Txn:</span> <span style={{ fontSize: "7pt", fontFamily: "monospace" }}>{order.paymentDetails.transactionId}</span></div>
          )}
        </div>
        <div style={{ textAlign: "center", fontSize: "7pt", color: "#999" }}>
          {slogan && <p style={{ margin: "0 0 4px 0", fontStyle: "italic" }}>{slogan}</p>}
          <div>
            {companyPhone && <span>{companyPhone}</span>}
            {companyPhone && companyEmail && <span> | </span>}
            {companyEmail && <span>{companyEmail}</span>}
          </div>
          {isPaid ? (
            <p style={{ margin: "4px 0 0 0", color: "#1a472a" }}>✓ Payment Confirmed - Thank you for your business!</p>
          ) : (
            <p style={{ margin: "4px 0 0 0" }}>Thank you for your business!</p>
          )}
        </div>
      </div>
      {itemChunks.slice(1).map((chunk, pageIndex) => (
        <div key={pageIndex} style={{ pageBreakBefore: "always" }}>
          <div style={{ 
            display: "flex", 
            justifyContent: "space-between", 
            alignItems: "center",
            borderBottom: "2px solid #1a472a",
            paddingBottom: "8px",
            marginBottom: "15px"
          }}>
            <div>
              {logoUrl ? (
                <img 
                  src={logoUrl} 
                  alt="Company Logo"
                  style={{ height: "40px", width: "auto", maxWidth: "120px", objectFit: "contain" }}
                />
              ) : (
                <div style={{ height: "40px", width: "80px", backgroundColor: "#f0f0f0", borderRadius: "4px" }}></div>
              )}
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "8pt", color: "#666" }}>
                {documentTitle} - Page {pageIndex + 2} of {itemChunks.length}
              </div>
            </div>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "9pt" }}>
            <thead>
              <tr style={{ backgroundColor: "#f5f5f0", borderBottom: "2px solid #1a472a" }}>
                <th style={{ padding: "6px 6px", textAlign: "left", width: "45%" }}>Item</th>
                <th style={{ padding: "6px 6px", textAlign: "center", width: "10%" }}>Qty</th>
                <th style={{ padding: "6px 6px", textAlign: "right", width: "20%" }}>Price</th>
                <th style={{ padding: "6px 6px", textAlign: "right", width: "25%" }}>Total</th>
               </tr>
            </thead>
            <tbody>
              {chunk.map((item, idx) => (
                <tr key={idx} style={{ borderBottom: "1px solid #eee" }}>
                  <td style={{ padding: "6px 6px" }}>
                    <div style={{ fontWeight: "bold" }}>{item.name}</div>
                    <div style={{ fontSize: "7pt", color: "#888" }}>{item.slug || 'N/A'}</div>
                   </td>
                  <td style={{ padding: "6px 6px", textAlign: "center" }}>{item.qty}</td>
                  <td style={{ padding: "6px 6px", textAlign: "right" }}>Ksh {item.sellingPrice.toLocaleString()}</td>
                  <td style={{ padding: "6px 6px", textAlign: "right", fontWeight: "bold" }}>Ksh {(item.sellingPrice * item.qty).toLocaleString()}</td>
                 </tr>
              ))}
            </tbody>
           </table>
          <div style={{ textAlign: "center", fontSize: "7pt", color: "#999", marginTop: "20px" }}>
            <p style={{ margin: "0" }}>Continued from previous page...</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default function AdminOrderDetails() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const orderId = params.id as string;
  const [isUpdating, setIsUpdating] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState("");
  const [estimatedDelivery, setEstimatedDelivery] = useState("");
  const [showTrackingForm, setShowTrackingForm] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const invoiceRef = useRef<HTMLDivElement>(null);
  
  const { data: settings } = useCompanySettings();
  const logoUrl = getLogoUrl(settings || null);

  const { data: order, isLoading, refetch } = useQuery({
    queryKey: ["adminOrder", orderId],
    queryFn: () => getOrder(orderId),
  });

  const isPaid = order?.paymentStatus === "completed" || order?.status === "paid" || order?.status === "delivered";

  const statusMutation = useMutation({
    mutationFn: ({ status, tracking, delivery }: { status: Order["status"]; tracking?: string; delivery?: string }) =>
      updateOrderStatus(orderId, status, { trackingNumber: tracking, estimatedDelivery: delivery }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminOrder", orderId] });
      queryClient.invalidateQueries({ queryKey: ["adminOrders"] });
      toast.success("Order updated successfully");
      setShowTrackingForm(false);
      setTrackingNumber("");
      setEstimatedDelivery("");
    },
    onError: () => {
      toast.error("Failed to update order");
    },
  });

  const handleUpdateStatus = async (status: Order["status"]) => {
    setIsUpdating(true);
    try {
      await statusMutation.mutateAsync({ status });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAddTracking = async () => {
    if (!order) {
      toast.error("Order not found");
      return;
    }
    if (!trackingNumber) {
      toast.error("Please enter a tracking number");
      return;
    }
    setIsUpdating(true);
    try {
      await statusMutation.mutateAsync({ 
        status: order.status, 
        tracking: trackingNumber,
        delivery: estimatedDelivery || undefined
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!order || !invoiceRef.current) return;
    
    setIsGeneratingPDF(true);
    const loadingToast = toast.loading(`Generating ${isPaid ? "receipt" : "invoice"} PDF...`, { id: "invoice" });
    
    try {
      const element = invoiceRef.current;
      element.classList.add("pdf-generation-mode");
      
      const canvas = await html2canvas(element, {
        scale: 3,
        backgroundColor: "#ffffff",
        logging: false,
        useCORS: true,
        allowTaint: false,
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight,
        onclone: (clonedDoc) => {
          const style = clonedDoc.createElement("style");
          style.textContent = `* { font-family: 'Times New Roman', Times, serif !important; }`;
          clonedDoc.head.appendChild(style);
        }
      });
      
      element.classList.remove("pdf-generation-mode");
      
      const imgData = canvas.toDataURL("image/png", 1.0);
      const pdf = new jsPDF({
        orientation: "p",
        unit: "mm",
        format: "a4",
        compress: true,
        hotfixes: ["px_scaling"]
      });
      
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight, undefined, "FAST");
      pdf.save(`${isPaid ? "RECEIPT" : "INVOICE"}-${order.orderNumber || order._id.slice(-8).toUpperCase()}.pdf`);
      
      toast.success(`${isPaid ? "Receipt" : "Invoice"} generated successfully!`, { id: loadingToast });
    } catch (error) {
      console.error("PDF generation failed:", error);
      toast.error("Failed to generate PDF. Please try again.", { id: loadingToast });
    } finally {
      setIsGeneratingPDF(false);
    }
  };

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
    );
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
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-300" />
            <span className="font-medium">Back to Orders</span>
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-emerald-50/30 dark:from-gray-950 dark:via-slate-900 dark:to-emerald-950/30">
      <div className="fixed left-[-9999px] top-0" ref={invoiceRef}>
        <InvoiceTemplate order={order} settings={settings} logoUrl={logoUrl} isPaid={isPaid} />
      </div>
      <div className="relative overflow-hidden border-b border-gray-200/50 dark:border-gray-800/50">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-blue-500/5 to-purple-500/10"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">

          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-gray-900 dark:text-white">
                  {order.orderNumber || `#${order._id.slice(-8).toUpperCase()}`}
                </h1>
                <OrderStatusBadge status={order.status} />
              </div>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1.5 flex-wrap">
                <CalendarIcon className="w-3.5 h-3.5" />
                Placed on {new Date(order.createdAt).toLocaleDateString("en-US", { 
                  weekday: "long", 
                  year: "numeric", 
                  month: "long", 
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit"
                })}
              </p>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="flex items-center gap-2.5 w-full lg:w-auto"
            >
              <div className="text-right min-w-0">
                <div className="text-xs text-gray-500 dark:text-gray-400 truncate">Total Amount</div>
                <div className="text-xl sm:text-2xl lg:text-3xl font-black bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
                  Ksh {order.total.toLocaleString()}
                </div>
              </div>
              <div className="h-8 w-px bg-gray-300 dark:bg-gray-700 hidden sm:block"></div>
              <div className="flex gap-1.5 flex-wrap justify-center lg:justify-start">
                <motion.button
                  onClick={handleDownloadPDF}
                  disabled={isGeneratingPDF}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="relative p-1.5 sm:p-2.5 rounded-lg bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 text-white transition-all duration-300 shadow-md group"
                >
                  {isGeneratingPDF ? (
                    <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin" />
                  ) : (
                    <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:scale-110 transition-transform duration-300" />
                  )}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-1.5 sm:p-2.5 rounded-lg bg-white/50 dark:bg-gray-800/50 hover:bg-white/80 dark:hover:bg-gray-700/50 transition-all duration-300 border border-gray-200/50 dark:border-gray-700/50 group"
                  onClick={() => refetch()}
                >
                  <RefreshCw className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:rotate-180 transition-transform duration-500" />
                </motion.button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Left Column - Order Items */}
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
                    whileHover={{ backgroundColor: "rgba(0,0,0,0.02)" }}
                    className="p-3 sm:p-4 hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-all duration-300"
                  >
                    <div className="flex flex-col xs:flex-row gap-2.5 sm:gap-3">
                      <div className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 shadow-sm mx-auto sm:mx-0">
                        <Image
                          src={getItemImageUrl(item)}
                          alt={item.name}
                          fill
                          sizes="(max-width: 640px) 80px, 80px"
                          className="object-cover transition-transform duration-300 hover:scale-110"
                          priority={index === 0}
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = '/placeholder-product.jpg';
                          }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-1.5 sm:gap-2.5">
                          <div className="text-center sm:text-left flex-1">
                            <h3 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white mb-0.5">
                              {item.name}
                            </h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                              SKU: {item.slug || 'N/A'}
                            </p>
                            {item.description && (
                              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 line-clamp-2">
                                {item.description}
                              </p>
                            )}
                            <div className="flex items-center justify-center sm:justify-start gap-2 text-xs sm:text-sm mt-1">
                              <span className="text-gray-600 dark:text-gray-300">Ksh {item.sellingPrice.toLocaleString()}</span>
                              <span className="text-gray-400">×</span>
                              <span className="font-semibold text-gray-900 dark:text-white">{item.qty}</span>
                            </div>
                          </div>
                          <div className="text-center sm:text-right mt-2 sm:mt-0">
                            <div className="text-base sm:text-lg font-black text-gray-900 dark:text-white">
                              Ksh {(item.sellingPrice * item.qty).toLocaleString()}
                            </div>
                            <Link 
                              href={`/products/${item.slug}`}
                              className="inline-flex items-center gap-1 mt-1 text-xs sm:text-sm text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
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
              <div className="p-3 sm:p-4 bg-gradient-to-r from-gray-50/50 to-gray-100/50 dark:from-gray-800/40 dark:to-gray-900/40 border-t border-gray-200/50 dark:border-gray-700">
                <div className="flex justify-end">
                  <div className="space-y-1 text-right max-w-[220px]">
                    <div className="flex justify-between text-xs sm:text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Subtotal:</span>
                      <span className="font-medium">Ksh {(order.subtotal || order.total).toLocaleString()}</span>
                    </div>
                    {order.shippingCost > 0 && (
                      <div className="flex justify-between text-xs sm:text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Shipping:</span>
                        <span className="font-medium">Ksh {order.shippingCost.toLocaleString()}</span>
                      </div>
                    )}
                    {order.tax > 0 && (
                      <div className="flex justify-between text-xs sm:text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Tax (VAT):</span>
                        <span className="font-medium">Ksh {order.tax.toLocaleString()}</span>
                      </div>
                    )}
                    {order.discount > 0 && (
                      <div className="flex justify-between text-xs sm:text-sm bg-emerald-50 dark:bg-emerald-950/40 p-2 rounded-lg">
                        <span className="text-gray-600 dark:text-gray-400 truncate">
                          {(order as any).appliedPromoCode?.code || "Promo"}
                        </span>
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                          -Ksh {order.discount.toLocaleString()}
                        </span>
                      </div>
                    )}
                    <div className="pt-1 border-t border-gray-200/50 dark:border-gray-700">
                      <div className="flex justify-between text-sm sm:text-base font-black">
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
          </motion.div>

          {/* Right Column - Customer & Order Info */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-6 lg:sticky lg:top-24"
          >
            {/* Customer Information */}
            <div className="bg-white/80 dark:bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-white/50 shadow-xl p-4 sm:p-6">
              <h3 className="text-base font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <User className="w-4 h-4" />
                Customer Information
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Full Name</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {getCustomerName(order)}
                  </p>
                </div>
                {getCustomerEmail(order) && (
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Email</p>
                    <p className="text-sm text-gray-700 dark:text-gray-300 break-all">
                      {getCustomerEmail(order)}
                    </p>
                  </div>
                )}
                {order.shippingAddress?.phone && (
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Phone</p>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {order.shippingAddress.phone}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-white/80 dark:bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-white/50 shadow-xl p-4 sm:p-6">
              <h3 className="text-base font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Truck className="w-4 h-4" />
                Shipping Address
              </h3>
              <div className="space-y-2 text-sm">
                <p className="font-medium text-gray-900 dark:text-white">
                  {order.shippingAddress.fullName}
                </p>
                <p className="text-gray-600 dark:text-gray-400">
                  {order.shippingAddress.address1}
                  {order.shippingAddress.address2 && <>, {order.shippingAddress.address2}</>}
                </p>
                <p className="text-gray-600 dark:text-gray-400">
                  {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}
                </p>
                <p className="text-gray-600 dark:text-gray-400">
                  {order.shippingAddress.country}
                </p>
                <p className="text-gray-600 dark:text-gray-400 flex items-center gap-1">
                  <Phone className="w-3 h-3" />
                  {order.shippingAddress.phone}
                </p>
              </div>
            </div>

            {/* Payment Information */}
            <div className="bg-white/80 dark:bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-white/50 shadow-xl p-4 sm:p-6">
              <h3 className="text-base font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                Payment Information
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500 dark:text-gray-400">Method</span>
                  <span className="text-sm font-medium capitalize">
                    {order.paymentMethod === 'cod' ? 'Cash on Delivery' : 
                     order.paymentMethod === 'mpesa' ? 'M-PESA' : 'Card'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500 dark:text-gray-400">Status</span>
                  <span className={`text-sm font-medium capitalize ${
                    order.paymentStatus === 'completed' ? 'text-green-600' :
                    order.paymentStatus === 'failed' ? 'text-red-600' : 'text-yellow-600'
                  }`}>
                    {order.paymentStatus || 'Pending'}
                  </span>
                </div>
                {order.paymentDetails?.transactionId && (
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Transaction ID</p>
                    <p className="text-xs font-mono text-gray-700 dark:text-gray-300 break-all">
                      {order.paymentDetails.transactionId}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Update Status */}
            <div className="bg-white/80 dark:bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-white/50 shadow-xl p-4 sm:p-6">
              <h3 className="text-base font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <RefreshCw className="w-4 h-4" />
                Update Order Status
              </h3>
              <div className="space-y-3">
                <select
                  value={order.status}
                  onChange={(e) => handleUpdateStatus(e.target.value as Order['status'])}
                  disabled={isUpdating}
                  className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="paid">Paid</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="refunded">Refunded</option>
                </select>
                
                {order.status === 'shipped' && !order.trackingNumber && (
                  <button
                    onClick={() => setShowTrackingForm(!showTrackingForm)}
                    className="w-full px-3 py-2 text-sm text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors"
                  >
                    Add Tracking Number
                  </button>
                )}
                
                {showTrackingForm && (
                  <div className="space-y-2 pt-2">
                    <input
                      type="text"
                      placeholder="Tracking Number"
                      value={trackingNumber}
                      onChange={(e) => setTrackingNumber(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                    />
                    <input
                      type="date"
                      placeholder="Estimated Delivery"
                      value={estimatedDelivery}
                      onChange={(e) => setEstimatedDelivery(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                    />
                    <button
                      onClick={handleAddTracking}
                      disabled={isUpdating || !trackingNumber}
                      className="w-full px-3 py-2 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors"
                    >
                      {isUpdating ? 'Saving...' : 'Save Tracking Info'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}