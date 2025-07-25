import React, { useState, useEffect } from 'react';
// @ts-ignore
import { getEventRegistrations, EventRegistration } from '../../firebase/auth';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
}

interface EventRegistrationsProps {
  user: User;
  onBack: () => void;
  onLogout: () => void;
}

const EventRegistrations: React.FC<EventRegistrationsProps> = ({ user, onBack, onLogout }) => {
  const [registrations, setRegistrations] = useState<EventRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEventFilter, setSelectedEventFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const containerStyle: React.CSSProperties = {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    fontFamily: 'Arial, sans-serif'
  };

  const headerStyle: React.CSSProperties = {
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(10px)',
    borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
    padding: '1rem 2rem',
    position: 'sticky',
    top: 0,
    zIndex: 100
  };

  const backButtonStyle: React.CSSProperties = {
    background: '#667eea',
    color: 'white',
    border: 'none',
    padding: '0.5rem 1rem',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.875rem',
    fontWeight: '600',
    marginRight: '1rem'
  };

  const logoutButtonStyle: React.CSSProperties = {
    background: '#ef4444',
    color: 'white',
    border: 'none',
    padding: '0.5rem 1rem',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.875rem',
    fontWeight: '600'
  };

  const mainContentStyle: React.CSSProperties = {
    padding: '2rem',
    maxWidth: '1200px',
    margin: '0 auto'
  };

  const cardStyle: React.CSSProperties = {
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(10px)',
    borderRadius: '20px',
    padding: '2rem',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    border: '1px solid rgba(255, 255, 255, 0.2)'
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '0.75rem',
    border: '2px solid #e2e8f0',
    borderRadius: '10px',
    fontSize: '1rem',
    marginBottom: '1rem'
  };

  const registrationCardStyle: React.CSSProperties = {
    background: 'white',
    borderRadius: '15px',
    padding: '1.5rem',
    marginBottom: '1rem',
    boxShadow: '0 5px 15px rgba(0,0,0,0.1)',
    border: '1px solid #e2e8f0',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease'
  };

  // Load registrations on component mount
  useEffect(() => {
    loadRegistrations();
  }, []);

  const loadRegistrations = async () => {
    setLoading(true);
    try {
      const result = await getEventRegistrations();
      if (result.success) {
        setRegistrations(result.registrations);
      } else {
        console.error('Failed to load registrations:', result.message);
      }
    } catch (error) {
      console.error('Error loading registrations:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get unique event titles for filter dropdown
  const uniqueEvents = Array.from(new Set(registrations.map(reg => reg.eventTitle)));

  // Filter registrations
  const filteredRegistrations = registrations.filter(registration => {
    const matchesEvent = !selectedEventFilter || registration.eventTitle === selectedEventFilter;
    const matchesSearch = !searchTerm || 
      registration.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      registration.studentEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      registration.eventTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      registration.studentId.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesEvent && matchesSearch;
  });

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div style={containerStyle}>
      <header style={headerStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <button style={backButtonStyle} onClick={onBack}>
              ← Back to Dashboard
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.5rem', fontWeight: '800', color: '#333' }}>
              <span style={{ fontSize: '2rem' }}>📝</span>
              Event Registrations
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ color: '#333', fontSize: '0.875rem' }}>
              Welcome, <strong>{user.name}</strong>
            </span>
            <button style={logoutButtonStyle} onClick={onLogout}>
              Logout
            </button>
          </div>
        </div>
      </header>

      <main style={mainContentStyle}>
        <div style={cardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ margin: 0, color: '#333', fontSize: '1.5rem' }}>
              Event Registrations ({filteredRegistrations.length})
            </h2>
            <div style={{
              background: '#10b981',
              color: 'white',
              padding: '0.75rem 1.5rem',
              borderRadius: '10px',
              fontSize: '0.875rem',
              fontWeight: '600'
            }}>
              📊 Total: {registrations.length} registrations
            </div>
          </div>

          {/* Registration Summary */}
          {registrations.length > 0 && (
            <div style={{
              background: 'white',
              borderRadius: '15px',
              padding: '1.5rem',
              marginBottom: '2rem',
              boxShadow: '0 5px 15px rgba(0,0,0,0.1)',
              border: '1px solid #e2e8f0'
            }}>
              <h3 style={{ margin: '0 0 1rem 0', color: '#333', fontSize: '1.125rem' }}>
                📈 Registration Summary by Event
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                {Object.entries(
                  registrations.reduce((acc: any, reg) => {
                    acc[reg.eventTitle] = (acc[reg.eventTitle] || 0) + 1;
                    return acc;
                  }, {})
                ).map(([eventTitle, count]) => (
                  <div
                    key={eventTitle}
                    style={{
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: 'white',
                      padding: '1rem',
                      borderRadius: '10px',
                      textAlign: 'center'
                    }}
                  >
                    <div style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.5rem' }}>
                      {count as number}
                    </div>
                    <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>
                      {eventTitle}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
            <input
              style={inputStyle}
              type="text"
              placeholder="Search by student name, email, or event..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            
            <select
              style={inputStyle}
              value={selectedEventFilter}
              onChange={(e) => setSelectedEventFilter(e.target.value)}
            >
              <option value="">All Events</option>
              {uniqueEvents.map(eventTitle => (
                <option key={eventTitle} value={eventTitle}>
                  {eventTitle}
                </option>
              ))}
            </select>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
              <h3 style={{ margin: '0 0 0.5rem 0' }}>Loading registrations...</h3>
            </div>
          ) : filteredRegistrations.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📝</div>
              <h3 style={{ margin: '0 0 0.5rem 0' }}>No registrations found</h3>
              <p style={{ margin: 0 }}>
                {selectedEventFilter || searchTerm 
                  ? 'No registrations match your search criteria.'
                  : 'No students have registered for events yet.'
                }
              </p>
            </div>
          ) : (
            <div>
              {filteredRegistrations.map(registration => (
                <div
                  key={registration.id}
                  style={registrationCardStyle}
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
                      <h3 style={{ margin: '0 0 0.5rem 0', color: '#333', fontSize: '1.25rem' }}>
                        🎭 {registration.eventTitle}
                      </h3>
                      <div style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                        Registered: {formatDate(registration.registrationDate)}
                      </div>
                    </div>
                    <div style={{
                      background: '#10b981',
                      color: 'white',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '20px',
                      fontSize: '0.75rem',
                      fontWeight: '600'
                    }}>
                      {registration.status}
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                    <div>
                      <strong>Student Details:</strong>
                      <div style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#4b5563' }}>
                        <div><strong>Name:</strong> {registration.studentName}</div>
                        <div><strong>Email:</strong> {registration.studentEmail}</div>
                        <div><strong>Student ID:</strong> {registration.studentId}</div>
                      </div>
                    </div>
                    <div>
                      <strong>Additional Info:</strong>
                      <div style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#4b5563' }}>
                        {registration.department && <div><strong>Department:</strong> {registration.department}</div>}
                        {registration.year && <div><strong>Year:</strong> {registration.year}</div>}
                        {registration.phone && <div><strong>Phone:</strong> {registration.phone}</div>}
                      </div>
                    </div>
                  </div>

                  {registration.additionalInfo && (
                    <div style={{
                      background: '#f8fafc',
                      padding: '1rem',
                      borderRadius: '8px',
                      marginTop: '1rem'
                    }}>
                      <strong>Additional Information:</strong>
                      <p style={{ margin: '0.5rem 0 0 0', color: '#4b5563', fontSize: '0.875rem' }}>
                        {registration.additionalInfo}
                      </p>
                    </div>
                  )}

                  {registration.attachments && registration.attachments.length > 0 && (
                    <div style={{
                      background: '#f0f9ff',
                      padding: '1rem',
                      borderRadius: '8px',
                      marginTop: '1rem'
                    }}>
                      <strong>📎 Attached Files ({registration.attachments.length}):</strong>
                      <div style={{ marginTop: '0.5rem' }}>
                        {registration.attachments.map((attachment, index) => (
                          <div
                            key={index}
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              padding: '0.5rem',
                              backgroundColor: 'white',
                              borderRadius: '6px',
                              marginBottom: '0.5rem',
                              fontSize: '0.875rem',
                              border: '1px solid #e2e8f0'
                            }}
                          >
                            <div>
                              <div style={{ fontWeight: '600', color: '#333' }}>
                                {attachment.fileName}
                              </div>
                              <div style={{ color: '#6b7280', fontSize: '0.75rem' }}>
                                {(attachment.fileSize / 1024 / 1024).toFixed(2)} MB • {attachment.fileType} •
                                Uploaded: {new Date(attachment.uploadDate).toLocaleDateString()}
                              </div>
                            </div>
                            <a
                              href={attachment.fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                background: '#3b82f6',
                                color: 'white',
                                textDecoration: 'none',
                                padding: '0.5rem 1rem',
                                borderRadius: '6px',
                                fontSize: '0.75rem',
                                fontWeight: '600'
                              }}
                            >
                              📥 Download
                            </a>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default EventRegistrations;
