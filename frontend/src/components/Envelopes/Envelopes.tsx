import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Wallet, AlertTriangle, TrendingUp } from 'lucide-react';
import { useEnvelopes } from '../../hooks/useEnvelopes';
import { useCategories } from '../../hooks/useCategories';
import { formatCurrency } from '../../utils/currency';
import type { Category } from '../../types';
import IncomeAllocation from './IncomeAllocation';
import EnvelopeFunding from './EnvelopeFunding';

const Envelopes: React.FC = () => {
  const { 
    envelopes, 
    summary, 
    isLoading, 
    createEnvelope, 
    updateEnvelope, 
    deleteEnvelope,
    isCreating,
    isUpdating,
    isDeleting 
  } = useEnvelopes();
  
  const { categories } = useCategories();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEnvelope, setEditingEnvelope] = useState<any>(null);
  const [envelopeData, setEnvelopeData] = useState({
    category: '',
    budgeted_amount: ''
  });
  const [deleteConfirm, setDeleteConfirm] = useState<any>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!envelopeData.category) return;

    const category = categories.find((cat: Category) => cat.name === envelopeData.category);
    if (!category) return;

    // Create envelope with 0 budget - user will allocate income later
    createEnvelope({
      category: category.id,
      budgeted_amount: '0.00'
    });

    closeModal();
  };

  const openEditModal = (envelope: any) => {
    setEditingEnvelope(envelope);
    setEnvelopeData({
      category: envelope.category_name,
      budgeted_amount: envelope.budgeted_amount
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingEnvelope(null);
    setEnvelopeData({ category: '', budgeted_amount: '' });
  };

  const confirmDelete = () => {
    if (deleteConfirm) {
      deleteEnvelope(deleteConfirm.id);
      setDeleteConfirm(null);
    }
  };

  const getProgressColor = (percentage: number, isOverBudget: boolean) => {
    if (isOverBudget) return 'bg-red-500';
    if (percentage >= 80) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getProgressBgColor = (percentage: number, isOverBudget: boolean) => {
    if (isOverBudget) return 'bg-red-100';
    if (percentage >= 80) return 'bg-yellow-100';
    return 'bg-green-100';
  };

  const getStatusIcon = (envelope: any) => {
    if (envelope.is_over_budget) {
      return <AlertTriangle className="w-4 h-4 text-red-500" />;
    }
    if (envelope.is_near_limit) {
      return <TrendingUp className="w-4 h-4 text-yellow-500" />;
    }
    return <Wallet className="w-4 h-4 text-green-500" />;
  };

  if (isLoading) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>Loading envelopes...</p>
      </div>
    );
  }

  return (
    <div className="p-6 ml-0 lg:ml-4">
      {/* Envelope Funding Section */}
      <EnvelopeFunding />
      
      {/* Income Allocation Section */}
      <IncomeAllocation />
      
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Envelope Budgeting</h1>
          <p className="text-gray-600">Manage your budget envelopes and track spending</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="btn-primary flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Envelope
        </button>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Envelopes</p>
                <p className="text-2xl font-bold text-gray-900">{summary.total_envelopes}</p>
              </div>
              <Wallet className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Budgeted</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(summary.total_budgeted)}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Spent</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(summary.total_spent)}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-orange-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Remaining</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(summary.total_remaining)}</p>
              </div>
              <Wallet className="w-8 h-8 text-purple-500" />
            </div>
          </div>
        </div>
      )}

      {/* Envelopes List */}
      <div className="space-y-4">
        {envelopes.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200 shadow-sm">
            <Wallet className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No envelopes yet</h3>
            <p className="text-gray-600 mb-4">Create your first envelope to start budgeting</p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="btn-primary"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Envelope
            </button>
          </div>
        ) : (
          envelopes.map((envelope) => (
            <div key={envelope.id} className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(envelope)}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{envelope.category_name}</h3>
                    <p className="text-sm text-gray-600">
                      {formatCurrency(envelope.spent_amount)} of {formatCurrency(envelope.budgeted_amount)} spent
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => openEditModal(envelope)}
                    className="p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(envelope)}
                    className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className={`font-medium ${
                    envelope.is_over_budget ? 'text-red-600' : 
                    envelope.is_near_limit ? 'text-yellow-600' : 'text-green-600'
                  }`}>
                    {envelope.percentage_used.toFixed(1)}% used
                  </span>
                  <span className={`font-medium ${
                    envelope.is_over_budget ? 'text-red-600' : 
                    envelope.is_near_limit ? 'text-yellow-600' : 'text-gray-600'
                  }`}>
                    {formatCurrency(envelope.remaining_amount)} remaining
                  </span>
                </div>
                <div className={`w-full rounded-full h-2 ${getProgressBgColor(envelope.percentage_used, envelope.is_over_budget)}`}>
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(envelope.percentage_used, envelope.is_over_budget)}`}
                    style={{ width: `${Math.min(envelope.percentage_used, 100)}%` }}
                  />
                </div>
              </div>

              {/* Status Message */}
              {envelope.is_over_budget && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-red-800 text-sm">
                    <AlertTriangle className="w-4 h-4 inline mr-1" />
                    Over budget by {formatCurrency(Math.abs(parseFloat(envelope.remaining_amount)))}
                  </p>
                </div>
              )}
              {envelope.is_near_limit && !envelope.is_over_budget && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-yellow-800 text-sm">
                    <TrendingUp className="w-4 h-4 inline mr-1" />
                    Near budget limit - only {formatCurrency(envelope.remaining_amount)} remaining
                  </p>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Add Envelope
            </h3>
            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                Envelopes start with VT 0.00 budget. Use the "Allocate Income" button above to add funds from your total income.
              </p>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={envelopeData.category}
                  onChange={(e) => setEnvelopeData({ ...envelopeData, category: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map((category: Category) => (
                    <option key={category.id} value={category.name}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={isCreating}
                >
                  {isCreating ? 'Creating...' : 'Create Envelope'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Delete Envelope</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete the envelope for "{deleteConfirm.category_name}"? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors font-medium"
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Envelopes;
