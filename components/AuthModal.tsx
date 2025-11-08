import React, { useState } from 'react';
import { LogoIcon, CloseIcon, GoogleIcon } from './Icons';
import { authService, AuthUser } from '../services/authService';
import { blacklistService } from '../services/blacklistService';
import { emailValidationService } from '../services/emailValidationService';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: AuthUser) => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isResetMode, setIsResetMode] = useState(false);
  const [resetMessage, setResetMessage] = useState('');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
        setError('Please fill in all fields.');
        return;
    }

    // Validate email format and check for disposable emails
    const emailValidation = emailValidationService.validateEmail(email);
    if (!emailValidation.valid) {
      setError(emailValidation.error || 'Invalid email address.');
      return;
    }

    // Check if email is blacklisted (for both sign up and sign in)
    if (blacklistService.isBlacklisted(email)) {
      setError('This account has been permanently deleted and cannot be recreated. Please contact support if you believe this is an error.');
      return;
    }

    try {
      let user: AuthUser;
      
      if (isSignUp) {
        user = await authService.signUp(email, password);
        // Send verification email after signup
        try {
          await authService.sendVerificationEmail();
          setMessage('Account created! Please check your email (including spam folder) to verify your account.');
        } catch (verifyError: any) {
          console.error('Failed to send verification email:', verifyError);
          // Don't block login if verification email fails
        }
      } else {
        user = await authService.signIn(email, password);
      }
      
      onLoginSuccess(user);
    } catch (e: any) {
      setError(e.message || 'An unexpected error occurred. Please try again.');
      console.error(e);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setError('');
      const user = await authService.signInWithGoogle();
      
      // Check if the Google account email is blacklisted
      if (blacklistService.isBlacklisted(user.email)) {
        // Sign out the user immediately
        await authService.signOut();
        setError('This account has been permanently deleted and cannot be recreated. Please contact support if you believe this is an error.');
        return;
      }
      
      onLoginSuccess(user);
    } catch (e: any) {
      setError(e.message || 'Failed to sign in with Google.');
      console.error(e);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setResetMessage('');

    if (!email) {
      setError('Please enter your email address.');
      return;
    }

    try {
      await authService.sendPasswordReset(email);
      setResetMessage('Password reset email sent! Please check your inbox and spam folder.');
    } catch (e: any) {
      setError(e.message || 'Failed to send password reset email.');
      console.error(e);
    }
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setError('');
    setMessage('');
    setResetMessage('');
    setIsResetMode(false);
    setIsSignUp(false);
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
              {isResetMode ? 'Reset Password' : isSignUp ? 'Create an Account' : 'Welcome Back'}
            </h2>
            <p className="text-gray-500 mt-1">
              {isResetMode ? 'Enter your email to receive a password reset link.' : isSignUp ? 'Get started with Promptify.' : 'Sign in to continue.'}
            </p>
        </div>
        
        <form onSubmit={isResetMode ? handlePasswordReset : handleAuth} className="mt-8 space-y-4">
            <div>
                <label className="text-sm font-medium text-gray-700" htmlFor="email">Email</label>
                <input 
                    id="email"
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    className="w-full mt-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-300 focus:border-purple-500"
                    placeholder="you@example.com"
                />
            </div>
            {!isResetMode && (
              <div>
                  <label className="text-sm font-medium text-gray-700" htmlFor="password">Password</label>
                  <input 
                      id="password"
                      type="password"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      required
                      minLength={6}
                      className="w-full mt-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-300 focus:border-purple-500"
                      placeholder="••••••••"
                  />
              </div>
            )}
            {error && <p className="text-red-600 text-sm text-center">{error}</p>}
            {resetMessage && <p className="text-green-600 text-sm text-center">{resetMessage}</p>}
            <button type="submit" className="w-full bg-gray-800 text-white font-semibold py-3 rounded-lg shadow-sm hover:bg-gray-900 transition-transform transform hover:scale-105">
                {isResetMode ? 'Send Reset Email' : isSignUp ? 'Sign Up' : 'Login'}
            </button>
        </form>
        
        <div className="text-center mt-4 space-y-2">
            {!isResetMode ? (
              <>
                <button onClick={() => { setIsSignUp(!isSignUp); setError(''); setResetMessage(''); }} className="text-sm text-purple-600 hover:underline font-medium block">
                    {isSignUp ? 'Already have an account? Login' : "Don't have an account? Sign Up"}
                </button>
                {!isSignUp && (
                  <button onClick={() => { setIsResetMode(true); setError(''); setResetMessage(''); }} className="text-sm text-gray-500 hover:underline font-medium block">
                      Forgot your password?
                  </button>
                )}
              </>
            ) : (
              <button onClick={resetForm} className="text-sm text-purple-600 hover:underline font-medium">
                  Back to Login
              </button>
            )}
        </div>
        
        <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
                <span className="bg-white px-2 text-gray-500">OR</span>
            </div>
        </div>

        {!isResetMode && (
          <div className="space-y-3">
               <button 
                  onClick={handleGoogleSignIn}
                  type="button"
                  className="w-full flex items-center justify-center gap-3 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
               >
                  <GoogleIcon className="h-5 w-5"/>
                  <span className="font-medium text-gray-700">Continue with Google</span>
              </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default AuthModal;
