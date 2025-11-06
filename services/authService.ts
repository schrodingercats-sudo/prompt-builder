import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  deleteUser,
  User
} from 'firebase/auth';
import { auth, googleProvider } from './firebaseConfig';

export interface AuthUser {
  id: string;
  email: string;
  displayName?: string;
}

export class AuthService {
  // Sign up with email and password
  async signUp(email: string, password: string): Promise<AuthUser> {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      return this.mapFirebaseUser(userCredential.user);
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  // Sign in with email and password
  async signIn(email: string, password: string): Promise<AuthUser> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return this.mapFirebaseUser(userCredential.user);
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  // Sign in with Google
  async signInWithGoogle(): Promise<AuthUser> {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      return this.mapFirebaseUser(result.user);
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  // Sign out
  async signOut(): Promise<void> {
    try {
      await signOut(auth);
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  // Get current user
  getCurrentUser(): AuthUser | null {
    const user = auth.currentUser;
    return user ? this.mapFirebaseUser(user) : null;
  }

  // Listen to auth state changes
  onAuthStateChanged(callback: (user: AuthUser | null) => void): () => void {
    return onAuthStateChanged(auth, (user) => {
      const authUser = user ? this.mapFirebaseUser(user) : null;
      callback(authUser);
    });
  }

  // Send password reset email
  async sendPasswordReset(email: string): Promise<void> {
    try {
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
    };
  }
}

export const authService = new AuthService();