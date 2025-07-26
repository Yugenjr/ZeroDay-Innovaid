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
// @ts-ignore
import { ref as storageRef, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { realtimeDb, storage } from './config';

export interface RealtimeTechEvent {
  id?: string;
  title: string;
  details: string;
  place: string;
  venue: string;
  date: string; // ISO string for Realtime Database
  requirements: string;
  type: 'hackathon' | 'internship' | 'event' | 'tech-news';
  posterUrl?: string;
  posterPath?: string;
  createdAt: number; // timestamp
  updatedAt: number; // timestamp
  createdBy: string; // Admin user ID
  isActive: boolean;
  registrationLink?: string;
  deadline?: string; // ISO string
  tags: string[];
  priority: 'low' | 'medium' | 'high';
}

const TECH_EVENTS_PATH = 'techEvents';

// Create a new tech event in Realtime Database
export const createRealtimeTechEvent = async (
  eventData: Omit<RealtimeTechEvent, 'id' | 'createdAt' | 'updatedAt'>, 
  posterFile?: File
): Promise<string> => {
  try {
    console.log('🔥 Creating tech event in Realtime Database...');
    
    let posterUrl = '';
    let posterPath = '';

    // Upload poster if provided
    if (posterFile) {
      const timestamp = Date.now();
      const fileName = `tech-events/${timestamp}_${posterFile.name}`;
      const fileRef = storageRef(storage, fileName);
      
      console.log('📤 Uploading poster to Firebase Storage...');
      await uploadBytes(fileRef, posterFile);
      posterUrl = await getDownloadURL(fileRef);
      posterPath = fileName;
      console.log('✅ Poster uploaded successfully:', posterUrl);
    }

    // Prepare data for Realtime Database
    const now = Date.now();
    const techEventData: Omit<RealtimeTechEvent, 'id'> = {
      ...eventData,
      posterUrl,
      posterPath,
      createdAt: now,
      updatedAt: now
    };

    // Push to Realtime Database
    const techEventsRef = ref(realtimeDb, TECH_EVENTS_PATH);
    const newEventRef = push(techEventsRef);
    await set(newEventRef, techEventData);
    
    const eventId = newEventRef.key!;
    console.log('✅ Tech event created in Realtime Database with ID:', eventId);
    
    return eventId;
  } catch (error) {
    console.error('❌ Error creating tech event in Realtime Database:', error);
    throw error;
  }
};

// Get all active tech events from Realtime Database
export const getRealtimeTechEvents = async (): Promise<RealtimeTechEvent[]> => {
  try {
    console.log('📥 Fetching tech events from Realtime Database...');
    
    const techEventsRef = ref(realtimeDb, TECH_EVENTS_PATH);
    const snapshot = await get(techEventsRef);
    
    if (!snapshot.exists()) {
      console.log('📭 No tech events found in Realtime Database');
      return [];
    }

    const eventsData = snapshot.val();
    const events: RealtimeTechEvent[] = [];

    Object.keys(eventsData).forEach(key => {
      const event = eventsData[key];
      if (event.isActive) {
        events.push({
          id: key,
          ...event
        });
      }
    });

    // Sort by creation date (newest first)
    events.sort((a, b) => b.createdAt - a.createdAt);
    
    console.log('✅ Fetched', events.length, 'active tech events from Realtime Database');
    return events;
  } catch (error) {
    console.error('❌ Error fetching tech events from Realtime Database:', error);
    throw error;
  }
};

// Subscribe to real-time tech events updates
export const subscribeToRealtimeTechEvents = (callback: (events: RealtimeTechEvent[]) => void) => {
  console.log('🔄 Setting up real-time listener for tech events...');
  
  const techEventsRef = ref(realtimeDb, TECH_EVENTS_PATH);
  
  const unsubscribe = onValue(techEventsRef, (snapshot) => {
    console.log('🔄 Real-time update received for tech events');
    
    if (!snapshot.exists()) {
      console.log('📭 No tech events in database');
      callback([]);
      return;
    }

    const eventsData = snapshot.val();
    const events: RealtimeTechEvent[] = [];

    Object.keys(eventsData).forEach(key => {
      const event = eventsData[key];
      if (event.isActive) {
        events.push({
          id: key,
          ...event
        });
      }
    });

    // Sort by creation date (newest first)
    events.sort((a, b) => b.createdAt - a.createdAt);
    
    console.log('📊 Processed', events.length, 'active tech events for callback');
    console.log('📋 Event titles:', events.map(e => e.title));
    callback(events);
  });

  return () => {
    console.log('🔌 Unsubscribing from tech events real-time listener');
    off(techEventsRef);
  };
};

// Update tech event in Realtime Database
export const updateRealtimeTechEvent = async (
  eventId: string, 
  updates: Partial<RealtimeTechEvent>, 
  newPosterFile?: File
): Promise<void> => {
  try {
    console.log('🔧 Updating tech event in Realtime Database:', eventId);
    
    const updateData: any = { ...updates };

    // Handle poster update
    if (newPosterFile) {
      // Delete old poster if exists
      if (updates.posterPath) {
        try {
          const oldPosterRef = storageRef(storage, updates.posterPath);
          await deleteObject(oldPosterRef);
          console.log('🗑️ Old poster deleted');
        } catch (error) {
          console.warn('⚠️ Could not delete old poster:', error);
        }
      }

      // Upload new poster
      const timestamp = Date.now();
      const fileName = `tech-events/${timestamp}_${newPosterFile.name}`;
      const fileRef = storageRef(storage, fileName);
      
      await uploadBytes(fileRef, newPosterFile);
      const posterUrl = await getDownloadURL(fileRef);
      
      updateData.posterUrl = posterUrl;
      updateData.posterPath = fileName;
      console.log('✅ New poster uploaded:', posterUrl);
    }

    updateData.updatedAt = Date.now();

    const eventRef = ref(realtimeDb, `${TECH_EVENTS_PATH}/${eventId}`);
    await set(eventRef, updateData);
    
    console.log('✅ Tech event updated successfully in Realtime Database');
  } catch (error) {
    console.error('❌ Error updating tech event in Realtime Database:', error);
    throw error;
  }
};

// Delete tech event (soft delete) in Realtime Database
export const deleteRealtimeTechEvent = async (eventId: string): Promise<void> => {
  try {
    console.log('🗑️ Soft deleting tech event in Realtime Database:', eventId);
    
    const eventRef = ref(realtimeDb, `${TECH_EVENTS_PATH}/${eventId}`);
    await set(eventRef, {
      isActive: false,
      updatedAt: Date.now()
    });
    
    console.log('✅ Tech event soft deleted successfully');
  } catch (error) {
    console.error('❌ Error deleting tech event in Realtime Database:', error);
    throw error;
  }
};

// Test Realtime Database connection
export const testRealtimeConnection = async (): Promise<boolean> => {
  try {
    console.log('🧪 Testing Realtime Database connection...');

    const testRef = ref(realtimeDb, 'connectionTest');
    await set(testRef, {
      timestamp: Date.now(),
      message: 'Connection test successful'
    });

    const snapshot = await get(testRef);
    if (snapshot.exists()) {
      console.log('✅ Realtime Database connection successful!');
      // Clean up test data
      await remove(testRef);
      return true;
    }

    return false;
  } catch (error) {
    console.error('❌ Realtime Database connection failed:', error);
    return false;
  }
};

// Create a test tech event for demonstration
export const createTestTechEvent = async (): Promise<string> => {
  try {
    console.log('🧪 Creating test tech event...');

    const testEventData: Omit<RealtimeTechEvent, 'id' | 'createdAt' | 'updatedAt'> = {
      title: `🚀 Test Tech Event - ${new Date().toLocaleTimeString()}`,
      details: 'This is a test event created to verify the Realtime Database connection and real-time synchronization between admin and student dashboards.',
      place: 'Virtual/Online',
      venue: 'Zoom Meeting',
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
      requirements: 'Basic programming knowledge, laptop with internet connection',
      type: 'hackathon',
      createdBy: 'test-admin',
      isActive: true,
      registrationLink: 'https://example.com/register-test-event',
      deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days from now
      tags: ['test', 'hackathon', 'realtime-db', 'demo'],
      priority: 'high'
    };

    const eventId = await createRealtimeTechEvent(testEventData);
    console.log('✅ Test tech event created successfully with ID:', eventId);

    return eventId;
  } catch (error) {
    console.error('❌ Failed to create test tech event:', error);
    throw error;
  }
};
