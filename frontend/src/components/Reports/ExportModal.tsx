import React, { useState } from 'react';
import { X, Download, Calendar, FileText, Database } from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (format: 'csv' | 'json', startDate?: string, endDate?: string) => void;
}

const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose, onExport }) => {
  const [format, setFormat] = useState<'csv' | 'json'>('csv');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onExport(format, startDate || undefined, endDate || undefined);
  };

  const setQuickDateRange = (range: 'this_month' | 'last_month' | 'this_year' | 'last_year') => {
    const now = new Date();
    let start: Date;
    let end: Date;

    switch (range) {
      case 'this_month':
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        break;
      case 'last_month':
        start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        end = new Date(now.getFullYear(), now.getMonth(), 0);
        break;
      case 'this_year':
        start = new Date(now.getFullYear(), 0, 1);
        end = new Date(now.getFullYear(), 11, 31);
        break;
      case 'last_year':
        start = new Date(now.getFullYear() - 1, 0, 1);
        end = new Date(now.getFullYear() - 1, 11, 31);
        break;
    }

    setStartDate(start.toISOString().split('T')[0]);
    setEndDate(end.toISOString().split('T')[0]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Export Data</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Format Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Export Format
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormat('csv')}
                className={`p-3 rounded-lg border-2 transition-colors ${
                  format === 'csv'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <FileText className="w-5 h-5 mx-auto mb-1" />
                <span className="text-sm font-medium">CSV</span>
                <span className="text-xs text-gray-500">Excel/Spreadsheet</span>
              </button>
              
              <button
                type="button"
                onClick={() => setFormat('json')}
                className={`p-3 rounded-lg border-2 transition-colors ${
                  format === 'json'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Database className="w-5 h-5 mx-auto mb-1" />
                <span className="text-sm font-medium">JSON</span>
                <span className="text-xs text-gray-500">Data/Developer</span>
              </button>
            </div>
          </div>

          {/* Date Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date Range (Optional)
            </label>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">End Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Quick Date Range Buttons */}
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setQuickDateRange('this_month')}
                  className="text-xs px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg"
                >
                  This Month
                </button>
                <button
                  type="button"
                  onClick={() => setQuickDateRange('last_month')}
                  className="text-xs px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg"
                >
                  Last Month
                </button>
                <button
                  type="button"
                  onClick={() => setQuickDateRange('this_year')}
                  className="text-xs px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg"
                >
                  This Year
                </button>
                <button
                  type="button"
                  onClick={() => setQuickDateRange('last_year')}
                  className="text-xs px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg"
                >
                  Last Year
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setStartDate('');
                    setEndDate('');
                  }}
                  className="text-xs px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg"
                >
                  All Time
                </button>
              </div>
            </div>
          </div>

          {/* Export Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-start space-x-2">
              <Calendar className="w-4 h-4 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Export Information</p>
                <ul className="text-xs space-y-1">
                  <li>• CSV format is ideal for Excel and spreadsheet applications</li>
                  <li>• JSON format is perfect for data analysis and backup</li>
                  <li>• Leave date range empty to export all transactions</li>
                  <li>• Export includes all transaction details and categories</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Actions */}
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
              className="btn-primary flex items-center"
            >
              <Download className="w-4 h-4 mr-2" />
              Export {format.toUpperCase()}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExportModal;
