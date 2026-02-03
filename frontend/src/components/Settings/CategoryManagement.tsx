import React, { useState } from 'react';
import { Plus, Edit2, Trash2, TrendingUp, ArrowDownRight } from 'lucide-react';
import { useCategories } from '../../hooks/useCategories';
import type { Category } from '../../types';

interface CategoryManagementProps {
  transactionType: 'income' | 'expense';
}

const CategoryManagement: React.FC<CategoryManagementProps> = ({ transactionType }) => {
  const { categories, createCategory, updateCategory, deleteCategory, isLoading } = useCategories();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [categoryData, setCategoryData] = useState({
    name: '',
    transaction_type: transactionType
  });
  const [deleteConfirm, setDeleteConfirm] = useState<any>(null);

  // Filter categories by transaction type
  const filteredCategories = (categories as Category[]).filter(cat => cat.transaction_type === transactionType);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryData.name) return;

    if (editingCategory) {
      updateCategory({ id: editingCategory.id, data: categoryData });
    } else {
      createCategory(categoryData);
    }

    closeModal();
  };

  const openEditModal = (category: Category) => {
    setEditingCategory(category);
    setCategoryData({
      name: category.name,
      transaction_type: category.transaction_type
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
    setCategoryData({
      name: '',
      transaction_type: transactionType
    });
  };

  const confirmDelete = () => {
    if (deleteConfirm) {
      deleteCategory(deleteConfirm.id);
      setDeleteConfirm(null);
    }
  };

  const getTypeIcon = () => {
    return transactionType === 'income' ? TrendingUp : ArrowDownRight;
  };

  const getTypeColor = () => {
    return transactionType === 'income' ? 'text-green-600' : 'text-red-600';
  };

  const getTypeBgColor = () => {
    return transactionType === 'income' ? 'bg-green-50' : 'bg-red-50';
  };

  const Icon = getTypeIcon();

  if (isLoading) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>Loading categories...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg ${getTypeBgColor()}`}>
            <Icon className={`w-5 h-5 ${getTypeColor()}`} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 capitalize">
              {transactionType} Categories
            </h3>
            <p className="text-sm text-gray-600">
              Manage your {transactionType} categories for better organization
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="btn-primary flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add {transactionType === 'income' ? 'Income' : 'Expense'} Category
        </button>
      </div>

      {/* Categories List */}
      <div className="space-y-3">
        {filteredCategories.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
            <Icon className={`w-12 h-12 mx-auto mb-4 ${getTypeColor()}`} />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No {transactionType} categories yet
            </h3>
            <p className="text-gray-600 mb-4">
              Create your first {transactionType} category to start organizing transactions
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="btn-primary"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add {transactionType === 'income' ? 'Income' : 'Expense'} Category
            </button>
          </div>
        ) : (
          filteredCategories.map((category) => (
            <div key={category.id} className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${getTypeBgColor()}`}>
                    <Icon className={`w-4 h-4 ${getTypeColor()}`} />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{category.name}</h4>
                    <p className="text-sm text-gray-500 capitalize">{category.transaction_type}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => openEditModal(category)}
                    className="p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(category)}
                    className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {editingCategory ? 'Edit Category' : `Add ${transactionType === 'income' ? 'Income' : 'Expense'} Category`}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category Name
                </label>
                <input
                  type="text"
                  value={categoryData.name}
                  onChange={(e) => setCategoryData({ ...categoryData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder={`e.g., ${transactionType === 'income' ? 'Salary' : 'Food'}`}
                  required
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
                  disabled={isLoading}
                >
                  {isLoading ? 'Saving...' : editingCategory ? 'Update' : 'Create'}
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
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Delete Category</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete the category "{deleteConfirm.name}"? This action cannot be undone.
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
                disabled={isLoading}
              >
                {isLoading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryManagement;
