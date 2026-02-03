import React, { useState } from 'react';
import { Plus, ArrowDownRight, Wallet, TrendingUp } from 'lucide-react';
import { useEnvelopes } from '../../hooks/useEnvelopes';
import { useTransactions } from '../../hooks/useTransactions';
import { useQuery } from '@tanstack/react-query';
import { incomeAPI, type IncomeData } from '../../api/income';
import { formatCurrency } from '../../utils/currency';

interface IncomeAllocationProps {
  onTransactionCreated?: () => void;
}

const IncomeAllocation: React.FC<IncomeAllocationProps> = ({ onTransactionCreated }) => {
  const { envelopes, updateEnvelope } = useEnvelopes();
  const { createTransaction } = useTransactions();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [allocationData, setAllocationData] = useState({
    envelopeId: '',
    amount: '',
    description: ''
  });

  // Fetch income data from API
  const { data: incomeData, isLoading: incomeLoading } = useQuery<IncomeData>({
    queryKey: ['income'],
    queryFn: incomeAPI.getIncome,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Calculate total allocated to envelopes
  const getTotalAllocated = () => {
    return envelopes.reduce((total, envelope) => total + parseFloat(envelope.budgeted_amount), 0);
  };

  const getAvailableIncome = () => {
    if (!incomeData) return 0;
    return incomeData.available_income;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const amount = parseFloat(allocationData.amount);
    const available = getAvailableIncome();
    
    if (amount > available) {
      alert(`Insufficient income! Available: VT ${available.toFixed(2)}, Requested: VT ${amount.toFixed(2)}`);
      return;
    }
    
    if (amount <= 0) {
      alert('Amount must be greater than 0');
      return;
    }

    // Find the envelope
    const envelope = envelopes.find(env => env.id.toString() === allocationData.envelopeId);
    if (!envelope) {
      alert('Please select an envelope');
      return;
    }

    // Update envelope budget
    const newBudgetedAmount = parseFloat(envelope.budgeted_amount) + amount;
    updateEnvelope({ 
      id: envelope.id, 
      data: { budgeted_amount: newBudgetedAmount.toString() } 
    });

    // Create an income transaction record
    createTransaction({
      description: allocationData.description || `Income allocation to ${envelope.category_name}`,
      amount: amount.toString(),
      category: 'Income Allocation',
      transaction_type: 'income',
      date: new Date().toISOString().split('T')[0]
    });

    // Reset form
    setAllocationData({ envelopeId: '', amount: '', description: '' });
    setIsModalOpen(false);
    
    if (onTransactionCreated) {
      onTransactionCreated();
    }
  };

  const availableIncome = getAvailableIncome();
  const totalAllocated = getTotalAllocated();

  if (incomeLoading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 mb-6">
        <div className="text-center py-4 text-gray-500">
          <p>Loading income data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Income Allocation</h3>
          <p className="text-sm text-gray-600 mt-1">
            Transfer income from total to your envelopes
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="btn-primary flex items-center"
          disabled={availableIncome <= 0}
        >
          <Plus className="w-4 h-4 mr-2" />
          Allocate Income
        </button>
      </div>

      {/* Income Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="text-center">
          <div className="flex items-center justify-center mb-2">
            <TrendingUp className="w-5 h-5 text-green-600 mr-2" />
            <span className="text-sm font-medium text-gray-700">Total Income</span>
          </div>
          <p className="text-xl font-bold text-gray-900">{formatCurrency(incomeData?.total_income || 0)}</p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center mb-2">
            <ArrowDownRight className="w-5 h-5 text-blue-600 mr-2" />
            <span className="text-sm font-medium text-gray-700">Allocated</span>
          </div>
          <p className="text-xl font-bold text-gray-900">{formatCurrency(totalAllocated)}</p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center mb-2">
            <Wallet className="w-5 h-5 text-purple-600 mr-2" />
            <span className="text-sm font-medium text-gray-700">Available</span>
          </div>
          <p className={`text-xl font-bold ${
            availableIncome > 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            {formatCurrency(availableIncome)}
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Income Allocation Progress</span>
          <span>{((totalAllocated / (incomeData?.total_income || 1)) * 100).toFixed(1)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${Math.min((totalAllocated / (incomeData?.total_income || 1)) * 100, 100)}%` }}
          />
        </div>
      </div>

      {/* Allocation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Allocate Income to Envelope
            </h3>
            
            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-blue-800">Available Income:</span>
                <span className="text-sm font-bold text-blue-900">{formatCurrency(availableIncome)}</span>
              </div>
              <div className="text-xs text-blue-600">
                This amount will be deducted from your total income
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Envelope
                </label>
                <select
                  value={allocationData.envelopeId}
                  onChange={(e) => setAllocationData({ ...allocationData, envelopeId: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                >
                  <option value="">Select an envelope</option>
                  {envelopes.map((envelope) => (
                    <option key={envelope.id} value={envelope.id.toString()}>
                      {envelope.category_name} - Current: {formatCurrency(envelope.budgeted_amount)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount to Allocate
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  max={availableIncome}
                  value={allocationData.amount}
                  onChange={(e) => setAllocationData({ ...allocationData, amount: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="0.00"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Maximum: {formatCurrency(availableIncome)}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description (Optional)
                </label>
                <input
                  type="text"
                  value={allocationData.description}
                  onChange={(e) => setAllocationData({ ...allocationData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="e.g., Monthly budget allocation"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={availableIncome <= 0 || !allocationData.envelopeId || !allocationData.amount}
                >
                  Allocate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default IncomeAllocation;
