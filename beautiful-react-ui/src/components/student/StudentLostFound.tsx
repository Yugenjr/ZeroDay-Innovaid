import React, { useState, useEffect } from 'react';
// @ts-ignore
import { createLostFoundItem, getApprovedLostFoundItems, getStudentLostFoundItems, LostFoundItem } from '../../firebase/lostFound';

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

interface StudentLostFoundProps {
  user: User;
  onBack: () => void;
  onLogout: () => void;
  isDarkMode: boolean;
}

const StudentLostFound: React.FC<StudentLostFoundProps> = ({ user, onBack, onLogout, isDarkMode }) => {
  const [items, setItems] = useState<LostFoundItem[]>([]);
  const [myItems, setMyItems] = useState<LostFoundItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'lost' | 'found'>('all');
  const [filterCategory, setFilterCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showReportForm, setShowReportForm] = useState(false);
  const [reportType, setReportType] = useState<'lost' | 'found'>('lost');
  const [newItem, setNewItem] = useState({
    itemName: '',
    category: 'Electronics',
    location: '',
    description: ''
  });

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load approved items for public viewing
      const approvedResult = await getApprovedLostFoundItems();
      if (approvedResult.success) {
        setItems(approvedResult.items);
      }

      // Load student's own items
      if (user.studentId) {
        const studentResult = await getStudentLostFoundItems(user.studentId);
        if (studentResult.success) {
          setMyItems(studentResult.items);
        }
      }
    } catch (error) {
      console.error('Error loading lost & found data:', error);
      setMessage('❌ Failed to load data');
    } finally {
      setLoading(false);
    }
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
    background: isDarkMode
      ? 'rgba(42, 42, 74, 0.95)'
      : 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(10px)',
    borderRadius: '20px',
    padding: '2rem',
    marginBottom: '2rem',
    boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
    transition: 'background 0.3s ease'
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

  const itemGridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
    gap: '1.5rem'
  };

  const itemCardStyle: React.CSSProperties = {
    background: isDarkMode ? 'rgba(51, 51, 51, 0.8)' : 'white',
    borderRadius: '15px',
    padding: '1.5rem',
    boxShadow: '0 5px 15px rgba(0,0,0,0.1)',
    border: `1px solid ${isDarkMode ? '#555' : '#e2e8f0'}`,
    transition: 'transform 0.2s ease, box-shadow 0.2s ease, background 0.3s ease, border 0.3s ease'
  };

  const typeBadgeStyle = (type: string): React.CSSProperties => ({
    background: type === 'lost' ? '#ef4444' : '#10b981',
    color: 'white',
    padding: '0.25rem 0.75rem',
    borderRadius: '20px',
    fontSize: '0.75rem',
    fontWeight: '600'
  });

  const statusBadgeStyle = (status: string): React.CSSProperties => {
    const colors = {
      'pending': '#f59e0b',
      'approved': '#3b82f6',
      'claimed': '#10b981',
      'resolved': '#6b7280',
      'rejected': '#ef4444'
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

  const categories = ['Electronics', 'Books', 'Bag', 'Accessories', 'ID/Card', 'Clothing', 'Other'];

  const filteredItems = items.filter(item => {
    const matchesType = filterType === 'all' || item.type === filterType;
    const matchesCategory = !filterCategory || item.category === filterCategory;
    const matchesSearch = !searchTerm || 
      item.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesType && matchesCategory && matchesSearch;
  });

  const handleReportItem = async () => {
    if (!newItem.itemName || !newItem.location || !newItem.description) {
      setMessage('❌ Please fill in all required fields');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    if (!user.studentId) {
      setMessage('❌ Student ID not found');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    setSubmitting(true);
    setMessage('');

    try {
      const itemData = {
        type: reportType,
        itemName: newItem.itemName,
        category: newItem.category,
        location: newItem.location,
        description: newItem.description,
        date: new Date().toISOString(),
        reportedBy: user.name,
        studentId: user.studentId,
        studentEmail: user.email,
        status: 'pending' as const
      };

      const result = await createLostFoundItem(itemData);

      if (result.success) {
        setMessage('✅ Item reported successfully! Awaiting admin approval.');
        setNewItem({ itemName: '', category: 'Electronics', location: '', description: '' });
        setShowReportForm(false);

        // Refresh data
        loadData();

        setTimeout(() => setMessage(''), 5000);
      } else {
        setMessage(`❌ ${result.message}`);
        setTimeout(() => setMessage(''), 5000);
      }
    } catch (error) {
      console.error('Error reporting item:', error);
      setMessage('❌ Failed to report item. Please try again.');
      setTimeout(() => setMessage(''), 5000);
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div style={containerStyle}>
      <header style={headerStyle}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <button style={backButtonStyle} onClick={onBack}>
            ← Back to Dashboard
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.5rem', fontWeight: '800', color: isDarkMode ? '#fff' : '#333', transition: 'color 0.3s ease' }}>
            <span style={{ fontSize: '2rem' }}>🔍</span>
            Lost & Found
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
        {/* Message Display */}
        {message && (
          <div style={{
            background: message.includes('✅') ? '#d1fae5' : '#fee2e2',
            color: message.includes('✅') ? '#065f46' : '#dc2626',
            padding: '1rem',
            borderRadius: '8px',
            marginBottom: '1rem',
            border: `1px solid ${message.includes('✅') ? '#a7f3d0' : '#fecaca'}`
          }}>
            {message}
          </div>
        )}

        <div style={cardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h2 style={{ margin: 0, color: isDarkMode ? '#fff' : '#333', fontSize: '1.5rem', transition: 'color 0.3s ease' }}>
              Lost & Found Items ({loading ? '...' : filteredItems.length})
            </h2>
            <button
              style={buttonStyle}
              onClick={() => setShowReportForm(!showReportForm)}
              disabled={submitting}
            >
              {showReportForm ? '✕ Cancel' : '+ Report Item'}
            </button>
          </div>

          {showReportForm && (
            <div style={{
              background: '#f8fafc',
              borderRadius: '15px',
              padding: '2rem',
              marginBottom: '2rem',
              border: '2px solid #e2e8f0'
            }}>
              <h3 style={{ margin: '0 0 1.5rem 0', color: isDarkMode ? '#fff' : '#333', transition: 'color 0.3s ease' }}>Report Lost/Found Item</h3>
              
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                <button
                  style={{
                    ...buttonStyle,
                    background: reportType === 'lost' ? '#ef4444' : '#e2e8f0',
                    color: reportType === 'lost' ? 'white' : '#333'
                  }}
                  onClick={() => setReportType('lost')}
                >
                  📢 I Lost Something
                </button>
                <button
                  style={{
                    ...buttonStyle,
                    background: reportType === 'found' ? '#10b981' : '#e2e8f0',
                    color: reportType === 'found' ? 'white' : '#333'
                  }}
                  onClick={() => setReportType('found')}
                >
                  🎯 I Found Something
                </button>
              </div>
              
              <input
                style={inputStyle}
                type="text"
                placeholder="Item Name *"
                value={newItem.itemName}
                onChange={(e) => setNewItem({ ...newItem, itemName: e.target.value })}
              />
              
              <select
                style={inputStyle}
                value={newItem.category}
                onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              
              <input
                style={inputStyle}
                type="text"
                placeholder="Location *"
                value={newItem.location}
                onChange={(e) => setNewItem({ ...newItem, location: e.target.value })}
              />
              
              <textarea
                style={{ ...inputStyle, minHeight: '100px', resize: 'vertical' as const }}
                placeholder="Description *"
                value={newItem.description}
                onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
              />
              
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button
                  style={{
                    ...buttonStyle,
                    opacity: submitting ? 0.7 : 1,
                    cursor: submitting ? 'not-allowed' : 'pointer'
                  }}
                  onClick={handleReportItem}
                  disabled={submitting}
                >
                  {submitting ? '⏳ Submitting...' : '📝 Submit Report'}
                </button>
                <button
                  style={{ ...buttonStyle, background: '#6b7280' }}
                  onClick={() => setShowReportForm(false)}
                  disabled={submitting}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          <div style={{ marginBottom: '2rem' }}>
            <input
              style={inputStyle}
              type="text"
              placeholder="Search items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
              <select
                style={{ padding: '0.75rem', border: '2px solid #e2e8f0', borderRadius: '8px', fontSize: '1rem' }}
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as 'all' | 'lost' | 'found')}
              >
                <option value="all">All Items</option>
                <option value="lost">Lost Items</option>
                <option value="found">Found Items</option>
              </select>
              
              <select
                style={{ padding: '0.75rem', border: '2px solid #e2e8f0', borderRadius: '8px', fontSize: '1rem' }}
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={itemGridStyle}>
            {filteredItems.map(item => (
              <div
                key={item.id}
                style={itemCardStyle}
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
                    <span style={typeBadgeStyle(item.type)}>
                      {item.type.toUpperCase()}
                    </span>
                    <span style={{ ...statusBadgeStyle(item.status), marginLeft: '0.5rem' }}>
                      {item.status.toUpperCase()}
                    </span>
                  </div>
                  <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                    {formatDate(item.date)}
                  </span>
                </div>
                
                <h3 style={{ margin: '0 0 0.5rem 0', color: '#333', fontSize: '1.1rem' }}>
                  {item.itemName}
                </h3>
                
                <p style={{ margin: '0 0 0.5rem 0', color: '#6b7280', fontSize: '0.875rem' }}>
                  <strong>Category:</strong> {item.category}
                </p>
                
                <p style={{ margin: '0 0 0.5rem 0', color: '#6b7280', fontSize: '0.875rem' }}>
                  <strong>Location:</strong> {item.location}
                </p>
                
                <p style={{ margin: '0 0 1rem 0', color: '#4b5563', fontSize: '0.875rem' }}>
                  {item.description}
                </p>
                
                <p style={{ margin: '0 0 0.5rem 0', color: '#6b7280', fontSize: '0.875rem' }}>
                  <strong>Reported by:</strong> {item.reportedBy}
                </p>

                {(item.status === 'approved' || item.status === 'claimed' || item.status === 'resolved') && item.studentEmail && (
                  <div style={{
                    background: '#f0f9ff',
                    border: '1px solid #0ea5e9',
                    borderRadius: '8px',
                    padding: '0.75rem',
                    fontSize: '0.85rem',
                    color: '#0369a1',
                    marginTop: '1rem'
                  }}>
                    💡 <strong>Contact:</strong> {item.studentEmail}
                    {item.status === 'resolved' && <span style={{ color: '#059669', fontWeight: 'bold' }}> (FOUND!)</span>}
                    {item.status === 'claimed' && <span style={{ color: '#059669', fontWeight: 'bold' }}> (CLAIMED!)</span>}
                  </div>
                )}
              </div>
            ))}
          </div>
          
          {filteredItems.length === 0 && (
            <div style={{
              textAlign: 'center',
              padding: '3rem',
              color: '#6b7280'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
              <h3 style={{ margin: '0 0 0.5rem 0' }}>No items found</h3>
              <p style={{ margin: 0 }}>No items match your search criteria.</p>
            </div>
          )}
        </div>

        {/* My Items Section */}
        {myItems.length > 0 && (
          <div style={{ ...cardStyle, marginTop: '2rem' }}>
            <h2 style={{ margin: '0 0 1.5rem 0', color: '#333', fontSize: '1.5rem' }}>
              My Reported Items ({myItems.length})
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
              {myItems.map((item) => (
                <div
                  key={item.id}
                  style={{
                    background: 'white',
                    padding: '1.5rem',
                    borderRadius: '12px',
                    boxShadow: '0 5px 15px rgba(0,0,0,0.1)',
                    border: '1px solid #e5e7eb',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <div>
                      <span style={typeBadgeStyle(item.type)}>
                        {item.type.toUpperCase()}
                      </span>
                      <span style={{ ...statusBadgeStyle(item.status), marginLeft: '0.5rem' }}>
                        {item.status.toUpperCase()}
                      </span>
                    </div>
                    <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                      {formatDate(item.date)}
                    </span>
                  </div>

                  <h3 style={{ margin: '0 0 0.5rem 0', color: '#333', fontSize: '1.1rem' }}>
                    {item.itemName}
                  </h3>

                  <p style={{ margin: '0 0 0.5rem 0', color: '#6b7280', fontSize: '0.875rem' }}>
                    <strong>Category:</strong> {item.category}
                  </p>

                  <p style={{ margin: '0 0 0.5rem 0', color: '#6b7280', fontSize: '0.875rem' }}>
                    <strong>Location:</strong> {item.location}
                  </p>

                  <p style={{ margin: '0 0 1rem 0', color: '#4b5563', fontSize: '0.875rem' }}>
                    {item.description}
                  </p>

                  {item.adminNotes && (
                    <div style={{
                      background: '#f3f4f6',
                      padding: '0.75rem',
                      borderRadius: '6px',
                      marginTop: '1rem'
                    }}>
                      <p style={{ margin: '0', color: '#374151', fontSize: '0.875rem' }}>
                        <strong>Admin Notes:</strong> {item.adminNotes}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default StudentLostFound;
