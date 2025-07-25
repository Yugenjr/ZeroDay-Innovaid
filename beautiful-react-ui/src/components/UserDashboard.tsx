import React, { useState } from 'react';
import { User } from '../types/User';
import StudentAnnouncements from './student/StudentAnnouncements';
import StudentLostFound from './student/StudentLostFound';
import StudentTimetable from './student/StudentTimetable';
import StudentHostelComplaints from './student/StudentHostelComplaints';
import SkillExchange from './student/SkillExchange';



interface UserDashboardProps {
  user: User;
  onLogout: () => void;
}

const UserDashboard: React.FC<UserDashboardProps> = ({ user, onLogout }) => {
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [feedbackForm, setFeedbackForm] = useState({ subject: '', message: '' });
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [notifications] = useState([
    { id: 1, message: 'New assignment posted in Data Structures', time: '2 hours ago', read: false },
    { id: 2, message: 'Library book due tomorrow', time: '1 day ago', read: false },
    { id: 3, message: 'Hostel maintenance scheduled', time: '2 days ago', read: true }
  ]);



  // Handle feedback form submission
  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically send the feedback to your backend
    console.log('Feedback submitted:', feedbackForm);
    alert('Thank you for your feedback! We will review it shortly.');
    setFeedbackForm({ subject: '', message: '' });
    setShowFeedbackForm(false);
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

  const logoStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    fontSize: '1.5rem',
    fontWeight: '800',
    color: isDarkMode ? '#fff' : '#333',
    transition: 'color 0.3s ease'
  };

  const userInfoStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem'
  };

  const avatarStyle: React.CSSProperties = {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'transform 0.2s ease'
  };



  const mainContentStyle: React.CSSProperties = {
    padding: '2rem',
    maxWidth: '1200px',
    margin: '0 auto'
  };

  const welcomeCardStyle: React.CSSProperties = {
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(10px)',
    borderRadius: '20px',
    padding: '2rem',
    marginBottom: '2rem',
    boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
  };

  const servicesGridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '1.5rem'
  };

  const serviceCardStyle: React.CSSProperties = {
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(10px)',
    borderRadius: '15px',
    padding: '1.5rem',
    boxShadow: '0 5px 20px rgba(0,0,0,0.1)',
    cursor: 'pointer',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease'
  };

  const services = [
    {
      icon: '📢',
      title: 'Campus Announcements',
      description: 'View important updates, events, exams, and holiday notices.',
      key: 'announcements'
    },
    {
      icon: '🔍',
      title: 'Lost & Found',
      description: 'Report or search for lost/found items with smart filters.',
      key: 'lostfound'
    },
    {
      icon: '📅',
      title: 'My Timetable',
      description: 'Manage your weekly class schedule in calendar format.',
      key: 'timetable'
    },
    {
      icon: '🏠',
      title: 'Hostel Complaints',
      description: 'Raise and track hostel maintenance complaints.',
      key: 'hostel'
    },
    {
      icon: '🎓',
      title: 'Skill Exchange',
      description: 'Create courses, teach skills, and learn from peers in collaborative sessions.',
      key: 'skillexchange'
    },
    {
      icon: '📚',
      title: 'Library Services',
      description: 'Book reservations, study room bookings, and digital resources access.',
      key: 'library'
    },
    {
      icon: '🎭',
      title: 'Campus Events',
      description: 'Campus events, workshops, seminars, and activity registrations.',
      key: 'events'
    },
    {
      icon: '🗺️',
      title: 'Campus Navigation',
      description: 'Interactive campus maps, room finder, and facility locations.',
      key: 'navigation'
    }
  ];

  // Handle section navigation
  const handleSectionClick = (sectionKey: string) => {
    setActiveSection(sectionKey);
  };

  const handleBackToDashboard = () => {
    setActiveSection(null);
  };

  // Render specific section
  if (activeSection) {
    switch (activeSection) {
      case 'announcements':
        return <StudentAnnouncements user={user} onBack={handleBackToDashboard} onLogout={onLogout} />;
      case 'lostfound':
        return <StudentLostFound user={user} onBack={handleBackToDashboard} onLogout={onLogout} />;
      case 'timetable':
        return <StudentTimetable user={user} onBack={handleBackToDashboard} onLogout={onLogout} />;
      case 'hostel':
        return <StudentHostelComplaints user={user} onBack={handleBackToDashboard} onLogout={onLogout} />;
      case 'skillexchange':
        return <SkillExchange user={user} onBack={handleBackToDashboard} onLogout={onLogout} />;
      case 'profile':
        return (
          <div style={containerStyle}>
            {/* Profile Header */}
            <header style={headerStyle}>
              <div style={logoStyle}>
                <span style={{ fontSize: '2rem' }}>🎓</span>
                InnovAid
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <button
                  style={{
                    background: 'rgba(255, 255, 255, 0.2)',
                    color: isDarkMode ? '#fff' : '#333',
                    border: 'none',
                    padding: '0.5rem 1rem',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    transition: 'background 0.3s ease'
                  }}
                  onClick={handleBackToDashboard}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                  }}
                >
                  ← Back to Dashboard
                </button>
              </div>
            </header>

            {/* Profile Content */}
            <main style={mainContentStyle}>
              <div style={{
                background: isDarkMode ? 'rgba(42, 42, 74, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
                borderRadius: '20px',
                padding: '2rem',
                boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                maxWidth: '800px',
                margin: '0 auto'
              }}>
                {/* Profile Header */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '2rem',
                  marginBottom: '2rem',
                  paddingBottom: '2rem',
                  borderBottom: `2px solid ${isDarkMode ? '#444' : '#e5e7eb'}`
                }}>
                  <div style={{
                    width: '100px',
                    height: '100px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: '700',
                    fontSize: '2.5rem',
                    boxShadow: '0 10px 30px rgba(102, 126, 234, 0.3)'
                  }}>
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h1 style={{
                      margin: '0 0 0.5rem 0',
                      fontSize: '2rem',
                      color: isDarkMode ? '#fff' : '#333',
                      fontWeight: '700'
                    }}>
                      {user.name}
                    </h1>
                    <p style={{
                      margin: '0 0 0.5rem 0',
                      fontSize: '1.1rem',
                      color: isDarkMode ? '#ccc' : '#666'
                    }}>
                      {user.email}
                    </p>
                    <p style={{
                      margin: 0,
                      fontSize: '1rem',
                      color: isDarkMode ? '#aaa' : '#888',
                      fontWeight: '600'
                    }}>
                      {user.department} • Year {user.year}
                    </p>
                  </div>
                </div>

                {/* Basic Info Section */}
                <div style={{ marginBottom: '2rem' }}>
                  <h2 style={{
                    margin: '0 0 1rem 0',
                    fontSize: '1.5rem',
                    color: isDarkMode ? '#fff' : '#333',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    📋 Basic Information
                  </h2>
                  <div style={{
                    background: isDarkMode ? 'rgba(51, 51, 51, 0.5)' : 'rgba(248, 249, 250, 0.8)',
                    padding: '1.5rem',
                    borderRadius: '15px',
                    fontSize: '1rem'
                  }}>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                      gap: '1rem'
                    }}>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        padding: '0.75rem 0',
                        borderBottom: `1px solid ${isDarkMode ? '#555' : '#e5e7eb'}`,
                        color: isDarkMode ? '#ccc' : '#666'
                      }}>
                        <span style={{ fontWeight: '500' }}>Student ID:</span>
                        <span style={{ fontWeight: '600', color: isDarkMode ? '#fff' : '#333' }}>
                          {user.studentId || 'Not provided'}
                        </span>
                      </div>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        padding: '0.75rem 0',
                        borderBottom: `1px solid ${isDarkMode ? '#555' : '#e5e7eb'}`,
                        color: isDarkMode ? '#ccc' : '#666'
                      }}>
                        <span style={{ fontWeight: '500' }}>Phone:</span>
                        <span style={{ fontWeight: '600', color: isDarkMode ? '#fff' : '#333' }}>
                          {user.phone || 'Not provided'}
                        </span>
                      </div>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        padding: '0.75rem 0',
                        borderBottom: `1px solid ${isDarkMode ? '#555' : '#e5e7eb'}`,
                        color: isDarkMode ? '#ccc' : '#666'
                      }}>
                        <span style={{ fontWeight: '500' }}>Role:</span>
                        <span style={{ fontWeight: '600', color: isDarkMode ? '#fff' : '#333', textTransform: 'capitalize' }}>
                          {user.role}
                        </span>
                      </div>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        padding: '0.75rem 0',
                        color: isDarkMode ? '#ccc' : '#666'
                      }}>
                        <span style={{ fontWeight: '500' }}>Member since:</span>
                        <span style={{ fontWeight: '600', color: isDarkMode ? '#fff' : '#333' }}>
                          {new Date(user.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Appearance Settings */}
                <div style={{ marginBottom: '2rem' }}>
                  <h2 style={{
                    margin: '0 0 1rem 0',
                    fontSize: '1.5rem',
                    color: isDarkMode ? '#fff' : '#333',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    🌙 Appearance Settings
                  </h2>
                  <div style={{
                    background: isDarkMode ? 'rgba(51, 51, 51, 0.5)' : 'rgba(248, 249, 250, 0.8)',
                    padding: '1.5rem',
                    borderRadius: '15px'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}>
                      <div>
                        <h3 style={{
                          margin: '0 0 0.5rem 0',
                          fontSize: '1.1rem',
                          color: isDarkMode ? '#fff' : '#333',
                          fontWeight: '600'
                        }}>
                          Dark Mode
                        </h3>
                        <p style={{
                          margin: 0,
                          fontSize: '0.9rem',
                          color: isDarkMode ? '#ccc' : '#666'
                        }}>
                          Switch between light and dark themes
                        </p>
                      </div>
                      <div
                        style={{
                          width: '60px',
                          height: '30px',
                          borderRadius: '20px',
                          background: isDarkMode ? '#667eea' : '#ddd',
                          position: 'relative',
                          cursor: 'pointer',
                          transition: 'background 0.3s ease',
                          boxShadow: isDarkMode ? '0 0 20px rgba(102, 126, 234, 0.3)' : 'inset 0 2px 4px rgba(0,0,0,0.1)'
                        }}
                        onClick={() => setIsDarkMode(!isDarkMode)}
                      >
                        <div style={{
                          width: '26px',
                          height: '26px',
                          borderRadius: '50%',
                          background: 'white',
                          position: 'absolute',
                          top: '2px',
                          left: isDarkMode ? '32px' : '2px',
                          transition: 'left 0.3s ease',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                        }} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Notifications */}
                <div style={{ marginBottom: '2rem' }}>
                  <h2 style={{
                    margin: '0 0 1rem 0',
                    fontSize: '1.5rem',
                    color: isDarkMode ? '#fff' : '#333',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    🔔 Recent Notifications
                  </h2>
                  <div style={{
                    background: isDarkMode ? 'rgba(51, 51, 51, 0.5)' : 'rgba(248, 249, 250, 0.8)',
                    borderRadius: '15px',
                    overflow: 'hidden'
                  }}>
                    {notifications.map((notification, index) => (
                      <div
                        key={notification.id}
                        style={{
                          padding: '1rem 1.5rem',
                          borderBottom: index < notifications.length - 1 ? `1px solid ${isDarkMode ? '#555' : '#e5e7eb'}` : 'none',
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '1rem'
                        }}
                      >
                        <div style={{
                          width: '12px',
                          height: '12px',
                          borderRadius: '50%',
                          background: notification.read ? '#ccc' : '#ef4444',
                          marginTop: '0.25rem',
                          flexShrink: 0,
                          boxShadow: notification.read ? 'none' : '0 0 10px rgba(239, 68, 68, 0.5)'
                        }} />
                        <div style={{ flex: 1 }}>
                          <p style={{
                            margin: '0 0 0.5rem 0',
                            fontSize: '1rem',
                            color: isDarkMode ? '#fff' : '#333',
                            fontWeight: notification.read ? '400' : '600',
                            lineHeight: '1.5'
                          }}>
                            {notification.message}
                          </p>
                          <p style={{
                            margin: 0,
                            fontSize: '0.85rem',
                            color: isDarkMode ? '#aaa' : '#888'
                          }}>
                            {notification.time}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Feedback & Complaints */}
                <div style={{ marginBottom: '2rem' }}>
                  <h2 style={{
                    margin: '0 0 1rem 0',
                    fontSize: '1.5rem',
                    color: isDarkMode ? '#fff' : '#333',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    💬 Feedback & Complaints
                  </h2>
                  {!showFeedbackForm ? (
                    <button
                      style={{
                        width: '100%',
                        padding: '1rem',
                        background: isDarkMode ? '#667eea' : '#3b82f6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '15px',
                        cursor: 'pointer',
                        fontSize: '1rem',
                        fontWeight: '600',
                        transition: 'all 0.3s ease',
                        boxShadow: '0 4px 15px rgba(59, 130, 246, 0.3)'
                      }}
                      onClick={() => setShowFeedbackForm(true)}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = isDarkMode ? '#5a67d8' : '#2563eb';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 6px 20px rgba(59, 130, 246, 0.4)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = isDarkMode ? '#667eea' : '#3b82f6';
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 4px 15px rgba(59, 130, 246, 0.3)';
                      }}
                    >
                      📝 Submit Feedback or Complaint
                    </button>
                  ) : (
                    <form onSubmit={handleFeedbackSubmit} style={{
                      background: isDarkMode ? 'rgba(51, 51, 51, 0.5)' : 'rgba(248, 249, 250, 0.8)',
                      padding: '1.5rem',
                      borderRadius: '15px'
                    }}>
                      <select
                        value={feedbackForm.subject}
                        onChange={(e) => setFeedbackForm({...feedbackForm, subject: e.target.value})}
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          marginBottom: '1rem',
                          border: `2px solid ${isDarkMode ? '#555' : '#ddd'}`,
                          borderRadius: '10px',
                          background: isDarkMode ? '#444' : 'white',
                          color: isDarkMode ? '#fff' : '#333',
                          fontSize: '1rem',
                          fontFamily: 'inherit'
                        }}
                        required
                      >
                        <option value="">Select subject...</option>
                        <option value="technical">Technical Issue</option>
                        <option value="feature">Feature Request</option>
                        <option value="complaint">General Complaint</option>
                        <option value="suggestion">Suggestion</option>
                      </select>
                      <textarea
                        value={feedbackForm.message}
                        onChange={(e) => setFeedbackForm({...feedbackForm, message: e.target.value})}
                        placeholder="Describe your feedback or complaint in detail..."
                        style={{
                          width: '100%',
                          height: '120px',
                          padding: '0.75rem',
                          marginBottom: '1rem',
                          border: `2px solid ${isDarkMode ? '#555' : '#ddd'}`,
                          borderRadius: '10px',
                          background: isDarkMode ? '#444' : 'white',
                          color: isDarkMode ? '#fff' : '#333',
                          fontSize: '1rem',
                          resize: 'vertical',
                          fontFamily: 'inherit'
                        }}
                        required
                      />
                      <div style={{ display: 'flex', gap: '1rem' }}>
                        <button
                          type="submit"
                          style={{
                            flex: 1,
                            padding: '0.75rem',
                            background: '#10b981',
                            color: 'white',
                            border: 'none',
                            borderRadius: '10px',
                            cursor: 'pointer',
                            fontSize: '1rem',
                            fontWeight: '600',
                            transition: 'background 0.3s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#059669';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = '#10b981';
                          }}
                        >
                          ✅ Submit
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setShowFeedbackForm(false);
                            setFeedbackForm({ subject: '', message: '' });
                          }}
                          style={{
                            flex: 1,
                            padding: '0.75rem',
                            background: '#6b7280',
                            color: 'white',
                            border: 'none',
                            borderRadius: '10px',
                            cursor: 'pointer',
                            fontSize: '1rem',
                            fontWeight: '600',
                            transition: 'background 0.3s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#4b5563';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = '#6b7280';
                          }}
                        >
                          ❌ Cancel
                        </button>
                      </div>
                    </form>
                  )}
                </div>

                {/* Logout Section */}
                <div style={{ textAlign: 'center' }}>
                  <button
                    style={{
                      padding: '1rem 2rem',
                      background: '#ef4444',
                      color: 'white',
                      border: 'none',
                      borderRadius: '15px',
                      cursor: 'pointer',
                      fontSize: '1rem',
                      fontWeight: '600',
                      transition: 'all 0.3s ease',
                      boxShadow: '0 4px 15px rgba(239, 68, 68, 0.3)'
                    }}
                    onClick={onLogout}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#dc2626';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 6px 20px rgba(239, 68, 68, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = '#ef4444';
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 4px 15px rgba(239, 68, 68, 0.3)';
                    }}
                  >
                    🚪 Logout from Account
                  </button>
                </div>
              </div>
            </main>
          </div>
        );
      default:
        return (
          <div style={containerStyle}>
            <div style={{ padding: '2rem', textAlign: 'center', color: 'white' }}>
              <h2>Feature Coming Soon!</h2>
              <p>This feature is under development.</p>
              <button
                style={{ background: 'white', color: '#333', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}
                onClick={handleBackToDashboard}
              >
                ← Back to Dashboard
              </button>
            </div>
          </div>
        );
    }
  }

  return (
    <div style={containerStyle}>
      <header style={headerStyle}>
        <div style={logoStyle}>
          <span style={{ fontSize: '2rem' }}>🎓</span>
          InnovAid
        </div>

        <div style={userInfoStyle}>
          <div
            style={avatarStyle}
            onClick={() => handleSectionClick('profile')}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div
            style={{ cursor: 'pointer' }}
            onClick={() => handleSectionClick('profile')}
          >
            <h3 style={{
              margin: 0,
              fontSize: '1rem',
              color: isDarkMode ? '#fff' : '#333',
              transition: 'color 0.3s ease'
            }}>
              {user.name}
            </h3>
            <p style={{
              margin: 0,
              fontSize: '0.875rem',
              color: isDarkMode ? '#ccc' : '#666',
              transition: 'color 0.3s ease'
            }}>
              {user.department} • Year {user.year}
            </p>
          </div>
        </div>
      </header>



      <main style={mainContentStyle}>
        <div style={welcomeCardStyle}>
          <h1 style={{ 
            fontSize: '2rem', 
            fontWeight: '700', 
            color: '#333', 
            marginBottom: '0.5rem' 
          }}>
            Welcome back, {user.name.split(' ')[0]}! 👋
          </h1>
          <p style={{ 
            color: '#666', 
            fontSize: '1.1rem', 
            marginBottom: '1.5rem' 
          }}>
            Here's what's happening on campus today. Explore our services to make the most of your college experience.
          </p>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: '1rem',
            marginTop: '1.5rem'
          }}>
            <div style={{ 
              background: '#f0f9ff', 
              padding: '1rem', 
              borderRadius: '10px',
              textAlign: 'center'
            }}>
              <h3 style={{ color: '#0369a1', margin: '0 0 0.5rem 0' }}>12</h3>
              <p style={{ color: '#0369a1', margin: 0, fontSize: '0.9rem' }}>Books Reserved</p>
            </div>
            <div style={{ 
              background: '#f0fdf4', 
              padding: '1rem', 
              borderRadius: '10px',
              textAlign: 'center'
            }}>
              <h3 style={{ color: '#15803d', margin: '0 0 0.5rem 0' }}>5</h3>
              <p style={{ color: '#15803d', margin: 0, fontSize: '0.9rem' }}>Events Registered</p>
            </div>
            <div style={{ 
              background: '#fef3c7', 
              padding: '1rem', 
              borderRadius: '10px',
              textAlign: 'center'
            }}>
              <h3 style={{ color: '#d97706', margin: '0 0 0.5rem 0' }}>24h</h3>
              <p style={{ color: '#d97706', margin: 0, fontSize: '0.9rem' }}>Study Hours This Week</p>
            </div>
            <div style={{ 
              background: '#fce7f3', 
              padding: '1rem', 
              borderRadius: '10px',
              textAlign: 'center'
            }}>
              <h3 style={{ color: '#be185d', margin: '0 0 0.5rem 0' }}>4.8</h3>
              <p style={{ color: '#be185d', margin: 0, fontSize: '0.9rem' }}>Service Rating</p>
            </div>
          </div>
        </div>

        <div style={servicesGridStyle}>
          {services.map((service) => (
            <div
              key={service.title}
              style={serviceCardStyle}
              onClick={() => handleSectionClick(service.key)}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.boxShadow = '0 15px 40px rgba(0,0,0,0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 5px 20px rgba(0,0,0,0.1)';
              }}
            >
              <div style={{
                fontSize: '3rem',
                marginBottom: '1rem'
              }}>
                {service.icon}
              </div>
              <h3 style={{
                fontSize: '1.25rem',
                fontWeight: '600',
                color: '#333',
                margin: '0 0 0.5rem 0'
              }}>
                {service.title}
              </h3>
              <p style={{
                color: '#666',
                margin: 0,
                lineHeight: '1.5'
              }}>
                {service.description}
              </p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default UserDashboard;
