// @ts-ignore
import { ref as dbRef, push, set, get, update, remove, onValue, off } from 'firebase/database';
// @ts-ignore
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
// @ts-ignore
import { realtimeDb, storage } from './config';
// @ts-ignore
import { updateRegistrationCount } from './announcements';

// Registration interface
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
  additionalInfo?: string;
  attachments?: {
    fileName: string;
    fileUrl: string;
    fileType: string;
    fileSize: number;
  }[];
  registrationDate: string;
  status: 'pending' | 'approved' | 'rejected';
  adminNotes?: string;
}

// Register for an event
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
    console.log('🚀 Starting event registration process...');
    console.log('📊 Registration data:', { eventId, eventTitle, studentData });

    // Simplified registration without file upload for now
    const registrationData = {
      eventId: eventId,
      eventTitle: eventTitle,
      studentId: studentData.studentId,
      studentName: studentData.studentName,
      studentEmail: studentData.studentEmail,
      department: studentData.department || '',
      year: studentData.year || 0,
      phone: studentData.phone || '',
      registrationDate: new Date().toISOString(),
      status: 'pending',
      additionalInfo: studentData.additionalInfo || '',
      timestamp: Date.now()
    };

    console.log('💾 Saving registration to database...', registrationData);

    // Try to write to database
    const registrationsRef = dbRef(realtimeDb, 'registrations');
    const newRegistrationRef = push(registrationsRef);

    console.log('📝 Writing to path:', `registrations/${newRegistrationRef.key}`);
    await set(newRegistrationRef, registrationData);

    console.log('✅ Registration saved successfully with ID:', newRegistrationRef.key);

    return {
      success: true,
      message: 'Registration submitted successfully! Awaiting admin approval.',
      registrationId: newRegistrationRef.key
    };
  } catch (error: any) {
    console.error('❌ Registration error details:', {
      message: error.message,
      code: error.code,
      stack: error.stack,
      error: error
    });
    return {
      success: false,
      message: `Registration failed: ${error.message || 'Unknown error'}`
    };
  }
};

// Get all registrations (for admins)
export const getAllRegistrations = async () => {
  try {
    const registrationsRef = dbRef(realtimeDb, 'registrations');
    const snapshot = await get(registrationsRef);

    const registrations: EventRegistration[] = [];
    if (snapshot.exists()) {
      const data = snapshot.val();
      Object.keys(data).forEach((key) => {
        registrations.push({
          id: key,
          ...data[key]
        } as EventRegistration);
      });

      // Sort by registration date (newest first)
      registrations.sort((a, b) => new Date(b.registrationDate).getTime() - new Date(a.registrationDate).getTime());
    }

    return {
      success: true,
      registrations
    };
  } catch (error: any) {
    console.error('Error fetching registrations:', error);
    return {
      success: false,
      message: error.message || 'Failed to fetch registrations'
    };
  }
};

// Get registrations for a specific event
export const getEventRegistrations = async (eventId: string) => {
  try {
    const registrationsRef = dbRef(realtimeDb, 'registrations');
    const snapshot = await get(registrationsRef);

    const registrations: EventRegistration[] = [];
    if (snapshot.exists()) {
      const data = snapshot.val();
      Object.keys(data).forEach((key) => {
        const registration = data[key];
        if (registration.eventId === eventId) {
          registrations.push({
            id: key,
            ...registration
          } as EventRegistration);
        }
      });

      // Sort by registration date (newest first)
      registrations.sort((a, b) => new Date(b.registrationDate).getTime() - new Date(a.registrationDate).getTime());
    }

    return {
      success: true,
      registrations
    };
  } catch (error: any) {
    console.error('Error fetching event registrations:', error);
    return {
      success: false,
      message: error.message || 'Failed to fetch event registrations'
    };
  }
};

// Update registration status (approve/reject)
export const updateRegistrationStatus = async (
  registrationId: string,
  status: 'approved' | 'rejected',
  adminNotes?: string
) => {
  try {
    // First get the registration to find the eventId
    const registrationRef = dbRef(realtimeDb, `registrations/${registrationId}`);
    const snapshot = await get(registrationRef);

    if (!snapshot.exists()) {
      return {
        success: false,
        message: 'Registration not found'
      };
    }

    const registration = snapshot.val();
    const previousStatus = registration.status;

    // Update the registration status
    await update(registrationRef, {
      status,
      adminNotes: adminNotes || '',
      updatedAt: new Date().toISOString()
    });

    // Update registration count in the event/announcement
    if (registration.eventId) {
      try {
        if (status === 'approved' && previousStatus !== 'approved') {
          // Increment count when approving
          await updateRegistrationCount(registration.eventId, true);
        } else if (status !== 'approved' && previousStatus === 'approved') {
          // Decrement count when changing from approved to rejected/pending
          await updateRegistrationCount(registration.eventId, false);
        }
      } catch (countError) {
        console.error('Error updating registration count:', countError);
        // Don't fail the whole operation if count update fails
      }
    }

    return {
      success: true,
      message: `Registration ${status} successfully`
    };
  } catch (error: any) {
    console.error('Error updating registration status:', error);
    return {
      success: false,
      message: error.message || 'Failed to update registration status'
    };
  }
};

// Get student's registrations
export const getStudentRegistrations = async (studentId: string) => {
  try {
    const registrationsRef = dbRef(realtimeDb, 'registrations');
    const snapshot = await get(registrationsRef);

    const registrations: EventRegistration[] = [];
    if (snapshot.exists()) {
      const data = snapshot.val();
      Object.keys(data).forEach((key) => {
        const registration = data[key];
        if (registration.studentId === studentId) {
          registrations.push({
            id: key,
            ...registration
          } as EventRegistration);
        }
      });

      // Sort by registration date (newest first)
      registrations.sort((a, b) => new Date(b.registrationDate).getTime() - new Date(a.registrationDate).getTime());
    }

    return {
      success: true,
      registrations
    };
  } catch (error: any) {
    console.error('Error fetching student registrations:', error);
    return {
      success: false,
      message: error.message || 'Failed to fetch student registrations'
    };
  }
};

// Delete registration
export const deleteRegistration = async (registrationId: string) => {
  try {
    const registrationRef = dbRef(realtimeDb, `registrations/${registrationId}`);
    await remove(registrationRef);

    return {
      success: true,
      message: 'Registration deleted successfully'
    };
  } catch (error: any) {
    console.error('Error deleting registration:', error);
    return {
      success: false,
      message: error.message || 'Failed to delete registration'
    };
  }
};
