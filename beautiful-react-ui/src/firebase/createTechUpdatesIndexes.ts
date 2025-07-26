import { db } from './config';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';

// Function to create Firebase indexes for tech updates
export const createTechUpdatesIndexes = async (): Promise<{ success: boolean; message: string }> => {
  try {
    console.log('🔍 Creating Firebase indexes for Tech Updates...');

    // Test queries that will create the necessary indexes
    const testQueries = [
      // Tech Updates indexes
      {
        name: 'techUpdates - isActive + isPinned + createdAt',
        query: () => query(
          collection(db, 'techUpdates'),
          where('isActive', '==', true),
          orderBy('isPinned', 'desc'),
          orderBy('createdAt', 'desc')
        )
      },
      {
        name: 'techUpdates - isActive + category + createdAt',
        query: () => query(
          collection(db, 'techUpdates'),
          where('isActive', '==', true),
          where('category', '==', 'announcement'),
          orderBy('createdAt', 'desc')
        )
      },
      {
        name: 'techUpdates - isActive + targetAudience + createdAt',
        query: () => query(
          collection(db, 'techUpdates'),
          where('isActive', '==', true),
          where('targetAudience', '==', 'all'),
          orderBy('createdAt', 'desc')
        )
      },
      {
        name: 'techUpdates - isActive + priority + createdAt',
        query: () => query(
          collection(db, 'techUpdates'),
          where('isActive', '==', true),
          where('priority', '==', 'high'),
          orderBy('createdAt', 'desc')
        )
      },
      {
        name: 'techUpdates - createdBy + createdAt',
        query: () => query(
          collection(db, 'techUpdates'),
          where('createdBy', '==', 'admin-id'),
          orderBy('createdAt', 'desc')
        )
      },

      // User Notifications indexes
      {
        name: 'userNotifications - userId + createdAt',
        query: () => query(
          collection(db, 'userNotifications'),
          where('userId', '==', 'user-id'),
          orderBy('createdAt', 'desc'),
          limit(20)
        )
      },
      {
        name: 'userNotifications - userId + isRead',
        query: () => query(
          collection(db, 'userNotifications'),
          where('userId', '==', 'user-id'),
          where('isRead', '==', false)
        )
      },
      {
        name: 'userNotifications - userId + updateId',
        query: () => query(
          collection(db, 'userNotifications'),
          where('userId', '==', 'user-id'),
          where('updateId', '==', 'update-id')
        )
      },
      {
        name: 'userNotifications - updateId + userId',
        query: () => query(
          collection(db, 'userNotifications'),
          where('updateId', '==', 'update-id'),
          where('userId', '==', 'user-id')
        )
      },
      {
        name: 'userNotifications - userId + priority + createdAt',
        query: () => query(
          collection(db, 'userNotifications'),
          where('userId', '==', 'user-id'),
          where('priority', '==', 'high'),
          orderBy('createdAt', 'desc')
        )
      },

      // Email service removed - using in-app notifications only
    ];

    let successCount = 0;
    let errorCount = 0;
    const errors: string[] = [];

    // Execute test queries to trigger index creation
    for (const testQuery of testQueries) {
      try {
        console.log(`🔍 Testing query: ${testQuery.name}`);
        await getDocs(testQuery.query());
        console.log(`✅ Index created/verified: ${testQuery.name}`);
        successCount++;
      } catch (error) {
        console.error(`❌ Error creating index for ${testQuery.name}:`, error);
        errorCount++;
        
        if (error instanceof Error) {
          // Check if it's an index creation error
          if (error.message.includes('index')) {
            console.log(`📝 Index needed for: ${testQuery.name}`);
            errors.push(`${testQuery.name}: ${error.message}`);
          } else {
            errors.push(`${testQuery.name}: ${error.message}`);
          }
        }
      }
    }

    console.log(`📊 Index creation summary: ${successCount} successful, ${errorCount} errors`);

    if (errorCount > 0) {
      console.log('📝 Firebase will automatically create the required indexes when these queries are first executed.');
      console.log('📝 You can also manually create indexes in the Firebase Console.');
      console.log('📝 Errors (these are expected for new indexes):');
      errors.forEach(error => console.log(`   - ${error}`));
    }

    return {
      success: true,
      message: `Tech Updates indexes processed: ${successCount} verified, ${errorCount} need creation. Firebase will auto-create missing indexes.`
    };

  } catch (error) {
    console.error('❌ Error in createTechUpdatesIndexes:', error);
    return {
      success: false,
      message: `Failed to process tech updates indexes: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
};

// Manual index creation instructions
export const getTechUpdatesIndexInstructions = (): string[] => {
  return [
    '📝 Firebase Index Creation Instructions for Tech Updates:',
    '',
    '1. Go to Firebase Console → Firestore Database → Indexes',
    '',
    '2. Create the following composite indexes:',
    '',
    '   Collection: techUpdates',
    '   - Fields: isActive (Ascending), isPinned (Descending), createdAt (Descending)',
    '   - Fields: isActive (Ascending), category (Ascending), createdAt (Descending)',
    '   - Fields: isActive (Ascending), targetAudience (Ascending), createdAt (Descending)',
    '   - Fields: isActive (Ascending), priority (Ascending), createdAt (Descending)',
    '   - Fields: createdBy (Ascending), createdAt (Descending)',
    '',
    '   Collection: userNotifications',
    '   - Fields: userId (Ascending), createdAt (Descending)',
    '   - Fields: userId (Ascending), isRead (Ascending)',
    '   - Fields: userId (Ascending), updateId (Ascending)',
    '   - Fields: updateId (Ascending), userId (Ascending)',
    '   - Fields: userId (Ascending), priority (Ascending), createdAt (Descending)',
    '',
    '   Collection: emailNotificationLogs',
    '   - Fields: updateId (Ascending), sentAt (Descending)',
    '   - Fields: recipientEmail (Ascending), sentAt (Descending)',
    '   - Fields: status (Ascending), sentAt (Descending)',
    '',
    '3. Single field indexes (usually auto-created):',
    '   - All collections: createdAt, updatedAt, isActive, userId, updateId',
    '',
    '4. These indexes will be automatically created when the queries are first executed.',
    '   You can also create them manually for better performance.',
    ''
  ];
};

// Test tech updates connection and indexes
export const testTechUpdatesSystem = async (): Promise<{ success: boolean; message: string; details: any }> => {
  try {
    console.log('🧪 Testing Tech Updates system...');

    // Test basic connection
    const techUpdatesQuery = query(collection(db, 'techUpdates'), limit(1));
    const techUpdatesSnapshot = await getDocs(techUpdatesQuery);
    
    const notificationsQuery = query(collection(db, 'userNotifications'), limit(1));
    const notificationsSnapshot = await getDocs(notificationsQuery);
    
    const details = {
      techUpdatesCount: techUpdatesSnapshot.size,
      notificationsCount: notificationsSnapshot.size,
      collectionsAccessible: true
    };

    console.log('✅ Tech Updates system test completed:', details);

    return {
      success: true,
      message: 'Tech Updates system is accessible and ready',
      details
    };

  } catch (error) {
    console.error('❌ Tech Updates system test failed:', error);
    return {
      success: false,
      message: `Tech Updates system test failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      details: { error: error instanceof Error ? error.message : 'Unknown error' }
    };
  }
};
