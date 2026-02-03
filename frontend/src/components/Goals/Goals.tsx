import React from 'react';
import { PiggyBank } from 'lucide-react';
import GoalsManagement from './GoalsManagement';
import { useSavingsGoals } from '../../hooks/useSavingsGoals';

const Goals: React.FC = () => {
  const {
    savingsGoals,
    createSavingsGoal,
    updateSavingsGoal,
    deleteSavingsGoal,
    contributeToGoal,
    isLoading,
  } = useSavingsGoals();

  const handleCreateGoal = (goalData: any) => {
    createSavingsGoal(goalData);
  };

  const handleUpdateGoal = (goalId: number, updates: any) => {
    updateSavingsGoal({ id: goalId, data: updates });
  };

  const handleDeleteGoal = (goalId: number) => {
    if (window.confirm('Are you sure you want to delete this savings goal?')) {
      deleteSavingsGoal(goalId);
    }
  };

  const handleContribute = (goalId: number, amount: number) => {
    contributeToGoal({ id: goalId, amount });
  };

  if (isLoading) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>Loading savings goals...</p>
      </div>
    );
  }

  return (
    <div className="p-6 ml-0 lg:ml-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-purple-50">
            <PiggyBank className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Savings Goals</h1>
            <p className="text-gray-600">Track your savings targets and achieve your financial dreams</p>
          </div>
        </div>
      </div>

      {/* Goals Management */}
      <GoalsManagement
        goals={savingsGoals}
        onCreateGoal={handleCreateGoal}
        onUpdateGoal={handleUpdateGoal}
        onDeleteGoal={handleDeleteGoal}
        onContributeToGoal={handleContribute}
      />
    </div>
  );
};

export default Goals;
