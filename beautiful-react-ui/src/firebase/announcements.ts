// @ts-ignore
import { ref, push, set, onValue, off, remove, update } from 'firebase/database';
// @ts-ignore
import { realtimeDb } from './config';

export interface Announcement {
  id?: string;
  title: string;
  category: string;
  date: string;
  content: string;
  author: string;
  createdAt?: string;
  updatedAt?: string;
  registrationCount?: number;
  maxRegistrations?: number;
  registrationDeadline?: string;
  eventLocation?: string;
  eventDate?: string;
}

// Create a new announcement
export const createAnnouncement = async (announcementData: Omit<Announcement, 'id' | 'createdAt' | 'updatedAt'>) => {
  try {
    const announcementsRef = ref(realtimeDb, 'announcements');
    const newAnnouncementRef = push(announcementsRef);
    
    const announcement: Announcement = {
      ...announcementData,
      id: newAnnouncementRef.key!,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      registrationCount: 0
    };

    await set(newAnnouncementRef, announcement);

    return {
      success: true,
      message: 'Announcement created successfully!',
      announcementId: newAnnouncementRef.key
    };
  } catch (error: any) {
    console.error('Error creating announcement:', error);
    return {
      success: false,
      message: error.message || 'Failed to create announcement'
    };
  }
};

// Get all announcements (real-time listener)
export const subscribeToAnnouncements = (callback: (announcements: Announcement[]) => void) => {
  const announcementsRef = ref(realtimeDb, 'announcements');
  
  const unsubscribe = onValue(announcementsRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
      const announcements: Announcement[] = Object.values(data);
      // Sort by date (newest first)
      announcements.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      callback(announcements);
    } else {
      callback([]);
    }
  }, (error) => {
    console.error('Error fetching announcements:', error);
    callback([]);
  });

  return unsubscribe;
};

// Unsubscribe from announcements
export const unsubscribeFromAnnouncements = (callback: any) => {
  const announcementsRef = ref(realtimeDb, 'announcements');
  off(announcementsRef, 'value', callback);
};

// Update an announcement
export const updateAnnouncement = async (announcementId: string, updates: Partial<Announcement>) => {
  try {
    const announcementRef = ref(realtimeDb, `announcements/${announcementId}`);
    
    const updateData = {
      ...updates,
      updatedAt: new Date().toISOString()
    };

    await update(announcementRef, updateData);

    return {
      success: true,
      message: 'Announcement updated successfully!'
    };
  } catch (error: any) {
    console.error('Error updating announcement:', error);
    return {
      success: false,
      message: error.message || 'Failed to update announcement'
    };
  }
};

// Delete an announcement
export const deleteAnnouncement = async (announcementId: string) => {
  try {
    const announcementRef = ref(realtimeDb, `announcements/${announcementId}`);
    await remove(announcementRef);

    return {
      success: true,
      message: 'Announcement deleted successfully!'
    };
  } catch (error: any) {
    console.error('Error deleting announcement:', error);
    return {
      success: false,
      message: error.message || 'Failed to delete announcement'
    };
  }
};

// Get announcements once (without real-time updates)
export const getAnnouncements = async (): Promise<{
  success: boolean;
  announcements: Announcement[];
  message?: string;
}> => {
  try {
    return new Promise((resolve) => {
      const announcementsRef = ref(realtimeDb, 'announcements');
      
      onValue(announcementsRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const announcements: Announcement[] = Object.values(data);
          // Sort by date (newest first)
          announcements.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
          resolve({
            success: true,
            announcements
          });
        } else {
          resolve({
            success: true,
            announcements: []
          });
        }
      }, (error) => {
        console.error('Error fetching announcements:', error);
        resolve({
          success: false,
          announcements: [],
          message: error.message || 'Failed to fetch announcements'
        });
      }, { onlyOnce: true });
    });
  } catch (error: any) {
    console.error('Error getting announcements:', error);
    return {
      success: false,
      announcements: [],
      message: error.message || 'Failed to get announcements'
    };
  }
};

