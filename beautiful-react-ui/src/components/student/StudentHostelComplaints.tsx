import React, { useState, useEffect } from 'react';
// @ts-ignore
import { createHostelComplaint, getStudentHostelComplaints, HostelComplaint } from '../../firebase/hostelComplaints';

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

interface StudentHostelComplaintsProps {
  user: User;
  onBack: () => void;
  onLogout: () => void;
  isDarkMode: boolean;
}

const StudentHostelComplaints: React.FC<StudentHostelComplaintsProps> = ({ user, onBack, onLogout, isDarkMode }) => {
  const [isHosteler, setIsHosteler] = useState<boolean | null>(null);
  const [complaints, setComplaints] = useState<HostelComplaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  
  const [showComplaintForm, setShowComplaintForm] = useState(false);
  const [newComplaint, setNewComplaint] = useState({
    type: 'Plumbing',
    room: '',
    hostelBlock: 'A',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high'
  });

  // Load data on component mount
  useEffect(() => {
    loadComplaints();
  }, []);

  const loadComplaints = async () => {
    setLoading(true);
    try {
      if (user.studentId) {
        const result = await getStudentHostelComplaints(user.studentId);
        if (result.success) {
          setComplaints(result.complaints);
        }
      }
    } catch (error) {
      console.error('Error loading hostel complaints:', error);
      setMessage('❌ Failed to load complaints');
    } finally {
      setLoading(false);
    }
  };
  const [successMessage, setSuccessMessage] = useState('');

  // This is now handled by the loadComplaints function in useEffect

  // Save complaints to localStorage whenever complaints change
  React.useEffect(() => {
    if (complaints.length > 0) {
      localStorage.setItem('hostelComplaints', JSON.stringify(complaints));
    }
  }, [complaints]);

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
    border: `2px solid ${isDarkMode ? '#555' : '#e2e8f0'}`,
    borderRadius: '8px',
    fontSize: '1rem',
    marginBottom: '1rem',
    background: isDarkMode ? '#444' : 'white',
    color: isDarkMode ? '#fff' : '#333',
    transition: 'all 0.3s ease'
  };

  const complaintCardStyle: React.CSSProperties = {
    background: isDarkMode ? 'rgba(51, 51, 51, 0.8)' : 'white',
    borderRadius: '15px',
    padding: '1.5rem',
    marginBottom: '1rem',
    boxShadow: '0 5px 15px rgba(0,0,0,0.1)',
    border: `1px solid ${isDarkMode ? '#555' : '#e2e8f0'}`,
    transition: 'transform 0.2s ease, box-shadow 0.2s ease, background 0.3s ease, border 0.3s ease'
  };

  const statusBadgeStyle = (status: string): React.CSSProperties => {
    const colors = {
      'pending': '#f59e0b',
      'in-progress': '#3b82f6',
      'resolved': '#10b981'
    };
    
    return {
      background: colors[status as keyof typeof colors] || '#6b7280',
      color: 'white',
      padding: '0.25rem 0.75rem',
      borderRadius: '20px',
      fontSize: '0.75rem',
      fontWeight: '600'
    };
  };

  const priorityBadgeStyle = (priority: string): React.CSSProperties => {
    const colors = {
      'low': '#10b981',
      'medium': '#f59e0b',
      'high': '#ef4444'
    };
    
    return {
      background: colors[priority as keyof typeof colors] || '#6b7280',
      color: 'white',
      padding: '0.25rem 0.75rem',
      borderRadius: '20px',
      fontSize: '0.75rem',
      fontWeight: '600'
    };
  };

  const complaintTypes = ['Plumbing', 'Electrical', 'Cleaning', 'Maintenance', 'Internet', 'Security', 'Other'];
  const hostelBlocks = ['A', 'B', 'C', 'D', 'E'];

  // Filter complaints to show only current user's complaints
  const userComplaints = complaints.filter(complaint => complaint.raisedBy === user.name);

  const handleSubmitComplaint = async () => {
    if (!newComplaint.room || !newComplaint.description) {
      setMessage('❌ Please fill in all required fields');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    if (!user.studentId) {
      setMessage('❌ Student ID not found');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    setSubmitting(true);
    setMessage('');

    try {
      const complaintData = {
        type: newComplaint.type,
        room: newComplaint.room,
        hostelBlock: newComplaint.hostelBlock,
        description: newComplaint.description,
        status: 'pending' as const,
        date: new Date().toISOString(),
        raisedBy: user.name,
        studentId: user.studentId,
        studentEmail: user.email,
        priority: newComplaint.priority
      };

      const result = await createHostelComplaint(complaintData);

      if (result.success) {
        setMessage('✅ Complaint submitted successfully!');
        setNewComplaint({
          type: 'Plumbing',
          room: '',
          hostelBlock: 'A',
          description: '',
          priority: 'medium'
        });
        setShowComplaintForm(false);

        // Refresh data
        loadComplaints();

        setTimeout(() => setMessage(''), 5000);
      } else {
        setMessage(`❌ ${result.message}`);
        setTimeout(() => setMessage(''), 5000);
      }
    } catch (error) {
      console.error('Error submitting complaint:', error);
      setMessage('❌ Failed to submit complaint. Please try again.');
      setTimeout(() => setMessage(''), 5000);
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // If user hasn't specified hostel status, show selection screen
  if (isHosteler === null) {
    return (
      <div style={containerStyle}>
        <header style={headerStyle}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <button style={backButtonStyle} onClick={onBack}>
              ← Back to Dashboard
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.5rem', fontWeight: '800', color: isDarkMode ? '#fff' : '#333', transition: 'color 0.3s ease' }}>
              <span style={{ fontSize: '2rem' }}>🏠</span>
              Hostel Complaints
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
          <div style={cardStyle}>
            <div style={{ textAlign: 'center', padding: '3rem' }}>
              <div style={{ fontSize: '4rem', marginBottom: '2rem' }}>🏠</div>
              <h2 style={{ margin: '0 0 1rem 0', color: isDarkMode ? '#fff' : '#333', fontSize: '2rem', transition: 'color 0.3s ease' }}>
                Hostel Accommodation Status
              </h2>
              <p style={{ margin: '0 0 2rem 0', color: isDarkMode ? '#ccc' : '#666', fontSize: '1.1rem', transition: 'color 0.3s ease' }}>
                Are you a hostel resident or a day scholar?
              </p>
              
              <div style={{ display: 'flex', gap: '2rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                <button
                  style={{
                    ...buttonStyle,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    padding: '1.5rem 2rem',
                    fontSize: '1.1rem',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.5rem',
                    minWidth: '200px'
                  }}
                  onClick={() => setIsHosteler(true)}
                >
                  <span style={{ fontSize: '2rem' }}>🏠</span>
                  I'm a Hosteler
                </button>
                
                <button
                  style={{
                    ...buttonStyle,
                    background: '#6b7280',
                    padding: '1.5rem 2rem',
                    fontSize: '1.1rem',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.5rem',
                    minWidth: '200px'
                  }}
                  onClick={() => setIsHosteler(false)}
                >
                  <span style={{ fontSize: '2rem' }}>🚌</span>
                  I'm a Day Scholar
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // If user is a day scholar, show access denied
  if (!isHosteler) {
    return (
      <div style={containerStyle}>
        <header style={headerStyle}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <button style={backButtonStyle} onClick={onBack}>
              ← Back to Dashboard
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.5rem', fontWeight: '800', color: isDarkMode ? '#fff' : '#333', transition: 'color 0.3s ease' }}>
              <span style={{ fontSize: '2rem' }}>🏠</span>
              Hostel Complaints
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
          <div style={cardStyle}>
            <div style={{ textAlign: 'center', padding: '3rem' }}>
              <div style={{ fontSize: '4rem', marginBottom: '2rem' }}>🚌</div>
              <h2 style={{ margin: '0 0 1rem 0', color: isDarkMode ? '#fff' : '#333', fontSize: '2rem', transition: 'color 0.3s ease' }}>
                Access Restricted
              </h2>
              <p style={{ margin: '0 0 2rem 0', color: isDarkMode ? '#ccc' : '#666', fontSize: '1.1rem', transition: 'color 0.3s ease' }}>
                This service is only available for hostel residents. As a day scholar, you don't have access to hostel complaint services.
              </p>
              
              <button
                style={{
                  ...buttonStyle,
                  background: '#667eea'
                }}
                onClick={() => setIsHosteler(null)}
              >
                ← Change Status
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Main hostel complaints interface for hostelers
  return (
    <div style={containerStyle}>
      <header style={headerStyle}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <button style={backButtonStyle} onClick={onBack}>
            ← Back to Dashboard
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.5rem', fontWeight: '800', color: '#333' }}>
            <span style={{ fontSize: '2rem' }}>🏠</span>
            Hostel Complaints
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
        <div style={cardStyle}>
          {successMessage && (
            <div style={{
              background: '#f0fdf4',
              border: '2px solid #10b981',
              borderRadius: '10px',
              padding: '1rem',
              marginBottom: '2rem',
              color: '#065f46',
              fontWeight: '600'
            }}>
              {successMessage}
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h2 style={{ margin: 0, color: isDarkMode ? '#fff' : '#333', fontSize: '1.5rem', transition: 'color 0.3s ease' }}>
              My Complaints ({userComplaints.length})
            </h2>
            <button
              style={buttonStyle}
              onClick={() => setShowComplaintForm(!showComplaintForm)}
            >
              {showComplaintForm ? '✕ Cancel' : '+ New Complaint'}
            </button>
          </div>

          {showComplaintForm && (
            <div style={{
              background: '#f8fafc',
              borderRadius: '15px',
              padding: '2rem',
              marginBottom: '2rem',
              border: '2px solid #e2e8f0'
            }}>
              <h3 style={{ margin: '0 0 1.5rem 0', color: isDarkMode ? '#fff' : '#333', transition: 'color 0.3s ease' }}>Submit New Complaint</h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <select
                  style={inputStyle}
                  value={newComplaint.type}
                  onChange={(e) => setNewComplaint({ ...newComplaint, type: e.target.value })}
                >
                  {complaintTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
                
                <input
                  style={inputStyle}
                  type="text"
                  placeholder="Room Number *"
                  value={newComplaint.room}
                  onChange={(e) => setNewComplaint({ ...newComplaint, room: e.target.value })}
                />
                
                <select
                  style={inputStyle}
                  value={newComplaint.hostelBlock}
                  onChange={(e) => setNewComplaint({ ...newComplaint, hostelBlock: e.target.value })}
                >
                  {hostelBlocks.map(block => (
                    <option key={block} value={block}>Block {block}</option>
                  ))}
                </select>
                
                <select
                  style={inputStyle}
                  value={newComplaint.priority}
                  onChange={(e) => setNewComplaint({ ...newComplaint, priority: e.target.value as 'low' | 'medium' | 'high' })}
                >
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
                </select>
              </div>
              
              <textarea
                style={{ ...inputStyle, minHeight: '100px', resize: 'vertical' as const }}
                placeholder="Describe the issue in detail *"
                value={newComplaint.description}
                onChange={(e) => setNewComplaint({ ...newComplaint, description: e.target.value })}
              />
              
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button style={buttonStyle} onClick={handleSubmitComplaint}>
                  📝 Submit Complaint
                </button>
                <button
                  style={{ ...buttonStyle, background: '#6b7280' }}
                  onClick={() => setShowComplaintForm(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          <div>
            {userComplaints.map(complaint => (
              <div
                key={complaint.id}
                style={complaintCardStyle}
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
                    <h3 style={{ margin: '0 0 0.5rem 0', color: isDarkMode ? '#fff' : '#333', fontSize: '1.1rem', transition: 'color 0.3s ease' }}>
                      {complaint.type} Issue
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <span style={statusBadgeStyle(complaint.status)}>
                        {complaint.status.toUpperCase().replace('-', ' ')}
                      </span>
                      <span style={priorityBadgeStyle(complaint.priority)}>
                        {complaint.priority.toUpperCase()} PRIORITY
                      </span>
                    </div>
                  </div>
                  <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                    {formatDate(complaint.date)}
                  </span>
                </div>
                
                <p style={{ margin: '0 0 0.5rem 0', color: '#6b7280', fontSize: '0.875rem' }}>
                  <strong>Room:</strong> {complaint.room} (Block {complaint.hostelBlock})
                </p>
                
                <p style={{ margin: '0', color: isDarkMode ? '#ddd' : '#4b5563', lineHeight: '1.6', transition: 'color 0.3s ease' }}>
                  {complaint.description}
                </p>
              </div>
            ))}
            
            {userComplaints.length === 0 && (
              <div style={{
                textAlign: 'center',
                padding: '3rem',
                color: '#6b7280'
              }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏠</div>
                <h3 style={{ margin: '0 0 0.5rem 0' }}>No complaints yet</h3>
                <p style={{ margin: 0 }}>Submit your first complaint to get started!</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default StudentHostelComplaints;
