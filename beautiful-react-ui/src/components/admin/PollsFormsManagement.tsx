import React, { useState, useEffect } from 'react';
import {
  createPoll,
  getAllPolls,
  updatePollStatus,
  deletePoll,
  Poll,
  PollOption,
  createForm,
  getAllForms,
  updateFormStatus,
  deleteForm,
  Form,
  FormQuestion,
  testFirebaseConnection
} from '../../firebase/polls';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
}

interface PollsFormsManagementProps {
  user: User;
  onBack: () => void;
  onLogout: () => void;
  isDarkMode: boolean;
}

const PollsFormsManagement: React.FC<PollsFormsManagementProps> = ({ user, onBack, onLogout, isDarkMode }) => {
  const [activeTab, setActiveTab] = useState<'polls' | 'forms'>('polls');
  const [polls, setPolls] = useState<Poll[]>([]);
  const [forms, setForms] = useState<Form[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Poll creation state
  const [newPoll, setNewPoll] = useState({
    title: '',
    description: '',
    category: 'general' as Poll['category'],
    expiresAt: '',
    allowMultipleVotes: false,
    isAnonymous: false,
    targetAudience: 'all' as Poll['targetAudience'],
    options: ['', '']
  });

  // Form creation state
  const [newForm, setNewForm] = useState({
    title: '',
    description: '',
    category: 'general' as Form['category'],
    expiresAt: '',
    isAnonymous: false,
    targetAudience: 'all' as Form['targetAudience'],
    numberOfQuestions: 3,
    questions: [] as FormQuestion[]
  });

  useEffect(() => {
    loadData();
  }, [activeTab]);

  useEffect(() => {
    // Initialize form questions when numberOfQuestions changes
    if (newForm.numberOfQuestions > 0) {
      const questions: FormQuestion[] = Array.from({ length: newForm.numberOfQuestions }, (_, index) => ({
        id: `question_${index + 1}`,
        type: 'text',
        question: '',
        required: true,
        options: []
      }));
      setNewForm(prev => ({ ...prev, questions }));
    }
  }, [newForm.numberOfQuestions]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Test Firebase connection first
      console.log('🔍 Testing Firebase connection...');
      const connectionTest = await testFirebaseConnection();
      if (!connectionTest.success) {
        setMessage(`❌ Firebase Connection Error: ${connectionTest.message}`);
        setLoading(false);
        return;
      }
      console.log('✅ Firebase connection successful');

      if (activeTab === 'polls') {
        console.log('📊 Loading polls...');
        const result = await getAllPolls();
        if (result.success) {
          setPolls(result.polls);
          setMessage(result.polls.length === 0 ? '📊 No polls found. Create your first poll!' : '');
        } else {
          setMessage(`❌ Failed to load polls: ${result.message}`);
        }
      } else {
        console.log('📝 Loading forms...');
        const result = await getAllForms();
        if (result.success) {
          setForms(result.forms);
          setMessage(result.forms.length === 0 ? '📝 No forms found. Create your first form!' : '');
        } else {
          setMessage(`❌ Failed to load forms: ${result.message}`);
        }
      }
    } catch (error) {
      console.error('❌ Error loading data:', error);
      setMessage(`❌ Failed to load data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePoll = async () => {
    if (!newPoll.title || !newPoll.description || newPoll.options.filter(opt => opt.trim()).length < 2) {
      setMessage('❌ Please fill in all required fields and provide at least 2 options');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    setSubmitting(true);
    setMessage('');

    try {
      const pollData = {
        title: newPoll.title,
        description: newPoll.description,
        category: newPoll.category,
        expiresAt: newPoll.expiresAt || null,
        allowMultipleVotes: newPoll.allowMultipleVotes,
        isAnonymous: newPoll.isAnonymous,
        targetAudience: newPoll.targetAudience,
        isActive: true,
        createdBy: user._id,
        createdByName: user.name,
        options: newPoll.options
          .filter(opt => opt.trim())
          .map((opt, index): PollOption => ({
            id: `option_${index + 1}`,
            text: opt.trim(),
            votes: 0,
            voters: []
          }))
      };

      const result = await createPoll(pollData);

      if (result.success) {
        setMessage('✅ Poll created successfully!');
        setNewPoll({
          title: '',
          description: '',
          category: 'general',
          expiresAt: '',
          allowMultipleVotes: false,
          isAnonymous: false,
          targetAudience: 'all',
          options: ['', '']
        });
        setShowCreateForm(false);
        loadData();
        setTimeout(() => setMessage(''), 5000);
      } else {
        setMessage(`❌ ${result.message}`);
        setTimeout(() => setMessage(''), 5000);
      }
    } catch (error) {
      console.error('❌ Error creating poll:', error);
      setMessage('❌ Failed to create poll. Please try again.');
      setTimeout(() => setMessage(''), 5000);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateForm = async () => {
    if (!newForm.title || !newForm.description || newForm.questions.some(q => !q.question.trim())) {
      setMessage('❌ Please fill in all required fields and questions');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    setSubmitting(true);
    setMessage('');

    try {
      const formData = {
        title: newForm.title,
        description: newForm.description,
        category: newForm.category,
        expiresAt: newForm.expiresAt || null,
        isAnonymous: newForm.isAnonymous,
        targetAudience: newForm.targetAudience,
        isActive: true,
        createdBy: user._id,
        createdByName: user.name,
        questions: newForm.questions.filter(q => q.question.trim())
      };

      const result = await createForm(formData);

      if (result.success) {
        setMessage('✅ Form created successfully!');
        setNewForm({
          title: '',
          description: '',
          category: 'general',
          expiresAt: '',
          isAnonymous: false,
          targetAudience: 'all',
          numberOfQuestions: 3,
          questions: []
        });
        setShowCreateForm(false);
        loadData();
        setTimeout(() => setMessage(''), 5000);
      } else {
        setMessage(`❌ ${result.message}`);
        setTimeout(() => setMessage(''), 5000);
      }
    } catch (error) {
      console.error('❌ Error creating form:', error);
      setMessage('❌ Failed to create form. Please try again.');
      setTimeout(() => setMessage(''), 5000);
    } finally {
      setSubmitting(false);
    }
  };

  const handleTogglePollStatus = async (pollId: string, currentStatus: boolean) => {
    try {
      const result = await updatePollStatus(pollId, !currentStatus);
      if (result.success) {
        setMessage(`✅ ${result.message}`);
        loadData();
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage(`❌ ${result.message}`);
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (error) {
      console.error('Error updating poll status:', error);
      setMessage('❌ Failed to update poll status');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleToggleFormStatus = async (formId: string, currentStatus: boolean) => {
    try {
      const result = await updateFormStatus(formId, !currentStatus);
      if (result.success) {
        setMessage(`✅ ${result.message}`);
        loadData();
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage(`❌ ${result.message}`);
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (error) {
      console.error('Error updating form status:', error);
      setMessage('❌ Failed to update form status');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleDeletePoll = async (pollId: string) => {
    if (!window.confirm('Are you sure you want to delete this poll? This action cannot be undone.')) {
      return;
    }

    try {
      const result = await deletePoll(pollId);
      if (result.success) {
        setMessage('✅ Poll deleted successfully!');
        loadData();
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage(`❌ ${result.message}`);
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (error) {
      console.error('Error deleting poll:', error);
      setMessage('❌ Failed to delete poll');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleDeleteForm = async (formId: string) => {
    if (!window.confirm('Are you sure you want to delete this form? This action cannot be undone.')) {
      return;
    }

    try {
      const result = await deleteForm(formId);
      if (result.success) {
        setMessage('✅ Form deleted successfully!');
        loadData();
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage(`❌ ${result.message}`);
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (error) {
      console.error('Error deleting form:', error);
      setMessage('❌ Failed to delete form');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const addPollOption = () => {
    setNewPoll({ ...newPoll, options: [...newPoll.options, ''] });
  };

  const removePollOption = (index: number) => {
    if (newPoll.options.length > 2) {
      const updatedOptions = newPoll.options.filter((_, i) => i !== index);
      setNewPoll({ ...newPoll, options: updatedOptions });
    }
  };

  const updatePollOption = (index: number, value: string) => {
    const updatedOptions = [...newPoll.options];
    updatedOptions[index] = value;
    setNewPoll({ ...newPoll, options: updatedOptions });
  };

  const updateFormQuestion = (index: number, field: keyof FormQuestion, value: any) => {
    const updatedQuestions = [...newForm.questions];
    updatedQuestions[index] = { ...updatedQuestions[index], [field]: value };
    setNewForm({ ...newForm, questions: updatedQuestions });
  };

  const addQuestionOption = (questionIndex: number) => {
    const updatedQuestions = [...newForm.questions];
    updatedQuestions[questionIndex].options = [...(updatedQuestions[questionIndex].options || []), ''];
    setNewForm({ ...newForm, questions: updatedQuestions });
  };

  const removeQuestionOption = (questionIndex: number, optionIndex: number) => {
    const updatedQuestions = [...newForm.questions];
    updatedQuestions[questionIndex].options = updatedQuestions[questionIndex].options?.filter((_, i) => i !== optionIndex) || [];
    setNewForm({ ...newForm, questions: updatedQuestions });
  };

  const updateQuestionOption = (questionIndex: number, optionIndex: number, value: string) => {
    const updatedQuestions = [...newForm.questions];
    if (!updatedQuestions[questionIndex].options) {
      updatedQuestions[questionIndex].options = [];
    }
    updatedQuestions[questionIndex].options![optionIndex] = value;
    setNewForm({ ...newForm, questions: updatedQuestions });
  };

  const containerStyle: React.CSSProperties = {
    minHeight: '100vh',
    background: isDarkMode
      ? 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)'
      : 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
    fontFamily: 'Arial, sans-serif',
    transition: 'background 0.3s ease'
  };

  const headerStyle: React.CSSProperties = {
    background: isDarkMode
      ? 'rgba(30, 30, 60, 0.95)'
      : 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(10px)',
    padding: '1rem 2rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    transition: 'background 0.3s ease'
  };

  const backButtonStyle: React.CSSProperties = {
    background: '#667eea',
    color: 'white',
    border: 'none',
    padding: '0.5rem 1rem',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600',
    marginRight: '1rem'
  };

  const mainContentStyle: React.CSSProperties = {
    padding: '2rem',
    maxWidth: '1200px',
    margin: '0 auto'
  };

  const cardStyle: React.CSSProperties = {
    background: isDarkMode
      ? 'rgba(42, 42, 74, 0.95)'
      : 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(10px)',
    borderRadius: '20px',
    padding: '2rem',
    marginBottom: '2rem',
    boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
    transition: 'background 0.3s ease'
  };

  const tabStyle = (isActive: boolean): React.CSSProperties => ({
    background: isActive ? '#10b981' : 'transparent',
    color: isActive ? 'white' : (isDarkMode ? '#fff' : '#333'),
    border: `2px solid ${isActive ? '#10b981' : (isDarkMode ? '#555' : '#e2e8f0')}`,
    padding: '0.75rem 1.5rem',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '1rem',
    transition: 'all 0.3s ease'
  });

  const buttonStyle: React.CSSProperties = {
    background: '#10b981',
    color: 'white',
    border: 'none',
    padding: '0.75rem 1.5rem',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '1rem'
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '0.75rem',
    border: '2px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '1rem',
    marginBottom: '1rem'
  };

  return (
    <div style={containerStyle}>
      <header style={headerStyle}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <button style={backButtonStyle} onClick={onBack}>
            ← Back to Dashboard
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.5rem', fontWeight: '800', color: isDarkMode ? '#fff' : '#333', transition: 'color 0.3s ease' }}>
            <span style={{ fontSize: '2rem' }}>📊</span>
            Polls & Forms Management
          </div>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '600' }}>
            {user.name.charAt(0).toUpperCase()}
          </div>
          <button style={{ background: '#ef4444', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }} onClick={onLogout}>
            🚪 Logout
          </button>
        </div>
      </header>

      <main style={mainContentStyle}>
        {/* Message Display */}
        {message && (
          <div style={{
            background: message.includes('✅') ? '#d1fae5' : '#fee2e2',
            color: message.includes('✅') ? '#065f46' : '#dc2626',
            padding: '1rem',
            borderRadius: '8px',
            marginBottom: '1rem',
            border: `1px solid ${message.includes('✅') ? '#a7f3d0' : '#fecaca'}`
          }}>
            {message}
          </div>
        )}

        <div style={cardStyle}>
          {/* Tab Navigation */}
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
            <button
              style={tabStyle(activeTab === 'polls')}
              onClick={() => setActiveTab('polls')}
            >
              📊 Polls ({loading ? '...' : polls.length})
            </button>
            <button
              style={tabStyle(activeTab === 'forms')}
              onClick={() => setActiveTab('forms')}
            >
              📝 Forms ({loading ? '...' : forms.length})
            </button>
          </div>

          {/* Action Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h2 style={{ margin: 0, color: isDarkMode ? '#fff' : '#333', fontSize: '1.5rem', transition: 'color 0.3s ease' }}>
              {activeTab === 'polls' ? 'Polls Management' : 'Forms Management'}
            </h2>
            <button
              style={buttonStyle}
              onClick={() => setShowCreateForm(!showCreateForm)}
              disabled={submitting}
            >
              {showCreateForm ? '✕ Cancel' : `+ Create New ${activeTab === 'polls' ? 'Poll' : 'Form'}`}
            </button>
          </div>

          {/* Create Form/Poll Section */}
          {showCreateForm && (
            <div style={{
              background: '#f8fafc',
              borderRadius: '15px',
              padding: '2rem',
              marginBottom: '2rem',
              border: '2px solid #e2e8f0'
            }}>
              <h3 style={{ margin: '0 0 1.5rem 0', color: isDarkMode ? '#fff' : '#333', transition: 'color 0.3s ease' }}>
                Create New {activeTab === 'polls' ? 'Poll' : 'Form'}
              </h3>
              
              {/* Common Fields */}
              <input
                style={inputStyle}
                type="text"
                placeholder={`${activeTab === 'polls' ? 'Poll' : 'Form'} Title *`}
                value={activeTab === 'polls' ? newPoll.title : newForm.title}
                onChange={(e) => activeTab === 'polls' 
                  ? setNewPoll({ ...newPoll, title: e.target.value })
                  : setNewForm({ ...newForm, title: e.target.value })
                }
              />
              
              <textarea
                style={{ ...inputStyle, minHeight: '100px', resize: 'vertical' as const }}
                placeholder={`${activeTab === 'polls' ? 'Poll' : 'Form'} Description *`}
                value={activeTab === 'polls' ? newPoll.description : newForm.description}
                onChange={(e) => activeTab === 'polls'
                  ? setNewPoll({ ...newPoll, description: e.target.value })
                  : setNewForm({ ...newForm, description: e.target.value })
                }
              />
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <select
                  style={inputStyle}
                  value={activeTab === 'polls' ? newPoll.category : newForm.category}
                  onChange={(e) => activeTab === 'polls'
                    ? setNewPoll({ ...newPoll, category: e.target.value as Poll['category'] })
                    : setNewForm({ ...newForm, category: e.target.value as Form['category'] })
                  }
                >
                  <option value="general">General</option>
                  <option value="academic">Academic</option>
                  <option value="event">Event</option>
                  <option value="feedback">Feedback</option>
                  <option value="other">Other</option>
                </select>
                
                <select
                  style={inputStyle}
                  value={activeTab === 'polls' ? newPoll.targetAudience : newForm.targetAudience}
                  onChange={(e) => activeTab === 'polls'
                    ? setNewPoll({ ...newPoll, targetAudience: e.target.value as Poll['targetAudience'] })
                    : setNewForm({ ...newForm, targetAudience: e.target.value as Form['targetAudience'] })
                  }
                >
                  <option value="all">All Users</option>
                  <option value="students">Students Only</option>
                  <option value="faculty">Faculty Only</option>
                </select>
              </div>
              
              <input
                style={inputStyle}
                type="datetime-local"
                placeholder="Expiry Date (Optional)"
                value={activeTab === 'polls' ? newPoll.expiresAt : newForm.expiresAt}
                onChange={(e) => activeTab === 'polls'
                  ? setNewPoll({ ...newPoll, expiresAt: e.target.value })
                  : setNewForm({ ...newForm, expiresAt: e.target.value })
                }
              />
              
              <div style={{ display: 'flex', gap: '2rem', marginBottom: '1rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: isDarkMode ? '#fff' : '#333' }}>
                  <input
                    type="checkbox"
                    checked={activeTab === 'polls' ? newPoll.isAnonymous : newForm.isAnonymous}
                    onChange={(e) => activeTab === 'polls'
                      ? setNewPoll({ ...newPoll, isAnonymous: e.target.checked })
                      : setNewForm({ ...newForm, isAnonymous: e.target.checked })
                    }
                  />
                  Anonymous {activeTab === 'polls' ? 'Voting' : 'Responses'}
                </label>
                
                {activeTab === 'polls' && (
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: isDarkMode ? '#fff' : '#333' }}>
                    <input
                      type="checkbox"
                      checked={newPoll.allowMultipleVotes}
                      onChange={(e) => setNewPoll({ ...newPoll, allowMultipleVotes: e.target.checked })}
                    />
                    Allow Multiple Votes
                  </label>
                )}
              </div>

              {/* Poll-specific content */}
              {activeTab === 'polls' && (
                <>
                  <h4 style={{ color: isDarkMode ? '#fff' : '#333', marginBottom: '1rem' }}>Poll Options</h4>
                  {newPoll.options.map((option, index) => (
                    <div key={index} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <input
                        style={{ ...inputStyle, marginBottom: 0 }}
                        type="text"
                        placeholder={`Option ${index + 1} *`}
                        value={option}
                        onChange={(e) => updatePollOption(index, e.target.value)}
                      />
                      {newPoll.options.length > 2 && (
                        <button
                          style={{ background: '#ef4444', color: 'white', border: 'none', padding: '0.75rem', borderRadius: '8px', cursor: 'pointer' }}
                          onClick={() => removePollOption(index)}
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                  
                  <button
                    style={{ ...buttonStyle, background: '#6b7280', marginBottom: '1rem' }}
                    onClick={addPollOption}
                  >
                    + Add Option
                  </button>
                </>
              )}

              {/* Form-specific content */}
              {activeTab === 'forms' && (
                <>
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: isDarkMode ? '#fff' : '#333', fontWeight: '600' }}>
                      Number of Questions:
                    </label>
                    <input
                      style={{ ...inputStyle, width: '200px' }}
                      type="number"
                      min="1"
                      max="20"
                      value={newForm.numberOfQuestions}
                      onChange={(e) => setNewForm({ ...newForm, numberOfQuestions: parseInt(e.target.value) || 1 })}
                    />
                  </div>

                  <h4 style={{ color: isDarkMode ? '#fff' : '#333', marginBottom: '1rem' }}>Form Questions</h4>
                  {newForm.questions.map((question, index) => (
                    <div key={index} style={{ 
                      background: 'white', 
                      padding: '1rem', 
                      borderRadius: '8px', 
                      marginBottom: '1rem',
                      border: '1px solid #e2e8f0'
                    }}>
                      <h5 style={{ margin: '0 0 1rem 0', color: '#333' }}>Question {index + 1}</h5>
                      
                      <input
                        style={inputStyle}
                        type="text"
                        placeholder={`Question ${index + 1} *`}
                        value={question.question}
                        onChange={(e) => updateFormQuestion(index, 'question', e.target.value)}
                      />
                      
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                        <select
                          style={inputStyle}
                          value={question.type}
                          onChange={(e) => updateFormQuestion(index, 'type', e.target.value)}
                        >
                          <option value="text">Short Text</option>
                          <option value="textarea">Long Text</option>
                          <option value="radio">Single Choice</option>
                          <option value="checkbox">Multiple Choice</option>
                          <option value="dropdown">Dropdown</option>
                          <option value="rating">Rating (1-5)</option>
                        </select>
                        
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#333' }}>
                          <input
                            type="checkbox"
                            checked={question.required}
                            onChange={(e) => updateFormQuestion(index, 'required', e.target.checked)}
                          />
                          Required
                        </label>
                      </div>

                      {/* Options for radio, checkbox, dropdown */}
                      {['radio', 'checkbox', 'dropdown'].includes(question.type) && (
                        <div>
                          <h6 style={{ margin: '0 0 0.5rem 0', color: '#333' }}>Options:</h6>
                          {(question.options || []).map((option, optionIndex) => (
                            <div key={optionIndex} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                              <input
                                style={{ ...inputStyle, marginBottom: 0 }}
                                type="text"
                                placeholder={`Option ${optionIndex + 1}`}
                                value={option}
                                onChange={(e) => updateQuestionOption(index, optionIndex, e.target.value)}
                              />
                              <button
                                style={{ background: '#ef4444', color: 'white', border: 'none', padding: '0.5rem', borderRadius: '4px', cursor: 'pointer' }}
                                onClick={() => removeQuestionOption(index, optionIndex)}
                              >
                                ✕
                              </button>
                            </div>
                          ))}
                          <button
                            style={{ ...buttonStyle, background: '#6b7280', fontSize: '0.875rem', padding: '0.5rem 1rem' }}
                            onClick={() => addQuestionOption(index)}
                          >
                            + Add Option
                          </button>
                        </div>
                      )}

                      {/* Rating configuration */}
                      {question.type === 'rating' && (
                        <div>
                          <label style={{ display: 'block', marginBottom: '0.5rem', color: '#333' }}>
                            Max Rating:
                          </label>
                          <select
                            style={{ ...inputStyle, width: '150px' }}
                            value={question.maxRating || 5}
                            onChange={(e) => updateFormQuestion(index, 'maxRating', parseInt(e.target.value))}
                          >
                            <option value={3}>1-3</option>
                            <option value={5}>1-5</option>
                            <option value={10}>1-10</option>
                          </select>
                        </div>
                      )}
                    </div>
                  ))}
                </>
              )}
              
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button
                  style={{
                    ...buttonStyle,
                    opacity: submitting ? 0.7 : 1,
                    cursor: submitting ? 'not-allowed' : 'pointer'
                  }}
                  onClick={activeTab === 'polls' ? handleCreatePoll : handleCreateForm}
                  disabled={submitting}
                >
                  {submitting ? '⏳ Creating...' : `📝 Create ${activeTab === 'polls' ? 'Poll' : 'Form'}`}
                </button>
                <button
                  style={{ ...buttonStyle, background: '#6b7280' }}
                  onClick={() => setShowCreateForm(false)}
                  disabled={submitting}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Content Display */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
            gap: '1.5rem'
          }}>
            {activeTab === 'polls' ? (
              polls.map(poll => (
                <div
                  key={poll.id}
                  style={{
                    background: isDarkMode ? 'rgba(51, 51, 51, 0.8)' : 'white',
                    borderRadius: '15px',
                    padding: '1.5rem',
                    boxShadow: '0 5px 15px rgba(0,0,0,0.1)',
                    border: `1px solid ${isDarkMode ? '#555' : '#e2e8f0'}`,
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 5px 15px rgba(0,0,0,0.1)';
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <div>
                      <span style={{
                        background: poll.isActive ? '#10b981' : '#ef4444',
                        color: 'white',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '20px',
                        fontSize: '0.75rem',
                        fontWeight: '600'
                      }}>
                        {poll.isActive ? 'ACTIVE' : 'INACTIVE'}
                      </span>
                      <span style={{
                        background: '#3b82f6',
                        color: 'white',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '20px',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        marginLeft: '0.5rem'
                      }}>
                        {poll.category.toUpperCase()}
                      </span>
                    </div>
                    <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                      {new Date(poll.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <h3 style={{ margin: '0 0 0.5rem 0', color: '#333', fontSize: '1.1rem' }}>
                    {poll.title}
                  </h3>

                  <p style={{ margin: '0 0 1rem 0', color: '#4b5563', fontSize: '0.875rem' }}>
                    {poll.description}
                  </p>

                  <div style={{ marginBottom: '1rem' }}>
                    <p style={{ margin: '0 0 0.5rem 0', color: '#6b7280', fontSize: '0.875rem' }}>
                      <strong>Total Votes:</strong> {poll.totalVotes} | <strong>Options:</strong> {poll.options.length}
                    </p>
                    {poll.expiresAt && (
                      <p style={{ margin: '0 0 0.5rem 0', color: '#6b7280', fontSize: '0.875rem' }}>
                        <strong>Expires:</strong> {new Date(poll.expiresAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>

                  {/* Poll Results */}
                  <div style={{ marginBottom: '1rem' }}>
                    <h4 style={{ margin: '0 0 0.5rem 0', color: '#333', fontSize: '0.9rem' }}>Results:</h4>
                    {poll.options.map((option, index) => {
                      const percentage = poll.totalVotes > 0 ? (option.votes / poll.totalVotes) * 100 : 0;
                      return (
                        <div key={index} style={{ marginBottom: '0.5rem' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#6b7280' }}>
                            <span>{option.text}</span>
                            <span>{option.votes} votes ({percentage.toFixed(1)}%)</span>
                          </div>
                          <div style={{
                            width: '100%',
                            height: '8px',
                            background: '#e5e7eb',
                            borderRadius: '4px',
                            overflow: 'hidden'
                          }}>
                            <div style={{
                              width: `${percentage}%`,
                              height: '100%',
                              background: '#10b981',
                              transition: 'width 0.3s ease'
                            }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <button
                      style={{
                        ...buttonStyle,
                        background: poll.isActive ? '#ef4444' : '#10b981',
                        fontSize: '0.875rem',
                        padding: '0.5rem 1rem'
                      }}
                      onClick={() => handleTogglePollStatus(poll.id, poll.isActive)}
                    >
                      {poll.isActive ? '⏸️ Deactivate' : '▶️ Activate'}
                    </button>

                    <button
                      style={{
                        ...buttonStyle,
                        background: '#ef4444',
                        fontSize: '0.875rem',
                        padding: '0.5rem 1rem'
                      }}
                      onClick={() => handleDeletePoll(poll.id)}
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              ))
            ) : (
              forms.map(form => (
                <div
                  key={form.id}
                  style={{
                    background: isDarkMode ? 'rgba(51, 51, 51, 0.8)' : 'white',
                    borderRadius: '15px',
                    padding: '1.5rem',
                    boxShadow: '0 5px 15px rgba(0,0,0,0.1)',
                    border: `1px solid ${isDarkMode ? '#555' : '#e2e8f0'}`,
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 5px 15px rgba(0,0,0,0.1)';
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <div>
                      <span style={{
                        background: form.isActive ? '#10b981' : '#ef4444',
                        color: 'white',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '20px',
                        fontSize: '0.75rem',
                        fontWeight: '600'
                      }}>
                        {form.isActive ? 'ACTIVE' : 'INACTIVE'}
                      </span>
                      <span style={{
                        background: '#8b5cf6',
                        color: 'white',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '20px',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        marginLeft: '0.5rem'
                      }}>
                        {form.category.toUpperCase()}
                      </span>
                    </div>
                    <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                      {new Date(form.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <h3 style={{ margin: '0 0 0.5rem 0', color: '#333', fontSize: '1.1rem' }}>
                    {form.title}
                  </h3>

                  <p style={{ margin: '0 0 1rem 0', color: '#4b5563', fontSize: '0.875rem' }}>
                    {form.description}
                  </p>

                  <div style={{ marginBottom: '1rem' }}>
                    <p style={{ margin: '0 0 0.5rem 0', color: '#6b7280', fontSize: '0.875rem' }}>
                      <strong>Total Responses:</strong> {form.totalResponses} | <strong>Questions:</strong> {form.questions.length}
                    </p>
                    <p style={{ margin: '0 0 0.5rem 0', color: '#6b7280', fontSize: '0.875rem' }}>
                      <strong>Target:</strong> {form.targetAudience} | <strong>Anonymous:</strong> {form.isAnonymous ? 'Yes' : 'No'}
                    </p>
                    {form.expiresAt && (
                      <p style={{ margin: '0 0 0.5rem 0', color: '#6b7280', fontSize: '0.875rem' }}>
                        <strong>Expires:</strong> {new Date(form.expiresAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>

                  {/* Form Questions Preview */}
                  <div style={{ marginBottom: '1rem' }}>
                    <h4 style={{ margin: '0 0 0.5rem 0', color: '#333', fontSize: '0.9rem' }}>Questions Preview:</h4>
                    <div style={{ maxHeight: '120px', overflowY: 'auto' }}>
                      {form.questions.slice(0, 3).map((question, index) => (
                        <div key={index} style={{ marginBottom: '0.5rem', fontSize: '0.8rem', color: '#6b7280' }}>
                          <strong>{index + 1}.</strong> {question.question}
                          <span style={{
                            background: '#f3f4f6',
                            padding: '0.125rem 0.5rem',
                            borderRadius: '12px',
                            marginLeft: '0.5rem',
                            fontSize: '0.7rem'
                          }}>
                            {question.type}
                          </span>
                        </div>
                      ))}
                      {form.questions.length > 3 && (
                        <div style={{ fontSize: '0.8rem', color: '#6b7280', fontStyle: 'italic' }}>
                          +{form.questions.length - 3} more questions...
                        </div>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <button
                      style={{
                        ...buttonStyle,
                        background: form.isActive ? '#ef4444' : '#10b981',
                        fontSize: '0.875rem',
                        padding: '0.5rem 1rem'
                      }}
                      onClick={() => handleToggleFormStatus(form.id, form.isActive)}
                    >
                      {form.isActive ? '⏸️ Deactivate' : '▶️ Activate'}
                    </button>

                    <button
                      style={{
                        ...buttonStyle,
                        background: '#ef4444',
                        fontSize: '0.875rem',
                        padding: '0.5rem 1rem'
                      }}
                      onClick={() => handleDeleteForm(form.id)}
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Empty State */}
          {((activeTab === 'polls' && polls.length === 0) || (activeTab === 'forms' && forms.length === 0)) && !loading && (
            <div style={{
              textAlign: 'center',
              padding: '3rem',
              color: '#6b7280'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>
                {activeTab === 'polls' ? '📊' : '📝'}
              </div>
              <h3 style={{ margin: '0 0 0.5rem 0' }}>
                No {activeTab} created yet
              </h3>
              <p style={{ margin: 0 }}>
                Create your first {activeTab === 'polls' ? 'poll' : 'form'} to start collecting {activeTab === 'polls' ? 'votes' : 'responses'}!
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default PollsFormsManagement;
