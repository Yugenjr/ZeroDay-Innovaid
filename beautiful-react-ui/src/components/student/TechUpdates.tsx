import React, { useState, useEffect } from 'react';
import { User } from '../../types/User';
import { RealtimeTechEvent, subscribeToRealtimeTechEvents, testRealtimeConnection } from '../../firebase/realtimeTechEvents';

interface TechUpdatesProps {
  user: User;
  onBack: () => void;
  onLogout: () => void;
  isDarkMode?: boolean;
}

const TechUpdates: React.FC<TechUpdatesProps> = ({ user, onBack, onLogout, isDarkMode = false }) => {
  const [events, setEvents] = useState<RealtimeTechEvent[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<RealtimeTechEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<'all' | RealtimeTechEvent['type']>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<RealtimeTechEvent | null>(null);

  useEffect(() => {
    // Test Realtime Database connection
    testRealtimeConnection().then((connected) => {
      if (connected) {
        console.log('✅ Student side: Realtime Database connected successfully!');
      } else {
        console.error('❌ Student side: Realtime Database connection failed!');
      }
    });

    // Subscribe to real-time updates from Realtime Database
    const unsubscribe = subscribeToRealtimeTechEvents((updatedEvents) => {
      console.log('📱 Student side: Received tech events update from Realtime DB:', updatedEvents.length, 'events');
      setEvents(updatedEvents);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    filterEvents();
  }, [events, selectedType, searchTerm]);

  const filterEvents = async () => {
    let filtered = events;

    // Filter by type
    if (selectedType !== 'all') {
      filtered = filtered.filter(event => event.type === selectedType);
    }

    // Filter by search term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(event =>
        event.title.toLowerCase().includes(term) ||
        event.details.toLowerCase().includes(term) ||
        event.place.toLowerCase().includes(term) ||
        event.venue.toLowerCase().includes(term) ||
        event.tags.some(tag => tag.toLowerCase().includes(term))
      );
    }

    setFilteredEvents(filtered);
  };

  const handleTypeFilter = async (type: 'all' | RealtimeTechEvent['type']) => {
    setSelectedType(type);
    setSearchTerm('');
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setSelectedType('all');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getEventTypeColor = (type: RealtimeTechEvent['type']) => {
    switch (type) {
      case 'hackathon': return '#ff6b6b';
      case 'internship': return '#4ecdc4';
      case 'event': return '#45b7d1';
      case 'tech-news': return '#96ceb4';
      default: return '#6c5ce7';
    }
  };

  const getEventTypeIcon = (type: RealtimeTechEvent['type']) => {
    switch (type) {
      case 'hackathon': return '💻';
      case 'internship': return '🏢';
      case 'event': return '🎯';
      case 'tech-news': return '📰';
      default: return '🚀';
    }
  };

  const containerStyle: React.CSSProperties = {
    minHeight: '100vh',
    background: isDarkMode
      ? 'linear-gradient(135deg, #1a202c 0%, #2d3748 100%)'
      : 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
    fontFamily: 'Arial, sans-serif'
  };

  const headerStyle: React.CSSProperties = {
    background: isDarkMode
      ? 'rgba(45, 55, 72, 0.95)'
      : 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(10px)',
    padding: '1rem 2rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
  };

  const mainContentStyle: React.CSSProperties = {
    padding: '2rem',
    maxWidth: '1200px',
    margin: '0 auto'
  };

  if (selectedEvent) {
    return (
      <div style={containerStyle}>
        <header style={headerStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button
              style={{
                background: 'none',
                border: 'none',
                fontSize: '1.5rem',
                cursor: 'pointer',
                padding: '0.5rem',
                color: isDarkMode ? '#fff' : '#333'
              }}
              onClick={() => setSelectedEvent(null)}
            >
              ←
            </button>
            <h1 style={{ margin: 0, color: isDarkMode ? '#fff' : '#333', fontSize: '1.5rem' }}>Event Details</h1>
          </div>
          <button
            style={{
              background: '#ef4444',
              color: 'white',
              border: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600'
            }}
            onClick={onLogout}
          >
            🚪 Logout
          </button>
        </header>

        <main style={mainContentStyle}>
          <div style={{
            background: isDarkMode
              ? 'rgba(45, 55, 72, 0.95)'
              : 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            borderRadius: '20px',
            padding: '2rem',
            boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
          }}>
            {/* Event Header */}
            <div style={{ marginBottom: '2rem' }}>
              <div style={{
                display: 'inline-block',
                background: getEventTypeColor(selectedEvent.type),
                color: 'white',
                padding: '0.5rem 1rem',
                borderRadius: '20px',
                fontSize: '0.9rem',
                fontWeight: '600',
                marginBottom: '1rem'
              }}>
                {getEventTypeIcon(selectedEvent.type)} {selectedEvent.type.charAt(0).toUpperCase() + selectedEvent.type.slice(1)}
              </div>
              
              <h1 style={{
                margin: '0 0 1rem 0',
                color: isDarkMode ? '#fff' : '#333',
                fontSize: '2.5rem',
                fontWeight: '700'
              }}>
                {selectedEvent.title}
              </h1>

              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
                gap: '1rem',
                marginBottom: '2rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '1.2rem' }}>📅</span>
                  <span style={{ fontWeight: '600', color: isDarkMode ? '#e2e8f0' : '#333' }}>{formatDate(selectedEvent.date)}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '1.2rem' }}>📍</span>
                  <span style={{ fontWeight: '600', color: isDarkMode ? '#e2e8f0' : '#333' }}>{selectedEvent.venue}, {selectedEvent.place}</span>
                </div>
                {selectedEvent.deadline && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '1.2rem' }}>⏰</span>
                    <span style={{ fontWeight: '600', color: '#ef4444' }}>
                      Deadline: {new Date(selectedEvent.deadline).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Event Poster */}
            {selectedEvent.posterUrl && (
              <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
                <img
                  src={selectedEvent.posterUrl}
                  alt={selectedEvent.title}
                  style={{
                    maxWidth: '100%',
                    maxHeight: '400px',
                    borderRadius: '15px',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
                  }}
                />
              </div>
            )}

            {/* Event Details */}
            <div style={{ marginBottom: '2rem' }}>
              <h2 style={{ color: isDarkMode ? '#fff' : '#333', marginBottom: '1rem' }}>📋 Event Details</h2>
              <div style={{
                background: isDarkMode ? '#4a5568' : '#f8f9fa',
                padding: '1.5rem',
                borderRadius: '15px',
                lineHeight: '1.6'
              }}>
                <p style={{ margin: 0, whiteSpace: 'pre-wrap', color: isDarkMode ? '#e2e8f0' : '#333' }}>{selectedEvent.details}</p>
              </div>
            </div>

            {/* Requirements */}
            <div style={{ marginBottom: '2rem' }}>
              <h2 style={{ color: isDarkMode ? '#fff' : '#333', marginBottom: '1rem' }}>🎯 Requirements</h2>
              <div style={{
                background: isDarkMode ? '#4a5568' : '#f8f9fa',
                padding: '1.5rem',
                borderRadius: '15px',
                lineHeight: '1.6'
              }}>
                <p style={{ margin: 0, whiteSpace: 'pre-wrap', color: isDarkMode ? '#e2e8f0' : '#333' }}>{selectedEvent.requirements}</p>
              </div>
            </div>

            {/* Registration Link */}
            {selectedEvent.registrationLink && (
              <div style={{ textAlign: 'center' }}>
                <a
                  href={selectedEvent.registrationLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-block',
                    background: getEventTypeColor(selectedEvent.type),
                    color: 'white',
                    padding: '1rem 2rem',
                    borderRadius: '15px',
                    textDecoration: 'none',
                    fontWeight: '600',
                    fontSize: '1.1rem',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
                    transition: 'transform 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  🚀 Register Now
                </a>
              </div>
            )}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <header style={headerStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.5rem',
              cursor: 'pointer',
              padding: '0.5rem',
              color: isDarkMode ? '#fff' : '#333'
            }}
            onClick={onBack}
          >
            ←
          </button>
          <h1 style={{ margin: 0, color: isDarkMode ? '#fff' : '#333', fontSize: '1.5rem' }}>Tech Updates & Opportunities</h1>
        </div>
        <button
          style={{
            background: '#ef4444',
            color: 'white',
            border: 'none',
            padding: '0.5rem 1rem',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: '600'
          }}
          onClick={onLogout}
        >
          🚪 Logout
        </button>
      </header>

      <main style={mainContentStyle}>
        {/* Search and Filter Section */}
        <div style={{
          background: isDarkMode
            ? 'rgba(45, 55, 72, 0.95)'
            : 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          borderRadius: '20px',
          padding: '1.5rem',
          marginBottom: '2rem',
          boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
        }}>
          {/* Search Bar */}
          <div style={{ marginBottom: '1rem' }}>
            <input
              type="text"
              placeholder="🔍 Search events, hackathons, internships..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '1rem',
                border: isDarkMode ? '2px solid #4a5568' : '2px solid #e5e7eb',
                borderRadius: '15px',
                fontSize: '1rem',
                outline: 'none',
                transition: 'border-color 0.3s ease',
                background: isDarkMode ? '#2d3748' : '#fff',
                color: isDarkMode ? '#e2e8f0' : '#333'
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#667eea';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = isDarkMode ? '#4a5568' : '#e5e7eb';
              }}
            />
          </div>

          {/* Filter Buttons */}
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            {[
              { key: 'all', label: '🌟 All', color: '#6c5ce7' },
              { key: 'hackathon', label: '💻 Hackathons', color: '#ff6b6b' },
              { key: 'internship', label: '🏢 Internships', color: '#4ecdc4' },
              { key: 'event', label: '🎯 Events', color: '#45b7d1' },
              { key: 'tech-news', label: '📰 Tech News', color: '#96ceb4' }
            ].map((filter) => (
              <button
                key={filter.key}
                onClick={() => handleTypeFilter(filter.key as any)}
                style={{
                  background: selectedType === filter.key ? filter.color : 'transparent',
                  color: selectedType === filter.key ? 'white' : filter.color,
                  border: `2px solid ${filter.color}`,
                  padding: '0.5rem 1rem',
                  borderRadius: '20px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  if (selectedType !== filter.key) {
                    e.currentTarget.style.background = filter.color;
                    e.currentTarget.style.color = 'white';
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedType !== filter.key) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = filter.color;
                  }
                }}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {/* Events Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
            <h2 style={{ color: isDarkMode ? '#e2e8f0' : '#666' }}>Loading tech updates...</h2>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
            <h2 style={{ color: isDarkMode ? '#e2e8f0' : '#666' }}>No events found</h2>
            <p style={{ color: isDarkMode ? '#a0aec0' : '#888' }}>
              {searchTerm ? 'Try adjusting your search terms' : 'Check back later for new opportunities!'}
            </p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
            gap: '2rem'
          }}>
            {filteredEvents.map((event) => (
              <div
                key={event.id}
                onClick={() => setSelectedEvent(event)}
                style={{
                  background: isDarkMode
                    ? 'rgba(45, 55, 72, 0.95)'
                    : 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: '20px',
                  padding: '1.5rem',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  border: '2px solid transparent'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-5px)';
                  e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.15)';
                  e.currentTarget.style.borderColor = getEventTypeColor(event.type);
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.1)';
                  e.currentTarget.style.borderColor = 'transparent';
                }}
              >
                {/* Event Type Badge */}
                <div style={{
                  display: 'inline-block',
                  background: getEventTypeColor(event.type),
                  color: 'white',
                  padding: '0.3rem 0.8rem',
                  borderRadius: '15px',
                  fontSize: '0.8rem',
                  fontWeight: '600',
                  marginBottom: '1rem'
                }}>
                  {getEventTypeIcon(event.type)} {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                </div>

                {/* Event Poster */}
                {event.posterUrl && (
                  <div style={{ marginBottom: '1rem' }}>
                    <img
                      src={event.posterUrl}
                      alt={event.title}
                      style={{
                        width: '100%',
                        height: '200px',
                        objectFit: 'cover',
                        borderRadius: '10px'
                      }}
                    />
                  </div>
                )}

                {/* Event Title */}
                <h3 style={{
                  margin: '0 0 0.5rem 0',
                  color: isDarkMode ? '#fff' : '#333',
                  fontSize: '1.3rem',
                  fontWeight: '700',
                  lineHeight: '1.3'
                }}>
                  {event.title}
                </h3>

                {/* Event Details Preview */}
                <p style={{
                  margin: '0 0 1rem 0',
                  color: isDarkMode ? '#a0aec0' : '#666',
                  fontSize: '0.9rem',
                  lineHeight: '1.5',
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }}>
                  {event.details}
                </p>

                {/* Event Meta Info */}
                <div style={{ fontSize: '0.85rem', color: isDarkMode ? '#a0aec0' : '#888' }}>
                  <div style={{ marginBottom: '0.3rem' }}>
                    📅 {formatDate(event.date)}
                  </div>
                  <div style={{ marginBottom: '0.3rem' }}>
                    📍 {event.venue}, {event.place}
                  </div>
                  {event.deadline && (
                    <div style={{ color: '#ef4444', fontWeight: '600' }}>
                      ⏰ Deadline: {new Date(event.deadline).toLocaleDateString()}
                    </div>
                  )}
                </div>

                {/* Priority Indicator */}
                {event.priority === 'high' && (
                  <div style={{
                    position: 'absolute',
                    top: '1rem',
                    right: '1rem',
                    background: '#ef4444',
                    color: 'white',
                    padding: '0.2rem 0.5rem',
                    borderRadius: '10px',
                    fontSize: '0.7rem',
                    fontWeight: '600'
                  }}>
                    🔥 HOT
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default TechUpdates;
