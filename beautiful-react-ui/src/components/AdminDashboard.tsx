import React, { useState, useEffect } from 'react';
import { User } from '../types/User';
import StudentManagement from './admin/StudentManagement';
import AnnouncementManagement from './admin/AnnouncementManagement';
import LostFoundManagement from './admin/LostFoundManagement';
import TimetableManagement from './admin/TimetableManagement';
import HostelManagement from './admin/HostelManagement';
import RegistrationManagement from './admin/RegistrationManagement';
// @ts-ignore
import { getAllRegistrations } from '../firebase/registrations';

interface AdminDashboardProps {
  user: User;
  onLogout: () => void;
}

// Mock student data for demonstration
const mockStudents = [
  { id: '1', name: 'John Doe', email: 'john@college.edu', studentId: 'CS2024001', department: 'Computer Science', year: 3, isActive: true, lastLogin: '2023-05-15T10:30:00Z' },
  { id: '2', name: 'Jane Smith', email: 'jane@college.edu', studentId: 'CS2024002', department: 'Computer Science', year: 2, isActive: true, lastLogin: '2023-05-14T14:20:00Z' },
  { id: '3', name: 'Mike Johnson', email: 'mike@college.edu', studentId: 'EE2024001', department: 'Electrical Engineering', year: 4, isActive: true, lastLogin: '2023-05-13T09:15:00Z' },
  { id: '4', name: 'Sarah Williams', email: 'sarah@college.edu', studentId: 'ME2024001', department: 'Mechanical Engineering', year: 1, isActive: false, lastLogin: '2023-04-28T11:45:00Z' },
  { id: '5', name: 'David Brown', email: 'david@college.edu', studentId: 'CE2024001', department: 'Civil Engineering', year: 3, isActive: true, lastLogin: '2023-05-12T16:30:00Z' },
];



// Mock lost & found items
const mockLostFoundItems = [
  { id: '1', type: 'lost' as const, itemName: 'Blue Backpack', category: 'Bag', location: 'Main Library', date: '2023-05-12T00:00:00Z', description: 'Blue Adidas backpack with laptop and notebooks inside', reportedBy: 'John Doe', status: 'pending' as const, image: 'backpack.jpg' },
  { id: '2', type: 'found' as const, itemName: 'Student ID Card', category: 'ID/Card', location: 'Cafeteria', date: '2023-05-11T00:00:00Z', description: 'Student ID card for Sarah Williams', reportedBy: 'Cafeteria Staff', status: 'claimed' as const, image: 'id_card.jpg' },
  { id: '3', type: 'lost' as const, itemName: 'iPhone 13', category: 'Electronics', location: 'Lecture Hall B', date: '2023-05-10T00:00:00Z', description: 'Black iPhone 13 with blue case', reportedBy: 'Mike Johnson', status: 'pending' as const, image: 'iphone.jpg' },
];

// Get shared hostel complaints from localStorage
const getSharedComplaints = () => {
  const stored = localStorage.getItem('hostelComplaints');
  if (stored) {
    return JSON.parse(stored);
  }
  // Default complaints if none exist
  return [
    { id: '1', type: 'Plumbing', room: 'A-101', hostelBlock: 'A', description: 'Water leakage from bathroom sink', status: 'pending' as const, date: '2023-05-12T00:00:00Z', raisedBy: 'John Doe', priority: 'high' as const },
    { id: '2', type: 'Electrical', room: 'B-205', hostelBlock: 'B', description: 'Fan not working properly', status: 'in-progress' as const, date: '2023-05-10T00:00:00Z', raisedBy: 'Mike Johnson', priority: 'medium' as const },
    { id: '3', type: 'Cleaning', room: 'C-110', hostelBlock: 'C', description: 'Common area needs cleaning', status: 'resolved' as const, date: '2023-05-08T00:00:00Z', raisedBy: 'David Brown', priority: 'low' as const },
  ];
};

