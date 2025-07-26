import React, { useState, useEffect } from 'react';
import {
  getActivePolls,
  voteOnPoll,
  getUserVote,
  Poll,
  UserVote,
  getActiveForms,
  submitFormResponse,
  getUserFormResponse,
  Form,
  FormResponse,
  testFirebaseConnection
} from '../../firebase/polls';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  studentId?: string;
  department?: string;
  year?: number;
  phone?: string;
}

interface StudentPollsFormsProps {
  user: User;
  onBack: () => void;
  onLogout: () => void;
  isDarkMode: boolean;
}

const StudentPollsForms: React.FC<StudentPollsFormsProps> = ({ user, onBack, onLogout, isDarkMode }) => {
  const [activeTab, setActiveTab] = useState<'polls' | 'forms'>('polls');
  const [polls, setPolls] = useState<Poll[]>([]);
  const [forms, setForms] = useState<Form[]>([]);
  const [userVotes, setUserVotes] = useState<{ [pollId: string]: UserVote }>({});
  const [userResponses, setUserResponses] = useState<{ [formId: string]: FormResponse }>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState<{ [id: string]: boolean }>({});
  const [message, setMessage] = useState('');
  const [selectedOptions, setSelectedOptions] = useState<{ [pollId: string]: string[] }>({});
  const [formAnswers, setFormAnswers] = useState<{ [formId: string]: { [questionId: string]: string | string[] | number } }>({});
  const [filterCategory, setFilterCategory] = useState('');

  useEffect(() => {
    loadData();
  }, [activeTab]);

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
        console.log('📊 Loading active polls...');
        const result = await getActivePolls();
        if (result.success) {
          setPolls(result.polls);
          setMessage(result.polls.length === 0 ? '📊 No active polls available at the moment.' : '');

          // Load user votes for each poll
          const votes: { [pollId: string]: UserVote } = {};
          for (const poll of result.polls) {
            const voteResult = await getUserVote(poll.id, user._id);
            if (voteResult.success && voteResult.vote) {
              votes[poll.id] = voteResult.vote;
            }
          }
          setUserVotes(votes);
        } else {
          setMessage(`❌ Failed to load polls: ${result.message}`);
        }
      } else {
        console.log('📝 Loading active forms...');
        const result = await getActiveForms();
        if (result.success) {
          setForms(result.forms);
          setMessage(result.forms.length === 0 ? '📝 No active forms available at the moment.' : '');

          // Load user responses for each form
          const responses: { [formId: string]: FormResponse } = {};
          for (const form of result.forms) {
            const responseResult = await getUserFormResponse(form.id, user._id);
            if (responseResult.success && responseResult.response) {
              responses[form.id] = responseResult.response;
            }
          }
          setUserResponses(responses);
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

  const handleVote = async (pollId: string) => {
    const selectedOptionIds = selectedOptions[pollId] || [];
    
    if (selectedOptionIds.length === 0) {
      setMessage('❌ Please select at least one option');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    setSubmitting({ ...submitting, [pollId]: true });
    setMessage('');

    try {
      const result = await voteOnPoll(pollId, user._id, user.name, selectedOptionIds);

      if (result.success) {
        setMessage('✅ Vote recorded successfully!');
        
        // Clear selected options for this poll
        const updatedSelectedOptions = { ...selectedOptions };
        delete updatedSelectedOptions[pollId];
        setSelectedOptions(updatedSelectedOptions);
        
        // Reload polls to get updated results
        loadData();
        
        setTimeout(() => setMessage(''), 5000);
      } else {
        setMessage(`❌ ${result.message}`);
        setTimeout(() => setMessage(''), 5000);
      }
    } catch (error) {
      console.error('Error voting:', error);
      setMessage('❌ Failed to record vote. Please try again.');
      setTimeout(() => setMessage(''), 5000);
    } finally {
      setSubmitting({ ...submitting, [pollId]: false });
    }
  };

  const handleFormSubmit = async (formId: string) => {
    const answers = formAnswers[formId] || {};
    const form = forms.find(f => f.id === formId);
    
    if (!form) return;

    // Validate required fields
    const missingRequired = form.questions.filter(q => 
      q.required && (!answers[q.id] || 
        (Array.isArray(answers[q.id]) && (answers[q.id] as string[]).length === 0) ||
        (typeof answers[q.id] === 'string' && !(answers[q.id] as string).trim()))
    );

    if (missingRequired.length > 0) {
      setMessage('❌ Please fill in all required fields');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    setSubmitting({ ...submitting, [formId]: true });
    setMessage('');

    try {
      const result = await submitFormResponse(formId, user._id, user.name, answers);

      if (result.success) {
        setMessage('✅ Form submitted successfully!');
        
        // Clear form answers
        const updatedFormAnswers = { ...formAnswers };
        delete updatedFormAnswers[formId];
        setFormAnswers(updatedFormAnswers);
        
        // Reload forms to get updated status
        loadData();
        
        setTimeout(() => setMessage(''), 5000);
      } else {
        setMessage(`❌ ${result.message}`);
        setTimeout(() => setMessage(''), 5000);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setMessage('❌ Failed to submit form. Please try again.');
      setTimeout(() => setMessage(''), 5000);
    } finally {
      setSubmitting({ ...submitting, [formId]: false });
    }
  };

  const handlePollOptionSelect = (pollId: string, optionId: string, allowMultiple: boolean) => {
    const currentSelected = selectedOptions[pollId] || [];
    
    if (allowMultiple) {
      // Toggle option in multiple selection
      if (currentSelected.includes(optionId)) {
        setSelectedOptions({
          ...selectedOptions,
          [pollId]: currentSelected.filter(id => id !== optionId)
        });
      } else {
        setSelectedOptions({
          ...selectedOptions,
          [pollId]: [...currentSelected, optionId]
        });
      }
    } else {
      // Single selection
      setSelectedOptions({
        ...selectedOptions,
        [pollId]: [optionId]
      });
    }
  };

  const handleFormAnswerChange = (formId: string, questionId: string, value: string | string[] | number) => {
    setFormAnswers({
      ...formAnswers,
      [formId]: {
        ...formAnswers[formId],
        [questionId]: value
      }
    });
  };

  const filteredPolls = polls.filter(poll => {
    const matchesCategory = !filterCategory || poll.category === filterCategory;
    const matchesAudience = poll.targetAudience === 'all' || poll.targetAudience === 'students';
    return matchesCategory && matchesAudience;
  });

  const filteredForms = forms.filter(form => {
    const matchesCategory = !filterCategory || form.category === filterCategory;
    const matchesAudience = form.targetAudience === 'all' || form.targetAudience === 'students';
    return matchesCategory && matchesAudience;
  });

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

  const categories = ['general', 'academic', 'event', 'feedback', 'other'];

  return (
    <div style={containerStyle}>
      <header style={headerStyle}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <button style={backButtonStyle} onClick={onBack}>
            ← Back to Dashboard
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.5rem', fontWeight: '800', color: isDarkMode ? '#fff' : '#333', transition: 'color 0.3s ease' }}>
            Polls & Forms
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
              📊 Polls ({loading ? '...' : filteredPolls.length})
            </button>
            <button
              style={tabStyle(activeTab === 'forms')}
              onClick={() => setActiveTab('forms')}
            >
              📝 Forms ({loading ? '...' : filteredForms.length})
            </button>
          </div>

          {/* Filter and Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h2 style={{ margin: 0, color: isDarkMode ? '#fff' : '#333', fontSize: '1.5rem', transition: 'color 0.3s ease' }}>
              Active {activeTab === 'polls' ? 'Polls' : 'Forms'}
            </h2>
            
            <select
              style={{ padding: '0.75rem', border: '2px solid #e2e8f0', borderRadius: '8px', fontSize: '1rem' }}
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Content Display */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(450px, 1fr))',
            gap: '1.5rem'
          }}>
            {activeTab === 'polls' ? (
              filteredPolls.map(poll => {
                const hasVoted = userVotes[poll.id];
                const isSubmitting = submitting[poll.id];
                const selectedForThisPoll = selectedOptions[poll.id] || [];

                return (
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
                      <span style={{
                        background: '#3b82f6',
                        color: 'white',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '20px',
                        fontSize: '0.75rem',
                        fontWeight: '600'
                      }}>
                        {poll.category.toUpperCase()}
                      </span>
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
                        <strong>Total Votes:</strong> {poll.totalVotes} |
                        <strong> Multiple Selection:</strong> {poll.allowMultipleVotes ? 'Yes' : 'No'} |
                        <strong> Anonymous:</strong> {poll.isAnonymous ? 'Yes' : 'No'}
                      </p>
                      {poll.expiresAt && (
                        <p style={{ margin: '0 0 0.5rem 0', color: '#6b7280', fontSize: '0.875rem' }}>
                          <strong>Expires:</strong> {new Date(poll.expiresAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>

                    {hasVoted ? (
                      <div>
                        <div style={{
                          background: '#f0fdf4',
                          border: '1px solid #a7f3d0',
                          borderRadius: '8px',
                          padding: '1rem',
                          marginBottom: '1rem'
                        }}>
                          <p style={{ margin: '0', color: '#065f46', fontWeight: '600' }}>
                            ✅ You have already voted on this poll
                          </p>
                          <p style={{ margin: '0.5rem 0 0 0', color: '#065f46', fontSize: '0.875rem' }}>
                            Your selection: {hasVoted.selectedOptions.map(optionId => {
                              const option = poll.options.find(opt => opt.id === optionId);
                              return option?.text;
                            }).join(', ')}
                          </p>
                        </div>

                        {/* Show results */}
                        <h4 style={{ margin: '0 0 0.5rem 0', color: '#333', fontSize: '0.9rem' }}>Current Results:</h4>
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
                    ) : (
                      <div>
                        <h4 style={{ margin: '0 0 1rem 0', color: '#333', fontSize: '0.9rem' }}>
                          Select your option{poll.allowMultipleVotes ? 's' : ''}:
                        </h4>

                        {poll.options.map((option) => (
                          <div
                            key={option.id}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.75rem',
                              padding: '0.75rem',
                              border: `2px solid ${selectedForThisPoll.includes(option.id) ? '#10b981' : '#e2e8f0'}`,
                              borderRadius: '8px',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease',
                              background: selectedForThisPoll.includes(option.id) ? '#f0fdf4' : 'transparent',
                              marginBottom: '0.5rem'
                            }}
                            onClick={() => handlePollOptionSelect(poll.id, option.id, poll.allowMultipleVotes)}
                          >
                            <input
                              type={poll.allowMultipleVotes ? 'checkbox' : 'radio'}
                              checked={selectedForThisPoll.includes(option.id)}
                              onChange={() => {}} // Handled by div onClick
                              style={{ margin: 0 }}
                            />
                            <span style={{ flex: 1, color: '#333' }}>{option.text}</span>
                          </div>
                        ))}

                        <button
                          style={{
                            ...buttonStyle,
                            opacity: isSubmitting || selectedForThisPoll.length === 0 ? 0.7 : 1,
                            cursor: isSubmitting || selectedForThisPoll.length === 0 ? 'not-allowed' : 'pointer',
                            marginTop: '1rem'
                          }}
                          onClick={() => handleVote(poll.id)}
                          disabled={isSubmitting || selectedForThisPoll.length === 0}
                        >
                          {isSubmitting ? 'Submitting...' : 'Submit Vote'}
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              filteredForms.map(form => {
                const hasSubmitted = userResponses[form.id];
                const isSubmitting = submitting[form.id];
                const formAnswersForThis = formAnswers[form.id] || {};

                return (
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
                      <span style={{
                        background: '#8b5cf6',
                        color: 'white',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '20px',
                        fontSize: '0.75rem',
                        fontWeight: '600'
                      }}>
                        {form.category.toUpperCase()}
                      </span>
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
                        <strong>Total Responses:</strong> {form.totalResponses} |
                        <strong> Questions:</strong> {form.questions.length} |
                        <strong> Anonymous:</strong> {form.isAnonymous ? 'Yes' : 'No'}
                      </p>
                      {form.expiresAt && (
                        <p style={{ margin: '0 0 0.5rem 0', color: '#6b7280', fontSize: '0.875rem' }}>
                          <strong>Expires:</strong> {new Date(form.expiresAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>

                    {hasSubmitted ? (
                      <div style={{
                        background: '#f0fdf4',
                        border: '1px solid #a7f3d0',
                        borderRadius: '8px',
                        padding: '1rem'
                      }}>
                        <p style={{ margin: '0', color: '#065f46', fontWeight: '600' }}>
                          ✅ You have already submitted this form
                        </p>
                        <p style={{ margin: '0.5rem 0 0 0', color: '#065f46', fontSize: '0.875rem' }}>
                          Submitted on: {new Date(hasSubmitted.submittedAt).toLocaleDateString()}
                        </p>
                      </div>
                    ) : (
                      <div>
                        <h4 style={{ margin: '0 0 1rem 0', color: '#333', fontSize: '0.9rem' }}>
                          Please fill out the form:
                        </h4>

                        <div style={{ maxHeight: '400px', overflowY: 'auto', marginBottom: '1rem' }}>
                          {form.questions.map((question, index) => (
                            <div key={question.id} style={{
                              marginBottom: '1.5rem',
                              padding: '1rem',
                              background: '#f8fafc',
                              borderRadius: '8px',
                              border: '1px solid #e2e8f0'
                            }}>
                              <label style={{
                                display: 'block',
                                marginBottom: '0.5rem',
                                color: '#333',
                                fontWeight: '600',
                                fontSize: '0.9rem'
                              }}>
                                {index + 1}. {question.question}
                                {question.required && <span style={{ color: '#ef4444' }}> *</span>}
                              </label>

                              {question.type === 'text' && (
                                <input
                                  type="text"
                                  style={{
                                    width: '100%',
                                    padding: '0.5rem',
                                    border: '1px solid #d1d5db',
                                    borderRadius: '4px',
                                    fontSize: '0.875rem'
                                  }}
                                  value={(formAnswersForThis[question.id] as string) || ''}
                                  onChange={(e) => handleFormAnswerChange(form.id, question.id, e.target.value)}
                                  placeholder="Enter your answer..."
                                />
                              )}

                              {question.type === 'textarea' && (
                                <textarea
                                  style={{
                                    width: '100%',
                                    padding: '0.5rem',
                                    border: '1px solid #d1d5db',
                                    borderRadius: '4px',
                                    fontSize: '0.875rem',
                                    minHeight: '80px',
                                    resize: 'vertical'
                                  }}
                                  value={(formAnswersForThis[question.id] as string) || ''}
                                  onChange={(e) => handleFormAnswerChange(form.id, question.id, e.target.value)}
                                  placeholder="Enter your detailed answer..."
                                />
                              )}

                              {question.type === 'radio' && question.options && (
                                <div>
                                  {question.options.map((option, optionIndex) => (
                                    <label key={optionIndex} style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '0.5rem',
                                      marginBottom: '0.5rem',
                                      cursor: 'pointer',
                                      fontSize: '0.875rem'
                                    }}>
                                      <input
                                        type="radio"
                                        name={`${form.id}_${question.id}`}
                                        value={option}
                                        checked={(formAnswersForThis[question.id] as string) === option}
                                        onChange={(e) => handleFormAnswerChange(form.id, question.id, e.target.value)}
                                      />
                                      {option}
                                    </label>
                                  ))}
                                </div>
                              )}

                              {question.type === 'checkbox' && question.options && (
                                <div>
                                  {question.options.map((option, optionIndex) => (
                                    <label key={optionIndex} style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '0.5rem',
                                      marginBottom: '0.5rem',
                                      cursor: 'pointer',
                                      fontSize: '0.875rem'
                                    }}>
                                      <input
                                        type="checkbox"
                                        checked={((formAnswersForThis[question.id] as string[]) || []).includes(option)}
                                        onChange={(e) => {
                                          const currentValues = (formAnswersForThis[question.id] as string[]) || [];
                                          if (e.target.checked) {
                                            handleFormAnswerChange(form.id, question.id, [...currentValues, option]);
                                          } else {
                                            handleFormAnswerChange(form.id, question.id, currentValues.filter(v => v !== option));
                                          }
                                        }}
                                      />
                                      {option}
                                    </label>
                                  ))}
                                </div>
                              )}

                              {question.type === 'dropdown' && question.options && (
                                <select
                                  style={{
                                    width: '100%',
                                    padding: '0.5rem',
                                    border: '1px solid #d1d5db',
                                    borderRadius: '4px',
                                    fontSize: '0.875rem'
                                  }}
                                  value={(formAnswersForThis[question.id] as string) || ''}
                                  onChange={(e) => handleFormAnswerChange(form.id, question.id, e.target.value)}
                                >
                                  <option value="">Select an option...</option>
                                  {question.options.map((option, optionIndex) => (
                                    <option key={optionIndex} value={option}>{option}</option>
                                  ))}
                                </select>
                              )}

                              {question.type === 'rating' && (
                                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                  {Array.from({ length: question.maxRating || 5 }, (_, i) => i + 1).map(rating => (
                                    <button
                                      key={rating}
                                      type="button"
                                      style={{
                                        background: (formAnswersForThis[question.id] as number) >= rating ? '#fbbf24' : '#e5e7eb',
                                        border: 'none',
                                        borderRadius: '50%',
                                        width: '30px',
                                        height: '30px',
                                        cursor: 'pointer',
                                        fontSize: '1rem',
                                        transition: 'background 0.2s ease'
                                      }}
                                      onClick={() => handleFormAnswerChange(form.id, question.id, rating)}
                                    >
                                      ⭐
                                    </button>
                                  ))}
                                  <span style={{ marginLeft: '0.5rem', fontSize: '0.875rem', color: '#6b7280' }}>
                                    {formAnswersForThis[question.id] ? `${formAnswersForThis[question.id]}/${question.maxRating || 5}` : 'Not rated'}
                                  </span>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>

                        <button
                          style={{
                            ...buttonStyle,
                            opacity: isSubmitting ? 0.7 : 1,
                            cursor: isSubmitting ? 'not-allowed' : 'pointer'
                          }}
                          onClick={() => handleFormSubmit(form.id)}
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? '⏳ Submitting...' : '📝 Submit Form'}
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Empty State */}
          {((activeTab === 'polls' && filteredPolls.length === 0) || (activeTab === 'forms' && filteredForms.length === 0)) && !loading && (
            <div style={{
              textAlign: 'center',
              padding: '3rem',
              color: '#6b7280'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>
                {activeTab === 'polls' ? '📊' : '📝'}
              </div>
              <h3 style={{ margin: '0 0 0.5rem 0' }}>
                No active {activeTab} found
              </h3>
              <p style={{ margin: 0 }}>
                Check back later for new {activeTab === 'polls' ? 'polls' : 'forms'} and feedback opportunities!
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default StudentPollsForms;
