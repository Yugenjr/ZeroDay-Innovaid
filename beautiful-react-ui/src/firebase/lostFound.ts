// @ts-ignore
import { ref as dbRef, push, set, get, update, remove, onValue, off } from 'firebase/database';
// @ts-ignore
import { realtimeDb } from './config';

export interface LostFoundItem {
  id?: string;
  type: 'lost' | 'found';
  itemName: string;
  category: string;
  location: string;
  date: string;
  description: string;
  reportedBy: string;
  studentId: string;
  studentEmail: string;
  status: 'pending' | 'approved' | 'claimed' | 'resolved' | 'rejected';
  image?: string;
  adminNotes?: string;
  createdAt: string;
  updatedAt: string;
  approvedBy?: string;
  approvedDate?: string;
  claimedBy?: string;
  claimedDate?: string;
}

// Create a new lost & found item
export const createLostFoundItem = async (itemData: Omit<LostFoundItem, 'id' | 'createdAt' | 'updatedAt'>) => {
  try {
    const itemsRef = dbRef(realtimeDb, 'lostFoundItems');
    const newItemRef = push(itemsRef);
    
    const item: LostFoundItem = {
      ...itemData,
      id: newItemRef.key!,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await set(newItemRef, item);
    console.log('✅ Lost & Found item created successfully:', newItemRef.key);

    return {
      success: true,
      message: 'Item reported successfully',
      itemId: newItemRef.key
    };
  } catch (error: any) {
    console.error('❌ Error creating lost & found item:', error);
    return {
      success: false,
      message: error.message || 'Failed to report item'
    };
  }
};

// Get all lost & found items (for admins and students)
export const getAllLostFoundItems = async () => {
  try {
    const itemsRef = dbRef(realtimeDb, 'lostFoundItems');
    const snapshot = await get(itemsRef);

    if (snapshot.exists()) {
      const itemsData = snapshot.val();
      const items: LostFoundItem[] = Object.keys(itemsData).map(key => ({
        ...itemsData[key],
        id: key
      }));

      // Sort by creation date (newest first)
      items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      return {
        success: true,
        items
      };
    } else {
      return {
        success: true,
        items: []
      };
    }
  } catch (error: any) {
    console.error('❌ Error fetching lost & found items:', error);
    return {
      success: false,
      items: [],
      message: error.message || 'Failed to fetch items'
    };
  }
};

// Get student's lost & found items
export const getStudentLostFoundItems = async (studentId: string) => {
  try {
    const itemsRef = dbRef(realtimeDb, 'lostFoundItems');
    const snapshot = await get(itemsRef);

    const items: LostFoundItem[] = [];
    if (snapshot.exists()) {
      const itemsData = snapshot.val();
      Object.keys(itemsData).forEach(key => {
        const item = itemsData[key];
        if (item.studentId === studentId) {
          items.push({
            ...item,
            id: key
          });
        }
      });
    }

    // Sort by creation date (newest first)
    items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return {
      success: true,
      items
    };
  } catch (error: any) {
    console.error('❌ Error fetching student lost & found items:', error);
    return {
      success: false,
      items: [],
      message: error.message || 'Failed to fetch items'
    };
  }
};

// Update lost & found item status (approve/reject/claim)
export const updateLostFoundItemStatus = async (
  itemId: string,
  status: 'pending' | 'approved' | 'claimed' | 'resolved' | 'rejected',
  adminNotes?: string,
  approvedBy?: string,
  claimedBy?: string
) => {
  try {
    const itemRef = dbRef(realtimeDb, `lostFoundItems/${itemId}`);
    const updateData: any = {
      status,
      updatedAt: new Date().toISOString()
    };

    if (adminNotes) {
      updateData.adminNotes = adminNotes;
    }

    if (status === 'approved' && approvedBy) {
      updateData.approvedBy = approvedBy;
      updateData.approvedDate = new Date().toISOString();
    }

    if (status === 'claimed' && claimedBy) {
      updateData.claimedBy = claimedBy;
      updateData.claimedDate = new Date().toISOString();
    }

    await update(itemRef, updateData);

    return {
      success: true,
      message: `Item ${status} successfully`
    };
  } catch (error: any) {
    console.error('❌ Error updating lost & found item status:', error);
    return {
      success: false,
      message: error.message || 'Failed to update item status'
    };
  }
};

// Subscribe to lost & found items (real-time updates)
export const subscribeToLostFoundItems = (callback: (items: LostFoundItem[]) => void) => {
  const itemsRef = dbRef(realtimeDb, 'lostFoundItems');
  
  const unsubscribe = onValue(itemsRef, (snapshot) => {
    if (snapshot.exists()) {
      const itemsData = snapshot.val();
      const items: LostFoundItem[] = Object.keys(itemsData).map(key => ({
        ...itemsData[key],
        id: key
      }));

      // Sort by creation date (newest first)
      items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      callback(items);
    } else {
      callback([]);
    }
  });

  return unsubscribe;
};

// Delete lost & found item
export const deleteLostFoundItem = async (itemId: string) => {
  try {
    const itemRef = dbRef(realtimeDb, `lostFoundItems/${itemId}`);
    await remove(itemRef);

    return {
      success: true,
      message: 'Item deleted successfully'
    };
  } catch (error: any) {
    console.error('❌ Error deleting lost & found item:', error);
    return {
      success: false,
      message: error.message || 'Failed to delete item'
    };
  }
};

// Get approved lost & found items (for public viewing)
export const getApprovedLostFoundItems = async () => {
  try {
    const result = await getAllLostFoundItems();
    if (result.success) {
      const approvedItems = result.items.filter(item => item.status === 'approved');
      return {
        success: true,
        items: approvedItems
      };
    }
    return result;
  } catch (error: any) {
    console.error('❌ Error fetching approved lost & found items:', error);
    return {
      success: false,
      items: [],
      message: error.message || 'Failed to fetch approved items'
    };
  }
};
