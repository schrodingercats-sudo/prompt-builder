import React, { useState, useEffect } from 'react';
import { CloseIcon, CheckIcon, SparklesIcon, CreditCardIcon } from './Icons';
import { razorpayService, SUBSCRIPTION_PLANS, SubscriptionPlan } from '../services/razorpayService';
import { databaseService } from '../services/databaseService';
import { AuthUser } from '../services/authService';

interface SubscriptionManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: AuthUser;
  onSubscriptionChange?: () => void;
}

const SubscriptionManagementModal: React.FC<SubscriptionManagementModalProps> = ({ 
  isOpen, 
  onClose, 
  currentUser,
  onSubscriptionChange 
}) => {
  const [subscriptionStatus, setSubscriptionStatus] = useState<string>('free');
  const [expiryDate, setExpiryDate] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan>(SUBSCRIPTION_PLANS[0]);

  useEffect(() => {
    if (isOpen && currentUser) {
      loadSubscriptionStatus();
    }
  }, [isOpen, currentUser]);

  const loadSubscriptionStatus = async () => {
    setIsLoading(true);
    try {
      const status = await databaseService.getUserSubscriptionStatus(currentUser.id);
      setSubscriptionStatus(status.status);
      setExpiryDate(status.expiresAt);
    } catch (err) {
      console.error('Failed to load subscription:', err);
      setError('Failed to load subscription details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpgrade = async () => {
    setIsProcessing(true);
    setError(null);

    try {
      const response = await razorpayService.openPaymentModal(
        selectedPlan,
        currentUser.email,
        currentUser.displayName
      );

      const isValid = razorpayService.verifyPayment(response);
      
      if (isValid) {
        const expiryDate = razorpayService.calculateExpiryDate(selectedPlan);

        await databaseService.updateUserSubscription(currentUser.id, {
          subscription_status: 'pro',
          subscription_id: response.razorpay_payment_id,
          subscription_expires_at: expiryDate.toISOString()
        });

        setSubscriptionStatus('pro');
        setExpiryDate(expiryDate.toISOString());
        
        if (onSubscriptionChange) {
          onSubscriptionChange();
        }
        
        alert('🎉 Successfully upgraded to Pro!');
      }
    } catch (err: any) {
      if (!err.message.includes('cancelled')) {
        setError(err.message || 'Upgrade failed. Please try again.');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancelSubscription = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to cancel your subscription? You will lose access to Pro features at the end of your billing period.'
    );

    if (!confirmed) return;

    setIsProcessing(true);
    setError(null);

    try {
      await databaseService.cancelSubscription(currentUser.id);
      setSubscriptionStatus('cancelled');
      
      if (onSubscriptionChange) {
        onSubscriptionChange();
      }
      
      alert('Subscription cancelled. You will retain Pro access until your current period ends.');
    } catch (err: any) {
      setError(err.message || 'Failed to cancel subscription');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const isProUser = subscriptionStatus === 'pro';
  const isCancelled = subscriptionStatus === 'cancelled';
  const isFreeUser = subscriptionStatus === 'free';

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center animate-fade-in" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl m-4 p-8 relative animate-fade-in-up max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 p-2 text-gray-500 hover:text-gray-800 rounded-full hover:bg-gray-100">
          <CloseIcon className="h-6 w-6" />
        </button>
        
        <div className="text-center mb-8">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-purple-100 mb-4">
            <SparklesIcon className="h-8 w-8 text-purple-600" />
          </div>
          <h2 className="text-3xl font-bold font-serif text-gray-800">Subscription Management</h2>
          <p className="text-gray-500 mt-2">Manage your Promptify subscription</p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
          </div>
        ) : (
          <>
            {/* Current Subscription Status */}
            <div className="mb-8 p-6 bg-gray-50 rounded-xl border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Current Plan</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Status:</span>
                  <span className={`font-semibold px-3 py-1 rounded-full text-sm ${
                    isProUser ? 'bg-green-100 text-green-800' :
                    isCancelled ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {isProUser ? '✨ Pro' : isCancelled ? '⚠️ Cancelled' : '🆓 Free'}
                  </span>
                </div>

                {isProUser && expiryDate && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Renews on:</span>
                    <span className="font-medium text-gray-800">{formatDate(expiryDate)}</span>
                  </div>
                )}

                {isCancelled && expiryDate && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Access until:</span>
                    <span className="font-medium text-gray-800">{formatDate(expiryDate)}</span>
                  </div>
                )}

                {isFreeUser && (
                  <div className="text-sm text-gray-600">
                    <p>• 2 credits per day</p>
                    <p>• All prompts are public</p>
                    <p>• Basic features</p>
                  </div>
                )}

                {isProUser && (
                  <div className="text-sm text-gray-600">
                    <p>• Unlimited credits</p>
                    <p>• Private prompts</p>
                    <p>• Priority support</p>
                    <p>• Advanced features</p>
                  </div>
                )}
              </div>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            {/* Upgrade Section for Free Users */}
            {isFreeUser && (
              <>
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Upgrade to Pro</h3>
                
                {/* Plan Selection */}
                <div className="mb-6 grid grid-cols-2 gap-4">
                  {SUBSCRIPTION_PLANS.map((plan) => (
                    <button
                      key={plan.id}
                      onClick={() => setSelectedPlan(plan)}
                      className={`p-4 rounded-xl border-2 transition-all text-left ${
                        selectedPlan.id === plan.id
                          ? 'border-purple-600 bg-purple-50 shadow-md'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-sm font-semibold text-gray-800">{plan.name}</div>
                      <div className="text-2xl font-bold text-gray-900 mt-1">₹{plan.price}</div>
                      <div className="text-xs text-gray-600 mt-1">per {plan.duration}</div>
                      {plan.id.includes('yearly') && (
                        <div className="text-xs text-green-600 font-medium mt-2 bg-green-50 px-2 py-1 rounded">
                          Save ₹1000
                        </div>
                      )}
                    </button>
                  ))}
                </div>

                {/* Features List */}
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold text-gray-800 mb-3">Pro Features:</h4>
                  <ul className="space-y-2 text-sm text-gray-700">
                    {selectedPlan.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <CheckIcon className="h-4 w-4 text-green-600 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button 
                  onClick={handleUpgrade}
                  disabled={isProcessing}
                  className="w-full bg-purple-600 text-white font-semibold py-3 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing ? (
                    <>
                      <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCardIcon className="h-5 w-5" />
                      Upgrade to Pro - ₹{selectedPlan.price}
                    </>
                  )}
                </button>
              </>
            )}

            {/* Cancel Subscription for Pro Users */}
            {isProUser && (
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Cancel Subscription</h3>
                <p className="text-sm text-gray-600 mb-4">
                  You can cancel your subscription at any time. You'll retain Pro access until {formatDate(expiryDate)}.
                </p>
                <button
                  onClick={handleCancelSubscription}
                  disabled={isProcessing}
                  className="w-full bg-red-600 text-white font-semibold py-3 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing ? 'Processing...' : 'Cancel Subscription'}
                </button>
              </div>
            )}

            {/* Reactivate for Cancelled Users */}
            {isCancelled && (
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Reactivate Subscription</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Your subscription was cancelled but you still have access until {formatDate(expiryDate)}. Reactivate to continue enjoying Pro features.
                </p>
                <button
                  onClick={handleUpgrade}
                  disabled={isProcessing}
                  className="w-full bg-purple-600 text-white font-semibold py-3 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Reactivate Pro Subscription
                </button>
              </div>
            )}
          </>
        )}

        <div className="mt-6 text-center text-xs text-gray-500">
          <p>Payments are securely processed by Razorpay</p>
          <p className="mt-1">Need help? Contact support at support@promptify.com</p>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionManagementModal;