// Add some initial sample data (call this once to populate the database)
export const addSampleAnnouncements = async () => {
  const sampleAnnouncements = [
    {
      title: 'Mid-Term Exam Schedule Released',
      category: 'Academic',
      date: new Date().toISOString(),
      content: 'Mid-term examinations will be held from May 20-25. Check department notice boards for detailed schedules. All students must carry their ID cards and admit cards to the examination hall.',
      author: 'Academic Office'
    },
    {
      title: 'Annual Cultural Fest - TechFiesta 2024',
      category: 'Event',
      date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      content: 'The annual cultural fest will be held on June 5-7. Registration for performances starts next week. Prizes worth ₹50,000 to be won! Categories include dance, music, drama, and technical events.',
      author: 'Cultural Committee',
      registrationCount: 0,
      maxRegistrations: 500,
      registrationDeadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      eventLocation: 'Main Auditorium',
      eventDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      title: 'Library Renovation Notice',
      category: 'Facility',
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      content: 'The main library will be closed for renovations from May 15-18. Alternative study spaces will be available in Block B, Level 2. Digital resources remain accessible 24/7.',
      author: 'Facility Management'
    },
    {
      title: 'Summer Internship Opportunities',
      category: 'Academic',
      date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      content: 'Leading tech companies are offering summer internships. Application deadline: May 30th. Visit the placement cell for more details and application procedures.',
      author: 'Placement Cell'
    },
    {
      title: 'Blood Donation Camp',
      category: 'Event',
      date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      content: 'NSS is organizing a blood donation camp on May 18th in the main auditorium from 9 AM to 4 PM. All healthy students above 18 are encouraged to participate.',
      author: 'NSS Committee',
      registrationCount: 0,
      maxRegistrations: 100,
      registrationDeadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      eventLocation: 'Main Auditorium',
      eventDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString()
    }
  ];

  try {
    for (const announcement of sampleAnnouncements) {
      await createAnnouncement(announcement);
    }
    console.log('Sample announcements added successfully!');
    return { success: true, message: 'Sample data added successfully!' };
  } catch (error: any) {
    console.error('Error adding sample announcements:', error);
    return { success: false, message: error.message || 'Failed to add sample data' };
  }
};

// Update registration count for an event
export const updateEventRegistrationCount = async (eventId: string, increment: boolean = true) => {
  try {
    const eventRef = ref(realtimeDb, `announcements/${eventId}`);

    // Get current announcement data
    return new Promise((resolve) => {
      onValue(eventRef, (snapshot) => {
        const eventData = snapshot.val();
        if (eventData) {
          const currentCount = eventData.registrationCount || 0;
          const newCount = increment ? currentCount + 1 : Math.max(0, currentCount - 1);

          // Update the registration count
          update(eventRef, {
            registrationCount: newCount,
            updatedAt: new Date().toISOString()
          }).then(() => {
            resolve({
              success: true,
              newCount
            });
          }).catch((error) => {
            console.error('Error updating registration count:', error);
            resolve({
              success: false,
              message: error.message || 'Failed to update registration count'
            });
          });
        } else {
          resolve({
            success: false,
            message: 'Event not found'
          });
        }
      }, { onlyOnce: true });
    });
  } catch (error: any) {
    console.error('Error updating registration count:', error);
    return {
      success: false,
      message: error.message || 'Failed to update registration count'
    };
  }
};

// Get registration count for an event
export const getEventRegistrationCount = async (eventId: string) => {
  try {
    return new Promise((resolve) => {
      const eventRef = ref(realtimeDb, `announcements/${eventId}`);
      onValue(eventRef, (snapshot) => {
        const eventData = snapshot.val();
        resolve({
          success: true,
          count: eventData?.registrationCount || 0,
          maxRegistrations: eventData?.maxRegistrations || null
        });
      }, (error) => {
        console.error('Error getting registration count:', error);
        resolve({
          success: false,
          count: 0,
          message: error.message || 'Failed to get registration count'
        });
      }, { onlyOnce: true });
    });
  } catch (error: any) {
    console.error('Error getting registration count:', error);
    return {
      success: false,
      count: 0,
      message: error.message || 'Failed to get registration count'
    };
  }
};

// Update registration count for an event
export const updateRegistrationCount = async (eventId: string, increment: boolean = true) => {
  try {
    const announcementRef = ref(realtimeDb, `announcements/${eventId}`);

    // Get current announcement data
    return new Promise((resolve, reject) => {
      onValue(announcementRef, (snapshot) => {
        if (snapshot.exists()) {
          const announcement = snapshot.val();
          const currentCount = announcement.registrationCount || 0;
          const newCount = increment ? currentCount + 1 : Math.max(0, currentCount - 1);

          // Update the registration count
          update(announcementRef, {
            registrationCount: newCount,
            updatedAt: new Date().toISOString()
          }).then(() => {
            console.log(`✅ Registration count updated for event ${eventId}: ${newCount}`);
            resolve({ success: true, newCount });
          }).catch((error) => {
            console.error('❌ Error updating registration count:', error);
            reject({ success: false, message: error.message });
          });
        } else {
          console.error('❌ Event not found:', eventId);
          reject({ success: false, message: 'Event not found' });
        }
      }, { onlyOnce: true });
    });
  } catch (error: any) {
    console.error('❌ Error updating registration count:', error);
    return { success: false, message: error.message };
  }
};
