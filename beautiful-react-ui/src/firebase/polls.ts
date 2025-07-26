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
  getDoc
} from 'firebase/firestore';
import { db } from './config';

export interface PollOption {
  id: string;
  text: string;
  votes: number;
  voters: string[]; // Array of user IDs who voted for this option
}

export interface Poll {
  id: string;
  title: string;
  description: string;
  options: PollOption[];
  createdBy: string;
  createdByName: string;
  createdAt: string;
  expiresAt: string | null;
  isActive: boolean;
  category: 'general' | 'academic' | 'event' | 'feedback' | 'other';
  totalVotes: number;
  allowMultipleVotes: boolean;
  isAnonymous: boolean;
  targetAudience: 'all' | 'students' | 'faculty';
}

export interface UserVote {
  pollId: string;
  userId: string;
  userName: string;
  selectedOptions: string[];
  votedAt: string;
}

// Form interfaces
export interface FormQuestion {
  id: string;
  type: 'text' | 'textarea' | 'radio' | 'checkbox' | 'rating' | 'dropdown';
  question: string;
  options?: string[]; // For radio, checkbox, dropdown
  required: boolean;
  maxRating?: number; // For rating questions
}

export interface Form {
  id: string;
  title: string;
  description: string;
  questions: FormQuestion[];
  createdBy: string;
  createdByName: string;
  createdAt: string;
  expiresAt: string | null;
  isActive: boolean;
  category: 'general' | 'academic' | 'event' | 'feedback' | 'other';
  totalResponses: number;
  isAnonymous: boolean;
  targetAudience: 'all' | 'students' | 'faculty';
}

export interface FormResponse {
  formId: string;
  userId: string;
  userName: string;
  answers: { [questionId: string]: string | string[] | number };
  submittedAt: string;
}

const POLLS_COLLECTION = 'polls';
const VOTES_COLLECTION = 'pollVotes';
const FORMS_COLLECTION = 'forms';
const FORM_RESPONSES_COLLECTION = 'formResponses';

