import React, { useState, useEffect } from 'react';
import { 
  createPoll, 
  getAllPolls, 
  updatePollStatus, 
  deletePoll, 
  Poll, 
  PollOption 
} from '../../firebase/polls';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
}

interface PollsManagementProps {
  user: User;
  onBack: () => void;
  onLogout: () => void;
  isDarkMode: boolean;
}

const PollsManagement: React.FC<PollsManagementProps> = ({ user, onBack, onLogout, isDarkMode }) => {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
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

  useEffect(() => {
    loadPolls();
  }, []);

  const loadPolls = async () => {
    setLoading(true);
    try {
      const result = await getAllPolls();
      if (result.success) {
        setPolls(result.polls);
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
          .map((opt, index) => ({
            id: `option_${index + 1}`,
            text: opt.trim(),
            votes: 0,
            voters: []
          })) as PollOption[]
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
        loadPolls();
        setTimeout(() => setMessage(''), 5000);
      } else {
        setMessage(`❌ ${result.message}`);
        setTimeout(() => setMessage(''), 5000);
      }
    } catch (error) {
      console.error('Error creating poll:', error);
      setMessage('❌ Failed to create poll. Please try again.');
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
        loadPolls();
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

  const handleDeletePoll = async (pollId: string) => {
    if (!window.confirm('Are you sure you want to delete this poll? This action cannot be undone.')) {
      return;
    }

    try {
      const result = await deletePoll(pollId);
      if (result.success) {
        setMessage('✅ Poll deleted successfully!');
        loadPolls();
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

  const addOption = () => {
    setNewPoll({ ...newPoll, options: [...newPoll.options, ''] });
  };

  const removeOption = (index: number) => {
    if (newPoll.options.length > 2) {
      const updatedOptions = newPoll.options.filter((_, i) => i !== index);
      setNewPoll({ ...newPoll, options: updatedOptions });
    }
  };

  const updateOption = (index: number, value: string) => {
    const updatedOptions = [...newPoll.options];
    updatedOptions[index] = value;
    setNewPoll({ ...newPoll, options: updatedOptions });
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

  const pollGridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
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

  const statusBadgeStyle = (isActive: boolean): React.CSSProperties => ({
    background: isActive ? '#10b981' : '#ef4444',
    color: 'white',
    padding: '0.25rem 0.75rem',
    borderRadius: '20px',
    fontSize: '0.75rem',
    fontWeight: '600'
  });

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
      fontWeight: '600',
      marginLeft: '0.5rem'
    };
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
            Polls & Feedback Management
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
              Polls Management ({loading ? '...' : polls.length})
            </h2>
            <button
              style={buttonStyle}
              onClick={() => setShowCreateForm(!showCreateForm)}
              disabled={submitting}
            >
              {showCreateForm ? '✕ Cancel' : '+ Create New Poll'}
            </button>
          </div>

          {showCreateForm && (
            <div style={{
              background: '#f8fafc',
              borderRadius: '15px',
              padding: '2rem',
              marginBottom: '2rem',
              border: '2px solid #e2e8f0'
            }}>
              <h3 style={{ margin: '0 0 1.5rem 0', color: isDarkMode ? '#fff' : '#333', transition: 'color 0.3s ease' }}>Create New Poll</h3>
              
              <input
                style={inputStyle}
                type="text"
                placeholder="Poll Title *"
                value={newPoll.title}
                onChange={(e) => setNewPoll({ ...newPoll, title: e.target.value })}
              />
              
              <textarea
                style={{ ...inputStyle, minHeight: '100px', resize: 'vertical' as const }}
                placeholder="Poll Description *"
                value={newPoll.description}
                onChange={(e) => setNewPoll({ ...newPoll, description: e.target.value })}
              />
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <select
                  style={inputStyle}
                  value={newPoll.category}
                  onChange={(e) => setNewPoll({ ...newPoll, category: e.target.value as Poll['category'] })}
                >
                  <option value="general">General</option>
                  <option value="academic">Academic</option>
                  <option value="event">Event</option>
                  <option value="feedback">Feedback</option>
                  <option value="other">Other</option>
                </select>
                
                <select
                  style={inputStyle}
                  value={newPoll.targetAudience}
                  onChange={(e) => setNewPoll({ ...newPoll, targetAudience: e.target.value as Poll['targetAudience'] })}
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
                value={newPoll.expiresAt}
                onChange={(e) => setNewPoll({ ...newPoll, expiresAt: e.target.value })}
              />
              
              <div style={{ display: 'flex', gap: '2rem', marginBottom: '1rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: isDarkMode ? '#fff' : '#333' }}>
                  <input
                    type="checkbox"
                    checked={newPoll.allowMultipleVotes}
                    onChange={(e) => setNewPoll({ ...newPoll, allowMultipleVotes: e.target.checked })}
                  />
                  Allow Multiple Votes
                </label>
                
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: isDarkMode ? '#fff' : '#333' }}>
                  <input
                    type="checkbox"
                    checked={newPoll.isAnonymous}
                    onChange={(e) => setNewPoll({ ...newPoll, isAnonymous: e.target.checked })}
                  />
                  Anonymous Voting
                </label>
              </div>
              
              <h4 style={{ color: isDarkMode ? '#fff' : '#333', marginBottom: '1rem' }}>Poll Options</h4>
              {newPoll.options.map((option, index) => (
                <div key={index} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <input
                    style={{ ...inputStyle, marginBottom: 0 }}
                    type="text"
                    placeholder={`Option ${index + 1} *`}
                    value={option}
                    onChange={(e) => updateOption(index, e.target.value)}
                  />
                  {newPoll.options.length > 2 && (
                    <button
                      style={{ background: '#ef4444', color: 'white', border: 'none', padding: '0.75rem', borderRadius: '8px', cursor: 'pointer' }}
                      onClick={() => removeOption(index)}
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
              
              <button
                style={{ ...buttonStyle, background: '#6b7280', marginBottom: '1rem' }}
                onClick={addOption}
              >
                + Add Option
              </button>
              
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button
                  style={{
                    ...buttonStyle,
                    opacity: submitting ? 0.7 : 1,
                    cursor: submitting ? 'not-allowed' : 'pointer'
                  }}
                  onClick={handleCreatePoll}
                  disabled={submitting}
                >
                  {submitting ? '⏳ Creating...' : '📝 Create Poll'}
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

          <div style={pollGridStyle}>
            {polls.map(poll => (
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
                  <div>
                    <span style={statusBadgeStyle(poll.isActive)}>
                      {poll.isActive ? 'ACTIVE' : 'INACTIVE'}
                    </span>
                    <span style={categoryBadgeStyle(poll.category)}>
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
                    <strong>Total Votes:</strong> {poll.totalVotes}
                  </p>
                  <p style={{ margin: '0 0 0.5rem 0', color: '#6b7280', fontSize: '0.875rem' }}>
                    <strong>Options:</strong> {poll.options.length}
                  </p>
                  <p style={{ margin: '0 0 0.5rem 0', color: '#6b7280', fontSize: '0.875rem' }}>
                    <strong>Target:</strong> {poll.targetAudience}
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
            ))}
          </div>
          
          {polls.length === 0 && !loading && (
            <div style={{
              textAlign: 'center',
              padding: '3rem',
              color: '#6b7280'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📊</div>
              <h3 style={{ margin: '0 0 0.5rem 0' }}>No polls created yet</h3>
              <p style={{ margin: 0 }}>Create your first poll to start collecting feedback!</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default PollsManagement;
