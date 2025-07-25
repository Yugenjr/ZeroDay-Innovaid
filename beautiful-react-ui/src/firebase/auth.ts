// @ts-ignore
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  User
} from 'firebase/auth';
// @ts-ignore
import { doc, setDoc, getDoc, collection, query, where, getDocs, deleteDoc, addDoc, orderBy } from 'firebase/firestore';
// @ts-ignore
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
// @ts-ignore
import { auth, db, storage } from './config';

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

// Event Registration Interfaces and Functions
export interface EventRegistration {
  id?: string;
  eventId: string;
  eventTitle: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  department?: string;
  year?: number;
  phone?: string;
  registrationDate: Date;
  status: 'registered' | 'cancelled';
  additionalInfo?: string;
  attachments?: {
    fileName: string;
    fileUrl: string;
    fileType: string;
    fileSize: number;
    uploadDate: Date;
  }[];
}

// File upload function for event registrations
export const uploadRegistrationFiles = async (
  files: File[],
  studentId: string,
  eventId: string
): Promise<{
  success: boolean;
  attachments?: {
    fileName: string;
    fileUrl: string;
    fileType: string;
    fileSize: number;
    uploadDate: Date;
  }[];
  message?: string;
}> => {
  try {
    console.log('uploadRegistrationFiles called with:', { filesCount: files.length, studentId, eventId });
    const attachments = [];

    for (const file of files) {
      console.log('Processing file:', { name: file.name, size: file.size, type: file.type });

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        console.log('File too large:', file.name);
        return {
          success: false,
          message: `File "${file.name}" is too large. Maximum size is 10MB.`
        };
      }

      // Validate file type
      const allowedTypes = [
        'application/pdf',
        'image/jpeg',
        'image/png',
        'image/jpg',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];

      console.log('Checking file type:', file.type);
      if (!allowedTypes.includes(file.type)) {
        console.log('File type not allowed:', file.type);
        return {
          success: false,
          message: `File type "${file.type}" is not allowed. Please upload PDF, DOC, DOCX, or image files.`
        };
      }

      // Create unique filename
      const timestamp = Date.now();
      const fileName = `${timestamp}_${file.name}`;
      const filePath = `event-registrations/${studentId}/${eventId}/${fileName}`;
      console.log('Uploading file to path:', filePath);

      // Upload file to Firebase Storage
      const storageRef = ref(storage, filePath);
      console.log('Storage ref created, uploading...');
      const snapshot = await uploadBytes(storageRef, file);
      console.log('File uploaded, getting download URL...');
      const downloadURL = await getDownloadURL(snapshot.ref);
      console.log('Download URL obtained:', downloadURL);

      attachments.push({
        fileName: file.name,
        fileUrl: downloadURL,
        fileType: file.type,
        fileSize: file.size,
        uploadDate: new Date()
      });
    }

    return {
      success: true,
      attachments
    };
  } catch (error: any) {
    console.error('File upload error:', error);
    return {
      success: false,
      message: error.message || 'Failed to upload files'
    };
  }
};

// Register student for an event
export const registerForEvent = async (
  eventId: string,
  eventTitle: string,
  studentData: {
    studentId: string;
    studentName: string;
    studentEmail: string;
    department?: string;
    year?: number;
    phone?: string;
    additionalInfo?: string;
  },
  files?: File[]
) => {
  try {
    console.log('registerForEvent called with:', { eventId, eventTitle, studentData, filesCount: files?.length });

    // Check if student is already registered for this event
    console.log('Checking for existing registrations...');
    const registrationsRef = collection(db, 'eventRegistrations');
    const existingQuery = query(
      registrationsRef,
      where('eventId', '==', eventId),
      where('studentId', '==', studentData.studentId),
      where('status', '==', 'registered')
    );
    const existingRegistrations = await getDocs(existingQuery);
    console.log('Existing registrations check completed');

    if (!existingRegistrations.empty) {
      console.log('Student already registered');
      return {
        success: false,
        message: 'You are already registered for this event'
      };
    }

    // Handle file uploads if provided
    console.log('Handling file uploads...');
    let attachments = undefined;
    if (files && files.length > 0) {
      console.log('Uploading files:', files.map(f => ({ name: f.name, size: f.size, type: f.type })));
      const uploadResult = await uploadRegistrationFiles(files, studentData.studentId, eventId);
      console.log('Upload result:', uploadResult);
      if (!uploadResult.success) {
        console.log('File upload failed:', uploadResult.message);
        return {
          success: false,
          message: uploadResult.message || 'Failed to upload files'
        };
      }
      attachments = uploadResult.attachments;
    } else {
      console.log('No files to upload');
    }

    // Create registration document
    console.log('Creating registration document...');
    const registrationData: EventRegistration = {
      eventId,
      eventTitle,
      studentId: studentData.studentId,
      studentName: studentData.studentName,
      studentEmail: studentData.studentEmail,
      department: studentData.department,
      year: studentData.year,
      phone: studentData.phone,
      registrationDate: new Date(),
      status: 'registered',
      additionalInfo: studentData.additionalInfo,
      attachments
    };

    console.log('Registration data:', registrationData);
    const docRef = await addDoc(registrationsRef, registrationData);
    console.log('Document created with ID:', docRef.id);

    // Update registration count in Realtime Database
    try {
      // Import the function dynamically to avoid circular imports
      const { updateEventRegistrationCount } = await import('./announcements');
      await updateEventRegistrationCount(eventId, true);
    } catch (countError) {
      console.warn('Failed to update registration count:', countError);
      // Don't fail the registration if count update fails
    }

    return {
      success: true,
      message: 'Successfully registered for the event!',
      registrationId: docRef.id
    };
  } catch (error: any) {
    console.error('Event registration error:', error);
    return {
      success: false,
      message: error.message || 'Failed to register for event'
    };
  }
};

