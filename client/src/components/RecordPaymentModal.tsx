'use client';

import { useState } from 'react';
import { X, Loader2, Smartphone, CreditCard, DollarSign, Banknote, Receipt } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '@/lib/api';

interface RecordPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  orderId: string;
  orderNumber: string;
  totalAmount: number;
  amountPaid: number;
  balanceDue: number;
}

export function RecordPaymentModal({
  isOpen,
  onClose,
  onSuccess,
  orderId,
  orderNumber,
  totalAmount,
  amountPaid,
  balanceDue,
}: RecordPaymentModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    amount: balanceDue,
    paymentMethod: 'mpesa' as 'mpesa' | 'cash' | 'bank_transfer' | 'cheque',
    reference: '',
    notes: '',
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    
    if (formData.amount > balanceDue) {
      toast.error(`Amount cannot exceed balance due of KES ${balanceDue.toLocaleString()}`);
      return;
    }

    setLoading(true);
    try {
      await api.post('/payments/record', {
        orderId,
        amount: formData.amount,
        paymentMethod: formData.paymentMethod,
        reference: formData.reference || undefined,
        notes: formData.notes || undefined,
      });
      
      toast.success(`Payment of KES ${formData.amount.toLocaleString()} recorded successfully`);
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to record payment');
    } finally {
      setLoading(false);
    }
  };

  const getPaymentIcon = (method: string) => {
    switch (method) {
      case 'mpesa': return <Smartphone className="w-4 h-4" />;
      case 'cash': return <DollarSign className="w-4 h-4" />;
      case 'bank_transfer': return <Banknote className="w-4 h-4" />;
      case 'cheque': return <Receipt className="w-4 h-4" />;
      default: return <CreditCard className="w-4 h-4" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl max-w-md w-full shadow-2xl">
        <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Record Payment</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Order: {orderNumber}
            </p>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Amount Summary */}
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Total Amount:</span>
              <span className="font-semibold text-gray-900 dark:text-white">KES {totalAmount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Already Paid:</span>
              <span className="font-semibold text-green-600 dark:text-green-400">KES {amountPaid.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm pt-2 border-t border-gray-200 dark:border-gray-700">
              <span className="text-gray-900 dark:text-white font-medium">Balance Due:</span>
              <span className="font-bold text-amber-600 dark:text-amber-400">KES {balanceDue.toLocaleString()}</span>
            </div>
          </div>

          {/* Amount Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Payment Amount <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">KES</span>
              <input
                type="number"
                step="0.01"
                min="1"
                max={balanceDue}
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                className="w-full pl-12 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-cyan-500"
                required
              />
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Payment Method <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(['mpesa', 'cash', 'bank_transfer', 'cheque'] as const).map((method) => (
                <button
                  key={method}
                  type="button"
                  onClick={() => setFormData({ ...formData, paymentMethod: method })}
                  className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border transition-all ${
                    formData.paymentMethod === method
                      ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-950/30 text-cyan-700 dark:text-cyan-400'
                      : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                >
                  {getPaymentIcon(method)}
                  <span className="capitalize">{method.replace('_', ' ')}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Reference (optional) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Reference (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g., M-Pesa transaction ID, Cheque number, etc."
              value={formData.reference}
              onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          {/* Notes (optional) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Notes (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="Additional notes about this payment..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Record Payment
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-gray-700 dark:text-gray-300"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}