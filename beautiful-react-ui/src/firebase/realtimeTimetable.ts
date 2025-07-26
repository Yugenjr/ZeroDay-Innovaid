// @ts-ignore
import { 
  ref, 
  push, 
  set, 
  get, 
  remove, 
  onValue, 
  off,
  serverTimestamp,
  query,
  orderByChild,
  equalTo
} from 'firebase/database';
import { realtimeDb } from './config';

export interface TimetableSlot {
  id?: string;
  day: string;
  time: string;
  subject: string;
  teacher: string;
  room: string;
  department: string;
  year: number;
  semester?: number;
  createdAt: number;
  updatedAt: number;
  createdBy: string; // Admin user ID
  isActive: boolean;
}

const TIMETABLE_PATH = 'timetables';

// Create a new timetable slot in Realtime Database
export const createTimetableSlot = async (
  slotData: Omit<TimetableSlot, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> => {
  try {
    console.log('🔥 Creating timetable slot in Realtime Database...');
    
    // Prepare data for Realtime Database
    const now = Date.now();
    const timetableSlotData: Omit<TimetableSlot, 'id'> = {
      ...slotData,
      createdAt: now,
      updatedAt: now
    };

    // Push to Realtime Database under department/year structure
    const departmentPath = `${TIMETABLE_PATH}/${slotData.department.replace(/\s+/g, '_')}/${slotData.year}`;
    const slotsRef = ref(realtimeDb, departmentPath);
    const newSlotRef = push(slotsRef);
    await set(newSlotRef, timetableSlotData);
    
    const slotId = newSlotRef.key!;
    console.log('✅ Timetable slot created in Realtime Database with ID:', slotId);
    
    return slotId;
  } catch (error) {
    console.error('❌ Error creating timetable slot in Realtime Database:', error);
    throw error;
  }
};

// Get all timetable slots for a specific department and year
export const getTimetableSlots = async (department: string, year: number): Promise<TimetableSlot[]> => {
  try {
    console.log(`📥 Fetching timetable slots for ${department} Year ${year} from Realtime Database...`);
    
    const departmentPath = `${TIMETABLE_PATH}/${department.replace(/\s+/g, '_')}/${year}`;
    const slotsRef = ref(realtimeDb, departmentPath);
    const snapshot = await get(slotsRef);
    
    if (!snapshot.exists()) {
      console.log(`📭 No timetable slots found for ${department} Year ${year}`);
      return [];
    }

    const slotsData = snapshot.val();
    const slots: TimetableSlot[] = [];

    Object.keys(slotsData).forEach(key => {
      const slot = slotsData[key];
      if (slot.isActive) {
        slots.push({
          id: key,
          ...slot
        });
      }
    });

    // Sort by day and time
    const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    slots.sort((a, b) => {
      const dayComparison = dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day);
      if (dayComparison !== 0) return dayComparison;
      return a.time.localeCompare(b.time);
    });
    
    console.log(`📊 Found ${slots.length} active timetable slots for ${department} Year ${year}`);
    return slots;
  } catch (error) {
    console.error('❌ Error fetching timetable slots:', error);
    throw error;
  }
};

// Get all timetable slots (for admin view)
export const getAllTimetableSlots = async (): Promise<TimetableSlot[]> => {
  try {
    console.log('📥 Fetching all timetable slots from Realtime Database...');
    
    const timetableRef = ref(realtimeDb, TIMETABLE_PATH);
    const snapshot = await get(timetableRef);
    
    if (!snapshot.exists()) {
      console.log('📭 No timetable slots found');
      return [];
    }

    const allData = snapshot.val();
    const slots: TimetableSlot[] = [];

    // Navigate through department -> year -> slots structure
    Object.keys(allData).forEach(department => {
      const departmentData = allData[department];
      Object.keys(departmentData).forEach(year => {
        const yearData = departmentData[year];
        Object.keys(yearData).forEach(slotId => {
          const slot = yearData[slotId];
          if (slot.isActive) {
            slots.push({
              id: slotId,
              ...slot
            });
          }
        });
      });
    });

    // Sort by department, year, day, and time
    const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    slots.sort((a, b) => {
      const deptComparison = a.department.localeCompare(b.department);
      if (deptComparison !== 0) return deptComparison;
      
      const yearComparison = a.year - b.year;
      if (yearComparison !== 0) return yearComparison;
      
      const dayComparison = dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day);
      if (dayComparison !== 0) return dayComparison;
      
      return a.time.localeCompare(b.time);
    });
    
    console.log(`📊 Found ${slots.length} total active timetable slots`);
    return slots;
  } catch (error) {
    console.error('❌ Error fetching all timetable slots:', error);
    throw error;
  }
};

// Subscribe to real-time timetable updates for specific department and year
export const subscribeToTimetableSlots = (
  department: string, 
  year: number, 
  callback: (slots: TimetableSlot[]) => void
): (() => void) => {
  console.log(`🔔 Setting up real-time subscription for ${department} Year ${year} timetable...`);
  
  const departmentPath = `${TIMETABLE_PATH}/${department.replace(/\s+/g, '_')}/${year}`;
  const slotsRef = ref(realtimeDb, departmentPath);
  
  const unsubscribe = onValue(slotsRef, (snapshot) => {
    console.log(`🔄 Real-time update received for ${department} Year ${year} timetable`);
    
    if (!snapshot.exists()) {
      console.log(`📭 No timetable slots in database for ${department} Year ${year}`);
      callback([]);
      return;
    }

    const slotsData = snapshot.val();
    const slots: TimetableSlot[] = [];

    Object.keys(slotsData).forEach(key => {
      const slot = slotsData[key];
      if (slot.isActive) {
        slots.push({
          id: key,
          ...slot
        });
      }
    });

    // Sort by day and time
    const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    slots.sort((a, b) => {
      const dayComparison = dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day);
      if (dayComparison !== 0) return dayComparison;
      return a.time.localeCompare(b.time);
    });
    
    console.log(`📊 Processed ${slots.length} active timetable slots for callback`);
    callback(slots);
  });

  return () => {
    console.log(`🧹 Cleaning up timetable subscription for ${department} Year ${year}`);
    off(slotsRef);
  };
};

