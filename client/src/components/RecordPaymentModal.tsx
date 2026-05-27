'use client';

import { useState, useEffect } from 'react';
import { X, Loader2, Smartphone, DollarSign, Banknote, Receipt, CreditCard, CheckCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '@/lib/api';

interface RecordPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  invoiceId: string;
  invoiceNumber: string;
  totalAmount: number;
  amountPaid: number;
  balanceDue: number;
}

export function RecordPaymentModal({
  isOpen,
  onClose,
  onSuccess,
  invoiceId,
  invoiceNumber,
  totalAmount,
  amountPaid,
  balanceDue,
}: RecordPaymentModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    amount: balanceDue,
    paymentMethod: 'mpesa',
    reference: '',
    notes: '',
  });

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        amount: balanceDue,
        paymentMethod: 'mpesa',
        reference: '',
        notes: '',
      });
    }
  }, [isOpen, balanceDue]);

  if (!isOpen) return null;

  const handleAmountChange = (value: string) => {
    // Allow empty string temporarily for typing
    if (value === '') {
      setFormData({ ...formData, amount: 0 });
      return;
    }
    
    let parsedValue = parseFloat(value);
    if (isNaN(parsedValue)) return;
    
    // Ensure amount doesn't exceed balance due
    if (parsedValue > balanceDue) {
      setFormData({ ...formData, amount: balanceDue });
    } else if (parsedValue < 0) {
      setFormData({ ...formData, amount: 0 });
    } else {
      setFormData({ ...formData, amount: parsedValue });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const paymentAmount = formData.amount;
    
    if (paymentAmount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    
    if (paymentAmount > balanceDue) {
      toast.error(`Amount cannot exceed balance due of KES ${balanceDue.toLocaleString()}`);
      return;
    }

    setLoading(true);
    try {
      await api.post(`/sales/invoices/${invoiceId}/payments`, {
        amount: paymentAmount,
        method: formData.paymentMethod,
        reference: formData.reference || undefined,
        notes: formData.notes || undefined,
      });
      
      toast.success(`Payment of KES ${paymentAmount.toLocaleString()} recorded successfully`);
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Payment error:', error);
      toast.error(error.response?.data?.error || 'Failed to record payment');
    } finally {
      setLoading(false);
    }
  };

  const paymentMethods = [
    { value: 'mpesa', label: 'M-PESA', icon: Smartphone, color: 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/30 dark:text-green-400 dark:border-green-800' },
    { value: 'cash', label: 'Cash', icon: DollarSign, color: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800' },
    { value: 'bank_transfer', label: 'Bank Transfer', icon: Banknote, color: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-800' },
    { value: 'card', label: 'Card', icon: CreditCard, color: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/30 dark:text-purple-400 dark:border-purple-800' },
    { value: 'cheque', label: 'Cheque', icon: Receipt, color: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800' },
  ];

  const selectedMethod = paymentMethods.find(m => m.value === formData.paymentMethod);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-md w-full shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800 bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-950/30 dark:to-blue-950/30">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Record Payment</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                Invoice #{invoiceNumber}
              </p>
            </div>
            <button 
              onClick={onClose} 
              className="p-2 hover:bg-white/50 dark:hover:bg-gray-800 rounded-xl transition-all duration-200"
            >
              <X className="w-5 h-5 text-gray-400 dark:text-gray-500" />
            </button>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Amount Summary Cards */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3 text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Total</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">KES {totalAmount.toLocaleString()}</p>
            </div>
            <div className="bg-green-50 dark:bg-green-950/20 rounded-xl p-3 text-center">
              <p className="text-xs text-green-600 dark:text-green-400 mb-1">Paid</p>
              <p className="text-lg font-bold text-green-600 dark:text-green-400">KES {amountPaid.toLocaleString()}</p>
            </div>
            <div className="bg-amber-50 dark:bg-amber-950/20 rounded-xl p-3 text-center">
              <p className="text-xs text-amber-600 dark:text-amber-400 mb-1">Balance</p>
              <p className="text-lg font-bold text-amber-600 dark:text-amber-400">KES {balanceDue.toLocaleString()}</p>
            </div>
          </div>

          {/* Amount Input - No rounding, allows any amount up to balance */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Payment Amount
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">KES</span>
              <input
                type="number"
                step="any"
                min="0"
                max={balanceDue}
                value={formData.amount}
                onChange={(e) => handleAmountChange(e.target.value)}
                className="w-full pl-16 pr-4 py-3 text-lg font-semibold border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                required
                placeholder="Enter amount"
              />
            </div>
            <p className="text-xs text-gray-400 mt-1.5">
              Maximum: KES {balanceDue.toLocaleString()}
            </p>
          </div>

          {/* Payment Method Dropdown */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Payment Method
            </label>
            <div className="relative">
              <select
                value={formData.paymentMethod}
                onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white appearance-none cursor-pointer focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
              >
                {paymentMethods.map((method) => (
                  <option key={method.value} value={method.value}>
                    {method.label}
                  </option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                {selectedMethod && <selectedMethod.icon className="w-5 h-5 text-gray-400" />}
              </div>
            </div>
            
            {/* Selected method hint */}
            <div className={`mt-2 px-3 py-2 rounded-lg text-xs flex items-center gap-2 ${selectedMethod?.color} border`}>
              {selectedMethod && <selectedMethod.icon className="w-3.5 h-3.5" />}
              <span>Payment will be recorded as {selectedMethod?.label}</span>
            </div>
          </div>

          {/* Reference Input */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Reference (Optional)
            </label>
            <input
              type="text"
              placeholder={
                formData.paymentMethod === 'mpesa' ? 'M-PESA Transaction ID' :
                formData.paymentMethod === 'cheque' ? 'Cheque Number' :
                formData.paymentMethod === 'bank_transfer' ? 'Transfer Reference' :
                'Reference Number'
              }
              value={formData.reference}
              onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Notes Input */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Notes (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="Additional notes about this payment..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all resize-none"
            />
          </div>

          {/* Quick Actions */}
          {balanceDue > 0 && (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, amount: balanceDue })}
                className="flex-1 px-3 py-2 text-sm bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors text-gray-700 dark:text-gray-300"
              >
                Pay Full Balance
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, amount: Math.round(balanceDue / 2) })}
                className="flex-1 px-3 py-2 text-sm bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors text-gray-700 dark:text-gray-300"
              >
                Pay Half ({Math.round(balanceDue / 2).toLocaleString()})
              </button>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={loading || formData.amount <= 0}
              className="flex-1 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white rounded-xl font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/25"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <CheckCircle className="w-5 h-5" />
              )}
              Record Payment
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200 text-gray-700 dark:text-gray-300 font-medium"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}