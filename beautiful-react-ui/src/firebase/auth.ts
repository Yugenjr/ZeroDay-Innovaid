// @ts-ignore
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  User
} from 'firebase/auth';
// @ts-ignore
import { doc, setDoc, getDoc, collection, query, where, getDocs, deleteDoc } from 'firebase/firestore';
// @ts-ignore
import { auth, db } from './config';

// User interface for our application
export interface AppUser {
  uid: string;
  _id: string; // For backward compatibility
  name: string;
  email: string;
  role: 'user' | 'admin';
  studentId?: string;
  department?: string;
  year?: number;
  phone?: string;
  createdAt: Date;
}

// Helper function to clean up orphaned user data
export const cleanupOrphanedUserData = async (email: string) => {
  try {
    console.log(`Starting cleanup for email: ${email}`);

    // Query Firestore for any documents with this email
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', email));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.docs.length > 0) {
      console.log(`Found ${querySnapshot.docs.length} orphaned documents to clean up`);

      // Delete any orphaned documents
      const deletePromises = querySnapshot.docs.map(doc => {
        console.log(`Deleting document: ${doc.id}`);
        return deleteDoc(doc.ref);
      });
      await Promise.all(deletePromises);

      // Add a small delay to help with Firebase's eventual consistency
      await new Promise(resolve => setTimeout(resolve, 1000));

      console.log(`Successfully cleaned up ${querySnapshot.docs.length} orphaned documents for email: ${email}`);
    } else {
      console.log(`No orphaned documents found for email: ${email}`);
    }

    return true;
  } catch (error) {
    console.error('Error cleaning up orphaned data:', error);
    return false;
  }
};

// Register new user
export const registerUser = async (
  email: string,
  password: string,
  userData: {
    name: string;
    role: 'user' | 'admin';
    studentId?: string;
    department?: string;
    year?: number;
    phone?: string;
  }
) => {
  try {
    // First, clean up any orphaned data for this email
    await cleanupOrphanedUserData(email);

    // Create user with email and password
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Update the user's display name
    await updateProfile(user, {
      displayName: userData.name
    });

    // Create user document in Firestore
    const userDoc: AppUser = {
      uid: user.uid,
      _id: user.uid, // Use uid as _id for compatibility
      name: userData.name,
      email: user.email!,
      role: userData.role,
      department: userData.department,
      phone: userData.phone,
      createdAt: new Date()
    };

    // Only add student-specific fields if they exist
    if (userData.studentId) {
      userDoc.studentId = userData.studentId;
    }
    if (userData.year) {
      userDoc.year = userData.year;
    }

    await setDoc(doc(db, 'users', user.uid), userDoc);

    return {
      success: true,
      user: userDoc,
      message: 'User registered successfully!'
    };
  } catch (error: any) {
    console.error('Registration error:', error);

    // Handle specific Firebase Auth errors
    let errorMessage = 'Registration failed';
    if (error.code === 'auth/email-already-in-use') {
      // Clean up orphaned data more thoroughly
      await cleanupOrphanedUserData(email);
      errorMessage = 'This email was previously registered but incompletely deleted. Please wait a few minutes and try again, or use a different email address.';
    } else if (error.code === 'auth/weak-password') {
      errorMessage = 'Password is too weak. Please use at least 6 characters.';
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = 'Invalid email address format.';
    } else {
      errorMessage = error.message || 'Registration failed';
    }

    return {
      success: false,
      message: errorMessage
    };
  }
};

// Login user
export const loginUser = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Get user data from Firestore
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    
    if (userDoc.exists()) {
      const userData = userDoc.data() as AppUser;
      return {
        success: true,
        user: userData,
        message: 'Login successful!'
      };
    } else {
      return {
        success: false,
        message: 'User data not found'
      };
    }
  } catch (error: any) {
    console.error('Login error:', error);
    return {
      success: false,
      message: error.message || 'Login failed'
    };
  }
};

// Logout user
export const logoutUser = async () => {
  try {
    await signOut(auth);
    return {
      success: true,
      message: 'Logged out successfully!'
    };
  } catch (error: any) {
    console.error('Logout error:', error);
    return {
      success: false,
      message: error.message || 'Logout failed'
    };
  }
};

// Get current user data
export const getCurrentUserData = async (user: User): Promise<AppUser | null> => {
  try {
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    if (userDoc.exists()) {
      return userDoc.data() as AppUser;
    }
    return null;
  } catch (error) {
    console.error('Error getting user data:', error);
    return null;
  }
};
