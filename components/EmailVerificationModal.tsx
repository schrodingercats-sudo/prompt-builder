import React, { useState } from 'react';
import { LogoIcon, CloseIcon } from './Icons';
import { authService } from '../services/authService';

interface EmailVerificationModalProps {
  isOpen: boolean;
  userEmail: string;
  onClose: () => void;
  onVerified: () => void;
}

const EmailVerificationModal: React.FC<EmailVerificationModalProps> = ({ 
  isOpen, 
  userEmail, 
  onClose,
  onVerified 
}) => {
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isResending, setIsResending] = useState(false);

  const handleResendVerification = async () => {
    setIsResending(true);
    setError('');
    setMessage('');

    try {
      await authService.sendVerificationEmail();
      setMessage('Verification email sent! Please check your inbox and spam folder.');
    } catch (e: any) {
      setError(e.message || 'Failed to send verification email.');
    } finally {
      setIsResending(false);
    }
  };

  const handleCheckVerification = async () => {
    try {
      const isVerified = await authService.checkEmailVerified();
      if (isVerified) {
        setMessage('Email verified successfully!');
        setTimeout(() => {
          onVerified();
        }, 1500);
      } else {
        setError('Email not verified yet. Please check your inbox and click the verification link.');
      }
    } catch (e: any) {
      setError(e.message || 'Failed to check verification status.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center animate-fade-in" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md m-4 p-8 relative animate-fade-in-up" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 p-2 text-gray-500 hover:text-gray-800 rounded-full hover:bg-gray-100">
          <CloseIcon className="h-6 w-6" />
        </button>
        
        <div className="flex flex-col items-center text-center">
          <LogoIcon className="h-12 w-12 mb-2" />
          <h2 className="text-2xl font-bold font-serif text-gray-800">
            Verify Your Email
          </h2>
          <p className="text-gray-500 mt-2">
            We've sent a verification email to:
          </p>
          <p className="text-gray-800 font-semibold mt-1">
            {userEmail}
          </p>
          <p className="text-sm text-gray-500 mt-4">
            Please check your inbox and spam folder for the verification link.
          </p>
        </div>

        {message && (
          <div className="mt-6 p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-700 text-sm text-center">{message}</p>
          </div>
        )}

        {error && (
          <div className="mt-6 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm text-center">{error}</p>
          </div>
        )}

        <div className="mt-6 space-y-3">
          <button 
            onClick={handleCheckVerification}
            className="w-full bg-gray-800 text-white font-semibold py-3 rounded-lg shadow-sm hover:bg-gray-900 transition-transform transform hover:scale-105"
          >
            I've Verified My Email
          </button>

          <button 
            onClick={handleResendVerification}
            disabled={isResending}
            className="w-full border border-gray-300 text-gray-700 font-semibold py-3 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isResending ? 'Sending...' : 'Resend Verification Email'}
          </button>
        </div>

        <p className="text-xs text-gray-400 text-center mt-6">
          Can't find the email? Check your spam or junk folder.
        </p>
      </div>
    </div>
  );
};

export default EmailVerificationModal;