const AdminDashboard: React.FC<AdminDashboardProps> = ({ user, onLogout }) => {
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [pendingRegistrationsCount, setPendingRegistrationsCount] = useState<number>(0);
  const [complaints, setComplaints] = useState(getSharedComplaints());

  // Update complaints and registrations when returning to dashboard
  React.useEffect(() => {
    if (!activeSection) {
      setComplaints(getSharedComplaints());
      loadPendingRegistrationsCount(); // Refresh registration count
    }
  }, [activeSection]);

  // Load pending registrations count
  const loadPendingRegistrationsCount = async () => {
    try {
      const result = await getAllRegistrations();
      if (result.success && result.registrations) {
        const pendingCount = result.registrations.filter(reg => reg.status === 'pending').length;
        setPendingRegistrationsCount(pendingCount);
        console.log('📊 Pending registrations count:', pendingCount);
      }
    } catch (error) {
      console.error('Error loading pending registrations count:', error);
    }
  };

  // Load data on component mount
  useEffect(() => {
    loadPendingRegistrationsCount();
  }, []);
  const containerStyle: React.CSSProperties = {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
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

  const adminBadgeStyle: React.CSSProperties = {
    background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    color: 'white',
    padding: '0.25rem 0.75rem',
    borderRadius: '1rem',
    fontSize: '0.75rem',
    fontWeight: '600',
    marginLeft: '0.5rem'
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
    background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
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
    maxWidth: '1400px',
    margin: '0 auto'
  };

  const welcomeCardStyle: React.CSSProperties = {
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(10px)',
    borderRadius: '20px',
    padding: '2rem',
    marginBottom: '2rem',
    boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
    border: '1px solid rgba(255, 255, 255, 0.2)'
  };

  const statsGridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '1.5rem',
    marginBottom: '2rem'
  };

  const statCardStyle: React.CSSProperties = {
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(10px)',
    borderRadius: '15px',
    padding: '1.5rem',
    boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderTop: '4px solid #f093fb'
  };

  const managementGridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
    gap: '1.5rem'
  };

  const managementCardStyle: React.CSSProperties = {
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(10px)',
    borderRadius: '15px',
    padding: '1.5rem',
    boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    cursor: 'pointer',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease'
  };

  const getPendingComplaintsCount = () => {
    return complaints.filter((c: any) => c.status === 'pending').length;
  };

  const managementSections = [
    {
      icon: '👥',
      title: 'Student Management',
      description: 'View and manage student accounts, permissions, and access controls.',
      key: 'students'
    },
    {
      icon: '📢',
      title: 'Campus Announcements',
      description: 'Post important updates like events, exams, and holiday notices.',
      key: 'announcements'
    },
    {
      icon: '🔍',
      title: 'Lost & Found Management',
      description: 'Approve, manage, and coordinate lost & found items across campus.',
      key: 'lostfound'
    },
    {
      icon: '📅',
      title: 'Timetable Administration',
      description: 'Create master schedules and manage class timetables for departments.',
      key: 'timetable'
    },
    {
      icon: '🏠',
      title: 'Hostel Complaints',
      description: 'Review and resolve hostel complaints and maintenance requests.',
      key: 'hostel',
      badge: getPendingComplaintsCount()
    },
    {
      icon: '📚',
      title: 'Library Management',
      description: 'Oversee book inventory, reservations, and library resource allocation.',
      key: 'library'
    },
    {
      icon: '🎭',
      title: 'Event Management',
      description: 'Create, manage, and monitor campus events, workshops, and activities.',
      key: 'events'
    },
    {
      icon: '📝',
      title: 'Event Registrations',
      description: 'View and manage student registrations for campus events.',
      key: 'eventRegistrations',
      badge: pendingRegistrationsCount
    },
    {
      icon: '🏢',
      title: 'Facility Management',
      description: 'Manage campus facilities, room bookings, and maintenance schedules.',
      key: 'facilities'
    },
    {
      icon: '📊',
      title: 'Analytics & Reports',
      description: 'View detailed analytics, usage statistics, and generate reports.',
      key: 'analytics'
    }
  ];

  // Handle section navigation
  const handleSectionClick = (sectionKey: string) => {
    console.log('🔍 Admin clicked section:', sectionKey);
    setActiveSection(sectionKey);
  };

  const handleBackToDashboard = () => {
    setActiveSection(null);
  };

  // Render specific management section
  if (activeSection) {
    console.log('🎯 Rendering section:', activeSection);
    switch (activeSection) {
      case 'students':
        return <StudentManagement user={user} onBack={handleBackToDashboard} onLogout={onLogout} students={mockStudents} />;
      case 'announcements':
        return <AnnouncementManagement user={user} onBack={handleBackToDashboard} onLogout={onLogout} />;
      case 'lostfound':
        return <LostFoundManagement user={user} onBack={handleBackToDashboard} onLogout={onLogout} items={mockLostFoundItems} />;
      case 'timetable':
        return <TimetableManagement user={user} onBack={handleBackToDashboard} onLogout={onLogout} />;
      case 'hostel':
        return <HostelManagement user={user} onBack={handleBackToDashboard} onLogout={onLogout} complaints={getSharedComplaints()} />;
      case 'eventRegistrations':
        console.log('📝 Loading Registration Management component');
        return <RegistrationManagement user={user} onBack={handleBackToDashboard} />;
      default:
        return <div>Feature coming soon!</div>;
    }
  }

  return (
    <div style={containerStyle}>
      <header style={headerStyle}>
        <div style={logoStyle}>
          <span style={{ fontSize: '2rem' }}>🎓</span>
          InnovAid
          <span style={adminBadgeStyle}>ADMIN</span>
        </div>
        
        <div style={userInfoStyle}>
          <div style={avatarStyle}>
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1rem', color: '#333' }}>{user.name}</h3>
            <p style={{ margin: 0, fontSize: '0.875rem', color: '#666' }}>
              System Administrator
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
            Admin Dashboard 🛡️
          </h1>
          <p style={{ 
            color: '#666', 
            fontSize: '1.1rem' 
          }}>
            Welcome back, {user.name.split(' ')[0]}! Monitor system performance and manage campus utilities from here.
          </p>
        </div>

        <div style={statsGridStyle}>
          <div style={statCardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '10px',
                background: 'rgba(102, 126, 234, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem'
              }}>
                👥
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.875rem', fontWeight: '600', color: '#10b981' }}>
                📈 +12%
              </div>
            </div>
            <h3 style={{ fontSize: '2rem', fontWeight: '700', color: '#333', margin: '0 0 0.25rem 0' }}>2,847</h3>
            <p style={{ color: '#666', margin: 0, fontSize: '0.875rem' }}>Active Users</p>
          </div>

          <div style={statCardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '10px',
                background: 'rgba(102, 126, 234, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem'
              }}>
                📊
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.875rem', fontWeight: '600', color: '#10b981' }}>
                📈 +8%
              </div>
            </div>
            <h3 style={{ fontSize: '2rem', fontWeight: '700', color: '#333', margin: '0 0 0.25rem 0' }}>98.5%</h3>
            <p style={{ color: '#666', margin: 0, fontSize: '0.875rem' }}>System Uptime</p>
          </div>

          <div style={statCardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '10px',
                background: 'rgba(102, 126, 234, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem'
              }}>
                📋
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.875rem', fontWeight: '600', color: '#10b981' }}>
                📈 +15%
              </div>
            </div>
            <h3 style={{ fontSize: '2rem', fontWeight: '700', color: '#333', margin: '0 0 0.25rem 0' }}>1,234</h3>
            <p style={{ color: '#666', margin: 0, fontSize: '0.875rem' }}>Service Requests</p>
          </div>

          <div style={statCardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '10px',
                background: 'rgba(102, 126, 234, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem'
              }}>
                ⚠️
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.875rem', fontWeight: '600', color: '#f59e0b' }}>
                ⚠️ 3 pending
              </div>
            </div>
            <h3 style={{ fontSize: '2rem', fontWeight: '700', color: '#333', margin: '0 0 0.25rem 0' }}>97</h3>
            <p style={{ color: '#666', margin: 0, fontSize: '0.875rem' }}>Issues Resolved</p>
          </div>
        </div>

        <div style={managementGridStyle}>
          {managementSections.map((section, index) => (
            <div
              key={section.title}
              style={managementCardStyle}
              onClick={() => handleSectionClick(section.key)}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.1)';
              }}
            >
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '15px',
                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem',
                fontSize: '1.5rem',
                position: 'relative'
              }}>
                {section.icon}
                {section.badge && section.badge > 0 && (
                  <div style={{
                    position: 'absolute',
                    top: '-8px',
                    right: '-8px',
                    background: '#ef4444',
                    color: 'white',
                    borderRadius: '50%',
                    width: '24px',
                    height: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    border: '2px solid white'
                  }}>
                    {section.badge}
                  </div>
                )}
              </div>
              <h3 style={{
                fontSize: '1.25rem',
                fontWeight: '600',
                color: '#333',
                margin: '0 0 0.5rem 0'
              }}>
                {section.title}
              </h3>
              <p style={{
                color: '#666',
                margin: 0,
                lineHeight: '1.5'
              }}>
                {section.description}
              </p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
