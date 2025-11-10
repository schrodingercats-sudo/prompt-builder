import React, { useState } from 'react';
import { CloseIcon, CheckIcon, SparklesIcon, CreditCardIcon } from './Icons';
import { razorpayService, SUBSCRIPTION_PLANS, SubscriptionPlan } from '../services/razorpayService';
import { databaseService } from '../services/databaseService';
import { emailService } from '../services/emailService';
import { AuthUser } from '../services/authService';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser?: AuthUser;
  onUpgradeSuccess?: () => void;
}

const UpgradeModal: React.FC<UpgradeModalProps> = ({ isOpen, onClose, currentUser, onUpgradeSuccess }) => {
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan>(SUBSCRIPTION_PLANS[0]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleUpgrade = async () => {
    if (!currentUser) {
      setError('Please sign in to upgrade');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Open Razorpay payment modal
      const response = await razorpayService.openPaymentModal(
        selectedPlan,
        currentUser.email,
        currentUser.displayName
      );

      // Verify payment
      const isValid = razorpayService.verifyPayment(response);
      
      if (isValid) {
        // Calculate expiry date
        const expiryDate = razorpayService.calculateExpiryDate(selectedPlan);

        // Update user subscription in database
        try {
          await databaseService.updateUserSubscription(currentUser.id, {
            subscription_status: 'pro',
            subscription_id: response.razorpay_payment_id,
            subscription_expires_at: expiryDate.toISOString()
          });

          // Send payment receipt email
          try {
            await emailService.sendPaymentReceipt({
              userEmail: currentUser.email,
              userName: currentUser.displayName || currentUser.email.split('@')[0],
              paymentId: response.razorpay_payment_id,
              amount: selectedPlan.price * 100, // Convert to paise
              currency: 'INR',
              paymentDate: new Date().toISOString(),
              expiryDate: expiryDate.toISOString(),
              planName: selectedPlan.name
            });
            console.log('Payment receipt email sent successfully');
          } catch (emailError) {
            console.error('Failed to send payment receipt email:', emailError);
            // Don't fail the whole process if email fails
          }

          // Success!
          if (onUpgradeSuccess) {
            onUpgradeSuccess();
          }
          
          alert('🎉 Welcome to Promptimzer Pro! Your subscription is now active. Check your email for the receipt.');
          onClose();
        } catch (dbError) {
          console.error('Failed to update subscription in database:', dbError);
          // Payment succeeded but database update failed
          alert('Payment successful! Please contact support to activate your subscription.');
          onClose();
        }
      } else {
        setError('Payment verification failed. Please try again.');
      }
    } catch (err: any) {
      if (err.message.includes('cancelled')) {
        setError('Payment cancelled');
      } else {
        setError(err.message || 'Payment failed. Please try again.');
      }
    } finally {
      setIsProcessing(false);
    }
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

        {/* Plan Selection */}
        <div className="mt-6 flex gap-3">
          {SUBSCRIPTION_PLANS.map((plan) => (
            <button
              key={plan.id}
              onClick={() => setSelectedPlan(plan)}
              className={`flex-1 p-3 rounded-lg border-2 transition-all ${
                selectedPlan.id === plan.id
                  ? 'border-purple-600 bg-purple-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-sm font-semibold text-gray-800">{plan.name}</div>
              <div className="text-lg font-bold text-gray-900">₹{plan.price}</div>
              {plan.id.includes('yearly') && (
                <div className="text-xs text-green-600 font-medium">Save ₹1000</div>
              )}
            </button>
          ))}
        </div>

        <div className="mt-6 bg-gray-800 text-white rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold">Promptify Pro</h3>
            {selectedPlan.id.includes('yearly') && (
              <span className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">Best Value</span>
            )}
          </div>
          <p className="text-3xl font-extrabold mb-4">
            ₹{selectedPlan.price} 
            <span className="text-lg font-medium text-gray-400"> / {selectedPlan.duration}</span>
          </p>
          
          <ul className="space-y-3 text-sm text-gray-200 mb-6">
            {selectedPlan.features.map((feature, index) => (
              <li key={index} className="flex items-center gap-3">
                <CheckIcon className="h-5 w-5 text-purple-400 flex-shrink-0" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

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
                Pay with Razorpay
              </>
            )}
          </button>
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Secure payment powered by Razorpay. Your credits will reset in 24 hours, or upgrade now for unlimited access.
          </p>
        </div>
      </div>
    </div>
  );
};

export default UpgradeModal;