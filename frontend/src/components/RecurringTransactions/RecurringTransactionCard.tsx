import React from 'react';
import { Calendar, Play, SkipForward, Edit2, Trash2, AlertCircle, Clock } from 'lucide-react';
import { formatCurrency } from '../../utils/currency';
import type { RecurringTransaction } from '../../api/recurringTransactions';

interface RecurringTransactionCardProps {
  transaction: RecurringTransaction;
  onEdit: (transaction: RecurringTransaction) => void;
  onDelete: (transactionId: number) => void;
  onCreateNow: (transactionId: number) => void;
  onSkipNext: (transactionId: number) => void;
}

const RecurringTransactionCard: React.FC<RecurringTransactionCardProps> = ({
  transaction,
  onEdit,
  onDelete,
  onCreateNow,
  onSkipNext,
}) => {
  const isOverdue = transaction.is_overdue;
  const daysUntil = transaction.days_until_next;

  const getStatusColor = () => {
    if (transaction.status === 'completed') return 'bg-gray-100 text-gray-600';
    if (isOverdue) return 'bg-red-100 text-red-600';
    if (daysUntil <= 3) return 'bg-yellow-100 text-yellow-600';
    return 'bg-green-100 text-green-600';
  };

  const getStatusText = () => {
    if (transaction.status === 'completed') return 'Completed';
    if (isOverdue) return 'Overdue';
    if (daysUntil === 0) return 'Today';
    if (daysUntil === 1) return 'Tomorrow';
    return `In ${daysUntil} days`;
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg ${getStatusColor()}`}>
            {isOverdue ? (
              <AlertCircle className="w-5 h-5" />
            ) : (
              <Clock className="w-5 h-5" />
            )}
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900">{transaction.name}</h3>
            <p className="text-sm text-gray-600">{transaction.category}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onCreateNow(transaction.id)}
            className="text-sm px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
            disabled={transaction.status !== 'active'}
          >
            Create Now
          </button>
          <button
            onClick={() => onSkipNext(transaction.id)}
            className="text-sm px-3 py-1 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            disabled={transaction.status !== 'active'}
          >
            Skip Next
          </button>
          <button
            onClick={() => onEdit(transaction)}
            className="p-1 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(transaction.id)}
            className="p-1 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Transaction Details */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div>
          <p className="text-sm text-gray-600">Amount</p>
          <p className={`font-semibold ${
            transaction.transaction_type === 'income' ? 'text-green-600' : 'text-red-600'
          }`}>
            {formatCurrency(transaction.amount)}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Frequency</p>
          <p className="font-semibold text-gray-900">{transaction.frequency_display}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Next Date</p>
          <p className="font-semibold text-gray-900">
            {new Date(transaction.next_occurrence).toLocaleDateString()}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Status</p>
          <p className={`font-semibold ${getStatusColor().split(' ')[1]}`}>
            {getStatusText()}
          </p>
        </div>
      </div>

      {/* Progress Info */}
      <div className="flex items-center justify-between text-sm text-gray-600">
        <div className="flex items-center space-x-4">
          <span>Created: {transaction.count_created}</span>
          {transaction.max_occurrences && (
            <span>Max: {transaction.max_occurrences}</span>
          )}
          {transaction.end_date && (
            <span>Ends: {new Date(transaction.end_date).toLocaleDateString()}</span>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <Calendar className="w-4 h-4" />
          <span>{transaction.status_display}</span>
        </div>
      </div>
    </div>
  );
};

export default RecurringTransactionCard;
