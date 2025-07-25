import React, { useState, useEffect } from 'react';
// @ts-ignore
import { registerForEvent } from '../../firebase/registrations';
// @ts-ignore
import { subscribeToAnnouncements, Announcement } from '../../firebase/announcements';

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

interface StudentAnnouncementsProps {
  user: User;
  onBack: () => void;
  onLogout: () => void;
}



const StudentAnnouncements: React.FC<StudentAnnouncementsProps> = ({ user, onBack, onLogout }) => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Announcement | null>(null);
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isRegistering, setIsRegistering] = useState(false);
  const [registrationMessage, setRegistrationMessage] = useState('');

  // Subscribe to real-time announcements
  useEffect(() => {
    setLoading(true);
    const unsubscribe = subscribeToAnnouncements((announcementsData) => {
      setAnnouncements(announcementsData);
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  const containerStyle: React.CSSProperties = {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
    fontFamily: 'Arial, sans-serif'
  };

  const headerStyle: React.CSSProperties = {
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(10px)',
    padding: '1rem 2rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
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
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(10px)',
    borderRadius: '20px',
    padding: '2rem',
    marginBottom: '2rem',
    boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '0.75rem',
    border: '2px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '1rem',
    marginBottom: '1rem'
  };

  const announcementCardStyle: React.CSSProperties = {
    background: 'white',
    borderRadius: '15px',
    padding: '1.5rem',
    marginBottom: '1rem',
    boxShadow: '0 5px 15px rgba(0,0,0,0.1)',
    border: '1px solid #e2e8f0',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease'
  };

  const categoryBadgeStyle = (category: string): React.CSSProperties => {
    const colors = {
      'Academic': '#3b82f6',
      'Event': '#10b981',
      'Facility': '#f59e0b',
      'Emergency': '#ef4444',
      'General': '#6b7280'
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

  const categories = ['Academic', 'Event', 'Facility', 'Emergency', 'General'];

  const filteredAnnouncements = announcements.filter((announcement: Announcement) => {
    const matchesCategory = !selectedCategory || announcement.category === selectedCategory;
    const matchesSearch = !searchTerm ||
      announcement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      announcement.content.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 24) {
      return `${diffInHours} hours ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays} days ago`;
    }
  };

  // Registration handlers
  const handleRegisterClick = (announcement: Announcement) => {
    if (announcement.category === 'Event') {
      setSelectedEvent(announcement);
      setShowRegistrationModal(true);
      setRegistrationMessage('');
      // Reset form
      setAdditionalInfo('');
      setSelectedFiles([]);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const fileArray = Array.from(files);
      setSelectedFiles(fileArray);
    }
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleRegistrationSubmit = async () => {
    console.log('Registration submit started');

    if (!selectedEvent || !selectedEvent.id || !user.studentId) {
      console.log('Missing required information:', { selectedEvent, user });
      setRegistrationMessage('❌ Missing required information');
      return;
    }

    setIsRegistering(true);
    setRegistrationMessage('');

    try {
      console.log('Calling registerForEvent with:', {
        eventId: selectedEvent.id,
        eventTitle: selectedEvent.title,
        studentData: {
          studentId: user.studentId,
          studentName: user.name,
          studentEmail: user.email,
          department: user.department,
          year: user.year,
          phone: user.phone,
          additionalInfo: additionalInfo
        },
        filesCount: selectedFiles.length
      });

      const result = await registerForEvent(
        selectedEvent.id,
        selectedEvent.title,
        {
          studentId: user.studentId,
          studentName: user.name,
          studentEmail: user.email,
          department: user.department,
          year: user.year,
          phone: user.phone,
          additionalInfo: additionalInfo
        },
        selectedFiles.length > 0 ? selectedFiles : undefined
      );

      console.log('Registration result:', result);

      if (result.success) {
        setRegistrationMessage(`✅ ${result.message}`);

        // Refresh announcements to get updated registration count
        // The subscription will automatically update the state

        setTimeout(() => {
          setShowRegistrationModal(false);
          setSelectedEvent(null);
          setAdditionalInfo('');
          setSelectedFiles([]);
          setRegistrationMessage('');
        }, 2000);
      } else {
        setRegistrationMessage(`❌ ${result.message}`);
      }
    } catch (error) {
      console.error('Registration error:', error);
      setRegistrationMessage(`❌ Registration failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      console.log('Setting isRegistering to false');
      setIsRegistering(false);
    }
  };

  const handleCloseModal = () => {
    setShowRegistrationModal(false);
    setSelectedEvent(null);
    setAdditionalInfo('');
    setSelectedFiles([]);
    setRegistrationMessage('');
  };

  return (
    <div style={containerStyle}>
      <header style={headerStyle}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <button style={backButtonStyle} onClick={onBack}>
            ← Back to Dashboard
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.5rem', fontWeight: '800', color: '#333' }}>
            <span style={{ fontSize: '2rem' }}>📢</span>
            Campus Announcements
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
          <h2 style={{ margin: '0 0 1.5rem 0', color: '#333', fontSize: '1.5rem' }}>
            Latest Announcements ({filteredAnnouncements.length})
          </h2>
          
          <input
            style={inputStyle}
            type="text"
            placeholder="Search announcements..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ margin: '0 0 1rem 0', color: '#333' }}>Filter by Category:</h3>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button
                style={{
                  background: !selectedCategory ? '#667eea' : '#e2e8f0',
                  color: !selectedCategory ? 'white' : '#333',
                  border: 'none',
                  padding: '0.5rem 1rem',
                  borderRadius: '20px',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '600'
                }}
                onClick={() => setSelectedCategory('')}
              >
                All ({announcements.length})
              </button>
              {categories.map(category => (
                <button
                  key={category}
                  style={{
                    background: selectedCategory === category ? '#667eea' : '#e2e8f0',
                    color: selectedCategory === category ? 'white' : '#333',
                    border: 'none',
                    padding: '0.5rem 1rem',
                    borderRadius: '20px',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: '600'
                  }}
                  onClick={() => setSelectedCategory(category)}
                >
                  {category} ({announcements.filter((a: Announcement) => a.category === category).length})
                </button>
              ))}
            </div>
          </div>

          <div>
            {loading ? (
              <div style={{
                textAlign: 'center',
                padding: '3rem',
                color: '#6b7280'
              }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
                <h3 style={{ margin: '0 0 0.5rem 0' }}>Loading announcements...</h3>
                <p style={{ margin: 0 }}>Please wait while we fetch the latest updates.</p>
              </div>
            ) : filteredAnnouncements.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '3rem',
                color: '#6b7280'
              }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📢</div>
                <h3 style={{ margin: '0 0 0.5rem 0' }}>No announcements found</h3>
                <p style={{ margin: 0 }}>
                  {selectedCategory
                    ? `No announcements in the ${selectedCategory} category match your search.`
                    : announcements.length === 0
                      ? 'No announcements have been posted yet.'
                      : 'No announcements match your search criteria.'
                  }
                </p>
              </div>
            ) : (
              filteredAnnouncements.map(announcement => (
              <div
                key={announcement.id}
                style={announcementCardStyle}
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
                      {announcement.title}
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                      <span style={categoryBadgeStyle(announcement.category)}>
                        {announcement.category}
                      </span>
                      <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                        By {announcement.author}
                      </span>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                      {formatDate(announcement.date)}
                    </div>
                    <div style={{ color: '#9ca3af', fontSize: '0.75rem' }}>
                      {getTimeAgo(announcement.date)}
                    </div>
                    {announcement.createdAt && (
                      <div style={{ color: '#9ca3af', fontSize: '0.75rem', marginTop: '2px' }}>
                        Created: {new Date(announcement.createdAt).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>
                <p style={{ margin: '0 0 1rem 0', color: '#4b5563', lineHeight: '1.6' }}>
                  {announcement.content}
                </p>

                {/* Event details and registration for events */}
                {announcement.category === 'Event' && (
                  <div style={{ marginTop: '1rem' }}>
                    {/* Event details */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                      gap: '0.75rem',
                      marginBottom: '1rem',
                      padding: '1rem',
                      backgroundColor: '#f8fafc',
                      borderRadius: '8px',
                      fontSize: '0.875rem'
                    }}>
                      {announcement.eventDate && (
                        <div><strong>📅 Event Date:</strong> {new Date(announcement.eventDate).toLocaleDateString()}</div>
                      )}
                      {announcement.eventLocation && (
                        <div><strong>📍 Location:</strong> {announcement.eventLocation}</div>
                      )}
                      {announcement.registrationDeadline && (
                        <div><strong>⏰ Registration Deadline:</strong> {new Date(announcement.registrationDeadline).toLocaleDateString()}</div>
                      )}
                      <div>
                        <strong>👥 Registrations:</strong>
                        <span style={{
                          color: announcement.maxRegistrations && (announcement.registrationCount || 0) >= announcement.maxRegistrations ? '#dc2626' : '#059669',
                          fontWeight: 'bold',
                          marginLeft: '4px'
                        }}>
                          {announcement.registrationCount || 0}
                          {announcement.maxRegistrations && ` / ${announcement.maxRegistrations}`}
                        </span>
                        {announcement.maxRegistrations && (announcement.registrationCount || 0) >= announcement.maxRegistrations && (
                          <span style={{ color: '#dc2626', fontSize: '0.75rem', marginLeft: '8px' }}>
                            (Full)
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Registration button */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                      {announcement.maxRegistrations && (announcement.registrationCount || 0) >= announcement.maxRegistrations ? (
                        <button
                          style={{
                            background: '#ef4444',
                            color: 'white',
                            border: 'none',
                            padding: '0.75rem 1.5rem',
                            borderRadius: '8px',
                            cursor: 'not-allowed',
                            fontSize: '0.875rem',
                            fontWeight: '600',
                            opacity: 0.7
                          }}
                          disabled
                        >
                          🚫 Registration Full
                        </button>
                      ) : announcement.registrationDeadline && new Date(announcement.registrationDeadline) < new Date() ? (
                        <button
                          style={{
                            background: '#f59e0b',
                            color: 'white',
                            border: 'none',
                            padding: '0.75rem 1.5rem',
                            borderRadius: '8px',
                            cursor: 'not-allowed',
                            fontSize: '0.875rem',
                            fontWeight: '600',
                            opacity: 0.7
                          }}
                          disabled
                        >
                          ⏰ Registration Closed
                        </button>
                      ) : (
                        <button
                          style={{
                            background: '#10b981',
                            color: 'white',
                            border: 'none',
                            padding: '0.75rem 1.5rem',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '0.875rem',
                            fontWeight: '600',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            transition: 'background-color 0.2s ease'
                          }}
                          onClick={() => handleRegisterClick(announcement)}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#059669';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = '#10b981';
                          }}
                        >
                          📝 Register for Event
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
              ))
            )}
          </div>
        </div>
      </main>

      {/* Registration Modal */}
      {showRegistrationModal && selectedEvent && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            borderRadius: '15px',
            padding: '2rem',
            maxWidth: '500px',
            width: '90%',
            maxHeight: '80vh',
            overflow: 'auto',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ margin: 0, color: '#333', fontSize: '1.5rem' }}>
                📝 Register for Event
              </h2>
              <button
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  color: '#6b7280',
                  padding: '0.25rem'
                }}
                onClick={handleCloseModal}
              >
                ✕
              </button>
            </div>

            <div style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
              <h3 style={{ margin: '0 0 0.5rem 0', color: '#333', fontSize: '1.125rem' }}>
                {selectedEvent.title}
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                <span style={categoryBadgeStyle(selectedEvent.category)}>
                  {selectedEvent.category}
                </span>
                <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                  By {selectedEvent.author}
                </span>
              </div>
              <p style={{ margin: 0, color: '#4b5563', fontSize: '0.875rem' }}>
                {selectedEvent.content}
              </p>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <h4 style={{ margin: '0 0 1rem 0', color: '#333' }}>Your Information:</h4>
              <div style={{ display: 'grid', gap: '0.75rem', fontSize: '0.875rem' }}>
                <div><strong>Name:</strong> {user.name}</div>
                <div><strong>Email:</strong> {user.email}</div>
                <div><strong>Student ID:</strong> {user.studentId}</div>
                {user.department && <div><strong>Department:</strong> {user.department}</div>}
                {user.year && <div><strong>Year:</strong> {user.year}</div>}
                {user.phone && <div><strong>Phone:</strong> {user.phone}</div>}
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#333', fontWeight: '600' }}>
                Additional Information (Optional):
              </label>
              <textarea
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '2px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  resize: 'vertical',
                  minHeight: '80px',
                  fontFamily: 'inherit'
                }}
                placeholder="Any additional information or special requirements..."
                value={additionalInfo}
                onChange={(e) => setAdditionalInfo(e.target.value)}
              />
            </div>

            {/* File Upload Section */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#333', fontWeight: '600' }}>
                📎 Attach Files (Optional):
              </label>
              <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.5rem' }}>
                Supported: PDF, DOC, DOCX, JPG, PNG (Max 10MB each)
              </div>

              <input
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                onChange={handleFileSelect}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '2px dashed #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  backgroundColor: '#f8fafc'
                }}
              />

              {/* Display selected files */}
              {selectedFiles.length > 0 && (
                <div style={{ marginTop: '1rem' }}>
                  <div style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem', color: '#333' }}>
                    Selected Files ({selectedFiles.length}):
                  </div>
                  {selectedFiles.map((file, index) => (
                    <div
                      key={index}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '0.5rem',
                        backgroundColor: '#f1f5f9',
                        borderRadius: '6px',
                        marginBottom: '0.5rem',
                        fontSize: '0.75rem'
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: '600', color: '#333' }}>{file.name}</div>
                        <div style={{ color: '#6b7280' }}>
                          {formatFileSize(file.size)} • {file.type}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveFile(index)}
                        style={{
                          background: '#ef4444',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          padding: '0.25rem 0.5rem',
                          cursor: 'pointer',
                          fontSize: '0.75rem'
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {registrationMessage && (
              <div style={{
                padding: '0.75rem',
                borderRadius: '8px',
                marginBottom: '1rem',
                backgroundColor: registrationMessage.includes('✅') ? '#f0fdf4' : '#fef2f2',
                color: registrationMessage.includes('✅') ? '#166534' : '#dc2626',
                fontSize: '0.875rem'
              }}>
                {registrationMessage}
              </div>
            )}

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button
                style={{
                  background: '#e5e7eb',
                  color: '#374151',
                  border: 'none',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '600'
                }}
                onClick={handleCloseModal}
                disabled={isRegistering}
              >
                Cancel
              </button>
              <button
                style={{
                  background: isRegistering ? '#9ca3af' : '#10b981',
                  color: 'white',
                  border: 'none',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '8px',
                  cursor: isRegistering ? 'not-allowed' : 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '600'
                }}
                onClick={handleRegistrationSubmit}
                disabled={isRegistering}
              >
                {isRegistering ? '⏳ Registering...' : '📝 Register'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentAnnouncements;