// Test Firebase connection
export const testFirebaseConnection = async (): Promise<{ success: boolean; message: string }> => {
  try {
    console.log('🔍 Testing Firebase connection...');
    console.log('📊 Database instance:', db);
    console.log('📊 Polls collection path:', POLLS_COLLECTION);

    // Try to read from polls collection
    const q = query(collection(db, POLLS_COLLECTION));
    console.log('📊 Query created:', q);

    const snapshot = await getDocs(q);
    console.log('📊 Query executed successfully, docs count:', snapshot.size);

    return {
      success: true,
      message: `Firebase connection successful - found ${snapshot.size} documents`
    };
  } catch (error) {
    console.error('❌ Firebase connection error:', error);

    // More detailed error information
    if (error instanceof Error) {
      console.error('❌ Error name:', error.name);
      console.error('❌ Error message:', error.message);
      console.error('❌ Error stack:', error.stack);
    }

    return {
      success: false,
      message: `Firebase connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
};

// Create a test poll for debugging
export const createTestPoll = async (): Promise<{ success: boolean; message: string; pollId?: string }> => {
  try {
    console.log('🧪 Creating test poll...');

    const testPollData = {
      title: 'Test Poll - Firebase Connection',
      description: 'This is a test poll to verify Firebase connectivity',
      category: 'general' as Poll['category'],
      expiresAt: null,
      allowMultipleVotes: false,
      isAnonymous: false,
      targetAudience: 'all' as Poll['targetAudience'],
      isActive: true,
      createdBy: 'test-admin',
      createdByName: 'Test Admin',
      options: [
        { id: 'option_1', text: 'Yes, it works!', votes: 0, voters: [] },
        { id: 'option_2', text: 'No, there are issues', votes: 0, voters: [] }
      ] as PollOption[]
    };

    const result = await createPoll(testPollData);

    if (result.success) {
      console.log('✅ Test poll created successfully with ID:', result.pollId);
    } else {
      console.error('❌ Failed to create test poll:', result.message);
    }

    return result;
  } catch (error) {
    console.error('❌ Error creating test poll:', error);
    return {
      success: false,
      message: `Failed to create test poll: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
};

// Create a new poll
export const createPoll = async (pollData: Omit<Poll, 'id' | 'createdAt' | 'totalVotes'>): Promise<{ success: boolean; message: string; pollId?: string }> => {
  try {
    console.log('📝 Creating new poll:', pollData.title);

    // First test basic connection
    const testResult = await testFirebaseConnection();
    if (!testResult.success) {
      console.error('❌ Firebase connection test failed:', testResult.message);
      return {
        success: false,
        message: `Firebase connection failed: ${testResult.message}`
      };
    }

    const poll: Omit<Poll, 'id'> = {
      ...pollData,
      createdAt: new Date().toISOString(),
      totalVotes: 0,
      options: pollData.options.map((option, index) => ({
        id: `option_${index + 1}`,
        text: option.text,
        votes: 0,
        voters: []
      }))
    };

    console.log('📝 Poll data prepared:', poll);

    const docRef = await addDoc(collection(db, POLLS_COLLECTION), poll);
    console.log('✅ Poll created with ID:', docRef.id);

    return {
      success: true,
      message: 'Poll created successfully!',
      pollId: docRef.id
    };
  } catch (error) {
    console.error('❌ Error creating poll:', error);
    return {
      success: false,
      message: `Failed to create poll: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
};

// Get all polls
export const getAllPolls = async (): Promise<{ success: boolean; polls: Poll[]; message?: string }> => {
  try {
    console.log('🔍 Attempting to fetch polls from Firebase...');

    // First test basic connection
    const testResult = await testFirebaseConnection();
    if (!testResult.success) {
      console.error('❌ Firebase connection test failed:', testResult.message);
      return {
        success: false,
        polls: [],
        message: `Firebase connection failed: ${testResult.message}`
      };
    }

    console.log('✅ Firebase connection test passed');

    const q = query(collection(db, POLLS_COLLECTION), orderBy('createdAt', 'desc'));
    console.log('📊 Executing polls query...');

    const querySnapshot = await getDocs(q);
    console.log(`📊 Found ${querySnapshot.size} polls in database`);

    const polls: Poll[] = [];
    querySnapshot.forEach((doc) => {
      try {
        const data = doc.data();
        const pollData: Poll = {
          id: doc.id,
          title: data.title || '',
          description: data.description || '',
          category: data.category || 'general',
          expiresAt: data.expiresAt || null,
          allowMultipleVotes: data.allowMultipleVotes || false,
          isAnonymous: data.isAnonymous || false,
          targetAudience: data.targetAudience || 'all',
          isActive: data.isActive || false,
          createdBy: data.createdBy || '',
          createdByName: data.createdByName || '',
          createdAt: data.createdAt || new Date().toISOString(),
          totalVotes: data.totalVotes || 0,
          options: data.options || []
        };
        polls.push(pollData);
        console.log(`📊 Loaded poll: ${pollData.title}`);
      } catch (error) {
        console.error(`❌ Error processing poll document ${doc.id}:`, error);
      }
    });

    console.log(`✅ Successfully loaded ${polls.length} polls`);
    return {
      success: true,
      polls
    };
  } catch (error) {
    console.error('❌ Error fetching polls:', error);
    return {
      success: false,
      polls: [],
      message: `Failed to fetch polls: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
};

// Get active polls for students
export const getActivePolls = async (): Promise<{ success: boolean; polls: Poll[]; message?: string }> => {
  try {
    console.log('🔍 Attempting to fetch active polls from Firebase...');

    // First test basic connection
    const testResult = await testFirebaseConnection();
    if (!testResult.success) {
      console.error('❌ Firebase connection test failed:', testResult.message);
      return {
        success: false,
        polls: [],
        message: `Firebase connection failed: ${testResult.message}`
      };
    }

    console.log('✅ Firebase connection test passed');

    const q = query(
      collection(db, POLLS_COLLECTION),
      where('isActive', '==', true),
      orderBy('createdAt', 'desc')
    );
    console.log('📊 Executing active polls query...');

    const querySnapshot = await getDocs(q);
    console.log(`📊 Found ${querySnapshot.size} active polls in database`);

    const polls: Poll[] = [];
    const now = new Date();

    querySnapshot.forEach((doc) => {
      try {
        const data = doc.data();
        const poll: Poll = {
          id: doc.id,
          title: data.title || '',
          description: data.description || '',
          category: data.category || 'general',
          expiresAt: data.expiresAt || null,
          allowMultipleVotes: data.allowMultipleVotes || false,
          isAnonymous: data.isAnonymous || false,
          targetAudience: data.targetAudience || 'all',
          isActive: data.isActive || false,
          createdBy: data.createdBy || '',
          createdByName: data.createdByName || '',
          createdAt: data.createdAt || new Date().toISOString(),
          totalVotes: data.totalVotes || 0,
          options: data.options || []
        };

        // Check if poll hasn't expired
        if (!poll.expiresAt || new Date(poll.expiresAt) > now) {
          polls.push(poll);
          console.log(`📊 Loaded active poll: ${poll.title}`);
        } else {
          console.log(`⏰ Skipped expired poll: ${poll.title}`);
        }
      } catch (error) {
        console.error(`❌ Error processing active poll document ${doc.id}:`, error);
      }
    });

    console.log(`✅ Successfully loaded ${polls.length} active polls`);
    return {
      success: true,
      polls
    };
  } catch (error) {
    console.error('❌ Error fetching active polls:', error);
    return {
      success: false,
      polls: [],
      message: `Failed to fetch active polls: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
};

// Vote on a poll
export const voteOnPoll = async (
  pollId: string, 
  userId: string, 
  userName: string, 
  selectedOptionIds: string[]
): Promise<{ success: boolean; message: string }> => {
  try {
    // Check if user has already voted
    const existingVoteQuery = query(
      collection(db, VOTES_COLLECTION),
      where('pollId', '==', pollId),
      where('userId', '==', userId)
    );
    const existingVoteSnapshot = await getDocs(existingVoteQuery);
    
    if (!existingVoteSnapshot.empty) {
      return {
        success: false,
        message: 'You have already voted on this poll'
      };
    }

    // Get the poll to check if multiple votes are allowed
    const pollDoc = await getDoc(doc(db, POLLS_COLLECTION, pollId));
    if (!pollDoc.exists()) {
      return {
        success: false,
        message: 'Poll not found'
      };
    }

    const poll = pollDoc.data() as Poll;
    
    // Check if poll allows multiple votes or if only one option is selected
    if (!poll.allowMultipleVotes && selectedOptionIds.length > 1) {
      return {
        success: false,
        message: 'This poll only allows one vote per option'
      };
    }

    // Record the vote
    const vote: Omit<UserVote, 'id'> = {
      pollId,
      userId,
      userName: poll.isAnonymous ? 'Anonymous' : userName,
      selectedOptions: selectedOptionIds,
      votedAt: new Date().toISOString()
    };

    await addDoc(collection(db, VOTES_COLLECTION), vote);

    // Update poll statistics
    const updatedOptions = poll.options.map(option => {
      if (selectedOptionIds.includes(option.id)) {
        return {
          ...option,
          votes: option.votes + 1,
          voters: poll.isAnonymous ? option.voters : [...option.voters, userId]
        };
      }
      return option;
    });

    await updateDoc(doc(db, POLLS_COLLECTION, pollId), {
      options: updatedOptions,
      totalVotes: poll.totalVotes + selectedOptionIds.length
    });

    return {
      success: true,
      message: 'Vote recorded successfully!'
    };
  } catch (error) {
    console.error('Error voting on poll:', error);
    return {
      success: false,
      message: 'Failed to record vote. Please try again.'
    };
  }
};

// Update poll status
export const updatePollStatus = async (pollId: string, isActive: boolean): Promise<{ success: boolean; message: string }> => {
  try {
    await updateDoc(doc(db, POLLS_COLLECTION, pollId), {
      isActive
    });

    return {
      success: true,
      message: `Poll ${isActive ? 'activated' : 'deactivated'} successfully!`
    };
  } catch (error) {
    console.error('Error updating poll status:', error);
    return {
      success: false,
      message: 'Failed to update poll status'
    };
  }
};

// Delete poll
export const deletePoll = async (pollId: string): Promise<{ success: boolean; message: string }> => {
  try {
    // Delete all votes for this poll first
    const votesQuery = query(collection(db, VOTES_COLLECTION), where('pollId', '==', pollId));
    const votesSnapshot = await getDocs(votesQuery);
    
    const deletePromises = votesSnapshot.docs.map(voteDoc => deleteDoc(voteDoc.ref));
    await Promise.all(deletePromises);

    // Delete the poll
    await deleteDoc(doc(db, POLLS_COLLECTION, pollId));

    return {
      success: true,
      message: 'Poll deleted successfully!'
    };
  } catch (error) {
    console.error('Error deleting poll:', error);
    return {
      success: false,
      message: 'Failed to delete poll'
    };
  }
};

// Get user's vote for a specific poll
export const getUserVote = async (pollId: string, userId: string): Promise<{ success: boolean; vote?: UserVote; message?: string }> => {
  try {
    const q = query(
      collection(db, VOTES_COLLECTION),
      where('pollId', '==', pollId),
      where('userId', '==', userId)
    );
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return {
        success: true,
        vote: undefined
      };
    }

    const voteDoc = querySnapshot.docs[0];
    const voteData = voteDoc.data();
    const vote: UserVote & { id: string } = {
      id: voteDoc.id,
      pollId: voteData.pollId || pollId,
      userId: voteData.userId || userId,
      userName: voteData.userName || '',
      selectedOptions: voteData.selectedOptions || [],
      votedAt: voteData.votedAt || new Date().toISOString()
    };

    return {
      success: true,
      vote
    };
  } catch (error) {
    console.error('Error fetching user vote:', error);
    return {
      success: false,
      message: 'Failed to fetch vote information'
    };
  }
};

// ==================== FORM FUNCTIONS ====================

// Create a new form
export const createForm = async (formData: Omit<Form, 'id' | 'createdAt' | 'totalResponses'>): Promise<{ success: boolean; message: string; formId?: string }> => {
  try {
    const form: Omit<Form, 'id'> = {
      ...formData,
      createdAt: new Date().toISOString(),
      totalResponses: 0
    };

    const docRef = await addDoc(collection(db, FORMS_COLLECTION), form);

    return {
      success: true,
      message: 'Form created successfully!',
      formId: docRef.id
    };
  } catch (error) {
    console.error('Error creating form:', error);
    return {
      success: false,
      message: 'Failed to create form. Please try again.'
    };
  }
};

// Get all forms
export const getAllForms = async (): Promise<{ success: boolean; forms: Form[]; message?: string }> => {
  try {
    const q = query(collection(db, FORMS_COLLECTION), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);

    const forms: Form[] = [];
    querySnapshot.forEach((doc) => {
      try {
        const data = doc.data();
        const form: Form = {
          id: doc.id,
          title: data.title || '',
          description: data.description || '',
          category: data.category || 'general',
          expiresAt: data.expiresAt || null,
          isAnonymous: data.isAnonymous || false,
          targetAudience: data.targetAudience || 'all',
          isActive: data.isActive || false,
          createdBy: data.createdBy || '',
          createdByName: data.createdByName || '',
          createdAt: data.createdAt || new Date().toISOString(),
          totalResponses: data.totalResponses || 0,
          questions: data.questions || []
        };
        forms.push(form);
      } catch (error) {
        console.error(`❌ Error processing form document ${doc.id}:`, error);
      }
    });

    return {
      success: true,
      forms
    };
  } catch (error) {
    console.error('Error fetching forms:', error);
    return {
      success: false,
      forms: [],
      message: 'Failed to fetch forms'
    };
  }
};

// Get active forms for students
export const getActiveForms = async (): Promise<{ success: boolean; forms: Form[]; message?: string }> => {
  try {
    const q = query(
      collection(db, FORMS_COLLECTION),
      where('isActive', '==', true),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);

    const forms: Form[] = [];
    const now = new Date();

    querySnapshot.forEach((doc) => {
      try {
        const data = doc.data();
        const form: Form = {
          id: doc.id,
          title: data.title || '',
          description: data.description || '',
          category: data.category || 'general',
          expiresAt: data.expiresAt || null,
          isAnonymous: data.isAnonymous || false,
          targetAudience: data.targetAudience || 'all',
          isActive: data.isActive || false,
          createdBy: data.createdBy || '',
          createdByName: data.createdByName || '',
          createdAt: data.createdAt || new Date().toISOString(),
          totalResponses: data.totalResponses || 0,
          questions: data.questions || []
        };

        // Check if form hasn't expired
        if (!form.expiresAt || new Date(form.expiresAt) > now) {
          forms.push(form);
        }
      } catch (error) {
        console.error(`❌ Error processing active form document ${doc.id}:`, error);
      }
    });

    return {
      success: true,
      forms
    };
  } catch (error) {
    console.error('Error fetching active forms:', error);
    return {
      success: false,
      forms: [],
      message: 'Failed to fetch active forms'
    };
  }
};

// Submit form response
export const submitFormResponse = async (
  formId: string,
  userId: string,
  userName: string,
  answers: { [questionId: string]: string | string[] | number }
): Promise<{ success: boolean; message: string }> => {
  try {
    // Check if user has already submitted
    const existingResponseQuery = query(
      collection(db, FORM_RESPONSES_COLLECTION),
      where('formId', '==', formId),
      where('userId', '==', userId)
    );
    const existingResponseSnapshot = await getDocs(existingResponseQuery);

    if (!existingResponseSnapshot.empty) {
      return {
        success: false,
        message: 'You have already submitted this form'
      };
    }

    // Get the form to check if anonymous
    const formDoc = await getDoc(doc(db, FORMS_COLLECTION, formId));
    if (!formDoc.exists()) {
      return {
        success: false,
        message: 'Form not found'
      };
    }

    const form = formDoc.data() as Form;

    // Record the response
    const response: Omit<FormResponse, 'id'> = {
      formId,
      userId,
      userName: form.isAnonymous ? 'Anonymous' : userName,
      answers,
      submittedAt: new Date().toISOString()
    };

    await addDoc(collection(db, FORM_RESPONSES_COLLECTION), response);

    // Update form statistics
    await updateDoc(doc(db, FORMS_COLLECTION, formId), {
      totalResponses: form.totalResponses + 1
    });

    return {
      success: true,
      message: 'Form submitted successfully!'
    };
  } catch (error) {
    console.error('Error submitting form:', error);
    return {
      success: false,
      message: 'Failed to submit form. Please try again.'
    };
  }
};

// Update form status
export const updateFormStatus = async (formId: string, isActive: boolean): Promise<{ success: boolean; message: string }> => {
  try {
    await updateDoc(doc(db, FORMS_COLLECTION, formId), {
      isActive
    });

    return {
      success: true,
      message: `Form ${isActive ? 'activated' : 'deactivated'} successfully!`
    };
  } catch (error) {
    console.error('Error updating form status:', error);
    return {
      success: false,
      message: 'Failed to update form status'
    };
  }
};

// Delete form
export const deleteForm = async (formId: string): Promise<{ success: boolean; message: string }> => {
  try {
    // Delete all responses for this form first
    const responsesQuery = query(collection(db, FORM_RESPONSES_COLLECTION), where('formId', '==', formId));
    const responsesSnapshot = await getDocs(responsesQuery);

    const deletePromises = responsesSnapshot.docs.map(responseDoc => deleteDoc(responseDoc.ref));
    await Promise.all(deletePromises);

    // Delete the form
    await deleteDoc(doc(db, FORMS_COLLECTION, formId));

    return {
      success: true,
      message: 'Form deleted successfully!'
    };
  } catch (error) {
    console.error('Error deleting form:', error);
    return {
      success: false,
      message: 'Failed to delete form'
    };
  }
};

// Get user's response for a specific form
export const getUserFormResponse = async (formId: string, userId: string): Promise<{ success: boolean; response?: FormResponse; message?: string }> => {
  try {
    const q = query(
      collection(db, FORM_RESPONSES_COLLECTION),
      where('formId', '==', formId),
      where('userId', '==', userId)
    );
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return {
        success: true,
        response: undefined
      };
    }

    const responseDoc = querySnapshot.docs[0];
    const responseData = responseDoc.data();
    const response: FormResponse & { id: string } = {
      id: responseDoc.id,
      formId: responseData.formId || formId,
      userId: responseData.userId || userId,
      userName: responseData.userName || '',
      answers: responseData.answers || {},
      submittedAt: responseData.submittedAt || new Date().toISOString()
    };

    return {
      success: true,
      response
    };
  } catch (error) {
    console.error('Error fetching user form response:', error);
    return {
      success: false,
      message: 'Failed to fetch response information'
    };
  }
};

// Get all responses for a form (admin only)
export const getFormResponses = async (formId: string): Promise<{ success: boolean; responses: FormResponse[]; message?: string }> => {
  try {
    const q = query(
      collection(db, FORM_RESPONSES_COLLECTION),
      where('formId', '==', formId),
      orderBy('submittedAt', 'desc')
    );
    const querySnapshot = await getDocs(q);

    const responses: FormResponse[] = [];
    querySnapshot.forEach((doc) => {
      try {
        const data = doc.data();
        const response: FormResponse & { id: string } = {
          id: doc.id,
          formId: data.formId || '',
          userId: data.userId || '',
          userName: data.userName || '',
          answers: data.answers || {},
          submittedAt: data.submittedAt || new Date().toISOString()
        };
        responses.push(response);
      } catch (error) {
        console.error(`❌ Error processing form response document ${doc.id}:`, error);
      }
    });

    return {
      success: true,
      responses
    };
  } catch (error) {
    console.error('Error fetching form responses:', error);
    return {
      success: false,
      responses: [],
      message: 'Failed to fetch form responses'
    };
  }
};
