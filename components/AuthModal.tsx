import React, { useState } from 'react';
import { LogoIcon, CloseIcon, GoogleIcon } from './Icons';
import { authService, AuthUser } from '../services/authService';

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

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
        setError('Please fill in all fields.');
        return;
    }

    try {
      let user: AuthUser;
      
      if (isSignUp) {
        user = await authService.signUp(email, password);
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
      onLoginSuccess(user);
    } catch (e: any) {
      setError(e.message || 'Failed to sign in with Google.');
      console.error(e);
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
            <h2 className="text-2xl font-bold font-serif text-gray-800">{isSignUp ? 'Create an Account' : 'Welcome Back'}</h2>
            <p className="text-gray-500 mt-1">{isSignUp ? 'Get started with Promptify.' : 'Sign in to continue.'}</p>
        </div>
        
        <form onSubmit={handleAuth} className="mt-8 space-y-4">
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
            {error && <p className="text-red-600 text-sm text-center">{error}</p>}
            <button type="submit" className="w-full bg-gray-800 text-white font-semibold py-3 rounded-lg shadow-sm hover:bg-gray-900 transition-transform transform hover:scale-105">
                {isSignUp ? 'Sign Up' : 'Login'}
            </button>
        </form>
        
        <div className="text-center mt-4">
            <button onClick={() => { setIsSignUp(!isSignUp); setError(''); }} className="text-sm text-purple-600 hover:underline font-medium">
                {isSignUp ? 'Already have an account? Login' : "Don't have an account? Sign Up"}
            </button>
        </div>
        
        <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
                <span className="bg-white px-2 text-gray-500">OR</span>
            </div>
        </div>

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

      </div>
    </div>
  );
};

export default AuthModal;
