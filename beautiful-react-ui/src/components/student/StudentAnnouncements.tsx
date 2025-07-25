import React, { useState } from 'react';

interface Announcement {
  id: string;
  title: string;
  category: string;
  date: string;
  content: string;
  author: string;
}

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

// Mock announcements data
const mockAnnouncements: Announcement[] = [
  { id: '1', title: 'Mid-Term Exam Schedule Released', category: 'Academic', date: '2023-05-15T00:00:00Z', content: 'Mid-term examinations will be held from May 20-25. Check department notice boards for detailed schedules. All students must carry their ID cards and admit cards to the examination hall.', author: 'Academic Office' },
  { id: '2', title: 'Annual Cultural Fest - TechFiesta 2024', category: 'Event', date: '2023-05-14T00:00:00Z', content: 'The annual cultural fest will be held on June 5-7. Registration for performances starts next week. Prizes worth ₹50,000 to be won! Categories include dance, music, drama, and technical events.', author: 'Cultural Committee' },
  { id: '3', title: 'Library Renovation Notice', category: 'Facility', date: '2023-05-13T00:00:00Z', content: 'The main library will be closed for renovations from May 15-18. Alternative study spaces will be available in Block B, Level 2. Digital resources remain accessible 24/7.', author: 'Facility Management' },
  { id: '4', title: 'Summer Internship Opportunities', category: 'Academic', date: '2023-05-12T00:00:00Z', content: 'Leading tech companies are offering summer internships. Application deadline: May 30th. Visit the placement cell for more details and application procedures.', author: 'Placement Cell' },
  { id: '5', title: 'Campus WiFi Maintenance', category: 'Facility', date: '2023-05-11T00:00:00Z', content: 'WiFi services will be temporarily unavailable on May 16th from 2 AM to 6 AM for scheduled maintenance. Mobile hotspots will be available at the IT help desk.', author: 'IT Department' },
  { id: '6', title: 'Blood Donation Camp', category: 'Event', date: '2023-05-10T00:00:00Z', content: 'NSS is organizing a blood donation camp on May 18th in the main auditorium from 9 AM to 4 PM. All healthy students above 18 are encouraged to participate.', author: 'NSS Committee' },
  { id: '7', title: 'Holiday Notice - Gandhi Jayanti', category: 'General', date: '2023-05-09T00:00:00Z', content: 'The college will remain closed on October 2nd (Gandhi Jayanti). Classes will resume on October 3rd as per regular schedule.', author: 'Administration' },
  { id: '8', title: 'New Course Registration Open', category: 'Academic', date: '2023-05-08T00:00:00Z', content: 'Registration for elective courses for the next semester is now open. Students can register through the student portal until May 25th. Limited seats available.', author: 'Academic Office' }
];

const StudentAnnouncements: React.FC<StudentAnnouncementsProps> = ({ user, onBack, onLogout }) => {
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

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

  const filteredAnnouncements = mockAnnouncements.filter(announcement => {
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
                All ({mockAnnouncements.length})
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
                  {category} ({mockAnnouncements.filter(a => a.category === category).length})
                </button>
              ))}
            </div>
          </div>

          <div>
            {filteredAnnouncements.map(announcement => (
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
                  </div>
                </div>
                <p style={{ margin: 0, color: '#4b5563', lineHeight: '1.6' }}>
                  {announcement.content}
                </p>
              </div>
            ))}
            
            {filteredAnnouncements.length === 0 && (
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
                    : 'No announcements match your search criteria.'
                  }
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default StudentAnnouncements;
