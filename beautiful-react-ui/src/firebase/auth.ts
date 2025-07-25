// @ts-ignore
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  User
} from 'firebase/auth';
// @ts-ignore
import { doc, setDoc, getDoc } from 'firebase/firestore';
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
      studentId: userData.studentId,
      department: userData.department,
      year: userData.year,
      phone: userData.phone,
      createdAt: new Date()
    };

    await setDoc(doc(db, 'users', user.uid), userDoc);

    return {
      success: true,
      user: userDoc,
      message: 'User registered successfully!'
    };
  } catch (error: any) {
    console.error('Registration error:', error);
    return {
      success: false,
      message: error.message || 'Registration failed'
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
