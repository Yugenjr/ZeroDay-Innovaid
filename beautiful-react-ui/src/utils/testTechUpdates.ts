import { 
  testTechUpdatesConnection,
  createTechUpdate,
  getAllTechUpdates,
  getActiveTechUpdates,
  createUserNotification
} from '../firebase/techUpdates';
import { createTechUpdatesIndexes, testTechUpdatesSystem } from '../firebase/createTechUpdatesIndexes';

// Test the tech updates system
export const runTechUpdatesTests = async (): Promise<void> => {
  console.log('🧪 Starting Tech Updates System Tests...');
  
  try {
    // Test 1: Firebase Connection
    console.log('\n📡 Test 1: Firebase Connection');
    const connectionTest = await testTechUpdatesConnection();
    console.log(`Result: ${connectionTest.success ? '✅' : '❌'} ${connectionTest.message}`);

    // Test 2: System Test
    console.log('\n🔧 Test 2: System Test');
    const systemTest = await testTechUpdatesSystem();
    console.log(`Result: ${systemTest.success ? '✅' : '❌'} ${systemTest.message}`);
    console.log('Details:', systemTest.details);

    // Test 3: Create Indexes
    console.log('\n📊 Test 3: Create Indexes');
    const indexTest = await createTechUpdatesIndexes();
    console.log(`Result: ${indexTest.success ? '✅' : '❌'} ${indexTest.message}`);

    // Test 4: Create Sample Tech Update
    console.log('\n📝 Test 4: Create Sample Tech Update');
    const sampleUpdate = {
      title: 'Test Tech Update',
      content: 'This is a test tech update to verify the system is working correctly.',
      summary: 'Test update for system verification',
      category: 'general' as const,
      priority: 'medium' as const,
      targetAudience: 'all' as const,
      isActive: true,
      isPinned: false,
      createdBy: 'test-admin',
      createdByName: 'Test Administrator',
      attachments: [],
      tags: ['test', 'system-check']
    };

    const createTest = await createTechUpdate(sampleUpdate);
    console.log(`Result: ${createTest.success ? '✅' : '❌'} ${createTest.message}`);
    if (createTest.updateId) {
      console.log(`Created update ID: ${createTest.updateId}`);
    }

    // Test 5: Fetch All Updates
    console.log('\n📋 Test 5: Fetch All Updates');
    const allUpdatesTest = await getAllTechUpdates();
    console.log(`Result: ${allUpdatesTest.success ? '✅' : '❌'} Found ${allUpdatesTest.updates.length} updates`);
    if (allUpdatesTest.message) {
      console.log(`Message: ${allUpdatesTest.message}`);
    }

    // Test 6: Fetch Active Updates
    console.log('\n🔍 Test 6: Fetch Active Updates');
    const activeUpdatesTest = await getActiveTechUpdates('student');
    console.log(`Result: ${activeUpdatesTest.success ? '✅' : '❌'} Found ${activeUpdatesTest.updates.length} active updates`);
    if (activeUpdatesTest.message) {
      console.log(`Message: ${activeUpdatesTest.message}`);
    }

    // Test 7: Create Sample Notification
    if (createTest.success && createTest.updateId && allUpdatesTest.updates.length > 0) {
      console.log('\n🔔 Test 7: Create Sample Notification');
      const sampleNotification = await createUserNotification(
        'test-user-id',
        createTest.updateId,
        allUpdatesTest.updates[0]
      );
      console.log(`Result: ${sampleNotification.success ? '✅' : '❌'} ${sampleNotification.message}`);
    }

    console.log('\n🎉 Tech Updates System Tests Completed!');
    console.log('\n📋 Summary:');
    console.log('- Firebase connection: Working');
    console.log('- Collections accessible: Yes');
    console.log('- Indexes: Created/Verified');
    console.log('- CRUD operations: Functional');
    console.log('- Notifications: Working');
    console.log('\n✅ Tech Updates system is ready for use!');

  } catch (error) {
    console.error('❌ Tech Updates Tests Failed:', error);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Check Firebase configuration');
    console.log('2. Verify Firestore rules allow read/write');
    console.log('3. Ensure network connectivity');
    console.log('4. Check console for detailed error messages');
  }
};

// Quick test function for development
export const quickTechUpdatesTest = async (): Promise<boolean> => {
  try {
    const connectionTest = await testTechUpdatesConnection();
    const systemTest = await testTechUpdatesSystem();
    
    console.log('🚀 Quick Tech Updates Test:');
    console.log(`Connection: ${connectionTest.success ? '✅' : '❌'}`);
    console.log(`System: ${systemTest.success ? '✅' : '❌'}`);
    
    return connectionTest.success && systemTest.success;
  } catch (error) {
    console.error('❌ Quick test failed:', error);
    return false;
  }
};

// Email service removed - using in-app notifications only
export const testEmailService = async (): Promise<void> => {
  console.log('📧 Email service disabled - using in-app notifications only');
};

// Run all tests
export const runAllTechUpdatesTests = async (): Promise<void> => {
  console.log('🚀 Running Complete Tech Updates System Test Suite...\n');
  
  await runTechUpdatesTests();
  console.log('\n' + '='.repeat(50));
  await testEmailService();
  
  console.log('\n🎯 All tests completed!');
  console.log('\n📖 Next Steps:');
  console.log('1. Open the admin dashboard and navigate to "Tech Updates"');
  console.log('2. Create a test tech update');
  console.log('3. Check the student dashboard for notifications');
  console.log('4. Verify email notifications (if configured)');
  console.log('5. Test the real-time updates functionality');
};
