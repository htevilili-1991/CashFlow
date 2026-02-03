import React from 'react';
import { Target, Calendar, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';
import { formatCurrency } from '../../utils/currency';

interface SavingsGoal {
  id: number;
  name: string;
  target_amount: number;
  current_amount: number;
  target_date: string;
  is_completed: boolean;
  created_at: string;
  category_name: string;
}

interface SavingsGoalProps {
  goal: SavingsGoal;
  onEdit?: (goal: SavingsGoal) => void;
  onDelete?: (goalId: number) => void;
  onContribute?: (goalId: number, amount: number) => void;
}

const SavingsGoal: React.FC<SavingsGoalProps> = ({ 
  goal, 
  onEdit, 
  onDelete, 
  onContribute 
}) => {
  const progress = (goal.current_amount / goal.target_amount) * 100;
  const remaining = goal.target_amount - goal.current_amount;
  
  // Calculate ETA based on current contribution rate
  const calculateETA = () => {
    if (goal.current_amount === 0 || goal.is_completed) return null;
    
    const today = new Date();
    const targetDate = new Date(goal.target_date);
    const daysUntilTarget = Math.ceil((targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilTarget <= 0) return 'Overdue';
    
    // Estimate contribution rate (this would ideally come from contribution history)
    const daysSinceCreation = Math.ceil((today.getTime() - new Date(goal.created_at).getTime()) / (1000 * 60 * 60 * 24));
    const contributionRate = goal.current_amount / daysSinceCreation;
    
    if (contributionRate === 0) return 'No contributions yet';
    
    const daysToComplete = Math.ceil(remaining / contributionRate);
    const etaDate = new Date(today.getTime() + (daysToComplete * 24 * 60 * 60 * 1000));
    
    if (daysToComplete <= daysUntilTarget) {
      return `On track (${Math.ceil(daysToComplete)} days)`;
    } else {
      return `${Math.ceil(daysToComplete - daysUntilTarget)} days behind`;
    }
  };

  const getProgressColor = () => {
    if (goal.is_completed) return 'bg-green-500';
    if (progress >= 80) return 'bg-blue-500';
    if (progress >= 50) return 'bg-yellow-500';
    return 'bg-gray-300';
  };

  const getStatusIcon = () => {
    if (goal.is_completed) return <CheckCircle className="w-5 h-5 text-green-600" />;
    const today = new Date();
    const targetDate = new Date(goal.target_date);
    const daysUntilTarget = Math.ceil((targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilTarget <= 0) return <AlertCircle className="w-5 h-5 text-red-600" />;
    if (daysUntilTarget <= 30) return <AlertCircle className="w-5 h-5 text-yellow-600" />;
    return <Target className="w-5 h-5 text-blue-600" />;
  };

  const eta = calculateETA();

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg ${
            goal.is_completed 
              ? 'bg-green-100' 
              : progress >= 80 
              ? 'bg-blue-100'
              : progress >= 50
              ? 'bg-yellow-100'
              : 'bg-gray-100'
          }`}>
            {getStatusIcon()}
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900">{goal.name}</h3>
            <p className="text-sm text-gray-600">{goal.category_name}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {onContribute && !goal.is_completed && (
            <button
              onClick={() => onContribute(goal.id, remaining)}
              className="text-sm px-3 py-1 bg-primary-100 text-primary-700 rounded-lg hover:bg-primary-200"
            >
              Contribute
            </button>
          )}
          {onEdit && (
            <button
              onClick={() => onEdit(goal)}
              className="p-1 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(goal.id)}
              className="p-1 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Progress Section */}
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-600">Progress</span>
          <span className={`font-medium ${
            goal.is_completed ? 'text-green-600' : 'text-gray-900'
          }`}>
            {progress.toFixed(1)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className={`${getProgressColor()} h-3 rounded-full transition-all duration-300`}
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
      </div>

      {/* Financial Details */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-sm text-gray-600">Current</p>
          <p className="font-semibold text-gray-900">{formatCurrency(goal.current_amount)}</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-600">Target</p>
          <p className="font-semibold text-gray-900">{formatCurrency(goal.target_amount)}</p>
        </div>
      </div>

      {/* Remaining Amount */}
      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Remaining</span>
          <span className={`font-semibold ${
            goal.is_completed ? 'text-green-600' : 'text-gray-900'
          }`}>
            {goal.is_completed ? 'Completed!' : formatCurrency(remaining)}
          </span>
        </div>
      </div>

      {/* Date and ETA */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center space-x-2 text-gray-600">
          <Calendar className="w-4 h-4" />
          <span>Target: {new Date(goal.target_date).toLocaleDateString()}</span>
        </div>
        {eta && (
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-4 h-4 text-gray-600" />
            <span className={`font-medium ${
              eta.includes('behind') || eta === 'Overdue' 
                ? 'text-red-600' 
                : eta.includes('On track')
                ? 'text-green-600'
                : 'text-gray-600'
            }`}>
              {eta}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default SavingsGoal;
