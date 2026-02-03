import React, { useState } from 'react';
import { Plus, Target, Calendar, TrendingUp, PiggyBank, AlertTriangle } from 'lucide-react';
import SavingsGoal from './SavingsGoal';
import { formatCurrency } from '../../utils/currency';
import { useEnvelopes } from '../../hooks/useEnvelopes';

interface Goal {
  id: number;
  name: string;
  target_amount: number;
  current_amount: number;
  target_date: string;
  is_completed: boolean;
  created_at: string;
  category_name: string;
}

interface GoalsManagementProps {
  goals: Goal[];
  onCreateGoal: (goal: Omit<Goal, 'id' | 'current_amount' | 'is_completed' | 'created_at'>) => void;
  onUpdateGoal: (goalId: number, updates: Partial<Goal>) => void;
  onDeleteGoal: (goalId: number) => void;
  onContributeToGoal: (goalId: number, amount: number) => void;
}

const GoalsManagement: React.FC<GoalsManagementProps> = ({
  goals,
  onCreateGoal,
  onUpdateGoal,
  onDeleteGoal,
  onContributeToGoal,
}) => {
  const { envelopes } = useEnvelopes();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [contributeModalOpen, setContributeModalOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [validationError, setValidationError] = useState('');
  
  const [goalData, setGoalData] = useState({
    name: '',
    target_amount: '',
    target_date: '',
    category_name: ''
  });
  
  const [contributionAmount, setContributionAmount] = useState('');

  // Get Savings envelope
  const savingsEnvelope = envelopes.find(env => env.category_name === 'Savings');

  const validateTargetAmount = (amount: number) => {
    if (!savingsEnvelope) {
      setValidationError('No Savings envelope found. Please create a Savings envelope first.');
      return false;
    }
    
    if (amount > Number(savingsEnvelope.budgeted_amount)) {
      setValidationError(`Target amount (${formatCurrency(amount)}) exceeds Savings envelope allocation (${formatCurrency(Number(savingsEnvelope.budgeted_amount))}). Please increase your Savings envelope allocation first.`);
      return false;
    }
    
    setValidationError('');
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalData.name || !goalData.target_amount || !goalData.target_date) return;

    const targetAmount = parseInt(goalData.target_amount);
    
    // Validate against Savings envelope
    if (!validateTargetAmount(targetAmount)) {
      return; // Validation failed, error message is set
    }

    const goalPayload = {
      name: goalData.name,
      target_amount: targetAmount,
      target_date: goalData.target_date,
      category_name: goalData.category_name || 'Savings Goal'
    };

    if (editingGoal) {
      onUpdateGoal(editingGoal.id, goalPayload);
    } else {
      onCreateGoal(goalPayload);
    }

    closeModal();
  };

  const handleContribute = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGoal || !contributionAmount) return;

    const contributionAmount = parseInt(contributionAmount);
    
    // Validate against available savings envelope
    if (!savingsEnvelope) {
      setValidationError('No Savings envelope found. Please create a Savings envelope first.');
      return;
    }
    
    const availableSavings = Number(savingsEnvelope.remaining_amount);
    if (contributionAmount > availableSavings) {
      setValidationError(`Contribution amount (${formatCurrency(contributionAmount)}) exceeds available Savings envelope balance (${formatCurrency(availableSavings)}).`);
      return;
    }
    
    setValidationError('');
    onContributeToGoal(selectedGoal.id, contributionAmount);
    closeContributeModal();
  };

  const openEditModal = (goal: Goal) => {
    setEditingGoal(goal);
    setGoalData({
      name: goal.name,
      target_amount: goal.target_amount.toString(),
      target_date: goal.target_date,
      category_name: goal.category_name
    });
    setIsModalOpen(true);
  };

  const openContributeModal = (goal: Goal, suggestedAmount?: number) => {
    setSelectedGoal(goal);
    setContributionAmount(suggestedAmount?.toString() || '');
    setContributeModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingGoal(null);
    setGoalData({
      name: '',
      target_amount: '',
      target_date: '',
      category_name: ''
    });
  };

  const closeContributeModal = () => {
    setContributeModalOpen(false);
    setSelectedGoal(null);
    setContributionAmount('');
  };

  // Calculate overall goals statistics
  const totalTarget = goals.reduce((sum, goal) => sum + goal.target_amount, 0);
  const totalSaved = goals.reduce((sum, goal) => sum + goal.current_amount, 0);
  const overallProgress = totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0;
  const completedGoals = goals.filter(goal => goal.is_completed).length;
  const activeGoals = goals.filter(goal => !goal.is_completed).length;

  return (
    <div className="space-y-6">
      {/* Header and Statistics */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-purple-50">
            <PiggyBank className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Savings Goals</h3>
            <p className="text-sm text-gray-600">Track your savings targets and progress</p>
          </div>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="btn-primary flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Goal
        </button>
      </div>

      {/* Goals Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Total Target</span>
            <Target className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-xl font-bold text-gray-900">{formatCurrency(totalTarget)}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Total Saved</span>
            <TrendingUp className="w-4 h-4 text-green-600" />
          </div>
          <p className="text-xl font-bold text-green-600">{formatCurrency(totalSaved)}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Progress</span>
            <div className="w-4 h-4 bg-purple-600 rounded-full" />
          </div>
          <p className="text-xl font-bold text-purple-600">{overallProgress.toFixed(1)}%</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Active Goals</span>
            <Calendar className="w-4 h-4 text-orange-600" />
          </div>
          <p className="text-xl font-bold text-orange-600">{activeGoals}</p>
        </div>
      </div>

      {/* Overall Progress Bar */}
      {goals.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Overall Progress</span>
            <span>{overallProgress.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-purple-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(overallProgress, 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>{formatCurrency(totalSaved)}</span>
            <span>{formatCurrency(totalTarget)}</span>
          </div>
        </div>
      )}

      {/* Goals List */}
      <div className="space-y-4">
        {goals.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
            <PiggyBank className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No savings goals yet</h3>
            <p className="text-gray-600 mb-4">
              Create your first savings goal to start tracking your progress
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="btn-primary"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Goal
            </button>
          </div>
        ) : (
          goals.map((goal) => (
            <SavingsGoal
              key={goal.id}
              goal={goal}
              onEdit={openEditModal}
              onDelete={onDeleteGoal}
              onContribute={(goalId: number, amount: number) => openContributeModal(goal, amount)}
            />
          ))
        )}
      </div>

      {/* Add/Edit Goal Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {editingGoal ? 'Edit Savings Goal' : 'Create Savings Goal'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Goal Name
                </label>
                <input
                  type="text"
                  value={goalData.name}
                  onChange={(e) => setGoalData({ ...goalData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="e.g., New Phone, Emergency Fund"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Target Amount (VT)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={goalData.target_amount}
                  onChange={(e) => setGoalData({ ...goalData, target_amount: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="50000.00"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Target Date
                </label>
                <input
                  type="date"
                  value={goalData.target_date}
                  onChange={(e) => setGoalData({ ...goalData, target_date: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category (Optional)
                </label>
                <input
                  type="text"
                  value={goalData.category_name}
                  onChange={(e) => setGoalData({ ...goalData, category_name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="e.g., Technology, Emergency, Travel"
                />
              </div>
              <div className="flex justify-end space-x-3 pt-4">
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
                >
                  {editingGoal ? 'Update Goal' : 'Create Goal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Contribute Modal */}
      {contributeModalOpen && selectedGoal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Contribute to Goal</h3>
            <div className="mb-4 p-4 bg-purple-50 border border-purple-200 rounded-lg">
              <h4 className="font-medium text-purple-900">{selectedGoal.name}</h4>
              <div className="flex justify-between text-sm text-purple-700 mt-2">
                <span>Current: {formatCurrency(selectedGoal.current_amount)}</span>
                <span>Target: {formatCurrency(selectedGoal.target_amount)}</span>
              </div>
              <div className="flex justify-between text-sm text-purple-700 mt-1">
                <span>Remaining: {formatCurrency(selectedGoal.target_amount - selectedGoal.current_amount)}</span>
              </div>
            </div>
            <form onSubmit={handleContribute} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contribution Amount (VT)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  max={selectedGoal.target_amount - selectedGoal.current_amount}
                  value={contributionAmount}
                  onChange={(e) => setContributionAmount(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="0.00"
                  required
                />
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={closeContributeModal}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                >
                  Contribute {contributionAmount ? formatCurrency(parseFloat(contributionAmount)) : ''}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GoalsManagement;
