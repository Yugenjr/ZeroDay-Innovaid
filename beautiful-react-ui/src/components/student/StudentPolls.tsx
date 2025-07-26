import React, { useState, useEffect } from 'react';
import { 
  getActivePolls, 
  voteOnPoll, 
  getUserVote, 
  Poll, 
  UserVote 
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

interface StudentPollsProps {
  user: User;
  onBack: () => void;
  onLogout: () => void;
  isDarkMode: boolean;
}

const StudentPolls: React.FC<StudentPollsProps> = ({ user, onBack, onLogout, isDarkMode }) => {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [userVotes, setUserVotes] = useState<{ [pollId: string]: UserVote }>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState<{ [pollId: string]: boolean }>({});
  const [message, setMessage] = useState('');
  const [selectedOptions, setSelectedOptions] = useState<{ [pollId: string]: string[] }>({});
  const [filterCategory, setFilterCategory] = useState('');

  useEffect(() => {
    loadPolls();
  }, []);

  const loadPolls = async () => {
    setLoading(true);
    try {
      const result = await getActivePolls();
      if (result.success) {
        setPolls(result.polls);
        
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
        setMessage('❌ Failed to load polls');
      }
    } catch (error) {
      console.error('Error loading polls:', error);
      setMessage('❌ Failed to load polls');
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
        loadPolls();
        
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

  const handleOptionSelect = (pollId: string, optionId: string, allowMultiple: boolean) => {
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

  const filteredPolls = polls.filter(poll => {
    const matchesCategory = !filterCategory || poll.category === filterCategory;
    const matchesAudience = poll.targetAudience === 'all' || poll.targetAudience === 'students';
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

  const pollGridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(450px, 1fr))',
    gap: '1.5rem'
  };

  const pollCardStyle: React.CSSProperties = {
    background: isDarkMode ? 'rgba(51, 51, 51, 0.8)' : 'white',
    borderRadius: '15px',
    padding: '1.5rem',
    boxShadow: '0 5px 15px rgba(0,0,0,0.1)',
    border: `1px solid ${isDarkMode ? '#555' : '#e2e8f0'}`,
    transition: 'transform 0.2s ease, box-shadow 0.2s ease, background 0.3s ease, border 0.3s ease'
  };

  const categoryBadgeStyle = (category: string): React.CSSProperties => {
    const colors = {
      'general': '#3b82f6',
      'academic': '#8b5cf6',
      'event': '#f59e0b',
      'feedback': '#10b981',
      'other': '#6b7280'
    };

    return {
      background: colors[category as keyof typeof colors] || '#6b7280',
      color: 'white',
      padding: '0.25rem 0.75rem',
      borderRadius: '20px',
      fontSize: '0.75rem',
      fontWeight: '600'
    };
  };

  const optionStyle = (isSelected: boolean): React.CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.75rem',
    border: `2px solid ${isSelected ? '#10b981' : '#e2e8f0'}`,
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    background: isSelected ? '#f0fdf4' : 'transparent',
    marginBottom: '0.5rem'
  });

  const categories = ['general', 'academic', 'event', 'feedback', 'other'];

  return (
    <div style={containerStyle}>
      <header style={headerStyle}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <button style={backButtonStyle} onClick={onBack}>
            ← Back to Dashboard
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.5rem', fontWeight: '800', color: isDarkMode ? '#fff' : '#333', transition: 'color 0.3s ease' }}>
            Polls & Feedback
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h2 style={{ margin: 0, color: isDarkMode ? '#fff' : '#333', fontSize: '1.5rem', transition: 'color 0.3s ease' }}>
              Active Polls ({loading ? '...' : filteredPolls.length})
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

          <div style={pollGridStyle}>
            {filteredPolls.map(poll => {
              const hasVoted = userVotes[poll.id];
              const isSubmitting = submitting[poll.id];
              const selectedForThisPoll = selectedOptions[poll.id] || [];

              return (
                <div
                  key={poll.id}
                  style={pollCardStyle}
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
                    <span style={categoryBadgeStyle(poll.category)}>
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
                          style={optionStyle(selectedForThisPoll.includes(option.id))}
                          onClick={() => handleOptionSelect(poll.id, option.id, poll.allowMultipleVotes)}
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
            })}
          </div>
          
          {filteredPolls.length === 0 && !loading && (
            <div style={{
              textAlign: 'center',
              padding: '3rem',
              color: '#6b7280'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📊</div>
              <h3 style={{ margin: '0 0 0.5rem 0' }}>No active polls found</h3>
              <p style={{ margin: 0 }}>Check back later for new polls and feedback opportunities!</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default StudentPolls;
