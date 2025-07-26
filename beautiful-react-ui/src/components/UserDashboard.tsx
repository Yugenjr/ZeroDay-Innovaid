import React, { useState, useEffect } from 'react';
import { User } from '../types/User';
import StudentAnnouncements from './student/StudentAnnouncements';
import StudentLostFound from './student/StudentLostFound';
import StudentTimetable from './student/StudentTimetable';
import StudentHostelComplaints from './student/StudentHostelComplaints';
import SkillExchange from './student/SkillExchange';
import TechUpdates from './student/TechUpdates';
import TechUpdatesView from './student/TechUpdatesView';
import StudentPollsForms from './student/StudentPollsForms';
import {
  Notification,
  subscribeToNotifications,
  getRecentNotifications
} from '../firebase/notifications';

// Error Boundary Component for UserDashboard
class UserDashboardErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('❌ UserDashboard Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '2rem',
          textAlign: 'center',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          color: 'white'
        }}>
          <h2 style={{ color: '#fff', marginBottom: '1rem' }}>
            ⚠️ Something went wrong
          </h2>
          <p style={{ color: '#f8f9fa', marginBottom: '1rem' }}>
            An error occurred in the student dashboard. Please refresh the page.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '0.75rem 1.5rem',
              background: '#fff',
              color: '#667eea',
              border: 'none',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            🔄 Refresh Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

interface UserDashboardProps {
  user: User;
  onLogout: () => void;
}

