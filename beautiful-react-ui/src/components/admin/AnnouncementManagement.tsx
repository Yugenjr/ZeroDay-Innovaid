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
}

interface AnnouncementManagementProps {
  user: User;
  onBack: () => void;
  onLogout: () => void;
  announcements: Announcement[];
}

const AnnouncementManagement: React.FC<AnnouncementManagementProps> = ({ user, onBack, onLogout, announcements: initialAnnouncements }) => {
  const [announcements, setAnnouncements] = useState(initialAnnouncements);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: '',
    category: 'Academic',
    content: ''
  });

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
    boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
    border: '1px solid rgba(255, 255, 255, 0.2)'
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

  const textareaStyle: React.CSSProperties = {
    ...inputStyle,
    minHeight: '120px',
    resize: 'vertical' as const
  };

  const announcementCardStyle: React.CSSProperties = {
    background: 'white',
    borderRadius: '15px',
    padding: '1.5rem',
    marginBottom: '1rem',
    boxShadow: '0 5px 15px rgba(0,0,0,0.1)',
    border: '1px solid #e2e8f0'
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

  const filteredAnnouncements = selectedCategory 
    ? announcements.filter(ann => ann.category === selectedCategory)
    : announcements;

  const handleCreateAnnouncement = () => {
    if (!newAnnouncement.title || !newAnnouncement.content) {
      alert('Please fill in all required fields');
      return;
    }

    const announcement: Announcement = {
      id: Date.now().toString(),
      title: newAnnouncement.title,
      category: newAnnouncement.category,
      content: newAnnouncement.content,
      date: new Date().toISOString(),
      author: user.name
    };

    setAnnouncements([announcement, ...announcements]);
    setNewAnnouncement({ title: '', category: 'Academic', content: '' });
    setShowCreateForm(false);
  };

  const handleDeleteAnnouncement = (id: string) => {
    if (window.confirm('Are you sure you want to delete this announcement?')) {
      setAnnouncements(announcements.filter(ann => ann.id !== id));
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
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
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '600' }}>
            {user.name.charAt(0).toUpperCase()}
          </div>
          <button style={{ background: '#ef4444', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }} onClick={onLogout}>
            🚪 Logout
          </button>
        </div>
      </header>

      <main style={mainContentStyle}>
        <div style={cardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h2 style={{ margin: 0, color: '#333', fontSize: '1.5rem' }}>
              Manage Announcements ({filteredAnnouncements.length})
            </h2>
            <button
              style={buttonStyle}
              onClick={() => setShowCreateForm(!showCreateForm)}
            >
              {showCreateForm ? '✕ Cancel' : '+ New Announcement'}
            </button>
          </div>

          {showCreateForm && (
            <div style={{
              background: '#f8fafc',
              borderRadius: '15px',
              padding: '2rem',
              marginBottom: '2rem',
              border: '2px solid #e2e8f0'
            }}>
              <h3 style={{ margin: '0 0 1.5rem 0', color: '#333' }}>Create New Announcement</h3>
              
              <input
                style={inputStyle}
                type="text"
                placeholder="Announcement Title *"
                value={newAnnouncement.title}
                onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })}
              />
              
              <select
                style={inputStyle}
                value={newAnnouncement.category}
                onChange={(e) => setNewAnnouncement({ ...newAnnouncement, category: e.target.value })}
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              
              <textarea
                style={textareaStyle}
                placeholder="Announcement Content *"
                value={newAnnouncement.content}
                onChange={(e) => setNewAnnouncement({ ...newAnnouncement, content: e.target.value })}
              />
              
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button style={buttonStyle} onClick={handleCreateAnnouncement}>
                  📢 Publish Announcement
                </button>
                <button
                  style={{ ...buttonStyle, background: '#6b7280' }}
                  onClick={() => setShowCreateForm(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ margin: '0 0 1rem 0', color: '#333' }}>Filter by Category:</h3>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button
                style={{
                  ...buttonStyle,
                  background: !selectedCategory ? '#667eea' : '#e2e8f0',
                  color: !selectedCategory ? 'white' : '#333',
                  padding: '0.5rem 1rem'
                }}
                onClick={() => setSelectedCategory('')}
              >
                All ({announcements.length})
              </button>
              {categories.map(category => (
                <button
                  key={category}
                  style={{
                    ...buttonStyle,
                    background: selectedCategory === category ? '#667eea' : '#e2e8f0',
                    color: selectedCategory === category ? 'white' : '#333',
                    padding: '0.5rem 1rem'
                  }}
                  onClick={() => setSelectedCategory(category)}
                >
                  {category} ({announcements.filter(a => a.category === category).length})
                </button>
              ))}
            </div>
          </div>

          <div>
            {filteredAnnouncements.map(announcement => (
              <div key={announcement.id} style={announcementCardStyle}>
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
                        By {announcement.author} • {formatDate(announcement.date)}
                      </span>
                    </div>
                  </div>
                  <button
                    style={{
                      background: '#ef4444',
                      color: 'white',
                      border: 'none',
                      padding: '0.5rem',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '0.875rem'
                    }}
                    onClick={() => handleDeleteAnnouncement(announcement.id)}
                  >
                    🗑️
                  </button>
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
                    ? `No announcements in the ${selectedCategory} category.`
                    : 'Create your first announcement to get started!'
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

export default AnnouncementManagement;
