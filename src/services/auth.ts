import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../lib/firebase';
import api from './api';

/**
 * Sign up a new admin user
 * @param email - User email
 * @param password - User password
 * @returns Promise that resolves when signup and session creation are complete
 */
export const signUp = async (email: string, password: string): Promise<void> => {
    try {
        // Step 1: Call backend /signup endpoint with admin userType
        const signupResponse = await api.post('/signup', {
            email,
            password,
            userType: 'admin', // Always admin for this dashboard
        });

        const { token } = signupResponse.data;

        // Step 2: Create session cookie using the custom token
        await api.post('/sessionLogin', { token });

        // Success - session cookie is now set
    } catch (error: any) {
        // Handle specific error cases
        if (error.response?.status === 400) {
            throw new Error('Invalid email or password format');
        } else if (error.response?.data) {
            throw new Error(error.response.data.message || 'Signup failed');
        } else {
            throw new Error('Network error. Please try again.');
        }
    }
};

/**
 * Login an existing admin user
 * @param email - User email
 * @param password - User password
 * @returns Promise that resolves when login and session creation are complete
 */
export const login = async (email: string, password: string): Promise<void> => {
    try {
        // Step 1: Sign in with Firebase client SDK
        const userCredential = await signInWithEmailAndPassword(auth, email, password);

        // Step 2: Get ID token from Firebase
        const token = await userCredential.user.getIdToken();

        // Step 3: Create session cookie
        await api.post('/sessionLogin', { token });

        // Success - session cookie is now set
    } catch (error: any) {
        // Handle Firebase auth errors
        if (error.code === 'auth/user-not-found') {
            throw new Error('No account found with this email');
        } else if (error.code === 'auth/wrong-password') {
            throw new Error('Incorrect password');
        } else if (error.code === 'auth/invalid-email') {
            throw new Error('Invalid email format');
        } else if (error.code === 'auth/too-many-requests') {
            throw new Error('Too many failed attempts. Please try again later.');
        } else {
            throw new Error(error.message || 'Login failed');
        }
    }
};

/**
 * Logout the current user
 * @returns Promise that resolves when logout is complete
 */
export const logout = async (): Promise<void> => {
    try {
        // Call backend to clear session cookie
        await api.post('/sessionLogout');

        // Sign out from Firebase client
        await auth.signOut();
    } catch (error: any) {
        console.error('Logout error:', error);
        // Even if backend call fails, sign out from Firebase
        await auth.signOut();
        throw new Error('Logout failed');
    }
};
