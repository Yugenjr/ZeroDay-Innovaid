import React, { useState, useEffect } from 'react';
import {
  TimetableSlot,
  getTimetableSlots,
  subscribeToTimetableSlots,
  testTimetableConnection
} from '../../firebase/realtimeTimetable';

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

interface StudentTimetableProps {
  user: User;
  onBack: () => void;
  onLogout: () => void;
  isDarkMode: boolean;
}

const StudentTimetable: React.FC<StudentTimetableProps> = ({ user, onBack, onLogout, isDarkMode }) => {
  const [timeSlots, setTimeSlots] = useState<TimetableSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Get user's department and year, with fallbacks
  const userDepartment = user.department || 'Computer Science';
  const userYear = user.year || 1;

  // Load timetable data and set up real-time subscription
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const setupTimetableData = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log(`🔄 Loading timetable for ${userDepartment} Year ${userYear}...`);

        // Test connection
        const connectionTest = await testTimetableConnection();
        if (!connectionTest) {
          console.error('❌ Failed to connect to Realtime Database');
          setError('Failed to connect to database. Showing offline data.');
          setLoading(false);
          return;
        }

        // Set up real-time subscription for user's department and year
        unsubscribe = subscribeToTimetableSlots(userDepartment, userYear, (slots) => {
          console.log(`📊 Received timetable slots update for ${userDepartment} Year ${userYear}:`, slots.length);
          setTimeSlots(slots);
          setLoading(false);
        });

      } catch (error) {
        console.error('❌ Error setting up timetable data:', error);
        setError('Error loading timetable data. Please refresh the page.');
        setLoading(false);
      }
    };

    setupTimetableData();

    // Cleanup subscription on unmount
    return () => {
      if (unsubscribe) {
        console.log('🧹 Cleaning up student timetable subscription');
        unsubscribe();
      }
    };
  }, [userDepartment, userYear]);

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
    maxWidth: '1400px',
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

  const timetableGridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'auto repeat(7, 1fr)',
    gap: '1px',
    background: isDarkMode ? '#555' : '#e2e8f0',
    borderRadius: '10px',
    overflow: 'hidden',
    transition: 'background 0.3s ease'
  };

  const cellStyle: React.CSSProperties = {
    background: isDarkMode ? '#374151' : 'white',
    padding: '1rem',
    minHeight: '80px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    color: isDarkMode ? '#fff' : '#333',
    transition: 'background 0.3s ease, color 0.3s ease'
  };

  const headerCellStyle: React.CSSProperties = {
    ...cellStyle,
    background: '#667eea',
    color: 'white',
    fontWeight: '600'
  };

  const timeSlotStyle: React.CSSProperties = {
    background: isDarkMode ? '#1e3a8a' : '#f0f9ff',
    border: `2px solid ${isDarkMode ? '#3b82f6' : '#3b82f6'}`,
    borderRadius: '8px',
    padding: '0.5rem',
    margin: '0.25rem',
    fontSize: '0.75rem',
    textAlign: 'center',
    cursor: 'pointer',
    position: 'relative'
  };

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const timeSlots_hours = [
    '09:00-10:00', '10:00-11:00', '11:00-12:00', '12:00-13:00',
    '13:00-14:00', '14:00-15:00', '15:00-16:00', '16:00-17:00'
  ];

  const getTimeSlotForCell = (day: string, time: string) => {
    return timeSlots.filter(slot => slot.day === day && slot.time === time);
  };

  return (
    <div style={containerStyle}>
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
      <header style={headerStyle}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <button style={backButtonStyle} onClick={onBack}>
            ← Back to Dashboard
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.5rem', fontWeight: '800', color: isDarkMode ? '#fff' : '#333', transition: 'color 0.3s ease' }}>
            My Timetable
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
        {loading ? (
          <div style={{
            ...cardStyle,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '400px'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '50px',
                height: '50px',
                border: '4px solid #e2e8f0',
                borderTop: '4px solid #667eea',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto 1rem'
              }}></div>
              <p style={{ color: isDarkMode ? '#ccc' : '#666', fontSize: '1.1rem' }}>
                Loading your timetable...
              </p>
            </div>
          </div>
        ) : error ? (
          <div style={{
            ...cardStyle,
            textAlign: 'center',
            padding: '3rem'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
            <h3 style={{ color: isDarkMode ? '#fff' : '#333', marginBottom: '1rem' }}>
              Connection Error
            </h3>
            <p style={{ color: isDarkMode ? '#ccc' : '#666', marginBottom: '2rem' }}>
              {error}
            </p>
            <button
              style={buttonStyle}
              onClick={() => window.location.reload()}
            >
              🔄 Retry
            </button>
          </div>
        ) : (
          <div style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h2 style={{ margin: 0, color: isDarkMode ? '#fff' : '#333', fontSize: '1.5rem', transition: 'color 0.3s ease' }}>
                My Weekly Schedule ({timeSlots.length} classes)
              </h2>
              <div style={{
                background: isDarkMode ? '#374151' : '#f0f9ff',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                color: isDarkMode ? '#fff' : '#1e40af',
                fontSize: '0.9rem',
                fontWeight: '600'
              }}>
                {userDepartment} - Year {userYear}
              </div>
            </div>

            {timeSlots.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '3rem',
                color: isDarkMode ? '#ccc' : '#666'
              }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📅</div>
                <h3 style={{ color: isDarkMode ? '#fff' : '#333', marginBottom: '1rem' }}>
                  No Classes Scheduled
                </h3>
                <p>
                  Your timetable for {userDepartment} Year {userYear} is currently empty.
                  <br />
                  Check back later or contact your administrator.
                </p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <div style={timetableGridStyle}>
                  {/* Header row */}
                  <div style={headerCellStyle}>Time</div>
                  {days.map(day => (
                    <div key={day} style={headerCellStyle}>{day}</div>
                  ))}

                  {/* Time slots */}
                  {timeSlots_hours.map(time => (
                    <React.Fragment key={time}>
                      <div style={headerCellStyle}>{time}</div>
                      {days.map(day => (
                        <div key={`${day}-${time}`} style={cellStyle}>
                          {getTimeSlotForCell(day, time).map(slot => (
                            <div
                              key={slot.id}
                              style={{
                                ...timeSlotStyle,
                                cursor: 'default'
                              }}
                              title={`${slot.subject} - ${slot.teacher} - ${slot.room}`}
                            >
                              <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>
                                {slot.subject}
                              </div>
                              <div>{slot.teacher}</div>
                              <div>{slot.room}</div>
                              {slot.semester && (
                                <div style={{ fontSize: '0.6rem', marginTop: '0.25rem', opacity: 0.8 }}>
                                  Semester {slot.semester}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      ))}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            )}

            <div style={{
              marginTop: '1rem',
              padding: '1rem',
              background: isDarkMode ? '#374151' : '#f0f9ff',
              borderRadius: '10px',
              transition: 'background 0.3s ease'
            }}>
              <p style={{
                margin: 0,
                color: isDarkMode ? '#93c5fd' : '#1e40af',
                fontSize: '0.875rem',
                transition: 'color 0.3s ease'
              }}>
                📡 <strong>Real-time Updates:</strong> Your timetable is automatically updated when administrators make changes.
                All data is synced with Firebase Realtime Database.
              </p>
            </div>

            {/* Quick Stats */}
            <div style={cardStyle}>
              <h3 style={{ margin: '0 0 1rem 0', color: isDarkMode ? '#fff' : '#333', transition: 'color 0.3s ease' }}>Weekly Summary</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
                <div style={{
                  textAlign: 'center',
                  padding: '1rem',
                  background: isDarkMode ? '#1e3a8a' : '#f0f9ff',
                  borderRadius: '10px',
                  transition: 'background 0.3s ease'
                }}>
                  <h4 style={{ fontSize: '1.5rem', margin: '0 0 0.5rem 0', color: '#3b82f6' }}>{timeSlots.length}</h4>
                  <p style={{ margin: 0, color: isDarkMode ? '#ccc' : '#6b7280', fontSize: '0.875rem' }}>Total Classes</p>
                </div>
                <div style={{
                  textAlign: 'center',
                  padding: '1rem',
                  background: isDarkMode ? '#064e3b' : '#f0fdf4',
                  borderRadius: '10px',
                  transition: 'background 0.3s ease'
                }}>
                  <h4 style={{ fontSize: '1.5rem', margin: '0 0 0.5rem 0', color: '#10b981' }}>{new Set(timeSlots.map(s => s.day)).size}</h4>
                  <p style={{ margin: 0, color: isDarkMode ? '#ccc' : '#6b7280', fontSize: '0.875rem' }}>Active Days</p>
                </div>
                <div style={{
                  textAlign: 'center',
                  padding: '1rem',
                  background: isDarkMode ? '#92400e' : '#fef3c7',
                  borderRadius: '10px',
                  transition: 'background 0.3s ease'
                }}>
                  <h4 style={{ fontSize: '1.5rem', margin: '0 0 0.5rem 0', color: '#d97706' }}>{new Set(timeSlots.map(s => s.subject)).size}</h4>
                  <p style={{ margin: 0, color: isDarkMode ? '#ccc' : '#6b7280', fontSize: '0.875rem' }}>Subjects</p>
                </div>
                <div style={{
                  textAlign: 'center',
                  padding: '1rem',
                  background: isDarkMode ? '#831843' : '#fce7f3',
                  borderRadius: '10px',
                  transition: 'background 0.3s ease'
                }}>
                  <h4 style={{ fontSize: '1.5rem', margin: '0 0 0.5rem 0', color: '#be185d' }}>{new Set(timeSlots.map(s => s.teacher)).size}</h4>
                  <p style={{ margin: 0, color: isDarkMode ? '#ccc' : '#6b7280', fontSize: '0.875rem' }}>Teachers</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default StudentTimetable;
