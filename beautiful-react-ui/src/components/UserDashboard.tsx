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

  const logoStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    fontSize: '1.5rem',
    fontWeight: '800',
    color: '#333'
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
    fontWeight: '600'
  };

  const logoutButtonStyle: React.CSSProperties = {
    background: '#ef4444',
    color: 'white',
    border: 'none',
    padding: '0.5rem 1rem',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600'
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
    },
    {
      icon: '⚙️',
      title: 'Account Settings',
      description: 'Update profile, preferences, and privacy settings.',
      key: 'settings'
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
          <div style={avatarStyle}>
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1rem', color: '#333' }}>{user.name}</h3>
            <p style={{ margin: 0, fontSize: '0.875rem', color: '#666' }}>
              {user.department} • Year {user.year}
            </p>
          </div>
          <button style={logoutButtonStyle} onClick={onLogout}>
            🚪 Logout
          </button>
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
          {services.map((service, index) => (
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
