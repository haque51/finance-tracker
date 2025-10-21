import React, { useEffect, useState } from 'react';
import { useAccounts } from '../hooks/useAccounts';

export default function AccountsPage() {
  const { accounts, loading, error, createAccount, updateAccount, deleteAccount, refreshAccounts } = useAccounts();
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    // Load accounts on mount
    refreshAccounts();
  }, []);

  const handleCreateAccount = async (accountData) => {
    try {
      await createAccount(accountData);
      setShowModal(false);
      alert('Account created successfully!');
    } catch (err) {
      alert('Failed to create account: ' + err.message);
    }
  };

  const handleDeleteAccount = async (id) => {
    if (!window.confirm('Are you sure you want to delete this account?')) {
      return;
    }

    try {
      await deleteAccount(id);
      alert('Account deleted successfully!');
    } catch (err) {
      alert('Failed to delete account: ' + err.message);
    }
  };

  if (loading && accounts.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Accounts</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Add Account
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {accounts.map(account => (
          <div key={account.id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {account.name}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {account.type}
                </p>
              </div>
              <button
                onClick={() => handleDeleteAccount(account.id)}
                className="text-red-600 hover:text-red-700"
              >
                Delete
              </button>
            </div>

            <div className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {account.currency} {account.balance.toLocaleString()}
            </div>

            <div className="text-sm text-gray-500 dark:text-gray-400">
              {account.transactionCount} transactions
            </div>
          </div>
        ))}
      </div>

      {/* Add Modal would go here */}
    </div>
  );
}
