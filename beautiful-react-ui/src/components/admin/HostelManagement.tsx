import React, { useState } from 'react';

interface HostelComplaint {
  id: string;
  type: string;
  room: string;
  hostelBlock: string;
  description: string;
  status: 'pending' | 'in-progress' | 'resolved';
  date: string;
  raisedBy: string;
  assignedTo?: string;
  resolvedDate?: string;
  priority: 'low' | 'medium' | 'high';
}

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
}

interface HostelManagementProps {
  user: User;
  onBack: () => void;
  onLogout: () => void;
  complaints: HostelComplaint[];
}

const HostelManagement: React.FC<HostelManagementProps> = ({ user, onBack, onLogout, complaints: initialComplaints }) => {
  const [complaints, setComplaints] = useState<HostelComplaint[]>(
    initialComplaints.map(complaint => ({
      ...complaint,
      priority: complaint.priority || 'medium'
    }))
  );

  // Save complaints to localStorage whenever complaints change
  React.useEffect(() => {
    localStorage.setItem('hostelComplaints', JSON.stringify(complaints));
  }, [complaints]);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterBlock, setFilterBlock] = useState('');
  const [selectedComplaint, setSelectedComplaint] = useState<HostelComplaint | null>(null);

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
    maxWidth: '1400px',
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

  const filterStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1rem',
    marginBottom: '2rem'
  };

  const selectStyle: React.CSSProperties = {
    padding: '0.75rem',
    border: '2px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '1rem'
  };

  const complaintGridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
    gap: '1.5rem'
  };

  const complaintCardStyle: React.CSSProperties = {
    background: 'white',
    borderRadius: '15px',
    padding: '1.5rem',
    boxShadow: '0 5px 15px rgba(0,0,0,0.1)',
    border: '1px solid #e2e8f0',
    cursor: 'pointer',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease'
  };

  const statusBadgeStyle = (status: string): React.CSSProperties => {
    const colors = {
      'pending': '#f59e0b',
      'in-progress': '#3b82f6',
      'resolved': '#10b981'
    };
    
    return {
      background: colors[status as keyof typeof colors] || '#6b7280',
      color: 'white',
      padding: '0.25rem 0.75rem',
      borderRadius: '20px',
      fontSize: '0.75rem',
      fontWeight: '600'
    };
  };

  const priorityBadgeStyle = (priority: string): React.CSSProperties => {
    const colors = {
      'low': '#10b981',
      'medium': '#f59e0b',
      'high': '#ef4444'
    };
    
    return {
      background: colors[priority as keyof typeof colors] || '#6b7280',
      color: 'white',
      padding: '0.25rem 0.75rem',
      borderRadius: '20px',
      fontSize: '0.75rem',
      fontWeight: '600'
    };
  };

  const buttonStyle: React.CSSProperties = {
    padding: '0.5rem 1rem',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.875rem',
    fontWeight: '600',
    margin: '0.25rem'
  };

  const complaintTypes = [...new Set(complaints.map(complaint => complaint.type))];
  const hostelBlocks = [...new Set(complaints.map(complaint => complaint.hostelBlock))];
  const statuses = ['pending', 'in-progress', 'resolved'];

  const filteredComplaints = complaints.filter(complaint => {
    const matchesStatus = !filterStatus || complaint.status === filterStatus;
    const matchesType = !filterType || complaint.type === filterType;
    const matchesBlock = !filterBlock || complaint.hostelBlock === filterBlock;
    
    return matchesStatus && matchesType && matchesBlock;
  });

  const handleStatusChange = (complaintId: string, newStatus: 'pending' | 'in-progress' | 'resolved') => {
    setComplaints(complaints.map(complaint => {
      if (complaint.id === complaintId) {
        const updatedComplaint = { 
          ...complaint, 
          status: newStatus,
          assignedTo: newStatus === 'in-progress' ? user.name : complaint.assignedTo,
          resolvedDate: newStatus === 'resolved' ? new Date().toISOString() : complaint.resolvedDate
        };
        return updatedComplaint;
      }
      return complaint;
    }));
  };

  const handlePriorityChange = (complaintId: string, newPriority: 'low' | 'medium' | 'high') => {
    setComplaints(complaints.map(complaint => 
      complaint.id === complaintId ? { ...complaint, priority: newPriority } : complaint
    ));
  };

  const handleDeleteComplaint = (complaintId: string) => {
    if (window.confirm('Are you sure you want to delete this complaint?')) {
      const updatedComplaints = complaints.filter(complaint => complaint.id !== complaintId);
      setComplaints(updatedComplaints);
      localStorage.setItem('hostelComplaints', JSON.stringify(updatedComplaints));
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStats = () => {
    const total = complaints.length;
    const pending = complaints.filter(c => c.status === 'pending').length;
    const inProgress = complaints.filter(c => c.status === 'in-progress').length;
    const resolved = complaints.filter(c => c.status === 'resolved').length;
    const highPriority = complaints.filter(c => c.priority === 'high' && c.status !== 'resolved').length;
    
    return { total, pending, inProgress, resolved, highPriority };
  };

  const stats = getStats();

  return (
    <div style={containerStyle}>
      <header style={headerStyle}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <button style={backButtonStyle} onClick={onBack}>
            ← Back to Dashboard
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.5rem', fontWeight: '800', color: '#333' }}>
            <span style={{ fontSize: '2rem' }}>🏠</span>
            Hostel Complaint Management
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
        {/* Statistics Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          <div style={{ ...cardStyle, padding: '1.5rem', textAlign: 'center' }}>
            <h3 style={{ fontSize: '2rem', margin: '0 0 0.5rem 0', color: '#333' }}>{stats.total}</h3>
            <p style={{ margin: 0, color: '#666' }}>Total Complaints</p>
          </div>
          <div style={{ ...cardStyle, padding: '1.5rem', textAlign: 'center' }}>
            <h3 style={{ fontSize: '2rem', margin: '0 0 0.5rem 0', color: '#f59e0b' }}>{stats.pending}</h3>
            <p style={{ margin: 0, color: '#666' }}>Pending</p>
          </div>
          <div style={{ ...cardStyle, padding: '1.5rem', textAlign: 'center' }}>
            <h3 style={{ fontSize: '2rem', margin: '0 0 0.5rem 0', color: '#3b82f6' }}>{stats.inProgress}</h3>
            <p style={{ margin: 0, color: '#666' }}>In Progress</p>
          </div>
          <div style={{ ...cardStyle, padding: '1.5rem', textAlign: 'center' }}>
            <h3 style={{ fontSize: '2rem', margin: '0 0 0.5rem 0', color: '#10b981' }}>{stats.resolved}</h3>
            <p style={{ margin: 0, color: '#666' }}>Resolved</p>
          </div>
          <div style={{ ...cardStyle, padding: '1.5rem', textAlign: 'center' }}>
            <h3 style={{ fontSize: '2rem', margin: '0 0 0.5rem 0', color: '#ef4444' }}>{stats.highPriority}</h3>
            <p style={{ margin: 0, color: '#666' }}>High Priority</p>
          </div>
        </div>

        <div style={cardStyle}>
          <h2 style={{ margin: '0 0 1.5rem 0', color: '#333', fontSize: '1.5rem' }}>
            Hostel Complaints ({filteredComplaints.length})
          </h2>
          
          <div style={filterStyle}>
            <select
              style={selectStyle}
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="">All Statuses</option>
              {statuses.map(status => (
                <option key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
                </option>
              ))}
            </select>
            
            <select
              style={selectStyle}
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="">All Types</option>
              {complaintTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            
            <select
              style={selectStyle}
              value={filterBlock}
              onChange={(e) => setFilterBlock(e.target.value)}
            >
              <option value="">All Blocks</option>
              {hostelBlocks.map(block => (
                <option key={block} value={block}>Block {block}</option>
              ))}
            </select>
          </div>

          <div style={complaintGridStyle}>
            {filteredComplaints.map(complaint => (
              <div
                key={complaint.id}
                style={complaintCardStyle}
                onClick={() => setSelectedComplaint(complaint)}
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
                    <span style={statusBadgeStyle(complaint.status)}>
                      {complaint.status.toUpperCase().replace('-', ' ')}
                    </span>
                    <span style={{ ...priorityBadgeStyle(complaint.priority), marginLeft: '0.5rem' }}>
                      {complaint.priority.toUpperCase()} PRIORITY
                    </span>
                  </div>
                  <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                    {formatDate(complaint.date)}
                  </span>
                </div>
                
                <h3 style={{ margin: '0 0 0.5rem 0', color: '#333', fontSize: '1.1rem' }}>
                  {complaint.type} Issue
                </h3>
                
                <p style={{ margin: '0 0 0.5rem 0', color: '#6b7280', fontSize: '0.875rem' }}>
                  <strong>Room:</strong> {complaint.room} (Block {complaint.hostelBlock})
                </p>
                
                <p style={{ margin: '0 0 1rem 0', color: '#4b5563', fontSize: '0.875rem' }}>
                  {complaint.description.length > 100 
                    ? `${complaint.description.substring(0, 100)}...` 
                    : complaint.description
                  }
                </p>
                
                <p style={{ margin: '0 0 1rem 0', color: '#6b7280', fontSize: '0.875rem' }}>
                  <strong>Raised by:</strong> {complaint.raisedBy}
                </p>
                
                {complaint.assignedTo && (
                  <p style={{ margin: '0 0 1rem 0', color: '#6b7280', fontSize: '0.875rem' }}>
                    <strong>Assigned to:</strong> {complaint.assignedTo}
                  </p>
                )}
                
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {complaint.status === 'pending' && (
                    <button
                      style={{ ...buttonStyle, background: '#3b82f6', color: 'white' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStatusChange(complaint.id, 'in-progress');
                      }}
                    >
                      Start Work
                    </button>
                  )}
                  {complaint.status === 'in-progress' && (
                    <button
                      style={{ ...buttonStyle, background: '#10b981', color: 'white' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStatusChange(complaint.id, 'resolved');
                      }}
                    >
                      Mark Resolved
                    </button>
                  )}
                  <button
                    style={{ ...buttonStyle, background: '#ef4444', color: 'white' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteComplaint(complaint.id);
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          {filteredComplaints.length === 0 && (
            <div style={{
              textAlign: 'center',
              padding: '3rem',
              color: '#6b7280'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏠</div>
              <h3 style={{ margin: '0 0 0.5rem 0' }}>No complaints found</h3>
              <p style={{ margin: 0 }}>No complaints match your current filters.</p>
            </div>
          )}
        </div>

        {/* Complaint Details Modal */}
        {selectedComplaint && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}>
            <div style={{
              background: 'white',
              borderRadius: '20px',
              padding: '2rem',
              maxWidth: '600px',
              width: '90%',
              maxHeight: '80vh',
              overflowY: 'auto'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <h3 style={{ margin: 0, color: '#333' }}>{selectedComplaint.type} Complaint</h3>
                <button
                  style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}
                  onClick={() => setSelectedComplaint(null)}
                >
                  ✕
                </button>
              </div>
              
              <div style={{ marginBottom: '1rem' }}>
                <span style={statusBadgeStyle(selectedComplaint.status)}>
                  {selectedComplaint.status.toUpperCase().replace('-', ' ')}
                </span>
                <span style={{ ...priorityBadgeStyle(selectedComplaint.priority), marginLeft: '0.5rem' }}>
                  {selectedComplaint.priority.toUpperCase()} PRIORITY
                </span>
              </div>
              
              <div style={{ marginBottom: '1rem' }}>
                <strong>Room:</strong> {selectedComplaint.room} (Block {selectedComplaint.hostelBlock})
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <strong>Date Reported:</strong> {formatDate(selectedComplaint.date)}
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <strong>Raised by:</strong> {selectedComplaint.raisedBy}
              </div>
              {selectedComplaint.assignedTo && (
                <div style={{ marginBottom: '1rem' }}>
                  <strong>Assigned to:</strong> {selectedComplaint.assignedTo}
                </div>
              )}
              {selectedComplaint.resolvedDate && (
                <div style={{ marginBottom: '1rem' }}>
                  <strong>Resolved on:</strong> {formatDate(selectedComplaint.resolvedDate)}
                </div>
              )}
              <div style={{ marginBottom: '2rem' }}>
                <strong>Description:</strong>
                <p style={{ margin: '0.5rem 0 0 0', color: '#4b5563' }}>{selectedComplaint.description}</p>
              </div>
              
              <div style={{ marginBottom: '2rem' }}>
                <strong>Change Priority:</strong>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                  {['low', 'medium', 'high'].map(priority => (
                    <button
                      key={priority}
                      style={{
                        ...buttonStyle,
                        background: selectedComplaint.priority === priority ? '#667eea' : '#e2e8f0',
                        color: selectedComplaint.priority === priority ? 'white' : '#333'
                      }}
                      onClick={() => handlePriorityChange(selectedComplaint.id, priority as 'low' | 'medium' | 'high')}
                    >
                      {priority.charAt(0).toUpperCase() + priority.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                {selectedComplaint.status === 'pending' && (
                  <button
                    style={{ ...buttonStyle, background: '#3b82f6', color: 'white' }}
                    onClick={() => {
                      handleStatusChange(selectedComplaint.id, 'in-progress');
                      setSelectedComplaint(null);
                    }}
                  >
                    Start Work
                  </button>
                )}
                {selectedComplaint.status === 'in-progress' && (
                  <button
                    style={{ ...buttonStyle, background: '#10b981', color: 'white' }}
                    onClick={() => {
                      handleStatusChange(selectedComplaint.id, 'resolved');
                      setSelectedComplaint(null);
                    }}
                  >
                    Mark Resolved
                  </button>
                )}
                <button
                  style={{ ...buttonStyle, background: '#6b7280', color: 'white' }}
                  onClick={() => setSelectedComplaint(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default HostelManagement;