const UserDashboard: React.FC<UserDashboardProps> = ({ user, onLogout }) => {
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [feedbackForm, setFeedbackForm] = useState({ subject: '', message: '' });
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notificationCount, setNotificationCount] = useState(0);

  // Initialize notification system and subscribe to real-time updates
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    let isMounted = true;

    const setupNotifications = async () => {
      try {
        if (!user?.uid) {
          console.warn('⚠️ No user ID available for notifications');
          return;
        }

        console.log('🔔 Setting up notifications for user:', user.uid);

        // Subscribe to real-time notifications with error handling
        const notificationUnsubscribe = subscribeToNotifications(user.uid, (newNotifications) => {
          try {
            if (isMounted) {
              console.log('📬 Received notifications:', newNotifications.length);
              setNotifications(newNotifications.slice(0, 5)); // Show latest 5 notifications
              // Temporarily disable notification count to remove the "1" badge
              setNotificationCount(0); // newNotifications.filter(n => !n.isRead).length
            }
          } catch (callbackError) {
            console.error('❌ Error in notification callback:', callbackError);
          }
        });

        // Store the unsubscribe function
        unsubscribe = notificationUnsubscribe;
        console.log('✅ Notification subscription set up successfully');

      } catch (error) {
        console.error('❌ Error setting up notifications:', error);

        // Fallback to getting recent notifications without real-time updates
        try {
          if (isMounted && user?.uid) {
            console.log('🔄 Falling back to static notifications');
            const recentNotifications = await getRecentNotifications(user.uid, 5);
            if (isMounted) {
              setNotifications(recentNotifications);
              // Temporarily disable notification count to remove the "1" badge
              setNotificationCount(0); // recentNotifications.filter(n => !n.isRead).length
            }
          }
        } catch (fallbackError) {
          console.error('❌ Error getting recent notifications:', fallbackError);
          if (isMounted) {
            setNotifications([]);
            setNotificationCount(0);
          }
        }
      }
    };

    setupNotifications();

    // Cleanup subscription on unmount
    return () => {
      isMounted = false;
      if (unsubscribe) {
        try {
          unsubscribe();
          console.log('🧹 Notification subscription cleaned up');
        } catch (cleanupError) {
          console.warn('⚠️ Error during notification cleanup:', cleanupError);
        }
      }
    };
  }, [user.uid]);

  // Load AI chatbot script only for student dashboard main page
  useEffect(() => {
    if (!activeSection) { // Only load on main dashboard
      const script = document.createElement('script');
      script.src = 'https://cdn.jotfor.ms/agent/embedjs/019841e2f27b773f9709beed9eddfdee97d2/embed.js?skipWelcome=1&maximizable=1';
      script.async = true;
      document.body.appendChild(script);

      // Cleanup function to remove script when component unmounts or section changes
      return () => {
        const existingScript = document.querySelector('script[src*="jotfor.ms"]');
        if (existingScript) {
          document.body.removeChild(existingScript);
        }
        // Also remove any chatbot elements that might have been created
        const chatbotElements = document.querySelectorAll('[id*="jotform"], [class*="jotform"]');
        chatbotElements.forEach(element => {
          if (element.parentNode) {
            element.parentNode.removeChild(element);
          }
        });
      };
    }
  }, [activeSection]);

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
      icon: '📊',
      title: 'Polls & Feedback',
      description: 'Participate in campus polls and provide feedback on various topics.',
      key: 'polls'
    },
    {
      icon: '📢',
      title: 'Tech Updates & Notifications',
      description: 'Stay updated with latest tech announcements, system updates, and important notifications.',
      key: 'techUpdatesNotifications'
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
      icon: '🚀',
      title: 'Tech Events',
      description: 'Curated hackathons, internships, tech news, and opportunities to stay competitive.',
      key: 'techupdates'
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
        return <StudentAnnouncements user={user} onBack={handleBackToDashboard} onLogout={onLogout} isDarkMode={isDarkMode} />;
      case 'lostfound':
        return <StudentLostFound user={user} onBack={handleBackToDashboard} onLogout={onLogout} isDarkMode={isDarkMode} />;
      case 'timetable':
        return <StudentTimetable user={user} onBack={handleBackToDashboard} onLogout={onLogout} isDarkMode={isDarkMode} />;
      case 'hostel':
        return <StudentHostelComplaints user={user} onBack={handleBackToDashboard} onLogout={onLogout} isDarkMode={isDarkMode} />;
      case 'skillexchange':
        return <SkillExchange user={user} onBack={handleBackToDashboard} onLogout={onLogout} isDarkMode={isDarkMode} />;
      case 'polls':
        return <StudentPollsForms user={user} onBack={handleBackToDashboard} onLogout={onLogout} isDarkMode={isDarkMode} />;
      case 'techUpdatesNotifications':
        return (
          <div style={containerStyle}>
            <header style={headerStyle}>
              <div style={logoStyle}>
                <img
                  src={isDarkMode ? "/logo-dark.png" : "/logo-light.png"}
                  alt="InnovAid Logo"
                  style={{
                    height: '65px',
                    width: 'auto',
                    objectFit: 'contain'
                  }}
                />
                <span>InnovAid</span>
              </div>
              <div style={userInfoStyle}>
                <button
                  onClick={handleBackToDashboard}
                  style={{
                    background: isDarkMode ? '#374151' : '#f3f4f6',
                    color: isDarkMode ? '#fff' : '#333',
                    border: 'none',
                    padding: '0.5rem 1rem',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    fontWeight: '500',
                    transition: 'background 0.3s ease'
                  }}
                >
                  ← Back to Dashboard
                </button>
                <div style={avatarStyle}>
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p style={{
                    margin: 0,
                    fontWeight: '600',
                    color: isDarkMode ? '#fff' : '#333',
                    transition: 'color 0.3s ease'
                  }}>
                    {user.name}
                  </p>
                  <p style={{
                    margin: 0,
                    fontSize: '0.875rem',
                    color: isDarkMode ? '#ccc' : '#666',
                    transition: 'color 0.3s ease'
                  }}>
                    {user.department} • Year {user.year}
                  </p>
                </div>
                <button
                  onClick={onLogout}
                  style={{
                    background: '#ef4444',
                    color: 'white',
                    border: 'none',
                    padding: '0.5rem 1rem',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    fontWeight: '500',
                    transition: 'background 0.3s ease'
                  }}
                >
                  Logout
                </button>
              </div>
            </header>
            <main style={mainContentStyle}>
              <TechUpdatesView user={user} isDarkMode={isDarkMode} />
            </main>
          </div>
        );
      case 'techupdates':
        return <TechUpdates user={user} onBack={handleBackToDashboard} onLogout={onLogout} />;
      case 'profile':
        return (
          <div style={containerStyle}>
            {/* Profile Header */}
            <header style={headerStyle}>
              <div style={logoStyle}>
                <img
                  src={isDarkMode ? "/logo-dark.png" : "/logo-light.png"}
                  alt="InnovAid Logo"
                  style={{
                    height: '65px',
                    width: 'auto',
                    objectFit: 'contain'
                  }}
                />
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
                      fontWeight: '700',
                      transition: 'color 0.3s ease'
                    }}>
                      {user.name}
                    </h1>
                    <p style={{
                      margin: '0 0 0.5rem 0',
                      fontSize: '1.1rem',
                      color: isDarkMode ? '#ccc' : '#666',
                      transition: 'color 0.3s ease'
                    }}>
                      {user.email}
                    </p>
                    <p style={{
                      margin: 0,
                      fontSize: '1rem',
                      color: isDarkMode ? '#aaa' : '#888',
                      fontWeight: '600',
                      transition: 'color 0.3s ease'
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
                    transition: 'color 0.3s ease'
                  }}>
                    Basic Information
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
                    transition: 'color 0.3s ease'
                  }}>
                    Appearance Settings
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
                          fontWeight: '600',
                          transition: 'color 0.3s ease'
                        }}>
                          Dark Mode
                        </h3>
                        <p style={{
                          margin: 0,
                          fontSize: '0.9rem',
                          color: isDarkMode ? '#ccc' : '#666',
                          transition: 'color 0.3s ease'
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
                    transition: 'color 0.3s ease'
                  }}>
                    Recent Notifications
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
                          background: notification.isRead ? '#ccc' : '#ef4444',
                          marginTop: '0.25rem',
                          flexShrink: 0,
                          boxShadow: notification.isRead ? 'none' : '0 0 10px rgba(239, 68, 68, 0.5)'
                        }} />
                        <div style={{ flex: 1 }}>
                          <p style={{
                            margin: '0 0 0.5rem 0',
                            fontSize: '1rem',
                            color: isDarkMode ? '#fff' : '#333',
                            fontWeight: notification.isRead ? '400' : '600',
                            lineHeight: '1.5',
                            transition: 'color 0.3s ease'
                          }}>
                            {notification.message}
                          </p>
                          <p style={{
                            margin: 0,
                            fontSize: '0.85rem',
                            color: isDarkMode ? '#aaa' : '#888',
                            transition: 'color 0.3s ease'
                          }}>
                            {notification.createdAt.toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
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
                    transition: 'color 0.3s ease'
                  }}>
                    Feedback & Complaints
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
                      Submit Feedback or Complaint
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
                          Submit
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
                          Cancel
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
                    Logout from Account
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
    <>
      {/* Add CSS animation for notification badge and chatbot styling */}
      <style>
        {`
          @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.1); }
            100% { transform: scale(1); }
          }

          /* AI Chatbot Styling - Force circular shape and bottom-right positioning */
          [id*="jotform"] {
            position: fixed !important;
            bottom: 20px !important;
            right: 20px !important;
            z-index: 9999 !important;
            border-radius: 50% !important;
            width: 60px !important;
            height: 60px !important;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
            transition: all 0.3s ease !important;
          }

          [id*="jotform"]:hover {
            transform: scale(1.1) !important;
            box-shadow: 0 6px 20px rgba(0, 0, 0, 0.25) !important;
          }

          /* Style the chatbot button/icon */
          [id*="jotform"] iframe,
          [id*="jotform"] > div {
            border-radius: 50% !important;
            width: 100% !important;
            height: 100% !important;
          }

          /* Hide chatbot on mobile screens if needed */
          @media (max-width: 768px) {
            [id*="jotform"] {
              width: 50px !important;
              height: 50px !important;
              bottom: 15px !important;
              right: 15px !important;
            }
          }
        `}
      </style>

      <div style={containerStyle}>
      <header style={headerStyle}>
        <div style={logoStyle}>
          <img
            src={isDarkMode ? "/logo-dark.png" : "/logo-light.png"}
            alt="InnovAid Logo"
            style={{
              height: '65px',
              width: 'auto',
              objectFit: 'contain'
            }}
          />
        </div>

        <div style={userInfoStyle}>
          {/* Notification Badge */}
          {notificationCount > 0 && (
            <div style={{
              position: 'relative',
              marginRight: '0.5rem'
            }}>
              <div style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                background: '#ef4444',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.75rem',
                fontWeight: '600',
                boxShadow: '0 2px 8px rgba(239, 68, 68, 0.3)',
                animation: notificationCount > 0 ? 'pulse 2s infinite' : 'none'
              }}>
                {notificationCount > 9 ? '9+' : notificationCount}
              </div>
            </div>
          )}

          <div
            style={{
              ...avatarStyle,
              position: 'relative'
            }}
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
            Welcome to your student dashboard. Explore our services to make the most of your college experience.
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
              <h3 style={{ color: '#15803d', margin: '0 0 0.5rem 0' }}>12</h3>
              <p style={{ color: '#15803d', margin: 0, fontSize: '0.9rem' }}>Tech Opportunities</p>
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

      {/* AI Chatbot will automatically appear in bottom-right corner when on main dashboard */}
      {/* The chatbot is loaded via useEffect and styled with CSS above */}
    </div>
    </>
  );
};

// Wrap UserDashboard with ErrorBoundary
const UserDashboardWithErrorBoundary: React.FC<UserDashboardProps> = (props) => (
  <UserDashboardErrorBoundary>
    <UserDashboard {...props} />
  </UserDashboardErrorBoundary>
);

export default UserDashboardWithErrorBoundary;
