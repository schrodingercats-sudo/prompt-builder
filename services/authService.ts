import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  sendEmailVerification,
  deleteUser,
  User
} from 'firebase/auth';
import { auth, googleProvider } from './firebaseConfig';

export interface AuthUser {
  id: string;
  email: string;
  displayName?: string;
  photoURL?: string;
}

export class AuthService {
  // Sign up with email and password
  async signUp(email: string, password: string): Promise<AuthUser> {
    try {
      if (!auth) throw new Error('Authentication is not configured.');
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      return this.mapFirebaseUser(userCredential.user);
    } catch (error: any) {
      // Provide user-friendly error messages
      if (error.code === 'auth/email-already-in-use') {
        throw new Error('This email is already registered. Please sign in instead or use a different email.');
      } else if (error.code === 'auth/weak-password') {
        throw new Error('Password is too weak. Please use at least 6 characters.');
      } else if (error.code === 'auth/invalid-email') {
        throw new Error('Invalid email address format.');
      }
      throw new Error(error.message);
    }
  }

  // Sign in with email and password
  async signIn(email: string, password: string): Promise<AuthUser> {
    try {
      if (!auth) throw new Error('Authentication is not configured.');
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return this.mapFirebaseUser(userCredential.user);
    } catch (error: any) {
      // Provide user-friendly error messages
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password') {
        throw new Error('Incorrect email or password. Please try again or reset your password.');
      } else if (error.code === 'auth/user-not-found') {
        throw new Error('No account found with this email. Please sign up first.');
      } else if (error.code === 'auth/invalid-email') {
        throw new Error('Invalid email address format.');
      } else if (error.code === 'auth/too-many-requests') {
        throw new Error('Too many failed attempts. Please try again later or reset your password.');
      }
      throw new Error(error.message);
    }
  }

  // Sign in with Google
  async signInWithGoogle(): Promise<AuthUser> {
    try {
      if (!auth || !googleProvider) throw new Error('Authentication is not configured.');
      const result = await signInWithPopup(auth, googleProvider);
      return this.mapFirebaseUser(result.user);
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  // Sign out
  async signOut(): Promise<void> {
    try {
      if (!auth) return; // no-op if auth is unavailable
      await signOut(auth);
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  // Get current user
  getCurrentUser(): AuthUser | null {
    if (!auth) return null;
    const user = auth.currentUser;
    return user ? this.mapFirebaseUser(user) : null;
  }

  // Listen to auth state changes
  onAuthStateChanged(callback: (user: AuthUser | null) => void): () => void {
    if (!auth) {
      // Immediately report unauthenticated and provide a no-op unsubscribe
      callback(null);
      return () => {};
    }
    return onAuthStateChanged(auth, (user) => {
      const authUser = user ? this.mapFirebaseUser(user) : null;
      callback(authUser);
    });
  }

  // Send password reset email
  async sendPasswordReset(email: string): Promise<void> {
    try {
      if (!auth) throw new Error('Authentication is not configured.');
      await sendPasswordResetEmail(auth, email, {
        url: window.location.origin, // Return URL after password reset
        handleCodeInApp: false
      });
    } catch (error: any) {
      // Provide more specific error messages
      if (error.code === 'auth/user-not-found') {
        throw new Error('No account found with this email address.');
      } else if (error.code === 'auth/invalid-email') {
        throw new Error('Invalid email address.');
      } else if (error.code === 'auth/too-many-requests') {
        throw new Error('Too many requests. Please try again later.');
      }
      throw new Error(error.message);
    }
  }

  // Send email verification
  async sendVerificationEmail(): Promise<void> {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('No user is currently signed in');
      }
      if (user.emailVerified) {
        throw new Error('Email is already verified');
      }
      await sendEmailVerification(user, {
        url: window.location.origin,
        handleCodeInApp: false
      });
    } catch (error: any) {
      if (error.code === 'auth/too-many-requests') {
        throw new Error('Too many requests. Please try again later.');
      }
      throw new Error(error.message);
    }
  }

  // Check if email is verified
  async checkEmailVerified(): Promise<boolean> {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('No user is currently signed in');
      }
      // Reload user to get latest verification status
      await user.reload();
      return user.emailVerified;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  // Get email verification status
  isEmailVerified(): boolean {
    const user = auth.currentUser;
    return user ? user.emailVerified : false;
  }

  // Delete user account
  async deleteAccount(): Promise<void> {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('No user is currently signed in');
      }
      await deleteUser(user);
    } catch (error: any) {
      if (error.code === 'auth/requires-recent-login') {
        throw new Error('For security reasons, please sign out and sign back in before deleting your account.');
      }
      throw new Error(error.message);
    }
  }

  private mapFirebaseUser(user: User): AuthUser {
    return {
      id: user.uid,
      email: user.email!,
      displayName: user.displayName || undefined,
      photoURL: user.photoURL || undefined,
    };
  }
}

export const authService = new AuthService();