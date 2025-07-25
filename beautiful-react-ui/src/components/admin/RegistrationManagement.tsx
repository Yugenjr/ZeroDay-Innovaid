import React, { useState, useEffect } from 'react';
import { 
  getAllRegistrations, 
  getEventRegistrations, 
  updateRegistrationStatus,
  EventRegistration 
} from '../../firebase/registrations';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
}

interface RegistrationManagementProps {
  user: User;
  onBack: () => void;
}

const RegistrationManagement: React.FC<RegistrationManagementProps> = ({ user, onBack }) => {
  const [registrations, setRegistrations] = useState<EventRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [message, setMessage] = useState('');
  const [processingId, setProcessingId] = useState<string>('');

  // Load all registrations
  const loadRegistrations = async () => {
    setLoading(true);
    try {
      const result = selectedEventId 
        ? await getEventRegistrations(selectedEventId)
        : await getAllRegistrations();
      
      if (result.success) {
        setRegistrations(result.registrations || []);
      } else {
        setMessage(`❌ ${result.message}`);
      }
    } catch (error) {
      console.error('Error loading registrations:', error);
      setMessage('❌ Failed to load registrations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRegistrations();
  }, [selectedEventId]);

  // Handle status update with admin notes
  const handleStatusUpdate = async (registrationId: string, status: 'approved' | 'rejected', adminNotes?: string) => {
    setProcessingId(registrationId);
    try {
      const result = await updateRegistrationStatus(registrationId, status, adminNotes);
      if (result.success) {
        setMessage(`✅ Registration ${status} successfully`);
        loadRegistrations(); // Refresh the list
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage(`❌ ${result.message}`);
      }
    } catch (error) {
      console.error('Error updating status:', error);
      setMessage('❌ Failed to update registration status');
    } finally {
      setProcessingId('');
    }
  };

  // Handle approval with optional notes
  const handleApprove = async (registrationId: string) => {
    const adminNotes = prompt('Add approval notes (optional):');
    await handleStatusUpdate(registrationId, 'approved', adminNotes || '');
  };

  // Handle rejection with required notes
  const handleReject = async (registrationId: string) => {
    const adminNotes = prompt('Please provide reason for rejection:');
    if (adminNotes && adminNotes.trim()) {
      await handleStatusUpdate(registrationId, 'rejected', adminNotes.trim());
    } else {
      setMessage('❌ Rejection reason is required');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  // Get unique event IDs for filter
  const uniqueEvents = Array.from(new Set(registrations.map(r => r.eventId)));

  const containerStyle: React.CSSProperties = {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: '20px',
    fontFamily: 'Arial, sans-serif'
  };

  const cardStyle: React.CSSProperties = {
    background: 'rgba(255, 255, 255, 0.95)',
    borderRadius: '15px',
    padding: '30px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    maxWidth: '1200px',
    margin: '0 auto'
  };

  const buttonStyle: React.CSSProperties = {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    transition: 'all 0.3s ease',
    marginRight: '10px'
  };

  const approveButtonStyle: React.CSSProperties = {
    ...buttonStyle,
    background: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)',
    padding: '8px 16px',
    fontSize: '12px'
  };

  const rejectButtonStyle: React.CSSProperties = {
    ...buttonStyle,
    background: 'linear-gradient(135deg, #f44336 0%, #da190b 100%)',
    padding: '8px 16px',
    fontSize: '12px'
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return '#4CAF50';
      case 'rejected': return '#f44336';
      case 'pending': return '#ff9800';
      default: return '#757575';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return '✅';
      case 'rejected': return '❌';
      case 'pending': return '⏳';
      default: return '❓';
    }
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <h2 style={{ margin: 0, color: '#333', fontSize: '28px', fontWeight: 'bold' }}>
            📝 Registration Management
          </h2>
          <button
            style={buttonStyle}
            onClick={onBack}
          >
            ← Back to Dashboard
          </button>
        </div>

        {message && (
          <div style={{
            padding: '15px',
            borderRadius: '8px',
            marginBottom: '20px',
            backgroundColor: message.includes('❌') ? '#ffebee' : '#e8f5e8',
            color: message.includes('❌') ? '#c62828' : '#2e7d32',
            border: `1px solid ${message.includes('❌') ? '#ffcdd2' : '#c8e6c8'}`
          }}>
            {message}
          </div>
        )}

        {/* Filter Section */}
        <div style={{ marginBottom: '20px', padding: '20px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
          <h3 style={{ margin: '0 0 15px 0', color: '#333' }}>Filter Registrations</h3>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <select
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              style={{
                padding: '10px',
                borderRadius: '5px',
                border: '1px solid #ddd',
                fontSize: '14px',
                minWidth: '200px'
              }}
            >
              <option value="">All Events</option>
              {uniqueEvents.map(eventId => {
                const event = registrations.find(r => r.eventId === eventId);
                return (
                  <option key={eventId} value={eventId}>
                    {event?.eventTitle || eventId}
                  </option>
                );
              })}
            </select>
            <button
              style={buttonStyle}
              onClick={loadRegistrations}
            >
              🔄 Refresh
            </button>
          </div>
        </div>

        {/* Statistics */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '15px', 
          marginBottom: '30px' 
        }}>
          <div style={{ 
            padding: '20px', 
            backgroundColor: '#e3f2fd', 
            borderRadius: '8px', 
            textAlign: 'center' 
          }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#1976d2' }}>Total Registrations</h3>
            <p style={{ fontSize: '24px', fontWeight: 'bold', margin: 0, color: '#1976d2' }}>
              {registrations.length}
            </p>
          </div>
          <div style={{ 
            padding: '20px', 
            backgroundColor: '#fff3e0', 
            borderRadius: '8px', 
            textAlign: 'center' 
          }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#f57c00' }}>Pending</h3>
            <p style={{ fontSize: '24px', fontWeight: 'bold', margin: 0, color: '#f57c00' }}>
              {registrations.filter(r => r.status === 'pending').length}
            </p>
          </div>
          <div style={{ 
            padding: '20px', 
            backgroundColor: '#e8f5e8', 
            borderRadius: '8px', 
            textAlign: 'center' 
          }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#388e3c' }}>Approved</h3>
            <p style={{ fontSize: '24px', fontWeight: 'bold', margin: 0, color: '#388e3c' }}>
              {registrations.filter(r => r.status === 'approved').length}
            </p>
          </div>
          <div style={{ 
            padding: '20px', 
            backgroundColor: '#ffebee', 
            borderRadius: '8px', 
            textAlign: 'center' 
          }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#d32f2f' }}>Rejected</h3>
            <p style={{ fontSize: '24px', fontWeight: 'bold', margin: 0, color: '#d32f2f' }}>
              {registrations.filter(r => r.status === 'rejected').length}
            </p>
          </div>
        </div>

        {/* Registrations List */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
            <div style={{ fontSize: '18px' }}>⏳ Loading registrations...</div>
          </div>
        ) : registrations.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
            <div style={{ fontSize: '18px' }}>📝 No registrations found</div>
            <p>Registrations will appear here when students register for events.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: 'white', borderRadius: '8px', overflow: 'hidden' }}>
              <thead>
                <tr style={{ backgroundColor: '#f5f5f5' }}>
                  <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Event</th>
                  <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Student</th>
                  <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Contact</th>
                  <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Date</th>
                  <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Status</th>
                  <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Notes</th>
                  <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {registrations.map((registration) => (
                  <tr key={registration.id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '15px' }}>
                      <div style={{ fontWeight: 'bold', color: '#333' }}>{registration.eventTitle}</div>
                      <div style={{ fontSize: '12px', color: '#666' }}>ID: {registration.eventId}</div>
                    </td>
                    <td style={{ padding: '15px' }}>
                      <div style={{ fontWeight: 'bold', color: '#333' }}>{registration.studentName}</div>
                      <div style={{ fontSize: '12px', color: '#666' }}>
                        {registration.studentId} • {registration.department} • Year {registration.year}
                      </div>
                    </td>
                    <td style={{ padding: '15px' }}>
                      <div style={{ fontSize: '14px', color: '#333' }}>{registration.studentEmail}</div>
                      {registration.phone && (
                        <div style={{ fontSize: '12px', color: '#666' }}>{registration.phone}</div>
                      )}
                    </td>
                    <td style={{ padding: '15px', fontSize: '14px', color: '#666' }}>
                      {new Date(registration.registrationDate).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '15px' }}>
                      <span style={{
                        padding: '6px 12px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        color: 'white',
                        backgroundColor: getStatusColor(registration.status)
                      }}>
                        {getStatusIcon(registration.status)} {registration.status.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ padding: '15px', maxWidth: '200px' }}>
                      {registration.adminNotes ? (
                        <div style={{
                          fontSize: '12px',
                          color: '#666',
                          wordWrap: 'break-word',
                          maxHeight: '60px',
                          overflow: 'auto'
                        }}>
                          {registration.adminNotes}
                        </div>
                      ) : (
                        <span style={{ fontSize: '12px', color: '#ccc', fontStyle: 'italic' }}>
                          No notes
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '15px' }}>
                      {registration.status === 'pending' && (
                        <div style={{ display: 'flex', gap: '5px' }}>
                          <button
                            style={approveButtonStyle}
                            onClick={() => handleApprove(registration.id!)}
                            disabled={processingId === registration.id}
                            title="Approve registration with optional notes"
                          >
                            {processingId === registration.id ? '⏳' : '✅'} Approve
                          </button>
                          <button
                            style={rejectButtonStyle}
                            onClick={() => handleReject(registration.id!)}
                            disabled={processingId === registration.id}
                            title="Reject registration with reason"
                          >
                            {processingId === registration.id ? '⏳' : '❌'} Reject
                          </button>
                        </div>
                      )}
                      {registration.status !== 'pending' && (
                        <span style={{ fontSize: '12px', color: '#666' }}>
                          {registration.status === 'approved' ? 'Approved' : 'Rejected'}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default RegistrationManagement;