// Subscribe to all timetable updates (for admin)
export const subscribeToAllTimetableSlots = (
  callback: (slots: TimetableSlot[]) => void
): (() => void) => {
  console.log('🔔 Setting up real-time subscription for all timetables...');

  const timetableRef = ref(realtimeDb, TIMETABLE_PATH);

  const unsubscribe = onValue(timetableRef, (snapshot) => {
    console.log('🔄 Real-time update received for all timetables');

    if (!snapshot.exists()) {
      console.log('📭 No timetable slots in database');
      callback([]);
      return;
    }

    const allData = snapshot.val();
    const slots: TimetableSlot[] = [];

    // Navigate through department -> year -> slots structure
    Object.keys(allData).forEach(department => {
      const departmentData = allData[department];
      Object.keys(departmentData).forEach(year => {
        const yearData = departmentData[year];
        Object.keys(yearData).forEach(slotId => {
          const slot = yearData[slotId];
          if (slot.isActive) {
            slots.push({
              id: slotId,
              ...slot
            });
          }
        });
      });
    });

    // Sort by department, year, day, and time
    const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    slots.sort((a, b) => {
      const deptComparison = a.department.localeCompare(b.department);
      if (deptComparison !== 0) return deptComparison;

      const yearComparison = a.year - b.year;
      if (yearComparison !== 0) return yearComparison;

      const dayComparison = dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day);
      if (dayComparison !== 0) return dayComparison;

      return a.time.localeCompare(b.time);
    });

    console.log(`📊 Processed ${slots.length} total active timetable slots for callback`);
    callback(slots);
  });

  return () => {
    console.log('🧹 Cleaning up all timetables subscription');
    off(timetableRef);
  };
};

// Update a timetable slot
export const updateTimetableSlot = async (
  slotId: string,
  department: string,
  year: number,
  updateData: Partial<Omit<TimetableSlot, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<void> => {
  try {
    console.log('🔧 Updating timetable slot in Realtime Database:', slotId);

    const departmentPath = `${TIMETABLE_PATH}/${department.replace(/\s+/g, '_')}/${year}/${slotId}`;
    const slotRef = ref(realtimeDb, departmentPath);

    const updatedData = {
      ...updateData,
      updatedAt: Date.now()
    };

    await set(slotRef, updatedData);
    console.log('✅ Timetable slot updated successfully');
  } catch (error) {
    console.error('❌ Error updating timetable slot:', error);
    throw error;
  }
};

// Delete a timetable slot (soft delete by setting isActive to false)
export const deleteTimetableSlot = async (
  slotId: string,
  department: string,
  year: number
): Promise<void> => {
  try {
    console.log('🗑️ Deleting timetable slot:', slotId);

    const departmentPath = `${TIMETABLE_PATH}/${department.replace(/\s+/g, '_')}/${year}/${slotId}`;
    const slotRef = ref(realtimeDb, departmentPath);

    await set(slotRef, {
      isActive: false,
      updatedAt: Date.now()
    });

    console.log('✅ Timetable slot deleted successfully');
  } catch (error) {
    console.error('❌ Error deleting timetable slot:', error);
    throw error;
  }
};

// Get available departments
export const getAvailableDepartments = async (): Promise<string[]> => {
  try {
    console.log('📥 Fetching available departments...');

    const timetableRef = ref(realtimeDb, TIMETABLE_PATH);
    const snapshot = await get(timetableRef);

    if (!snapshot.exists()) {
      return [];
    }

    const departments = Object.keys(snapshot.val()).map(dept => dept.replace(/_/g, ' '));
    console.log('📊 Available departments:', departments);
    return departments;
  } catch (error) {
    console.error('❌ Error fetching departments:', error);
    return [];
  }
};

// Get available years for a department
export const getAvailableYears = async (department: string): Promise<number[]> => {
  try {
    console.log(`📥 Fetching available years for ${department}...`);

    const departmentPath = `${TIMETABLE_PATH}/${department.replace(/\s+/g, '_')}`;
    const departmentRef = ref(realtimeDb, departmentPath);
    const snapshot = await get(departmentRef);

    if (!snapshot.exists()) {
      return [];
    }

    const years = Object.keys(snapshot.val()).map(year => parseInt(year)).sort((a, b) => a - b);
    console.log(`📊 Available years for ${department}:`, years);
    return years;
  } catch (error) {
    console.error('❌ Error fetching years:', error);
    return [];
  }
};

// Test Realtime Database connection for timetables
export const testTimetableConnection = async (): Promise<boolean> => {
  try {
    console.log('🧪 Testing Realtime Database connection for timetables...');

    const testRef = ref(realtimeDb, 'timetableConnectionTest');
    await set(testRef, {
      timestamp: Date.now(),
      message: 'Timetable connection test successful'
    });

    const snapshot = await get(testRef);
    if (snapshot.exists()) {
      console.log('✅ Timetable Realtime Database connection successful!');
      // Clean up test data
      await remove(testRef);
      return true;
    }

    return false;
  } catch (error) {
    console.error('❌ Timetable Realtime Database connection failed:', error);
    return false;
  }
};
