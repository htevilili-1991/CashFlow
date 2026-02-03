import React, { useState, useEffect } from 'react';
import { X, Bell, Search, AlertTriangle, Wallet } from 'lucide-react';
import type { Transaction } from '../../types';
import { useEnvelopes } from '../../hooks/useEnvelopes';
import { useCategories } from '../../hooks/useCategories';
import { formatCurrency } from '../../utils/currency';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (transaction: Partial<Transaction>) => void;
  editingTransaction?: Transaction | null;
}

const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  editingTransaction,
}) => {
  const { getEnvelopeByCategoryName } = useEnvelopes();
  const { categories } = useCategories();
  
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    category: '',
    transaction_type: 'expense' as 'income' | 'expense',
    date: new Date().toISOString().split('T')[0],
  });
  
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (editingTransaction) {
      setFormData({
        description: editingTransaction.description,
        amount: editingTransaction.amount,
        category: editingTransaction.category,
        transaction_type: editingTransaction.transaction_type,
        date: editingTransaction.date,
      });
    } else {
      setFormData({
        description: '',
        amount: '',
        category: '',
        transaction_type: 'expense',
        date: new Date().toISOString().split('T')[0],
      });
    }
    setSubmitError(null); // Clear error when modal opens
  }, [editingTransaction, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    
    // Validate envelope budget for expenses
    if (formData.transaction_type === 'expense' && formData.category) {
      const envelope = getEnvelopeByCategoryName(formData.category);
      if (envelope) {
        const amount = parseFloat(formData.amount);
        const remaining = parseFloat(envelope.remaining_amount);
        
        if (amount > remaining) {
          setSubmitError(
            `Amount exceeds envelope budget! Available: VT ${remaining.toFixed(2)}, Entered: VT ${amount.toFixed(2)}. Please reduce the amount.`
          );
          return;
        }
      }
    }
    
    onSubmit(formData);
    onClose();
    setFormData({
      description: '',
      amount: '',
      category: '',
      transaction_type: 'expense',
      date: new Date().toISOString().split('T')[0],
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setSubmitError(null); // Clear error when user makes changes
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">
            {editingTransaction ? 'Edit Transaction' : 'Add Transaction'}
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Error Message */}
          {submitError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-red-800">Envelope Budget Exceeded</h4>
                  <p className="text-sm text-red-700 mt-1">{submitError}</p>
                  <p className="text-xs text-red-600 mt-2">
                    Please adjust the amount or select a different category to continue.
                  </p>
                </div>
              </div>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Transaction Type
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, transaction_type: 'income' }))}
                className={`py-2 px-4 rounded-lg border-2 font-medium transition-colors ${
                  formData.transaction_type === 'income'
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-300 text-gray-700 hover:border-gray-400'
                }`}
              >
                Income
              </button>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, transaction_type: 'expense' }))}
                className={`py-2 px-4 rounded-lg border-2 font-medium transition-colors ${
                  formData.transaction_type === 'expense'
                    ? 'border-red-500 bg-red-50 text-red-700'
                    : 'border-gray-300 text-gray-700 hover:border-gray-400'
                }`}
              >
                Expense
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <input
              type="text"
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="e.g., Grocery shopping"
            />
          </div>

          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
              Amount
            </label>
            <input
              type="number"
              id="amount"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              required
              step="0.01"
              min="0.01"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="VT 0.00"
            />
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Select a category</option>
              {(categories as any[]).filter((cat: any) => cat.transaction_type === formData.transaction_type).map((category: any) => (
                <option key={category.id} value={category.name}>
                  {category.name}
                </option>
              ))}
            </select>
            
            {/* Envelope Balance Display */}
            {formData.transaction_type === 'expense' && formData.category && (() => {
              const envelope = getEnvelopeByCategoryName(formData.category);
              if (envelope) {
                return (
                  <div className={`mt-2 p-3 rounded-lg border ${
                    envelope.is_over_budget 
                      ? 'bg-red-50 border-red-200' 
                      : envelope.is_near_limit 
                      ? 'bg-yellow-50 border-yellow-200'
                      : 'bg-green-50 border-green-200'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {envelope.is_over_budget ? (
                          <AlertTriangle className="w-4 h-4 text-red-500" />
                        ) : envelope.is_near_limit ? (
                          <AlertTriangle className="w-4 h-4 text-yellow-500" />
                        ) : (
                          <Wallet className="w-4 h-4 text-green-500" />
                        )}
                        <span className={`text-sm font-medium ${
                          envelope.is_over_budget 
                            ? 'text-red-700' 
                            : envelope.is_near_limit 
                            ? 'text-yellow-700'
                            : 'text-green-700'
                        }`}>
                          Envelope Balance
                        </span>
                      </div>
                      <span className={`text-sm font-bold ${
                        envelope.is_over_budget 
                          ? 'text-red-700' 
                          : envelope.is_near_limit 
                          ? 'text-yellow-700'
                          : 'text-green-700'
                      }`}>
                        {formatCurrency(envelope.remaining_amount)}
                      </span>
                    </div>
                    <div className="mt-2">
                      <div className="flex justify-between text-xs mb-1">
                        <span className={envelope.is_over_budget || envelope.is_near_limit ? 'text-red-600' : 'text-gray-600'}>
                          {envelope.percentage_used.toFixed(1)}% used
                        </span>
                        <span className="text-gray-600">
                          {formatCurrency(envelope.budgeted_amount)} budgeted
                        </span>
                      </div>
                      <div className={`w-full rounded-full h-1.5 ${
                        envelope.is_over_budget 
                          ? 'bg-red-100' 
                          : envelope.is_near_limit 
                          ? 'bg-yellow-100'
                          : 'bg-green-100'
                      }`}>
                        <div
                          className={`h-1.5 rounded-full transition-all duration-300 ${
                            envelope.is_over_budget 
                              ? 'bg-red-500' 
                              : envelope.is_near_limit 
                              ? 'bg-yellow-500'
                              : 'bg-green-500'
                          }`}
                          style={{ width: `${Math.min(envelope.percentage_used, 100)}%` }}
                        />
                      </div>
                    </div>
                    {envelope.is_over_budget && (
                      <p className="text-xs text-red-600 mt-1">
                        Over budget by {formatCurrency(Math.abs(parseFloat(envelope.remaining_amount)))}
                      </p>
                    )}
                    {envelope.is_near_limit && !envelope.is_over_budget && (
                      <p className="text-xs text-yellow-600 mt-1">
                        Near budget limit
                      </p>
                    )}
                  </div>
                );
              }
              return null;
            })()}
          </div>

          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
              Date
            </label>
            <input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
            >
              {editingTransaction ? 'Update' : 'Add'} Transaction
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransactionModal;
