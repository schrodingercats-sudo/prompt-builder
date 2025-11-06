import React from 'react';
import { CloseIcon, CheckIcon, SparklesIcon, CreditCardIcon } from './Icons';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const UpgradeModal: React.FC<UpgradeModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const handleUpgrade = () => {
    // TODO: Integrate with payment system (Stripe, etc.)
    alert('Payment integration coming soon! For now, contact support to upgrade.');
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center animate-fade-in" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md m-4 p-8 relative animate-fade-in-up" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 p-2 text-gray-500 hover:text-gray-800 rounded-full hover:bg-gray-100">
          <CloseIcon className="h-6 w-6" />
        </button>
        
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-purple-100 mb-4">
            <SparklesIcon className="h-8 w-8 text-purple-600" />
          </div>
          <h2 className="text-2xl font-bold font-serif text-gray-800">You're out of credits!</h2>
          <p className="text-gray-500 mt-2">Upgrade to Pro to continue optimizing your prompts and unlock premium features.</p>
        </div>

        <div className="mt-8 bg-gray-800 text-white rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold">Pro Plan</h3>
            <span className="bg-purple-500 text-white text-xs font-bold px-2 py-1 rounded-full">Most Popular</span>
          </div>
          <p className="text-3xl font-extrabold mb-4">$29 <span className="text-lg font-medium text-gray-400">/ month</span></p>
          
          <ul className="space-y-3 text-sm text-gray-200 mb-6">
            <li className="flex items-center gap-3">
              <CheckIcon className="h-5 w-5 text-purple-400 flex-shrink-0" />
              <span>100 prompts / month</span>
            </li>
            <li className="flex items-center gap-3">
              <CheckIcon className="h-5 w-5 text-purple-400 flex-shrink-0" />
              <span>Advanced optimization</span>
            </li>
            <li className="flex items-center gap-3">
              <CheckIcon className="h-5 w-5 text-purple-400 flex-shrink-0" />
              <span>Private prompts</span>
            </li>
            <li className="flex items-center gap-3">
              <CheckIcon className="h-5 w-5 text-purple-400 flex-shrink-0" />
              <span>Priority support</span>
            </li>
          </ul>

          <button 
            onClick={handleUpgrade}
            className="w-full bg-purple-600 text-white font-semibold py-3 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
          >
            <CreditCardIcon className="h-5 w-5" />
            Upgrade to Pro
          </button>
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Your credits will reset in 24 hours, or upgrade now for unlimited access.
          </p>
        </div>
      </div>
    </div>
  );
};

export default UpgradeModal;