// @ts-ignore
import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  where,
  Timestamp,
  onSnapshot
} from 'firebase/firestore';
// @ts-ignore
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from './config';
import { sendFastNotifications, sendCompleteNotifications } from './emailNotifications';

export interface TechEvent {
  id?: string;
  title: string;
  details: string;
  place: string;
  venue: string;
  date: Date;
  requirements: string;
  type: 'hackathon' | 'internship' | 'event' | 'tech-news';
  posterUrl?: string;
  posterPath?: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string; // Admin user ID
  isActive: boolean;
  registrationLink?: string;
  deadline?: Date;
  tags: string[];
  priority: 'low' | 'medium' | 'high';
}

const COLLECTION_NAME = 'techEvents';

// Create a new tech event
export const createTechEvent = async (eventData: Omit<TechEvent, 'id' | 'createdAt' | 'updatedAt'>, posterFile?: File): Promise<string> => {
  try {
    let posterUrl = '';
    let posterPath = '';

    // Upload poster if provided
    if (posterFile) {
      const timestamp = Date.now();
      const fileName = `tech-events/${timestamp}_${posterFile.name}`;
      const storageRef = ref(storage, fileName);
      
      await uploadBytes(storageRef, posterFile);
      posterUrl = await getDownloadURL(storageRef);
      posterPath = fileName;
    }

    const docData = {
      ...eventData,
      posterUrl,
      posterPath,
      createdAt: Timestamp.fromDate(new Date()),
      updatedAt: Timestamp.fromDate(new Date()),
      date: Timestamp.fromDate(eventData.date),
      deadline: eventData.deadline ? Timestamp.fromDate(eventData.deadline) : null
    };

    const docRef = await addDoc(collection(db, COLLECTION_NAME), docData);

    // Create the tech event object for notification
    const createdEvent: TechEvent = {
      id: docRef.id,
      ...eventData,
      posterUrl,
      posterPath,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Send notifications in background (completely non-blocking)
    console.log('🚀 Starting background notifications for new tech event:', createdEvent.title);

    // Fire and forget - don't wait for notifications
    setTimeout(() => {
      sendFastNotifications(createdEvent)
        .then((fastResult) => {
          console.log('✅ Background notification results:');
          console.log(`📊 Database notification: ${fastResult.notificationResult.success ? 'Success' : 'Failed'}`);
          console.log('📧 Email notifications are being sent in background');
        })
        .catch((notificationError) => {
          console.error('⚠️ Background notifications failed:', notificationError);
        });
    }, 100); // Start after 100ms delay

    console.log('✅ Event created successfully, notifications will be processed in background');

    return docRef.id;
  } catch (error) {
    console.error('Error creating tech event:', error);
    throw error;
  }
};

// Get all tech events
export const getTechEvents = async (): Promise<TechEvent[]> => {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('isActive', '==', true),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        date: data.date?.toDate() || new Date(),
        deadline: data.deadline?.toDate() || null,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date()
      } as TechEvent;
    });
  } catch (error) {
    console.error('Error fetching tech events:', error);
    throw error;
  }
};

// Get tech events by type
export const getTechEventsByType = async (type: TechEvent['type']): Promise<TechEvent[]> => {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('isActive', '==', true),
      where('type', '==', type),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        date: data.date?.toDate() || new Date(),
        deadline: data.deadline?.toDate() || null,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date()
      } as TechEvent;
    });
  } catch (error) {
    console.error('Error fetching tech events by type:', error);
    throw error;
  }
};

// Update tech event
export const updateTechEvent = async (
  eventId: string, 
  updates: Partial<TechEvent>, 
  newPosterFile?: File
): Promise<void> => {
  try {
    const eventRef = doc(db, COLLECTION_NAME, eventId);
    let updateData = { ...updates };

    // Handle poster update
    if (newPosterFile) {
      // Delete old poster if exists
      if (updates.posterPath) {
        try {
          const oldPosterRef = ref(storage, updates.posterPath);
          await deleteObject(oldPosterRef);
        } catch (error) {
          console.warn('Could not delete old poster:', error);
        }
      }

      // Upload new poster
      const timestamp = Date.now();
      const fileName = `tech-events/${timestamp}_${newPosterFile.name}`;
      const storageRef = ref(storage, fileName);
      
      await uploadBytes(storageRef, newPosterFile);
      const posterUrl = await getDownloadURL(storageRef);
      
      updateData.posterUrl = posterUrl;
      updateData.posterPath = fileName;
    }

    // Convert dates to Timestamps
    if (updateData.date) {
      updateData.date = Timestamp.fromDate(updateData.date as Date) as any;
    }
    if (updateData.deadline) {
      updateData.deadline = Timestamp.fromDate(updateData.deadline as Date) as any;
    }

    updateData.updatedAt = Timestamp.fromDate(new Date()) as any;

    await updateDoc(eventRef, updateData);
  } catch (error) {
    console.error('Error updating tech event:', error);
    throw error;
  }
};

// Delete tech event (soft delete)
export const deleteTechEvent = async (eventId: string): Promise<void> => {
  try {
    const eventRef = doc(db, COLLECTION_NAME, eventId);
    await updateDoc(eventRef, {
      isActive: false,
      updatedAt: Timestamp.fromDate(new Date())
    });
  } catch (error) {
    console.error('Error deleting tech event:', error);
    throw error;
  }
};

// Subscribe to tech events changes
export const subscribeTechEvents = (callback: (events: TechEvent[]) => void) => {
  const q = query(
    collection(db, COLLECTION_NAME),
    where('isActive', '==', true),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(q, (querySnapshot) => {
    const events = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        date: data.date?.toDate() || new Date(),
        deadline: data.deadline?.toDate() || null,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date()
      } as TechEvent;
    });
    callback(events);
  });
};

// Get upcoming events (events with future dates)
export const getUpcomingEvents = async (): Promise<TechEvent[]> => {
  try {
    const now = Timestamp.fromDate(new Date());
    const q = query(
      collection(db, COLLECTION_NAME),
      where('isActive', '==', true),
      where('date', '>=', now),
      orderBy('date', 'asc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        date: data.date?.toDate() || new Date(),
        deadline: data.deadline?.toDate() || null,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date()
      } as TechEvent;
    });
  } catch (error) {
    console.error('Error fetching upcoming events:', error);
    throw error;
  }
};

// Search tech events
export const searchTechEvents = async (searchTerm: string): Promise<TechEvent[]> => {
  try {
    // Note: Firestore doesn't support full-text search natively
    // This is a basic implementation that searches in title and tags
    const events = await getTechEvents();
    
    const searchLower = searchTerm.toLowerCase();
    return events.filter(event => 
      event.title.toLowerCase().includes(searchLower) ||
      event.details.toLowerCase().includes(searchLower) ||
      event.tags.some(tag => tag.toLowerCase().includes(searchLower)) ||
      event.place.toLowerCase().includes(searchLower) ||
      event.venue.toLowerCase().includes(searchLower)
    );
  } catch (error) {
    console.error('Error searching tech events:', error);
    throw error;
  }
};
