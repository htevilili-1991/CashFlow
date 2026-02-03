import React, { useState } from 'react';
import { Plus, ArrowDownRight, Wallet, TrendingUp, RefreshCw, Target, Calculator, X } from 'lucide-react';
import { useEnvelopes } from '../../hooks/useEnvelopes';
import { useTransactions } from '../../hooks/useTransactions';
import { useQuery } from '@tanstack/react-query';
import { incomeAPI, type IncomeData } from '../../api/income';
import { formatCurrency } from '../../utils/currency';
import toast from 'react-hot-toast';

interface EnvelopeFundingProps {
  onTransactionCreated?: () => void;
}

const EnvelopeFunding: React.FC<EnvelopeFundingProps> = ({ onTransactionCreated }) => {
  const { envelopes, updateEnvelope } = useEnvelopes();
  const { createTransaction } = useTransactions();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [fundingData, setFundingData] = useState<{[key: number]: string}>({});

  // Fetch income data from API
  const { data: incomeData, isLoading: incomeLoading } = useQuery<IncomeData>({
    queryKey: ['income'],
    queryFn: incomeAPI.getIncome,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Calculate funding metrics
  const getAvailableToFund = () => {
    if (!incomeData) return 0;
    return incomeData.available_income;
  };

  const getTotalFundingAmount = () => {
    return Object.values(fundingData).reduce((sum, amount) => sum + parseFloat(amount || '0'), 0);
  };

  const getRemainingAfterFunding = () => {
    return getAvailableToFund() - getTotalFundingAmount();
  };

  // Auto-fill envelopes to their target amounts
  const autoFillEnvelopes = () => {
    const available = getAvailableToFund();
    const newFundingData: {[key: number]: string} = {};
    
    // Sort envelopes by priority (you could add a priority field to envelopes)
    const sortedEnvelopes = [...envelopes].sort((a, b) => {
      // Prioritize envelopes that are currently empty or have lower allocation
      const aPercentage = parseFloat(a.budgeted_amount) / (parseFloat(a.budgeted_amount) + parseFloat(a.remaining_amount) || 1);
      const bPercentage = parseFloat(b.budgeted_amount) / (parseFloat(b.budgeted_amount) + parseFloat(b.remaining_amount) || 1);
      return aPercentage - bPercentage;
    });

    let remaining = available;
    
    for (const envelope of sortedEnvelopes) {
      if (remaining <= 0) break;
      
      const currentBudget = parseFloat(envelope.budgeted_amount);
      const targetBudget = currentBudget + parseFloat(envelope.remaining_amount) || 0;
      const needed = targetBudget - currentBudget;
      
      if (needed > 0 && remaining > 0) {
        const amountToAllocate = Math.min(needed, remaining);
        newFundingData[envelope.id] = amountToAllocate.toString();
        remaining -= amountToAllocate;
      }
    }
    
    setFundingData(newFundingData);
  };

  // Fill all envelopes to zero (complete funding)
  const fillAllToZero = () => {
    const available = getAvailableToFund();
    const newFundingData: {[key: number]: string} = {};
    
    for (const envelope of envelopes) {
      const needed = parseFloat(envelope.remaining_amount) || 0;
      if (needed > 0) {
        newFundingData[envelope.id] = needed.toString();
      }
    }
    
    setFundingData(newFundingData);
  };

  // Quick fill to specific amount
  const quickFillToAmount = (envelopeId: number, targetAmount: number) => {
    const envelope = envelopes.find(e => e.id === envelopeId);
    if (!envelope) return;
    
    const currentBudget = parseFloat(envelope.budgeted_amount);
    const needed = targetAmount - currentBudget;
    
    if (needed > 0) {
      setFundingData(prev => ({
        ...prev,
        [envelopeId]: needed.toString()
      }));
    }
  };

  const handleFundingChange = (envelopeId: number, amount: string) => {
    setFundingData(prev => ({
      ...prev,
      [envelopeId]: amount
    }));
  };

  const handleSubmit = async () => {
    const totalFunding = getTotalFundingAmount();
    const available = getAvailableToFund();
    
    if (totalFunding > available) {
      toast.error(`Insufficient funds! Available: VT ${available.toFixed(2)}, Requested: VT ${totalFunding.toFixed(2)}`);
      return;
    }
    
    if (totalFunding <= 0) {
      toast.error('Please enter an amount to fund');
      return;
    }

    try {
      // Update each envelope budget
      for (const [envelopeId, amount] of Object.entries(fundingData)) {
        if (parseFloat(amount) > 0) {
          const envelope = envelopes.find(e => e.id === parseInt(envelopeId));
          if (envelope) {
            const newBudgetedAmount = parseFloat(envelope.budgeted_amount) + parseFloat(amount);
            await updateEnvelope({ 
              id: envelope.id, 
              data: { budgeted_amount: newBudgetedAmount.toString() } 
            });
          }
        }
      }

      // Create a single funding transaction record
      await createTransaction({
        description: `Envelope funding - ${Object.keys(fundingData).length} envelopes`,
        amount: totalFunding.toString(),
        category: 'Envelope Funding',
        transaction_type: 'expense',
        date: new Date().toISOString().split('T')[0]
      });

      // Reset form
      setFundingData({});
      setIsModalOpen(false);
      
      toast.success(`Successfully funded envelopes with VT ${totalFunding.toFixed(2)}`);
      
      if (onTransactionCreated) {
        onTransactionCreated();
      }
    } catch (error) {
      toast.error('Failed to fund envelopes. Please try again.');
    }
  };

  const availableToFund = getAvailableToFund();
  const totalFunding = getTotalFundingAmount();
  const remainingAfterFunding = getRemainingAfterFunding();

  if (incomeLoading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 mb-6">
        <div className="text-center py-4 text-gray-500">
          <p>Loading funding data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 mb-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-purple-50">
            <Target className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Envelope Funding</h3>
            <p className="text-sm text-gray-600">
              Allocate your available income to envelopes (Zero-based budgeting)
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="btn-primary flex items-center"
          disabled={availableToFund <= 0}
        >
          <Plus className="w-4 h-4 mr-2" />
          Fund Envelopes
        </button>
      </div>

      {/* Funding Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="text-center">
          <div className="flex items-center justify-center mb-2">
            <TrendingUp className="w-5 h-5 text-green-600 mr-2" />
            <span className="text-sm font-medium text-gray-700">Available to Fund</span>
          </div>
          <p className="text-xl font-bold text-gray-900">{formatCurrency(availableToFund)}</p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center mb-2">
            <ArrowDownRight className="w-5 h-5 text-blue-600 mr-2" />
            <span className="text-sm font-medium text-gray-700">Total Funding</span>
          </div>
          <p className="text-xl font-bold text-blue-600">{formatCurrency(totalFunding)}</p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center mb-2">
            <Wallet className="w-5 h-5 text-purple-600 mr-2" />
            <span className="text-sm font-medium text-gray-700">Remaining</span>
          </div>
          <p className={`text-xl font-bold ${
            remainingAfterFunding >= 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            {formatCurrency(remainingAfterFunding)}
          </p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center mb-2">
            <Calculator className="w-5 h-5 text-orange-600 mr-2" />
            <span className="text-sm font-medium text-gray-700">Funding Progress</span>
          </div>
          <p className="text-xl font-bold text-orange-600">
            {availableToFund > 0 ? `${((totalFunding / availableToFund) * 100).toFixed(1)}%` : '0%'}
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Envelope Funding Progress</span>
          <span>{availableToFund > 0 ? `${((totalFunding / availableToFund) * 100).toFixed(1)}%` : '0%'}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-purple-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${Math.min((totalFunding / (availableToFund || 1)) * 100, 100)}%` }}
          />
        </div>
      </div>

      {/* Funding Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Fund Your Envelopes</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="mb-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-purple-800">Available to Fund:</span>
                <span className="text-sm font-bold text-purple-900">{formatCurrency(availableToFund)}</span>
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-purple-800">Total Selected:</span>
                <span className="text-sm font-bold text-purple-900">{formatCurrency(totalFunding)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-purple-800">Remaining:</span>
                <span className={`text-sm font-bold ${
                  remainingAfterFunding >= 0 ? 'text-green-700' : 'text-red-700'
                }`}>
                  {formatCurrency(remainingAfterFunding)}
                </span>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap gap-2 mb-6">
              <button
                onClick={autoFillEnvelopes}
                className="btn-secondary flex items-center text-sm"
              >
                <Calculator className="w-4 h-4 mr-2" />
                Smart Fill
              </button>
              <button
                onClick={fillAllToZero}
                className="btn-secondary flex items-center text-sm"
              >
                <Target className="w-4 h-4 mr-2" />
                Fill to Zero
              </button>
              <button
                onClick={() => setFundingData({})}
                className="btn-secondary flex items-center text-sm"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Clear All
              </button>
            </div>

            {/* Envelope Funding List */}
            <div className="space-y-3 mb-6">
              {envelopes.map((envelope) => (
                <div key={envelope.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${
                        envelope.is_over_budget 
                          ? 'bg-red-100' 
                          : envelope.is_near_limit 
                          ? 'bg-yellow-100'
                          : 'bg-green-100'
                      }`}>
                        <Wallet className={`w-4 h-4 ${
                          envelope.is_over_budget 
                            ? 'text-red-600' 
                            : envelope.is_near_limit 
                            ? 'text-yellow-600'
                            : 'text-green-600'
                        }`} />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{envelope.category_name}</h4>
                        <p className="text-sm text-gray-600">
                          Current: {formatCurrency(envelope.budgeted_amount)} | 
                          Remaining: {formatCurrency(envelope.remaining_amount)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => quickFillToAmount(envelope.id, parseFloat(envelope.budgeted_amount) + parseFloat(envelope.remaining_amount))}
                        className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                      >
                        Fill to Zero
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <label className="text-sm font-medium text-gray-700 w-20">Add VT:</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max={availableToFund}
                      value={fundingData[envelope.id] || ''}
                      onChange={(e) => handleFundingChange(envelope.id, e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="0.00"
                    />
                    <div className="text-sm text-gray-600 w-32 text-right">
                      New Total: {formatCurrency(
                        parseFloat(envelope.budgeted_amount) + parseFloat(fundingData[envelope.id] || '0')
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t">
              <button
                onClick={() => setIsModalOpen(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="btn-primary"
                disabled={totalFunding <= 0 || remainingAfterFunding < 0}
              >
                Fund Envelopes ({formatCurrency(totalFunding)})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnvelopeFunding;
