import React, { useState, useEffect } from 'react';
import { User } from '../../types/User';
import {
  TechEvent,
  createTechEvent,
  updateTechEvent,
  deleteTechEvent,
  subscribeTechEvents
} from '../../firebase/techEvents';
import { initializeEmailJS } from '../../firebase/emailNotifications';

interface AdminTechEventsProps {
  user: User;
  onBack: () => void;
  onLogout: () => void;
}

const AdminTechEvents: React.FC<AdminTechEventsProps> = ({ user, onBack, onLogout }) => {
  const [events, setEvents] = useState<TechEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<TechEvent | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    details: '',
    place: '',
    venue: '',
    date: '',
    requirements: '',
    type: 'event' as TechEvent['type'],
    registrationLink: '',
    deadline: '',
    tags: '',
    priority: 'medium' as TechEvent['priority']
  });
  const [posterFile, setPosterFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // Initialize EmailJS for email notifications
    initializeEmailJS();

    const unsubscribe = subscribeTechEvents((updatedEvents) => {
      setEvents(updatedEvents);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const resetForm = () => {
    setFormData({
      title: '',
      details: '',
      place: '',
      venue: '',
      date: '',
      requirements: '',
      type: 'event',
      registrationLink: '',
      deadline: '',
      tags: '',
      priority: 'medium'
    });
    setPosterFile(null);
    setEditingEvent(null);
    setShowForm(false);
  };

  const handleEdit = (event: TechEvent) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      details: event.details,
      place: event.place,
      venue: event.venue,
      date: event.date.toISOString().slice(0, 16),
      requirements: event.requirements,
      type: event.type,
      registrationLink: event.registrationLink || '',
      deadline: event.deadline ? event.deadline.toISOString().slice(0, 16) : '',
      tags: event.tags.join(', '),
      priority: event.priority
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    // Add timeout to prevent getting stuck
    const timeoutId = setTimeout(() => {
      console.warn('⚠️ Form submission timeout, resetting...');
      setSubmitting(false);
      alert('Request is taking longer than expected. The event may have been created. Please refresh to check.');
    }, 10000); // 10 second timeout

    try {
      const eventData = {
        title: formData.title,
        details: formData.details,
        place: formData.place,
        venue: formData.venue,
        date: new Date(formData.date),
        requirements: formData.requirements,
        type: formData.type,
        registrationLink: formData.registrationLink || undefined,
        deadline: formData.deadline ? new Date(formData.deadline) : undefined,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        priority: formData.priority,
        createdBy: user.uid,
        isActive: true
      };

      if (editingEvent) {
        await updateTechEvent(editingEvent.id!, eventData, posterFile || undefined);
        clearTimeout(timeoutId);
        alert('Event updated successfully!');
      } else {
        await createTechEvent(eventData, posterFile || undefined);
        clearTimeout(timeoutId);
        alert(`🎉 Event "${eventData.title}" created successfully!\n\n📧 Notifications are being sent in the background.`);
      }

      setShowForm(false);
      resetForm();
    } catch (error) {
      clearTimeout(timeoutId);
      console.error('Error saving event:', error);
      alert('Error saving event. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (eventId: string) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        await deleteTechEvent(eventId);
        alert('Event deleted successfully!');
      } catch (error) {
        console.error('Error deleting event:', error);
        alert('Error deleting event. Please try again.');
      }
    }
  };

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

  const mainContentStyle: React.CSSProperties = {
    padding: '2rem',
    maxWidth: '1200px',
    margin: '0 auto'
  };

  if (showForm) {
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
                padding: '0.5rem'
              }}
              onClick={() => setShowForm(false)}
            >
              ←
            </button>
            <h1 style={{ margin: 0, color: '#333', fontSize: '1.5rem' }}>
              {editingEvent ? 'Edit Tech Event' : 'Create New Tech Event'}
            </h1>
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
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            borderRadius: '20px',
            padding: '2rem',
            boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
          }}>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                {/* Title */}
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#333' }}>
                    Event Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '2px solid #e5e7eb',
                      borderRadius: '10px',
                      fontSize: '1rem'
                    }}
                    placeholder="Enter event title"
                  />
                </div>

                {/* Type */}
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#333' }}>
                    Event Type *
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as TechEvent['type'] })}
                    required
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '2px solid #e5e7eb',
                      borderRadius: '10px',
                      fontSize: '1rem'
                    }}
                  >
                    <option value="event">Event</option>
                    <option value="hackathon">Hackathon</option>
                    <option value="internship">Internship</option>
                    <option value="tech-news">Tech News</option>
                  </select>
                </div>

                {/* Priority */}
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#333' }}>
                    Priority
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as TechEvent['priority'] })}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '2px solid #e5e7eb',
                      borderRadius: '10px',
                      fontSize: '1rem'
                    }}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                {/* Date */}
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#333' }}>
                    Event Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '2px solid #e5e7eb',
                      borderRadius: '10px',
                      fontSize: '1rem'
                    }}
                  />
                </div>

                {/* Deadline */}
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#333' }}>
                    Registration Deadline
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.deadline}
                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '2px solid #e5e7eb',
                      borderRadius: '10px',
                      fontSize: '1rem'
                    }}
                  />
                </div>

                {/* Venue */}
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#333' }}>
                    Venue *
                  </label>
                  <input
                    type="text"
                    value={formData.venue}
                    onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                    required
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '2px solid #e5e7eb',
                      borderRadius: '10px',
                      fontSize: '1rem'
                    }}
                    placeholder="e.g., Main Auditorium"
                  />
                </div>

                {/* Place */}
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#333' }}>
                    Place/Location *
                  </label>
                  <input
                    type="text"
                    value={formData.place}
                    onChange={(e) => setFormData({ ...formData, place: e.target.value })}
                    required
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '2px solid #e5e7eb',
                      borderRadius: '10px',
                      fontSize: '1rem'
                    }}
                    placeholder="e.g., University Campus, City"
                  />
                </div>

                {/* Registration Link */}
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#333' }}>
                    Registration Link
                  </label>
                  <input
                    type="url"
                    value={formData.registrationLink}
                    onChange={(e) => setFormData({ ...formData, registrationLink: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '2px solid #e5e7eb',
                      borderRadius: '10px',
                      fontSize: '1rem'
                    }}
                    placeholder="https://example.com/register"
                  />
                </div>
              </div>

              {/* Details */}
              <div style={{ marginTop: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#333' }}>
                  Event Details *
                </label>
                <textarea
                  value={formData.details}
                  onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                  required
                  rows={4}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '2px solid #e5e7eb',
                    borderRadius: '10px',
                    fontSize: '1rem',
                    resize: 'vertical'
                  }}
                  placeholder="Describe the event in detail..."
                />
              </div>

              {/* Requirements */}
              <div style={{ marginTop: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#333' }}>
                  Requirements *
                </label>
                <textarea
                  value={formData.requirements}
                  onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                  required
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '2px solid #e5e7eb',
                    borderRadius: '10px',
                    fontSize: '1rem',
                    resize: 'vertical'
                  }}
                  placeholder="List the requirements for participation..."
                />
              </div>

              {/* Tags */}
              <div style={{ marginTop: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#333' }}>
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '2px solid #e5e7eb',
                    borderRadius: '10px',
                    fontSize: '1rem'
                  }}
                  placeholder="e.g., AI, Machine Learning, Web Development"
                />
              </div>

              {/* Poster Upload */}
              <div style={{ marginTop: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#333' }}>
                  Event Poster
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setPosterFile(e.target.files?.[0] || null)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '2px solid #e5e7eb',
                    borderRadius: '10px',
                    fontSize: '1rem'
                  }}
                />
                {posterFile && (
                  <p style={{ marginTop: '0.5rem', color: '#666', fontSize: '0.9rem' }}>
                    Selected: {posterFile.name}
                  </p>
                )}
                {editingEvent?.posterUrl && !posterFile && (
                  <div style={{ marginTop: '0.5rem' }}>
                    <img
                      src={editingEvent.posterUrl}
                      alt="Current poster"
                      style={{ maxWidth: '200px', maxHeight: '200px', borderRadius: '10px' }}
                    />
                    <p style={{ color: '#666', fontSize: '0.9rem' }}>Current poster</p>
                  </div>
                )}
              </div>

              {/* Submit Buttons */}
              <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={resetForm}
                  style={{
                    padding: '0.75rem 1.5rem',
                    background: '#6b7280',
                    color: 'white',
                    border: 'none',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    fontWeight: '600'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    padding: '0.75rem 1.5rem',
                    background: submitting ? '#9ca3af' : '#10b981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '10px',
                    cursor: submitting ? 'not-allowed' : 'pointer',
                    fontWeight: '600'
                  }}
                >
                  {submitting ? 'Saving & Sending Notifications...' : editingEvent ? 'Update Event' : 'Create Event & Send Notifications'}
                </button>
              </div>
            </form>
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
              padding: '0.5rem'
            }}
            onClick={onBack}
          >
            ←
          </button>
          <h1 style={{ margin: 0, color: '#333', fontSize: '1.5rem' }}>🚀 Manage Tech Events</h1>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <button
            style={{
              background: '#10b981',
              color: 'white',
              border: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600'
            }}
            onClick={() => setShowForm(true)}
          >
            ➕ Create Event
          </button>
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
        </div>
      </header>

      <main style={mainContentStyle}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem', color: 'white' }}>⏳</div>
            <h2 style={{ color: 'white' }}>Loading events...</h2>
          </div>
        ) : events.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem', color: 'white' }}>📝</div>
            <h2 style={{ color: 'white' }}>No events created yet</h2>
            <p style={{ color: 'rgba(255,255,255,0.8)' }}>Create your first tech event to get started!</p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
            gap: '2rem'
          }}>
            {events.map((event) => (
              <div
                key={event.id}
                style={{
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: '20px',
                  padding: '1.5rem',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                  transition: 'transform 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-5px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                {/* Event Type Badge */}
                <div style={{
                  display: 'inline-block',
                  background: event.type === 'hackathon' ? '#ff6b6b' : 
                             event.type === 'internship' ? '#4ecdc4' :
                             event.type === 'event' ? '#45b7d1' : '#96ceb4',
                  color: 'white',
                  padding: '0.3rem 0.8rem',
                  borderRadius: '15px',
                  fontSize: '0.8rem',
                  fontWeight: '600',
                  marginBottom: '1rem'
                }}>
                  {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                </div>

                {/* Priority Badge */}
                {event.priority === 'high' && (
                  <div style={{
                    float: 'right',
                    background: '#ef4444',
                    color: 'white',
                    padding: '0.2rem 0.5rem',
                    borderRadius: '10px',
                    fontSize: '0.7rem',
                    fontWeight: '600'
                  }}>
                    🔥 HIGH
                  </div>
                )}

                {/* Event Poster */}
                {event.posterUrl && (
                  <div style={{ marginBottom: '1rem' }}>
                    <img
                      src={event.posterUrl}
                      alt={event.title}
                      style={{
                        width: '100%',
                        height: '150px',
                        objectFit: 'cover',
                        borderRadius: '10px'
                      }}
                    />
                  </div>
                )}

                {/* Event Title */}
                <h3 style={{
                  margin: '0 0 0.5rem 0',
                  color: '#333',
                  fontSize: '1.2rem',
                  fontWeight: '700'
                }}>
                  {event.title}
                </h3>

                {/* Event Meta */}
                <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '1rem' }}>
                  <div>📅 {event.date.toLocaleDateString()}</div>
                  <div>📍 {event.venue}, {event.place}</div>
                  {event.deadline && (
                    <div style={{ color: '#ef4444' }}>⏰ Deadline: {event.deadline.toLocaleDateString()}</div>
                  )}
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                  <button
                    onClick={() => handleEdit(event)}
                    style={{
                      flex: 1,
                      padding: '0.5rem',
                      background: '#3b82f6',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: '600',
                      fontSize: '0.9rem'
                    }}
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={() => handleDelete(event.id!)}
                    style={{
                      flex: 1,
                      padding: '0.5rem',
                      background: '#ef4444',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: '600',
                      fontSize: '0.9rem'
                    }}
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminTechEvents;
