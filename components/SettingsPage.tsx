import React from 'react';
import { TrashIcon } from './Icons';

interface SettingsPageProps {
  onDeleteAccount: () => void;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ onDeleteAccount }) => {

  const handleSubscription = () => {
    alert('Subscription management is not yet implemented.');
  };

  const handleResetPassword = () => {
    alert('Password reset is not yet implemented.');
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete your account? This action is irreversible and will erase all your saved prompts and data.')) {
      onDeleteAccount();
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl sm:text-5xl font-bold font-serif text-gray-900">Settings</h1>
        <p className="mt-4 text-lg text-gray-600">Manage your account and preferences.</p>
      </div>

      <div className="space-y-8 bg-white p-8 rounded-2xl border border-gray-200/80 shadow-sm">
        <div>
          <h2 className="text-2xl font-semibold text-gray-800">Account</h2>
          <div className="mt-6 space-y-4">
            <SettingsItem
              title="Manage Subscription"
              description="View, upgrade, or cancel your plan."
              buttonText="Manage"
              onClick={handleSubscription}
            />
            <SettingsItem
              title="Reset Password"
              description="Change your password for security."
              buttonText="Reset"
              onClick={handleResetPassword}
            />
          </div>
        </div>

        <div className="border-t border-gray-200 pt-8">
            <h2 className="text-2xl font-semibold text-red-600">Danger Zone</h2>
            <div className="mt-6">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 border border-red-200 bg-red-50 rounded-lg">
                    <div>
                        <h3 className="font-bold text-red-800">Delete Account</h3>
                        <p className="text-red-700 text-sm mt-1">Permanently delete your account and all associated data. This action cannot be undone.</p>
                    </div>
                    <button
                        onClick={handleDelete}
                        className="mt-4 md:mt-0 md:ml-4 flex-shrink-0 bg-red-600 text-white font-semibold px-4 py-2 rounded-lg shadow-sm hover:bg-red-700 transition-colors flex items-center gap-2"
                    >
                        <TrashIcon className="h-5 w-5" />
                        Delete
                    </button>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

// A helper component for consistent styling
const SettingsItem: React.FC<{ title: string; description: string; buttonText: string; onClick: () => void }> = ({ title, description, buttonText, onClick }) => (
  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border border-gray-200 rounded-lg">
    <div>
      <h3 className="font-semibold text-gray-800">{title}</h3>
      <p className="text-gray-500 text-sm mt-1">{description}</p>
    </div>
    <button
      onClick={onClick}
      className="mt-3 sm:mt-0 sm:ml-4 flex-shrink-0 bg-white text-gray-800 font-semibold px-4 py-2 rounded-lg shadow-sm border border-gray-300 hover:bg-gray-50 transition-colors"
    >
      {buttonText}
    </button>
  </div>
);


export default SettingsPage;
