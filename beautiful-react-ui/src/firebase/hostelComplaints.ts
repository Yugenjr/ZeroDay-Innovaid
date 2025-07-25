// @ts-ignore
import { ref as dbRef, push, set, get, update, remove, onValue, off } from 'firebase/database';
// @ts-ignore
import { realtimeDb } from './config';

export interface HostelComplaint {
  id?: string;
  type: string;
  room: string;
  hostelBlock: string;
  description: string;
  status: 'pending' | 'in-progress' | 'resolved';
  date: string;
  raisedBy: string;
  studentId: string;
  studentEmail: string;
  assignedTo?: string;
  resolvedDate?: string;
  priority: 'low' | 'medium' | 'high';
  adminNotes?: string;
  createdAt: string;
  updatedAt: string;
}

// Create a new hostel complaint
export const createHostelComplaint = async (complaintData: Omit<HostelComplaint, 'id' | 'createdAt' | 'updatedAt'>) => {
  try {
    const complaintsRef = dbRef(realtimeDb, 'hostelComplaints');
    const newComplaintRef = push(complaintsRef);
    
    const complaint: HostelComplaint = {
      ...complaintData,
      id: newComplaintRef.key!,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await set(newComplaintRef, complaint);
    console.log('✅ Hostel complaint created successfully:', newComplaintRef.key);

    return {
      success: true,
      message: 'Complaint submitted successfully',
      complaintId: newComplaintRef.key
    };
  } catch (error: any) {
    console.error('❌ Error creating hostel complaint:', error);
    return {
      success: false,
      message: error.message || 'Failed to submit complaint'
    };
  }
};

// Get all hostel complaints (for admins)
export const getAllHostelComplaints = async () => {
  try {
    const complaintsRef = dbRef(realtimeDb, 'hostelComplaints');
    const snapshot = await get(complaintsRef);

    if (snapshot.exists()) {
      const complaintsData = snapshot.val();
      const complaints: HostelComplaint[] = Object.keys(complaintsData).map(key => ({
        ...complaintsData[key],
        id: key
      }));

      // Sort by creation date (newest first)
      complaints.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      return {
        success: true,
        complaints
      };
    } else {
      return {
        success: true,
        complaints: []
      };
    }
  } catch (error: any) {
    console.error('❌ Error fetching hostel complaints:', error);
    return {
      success: false,
      complaints: [],
      message: error.message || 'Failed to fetch complaints'
    };
  }
};

// Get student's hostel complaints
export const getStudentHostelComplaints = async (studentId: string) => {
  try {
    const complaintsRef = dbRef(realtimeDb, 'hostelComplaints');
    const snapshot = await get(complaintsRef);

    const complaints: HostelComplaint[] = [];
    if (snapshot.exists()) {
      const complaintsData = snapshot.val();
      Object.keys(complaintsData).forEach(key => {
        const complaint = complaintsData[key];
        if (complaint.studentId === studentId) {
          complaints.push({
            ...complaint,
            id: key
          });
        }
      });
    }

    // Sort by creation date (newest first)
    complaints.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return {
      success: true,
      complaints
    };
  } catch (error: any) {
    console.error('❌ Error fetching student hostel complaints:', error);
    return {
      success: false,
      complaints: [],
      message: error.message || 'Failed to fetch complaints'
    };
  }
};

// Update hostel complaint status
export const updateHostelComplaintStatus = async (
  complaintId: string,
  status: 'pending' | 'in-progress' | 'resolved',
  adminNotes?: string,
  assignedTo?: string
) => {
  try {
    const complaintRef = dbRef(realtimeDb, `hostelComplaints/${complaintId}`);
    const updateData: any = {
      status,
      updatedAt: new Date().toISOString()
    };

    if (adminNotes) {
      updateData.adminNotes = adminNotes;
    }

    if (assignedTo) {
      updateData.assignedTo = assignedTo;
    }

    if (status === 'resolved') {
      updateData.resolvedDate = new Date().toISOString();
    }

    await update(complaintRef, updateData);

    return {
      success: true,
      message: `Complaint ${status} successfully`
    };
  } catch (error: any) {
    console.error('❌ Error updating hostel complaint status:', error);
    return {
      success: false,
      message: error.message || 'Failed to update complaint status'
    };
  }
};

// Subscribe to hostel complaints (real-time updates)
export const subscribeToHostelComplaints = (callback: (complaints: HostelComplaint[]) => void) => {
  const complaintsRef = dbRef(realtimeDb, 'hostelComplaints');
  
  const unsubscribe = onValue(complaintsRef, (snapshot) => {
    if (snapshot.exists()) {
      const complaintsData = snapshot.val();
      const complaints: HostelComplaint[] = Object.keys(complaintsData).map(key => ({
        ...complaintsData[key],
        id: key
      }));

      // Sort by creation date (newest first)
      complaints.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      callback(complaints);
    } else {
      callback([]);
    }
  });

  return unsubscribe;
};

// Delete hostel complaint
export const deleteHostelComplaint = async (complaintId: string) => {
  try {
    const complaintRef = dbRef(realtimeDb, `hostelComplaints/${complaintId}`);
    await remove(complaintRef);

    return {
      success: true,
      message: 'Complaint deleted successfully'
    };
  } catch (error: any) {
    console.error('❌ Error deleting hostel complaint:', error);
    return {
      success: false,
      message: error.message || 'Failed to delete complaint'
    };
  }
};
