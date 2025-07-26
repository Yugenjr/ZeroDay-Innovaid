// @ts-ignore
import { collection, addDoc, getDocs } from 'firebase/firestore';
import { db } from './config';

// Test Firebase connection
export const testFirebaseConnection = async (): Promise<boolean> => {
  try {
    console.log('Testing Firebase connection...');
    
    // Try to read from a collection
    const testCollection = collection(db, 'techEvents');
    const snapshot = await getDocs(testCollection);
    
    console.log('Firebase connection successful!');
    console.log(`Found ${snapshot.size} documents in techEvents collection`);
    
    return true;
  } catch (error) {
    console.error('Firebase connection failed:', error);
    return false;
  }
};

// Test creating a document
export const testCreateDocument = async (): Promise<boolean> => {
  try {
    console.log('Testing document creation...');

    const testDoc = {
      title: `Test Event ${new Date().toLocaleTimeString()}`,
      details: 'This is a test event to verify Firebase connection and real-time updates',
      place: 'Test City',
      venue: 'Test Venue',
      date: new Date(),
      requirements: 'No requirements - this is just a test',
      type: 'event' as const,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'test-admin',
      isActive: true,
      tags: ['test', 'firebase'],
      priority: 'high' as const,
      registrationLink: 'https://example.com/register'
    };

    const docRef = await addDoc(collection(db, 'techEvents'), testDoc);
    console.log('✅ Test document created with ID:', docRef.id);
    console.log('🔄 This should trigger real-time updates on both admin and student sides');

    return true;
  } catch (error) {
    console.error('❌ Document creation failed:', error);
    return false;
  }
};
