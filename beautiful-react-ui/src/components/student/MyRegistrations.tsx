import React, { useState, useEffect } from 'react';
import { getStudentRegistrations, EventRegistration } from '../../firebase/registrations';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  studentId?: string;
}

interface MyRegistrationsProps {
  user: User;
  onBack: () => void;
}

const MyRegistrations: React.FC<MyRegistrationsProps> = ({ user, onBack }) => {
  const [registrations, setRegistrations] = useState<EventRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  // Load student's registrations
  const loadRegistrations = async () => {
    if (!user.studentId) {
      setMessage('❌ Student ID not found');
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const result = await getStudentRegistrations(user.studentId);
      if (result.success) {
        setRegistrations(result.registrations || []);
      } else {
        setMessage(`❌ ${result.message}`);
      }
    } catch (error) {
      console.error('Error loading registrations:', error);
      setMessage('❌ Failed to load registrations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRegistrations();
  }, [user.studentId]);

  const containerStyle: React.CSSProperties = {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: '20px',
    fontFamily: 'Arial, sans-serif'
  };

  const cardStyle: React.CSSProperties = {
    background: 'rgba(255, 255, 255, 0.95)',
    borderRadius: '15px',
    padding: '30px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    maxWidth: '1000px',
    margin: '0 auto'
  };

  const buttonStyle: React.CSSProperties = {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    transition: 'all 0.3s ease'
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return '#4CAF50';
      case 'rejected': return '#f44336';
      case 'pending': return '#ff9800';
      default: return '#757575';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return '✅';
      case 'rejected': return '❌';
      case 'pending': return '⏳';
      default: return '❓';
    }
  };

  const getStatusMessage = (status: string) => {
    switch (status) {
      case 'approved': return 'Your registration has been approved!';
      case 'rejected': return 'Your registration was rejected.';
      case 'pending': return 'Your registration is pending admin approval.';
      default: return 'Unknown status';
    }
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <h2 style={{ margin: 0, color: '#333', fontSize: '28px', fontWeight: 'bold' }}>
            📝 My Event Registrations
          </h2>
          <button
            style={buttonStyle}
            onClick={onBack}
          >
            ← Back to Dashboard
          </button>
        </div>

        {message && (
          <div style={{
            padding: '15px',
            borderRadius: '8px',
            marginBottom: '20px',
            backgroundColor: message.includes('❌') ? '#ffebee' : '#e8f5e8',
            color: message.includes('❌') ? '#c62828' : '#2e7d32',
            border: `1px solid ${message.includes('❌') ? '#ffcdd2' : '#c8e6c8'}`
          }}>
            {message}
          </div>
        )}

        {/* Statistics */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
          gap: '15px', 
          marginBottom: '30px' 
        }}>
          <div style={{ 
            padding: '20px', 
            backgroundColor: '#e3f2fd', 
            borderRadius: '8px', 
            textAlign: 'center' 
          }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#1976d2' }}>Total</h3>
            <p style={{ fontSize: '24px', fontWeight: 'bold', margin: 0, color: '#1976d2' }}>
              {registrations.length}
            </p>
          </div>
          <div style={{ 
            padding: '20px', 
            backgroundColor: '#fff3e0', 
            borderRadius: '8px', 
            textAlign: 'center' 
          }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#f57c00' }}>Pending</h3>
            <p style={{ fontSize: '24px', fontWeight: 'bold', margin: 0, color: '#f57c00' }}>
              {registrations.filter(r => r.status === 'pending').length}
            </p>
          </div>
          <div style={{ 
            padding: '20px', 
            backgroundColor: '#e8f5e8', 
            borderRadius: '8px', 
            textAlign: 'center' 
          }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#388e3c' }}>Approved</h3>
            <p style={{ fontSize: '24px', fontWeight: 'bold', margin: 0, color: '#388e3c' }}>
              {registrations.filter(r => r.status === 'approved').length}
            </p>
          </div>
          <div style={{ 
            padding: '20px', 
            backgroundColor: '#ffebee', 
            borderRadius: '8px', 
            textAlign: 'center' 
          }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#d32f2f' }}>Rejected</h3>
            <p style={{ fontSize: '24px', fontWeight: 'bold', margin: 0, color: '#d32f2f' }}>
              {registrations.filter(r => r.status === 'rejected').length}
            </p>
          </div>
        </div>

        {/* Registrations List */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
            <div style={{ fontSize: '18px' }}>⏳ Loading your registrations...</div>
          </div>
        ) : registrations.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
            <div style={{ fontSize: '18px' }}>📝 No registrations found</div>
            <p>You haven't registered for any events yet. Check the announcements to register for upcoming events!</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '20px' }}>
            {registrations.map((registration) => (
              <div
                key={registration.id}
                style={{
                  background: 'white',
                  borderRadius: '12px',
                  padding: '25px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                  border: `3px solid ${getStatusColor(registration.status)}20`
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                  <div>
                    <h3 style={{ margin: '0 0 10px 0', color: '#333', fontSize: '20px' }}>
                      {registration.eventTitle}
                    </h3>
                    <p style={{ margin: '0 0 5px 0', color: '#666', fontSize: '14px' }}>
                      <strong>Registration Date:</strong> {new Date(registration.registrationDate).toLocaleDateString()}
                    </p>
                    {registration.additionalInfo && (
                      <p style={{ margin: '5px 0', color: '#666', fontSize: '14px' }}>
                        <strong>Additional Info:</strong> {registration.additionalInfo}
                      </p>
                    )}
                  </div>
                  <span style={{
                    padding: '8px 16px',
                    borderRadius: '20px',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    color: 'white',
                    backgroundColor: getStatusColor(registration.status),
                    whiteSpace: 'nowrap'
                  }}>
                    {getStatusIcon(registration.status)} {registration.status.toUpperCase()}
                  </span>
                </div>

                <div style={{
                  padding: '15px',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '8px',
                  marginBottom: '15px'
                }}>
                  <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
                    {getStatusMessage(registration.status)}
                  </p>
                  {registration.adminNotes && (
                    <p style={{ margin: '10px 0 0 0', color: '#666', fontSize: '14px' }}>
                      <strong>Admin Notes:</strong> {registration.adminNotes}
                    </p>
                  )}
                </div>

                {registration.attachments && registration.attachments.length > 0 && (
                  <div>
                    <h4 style={{ margin: '0 0 10px 0', color: '#333', fontSize: '16px' }}>
                      📎 Attached Files:
                    </h4>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                      {registration.attachments.map((attachment, index) => (
                        <a
                          key={index}
                          href={attachment.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            display: 'inline-block',
                            padding: '8px 12px',
                            backgroundColor: '#e3f2fd',
                            color: '#1976d2',
                            textDecoration: 'none',
                            borderRadius: '6px',
                            fontSize: '12px',
                            border: '1px solid #bbdefb'
                          }}
                        >
                          📄 {attachment.fileName}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyRegistrations;