// Get all registrations for a specific event (for admins)
export const getEventRegistrations = async (eventId?: string) => {
  try {
    const registrationsRef = collection(db, 'eventRegistrations');
    let q;

    if (eventId) {
      q = query(
        registrationsRef,
        where('eventId', '==', eventId),
        where('status', '==', 'registered'),
        orderBy('registrationDate', 'desc')
      );
    } else {
      q = query(
        registrationsRef,
        where('status', '==', 'registered'),
        orderBy('registrationDate', 'desc')
      );
    }

    const querySnapshot = await getDocs(q);
    const registrations: EventRegistration[] = [];

    querySnapshot.forEach((doc) => {
      registrations.push({
        id: doc.id,
        ...doc.data()
      } as EventRegistration);
    });

    return {
      success: true,
      registrations
    };
  } catch (error: any) {
    console.error('Error getting event registrations:', error);
    return {
      success: false,
      message: error.message || 'Failed to get registrations',
      registrations: []
    };
  }
};

// Get registrations for a specific student
export const getStudentRegistrations = async (studentId: string) => {
  try {
    const registrationsRef = collection(db, 'eventRegistrations');
    const q = query(
      registrationsRef,
      where('studentId', '==', studentId),
      where('status', '==', 'registered'),
      orderBy('registrationDate', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const registrations: EventRegistration[] = [];

    querySnapshot.forEach((doc) => {
      registrations.push({
        id: doc.id,
        ...doc.data()
      } as EventRegistration);
    });

    return {
      success: true,
      registrations
    };
  } catch (error: any) {
    console.error('Error getting student registrations:', error);
    return {
      success: false,
      message: error.message || 'Failed to get student registrations',
      registrations: []
    };
  }
};

// Cancel event registration
export const cancelEventRegistration = async (registrationId: string) => {
  try {
    // Get registration data first to access file URLs
    const registrationRef = doc(db, 'eventRegistrations', registrationId);
    const registrationDoc = await getDoc(registrationRef);

    if (registrationDoc.exists()) {
      const registrationData = registrationDoc.data() as EventRegistration;

      // Delete associated files from storage
      if (registrationData.attachments && registrationData.attachments.length > 0) {
        for (const attachment of registrationData.attachments) {
          try {
            const fileRef = ref(storage, attachment.fileUrl);
            await deleteObject(fileRef);
          } catch (fileError) {
            console.warn('Failed to delete file:', attachment.fileName, fileError);
            // Continue with cancellation even if file deletion fails
          }
        }
      }
    }

    // Update registration status
    await setDoc(registrationRef, { status: 'cancelled' }, { merge: true });

    // Update registration count in Realtime Database
    if (registrationDoc.exists()) {
      const registrationData = registrationDoc.data() as EventRegistration;
      try {
        // Import the function dynamically to avoid circular imports
        const { updateEventRegistrationCount } = await import('./announcements');
        await updateEventRegistrationCount(registrationData.eventId, false);
      } catch (countError) {
        console.warn('Failed to update registration count:', countError);
        // Don't fail the cancellation if count update fails
      }
    }

    return {
      success: true,
      message: 'Registration cancelled successfully'
    };
  } catch (error: any) {
    console.error('Error cancelling registration:', error);
    return {
      success: false,
      message: error.message || 'Failed to cancel registration'
    };
  }
};
