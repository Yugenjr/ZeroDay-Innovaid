import React, { useState, useEffect } from 'react';
// @ts-ignore
import { getAllLostFoundItems, updateLostFoundItemStatus, deleteLostFoundItem, LostFoundItem } from '../../firebase/lostFound';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
}

interface LostFoundManagementProps {
  user: User;
  onBack: () => void;
  onLogout: () => void;
}

const LostFoundManagement: React.FC<LostFoundManagementProps> = ({ user, onBack, onLogout }) => {
  const [items, setItems] = useState<LostFoundItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'lost' | 'found'>('all');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [selectedItem, setSelectedItem] = useState<LostFoundItem | null>(null);

  // Load data on component mount
  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    setLoading(true);
    try {
      const result = await getAllLostFoundItems();
      if (result.success) {
        setItems(result.items);
      } else {
        console.error('Failed to load items:', result.message);
      }
    } catch (error) {
      console.error('Error loading items:', error);
    } finally {
      setLoading(false);
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

  const itemGridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
    gap: '1.5rem'
  };

  const itemCardStyle: React.CSSProperties = {
    background: 'white',
    borderRadius: '15px',
    padding: '1.5rem',
    boxShadow: '0 5px 15px rgba(0,0,0,0.1)',
    border: '1px solid #e2e8f0',
    cursor: 'pointer',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease'
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
      'claimed': '#10b981',
      'resolved': '#6b7280'
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

  const buttonStyle: React.CSSProperties = {
    padding: '0.5rem 1rem',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.875rem',
    fontWeight: '600',
    margin: '0.25rem'
  };

  const categories = [...new Set(items.map(item => item.category))];
  const statuses = ['pending', 'claimed', 'resolved'];

  const filteredItems = items.filter(item => {
    const matchesType = filterType === 'all' || item.type === filterType;
    const matchesStatus = !filterStatus || item.status === filterStatus;
    const matchesCategory = !filterCategory || item.category === filterCategory;
    
    return matchesType && matchesStatus && matchesCategory;
  });

  const handleStatusChange = async (itemId: string, newStatus: string) => {
    setUpdating(itemId);
    try {
      const result = await updateLostFoundItemStatus(itemId, newStatus as any, user.name);
      if (result.success) {
        // Reload items to get updated data
        await loadItems();
        console.log('✅ Status updated successfully');
      } else {
        console.error('Failed to update status:', result.message);
        alert('Failed to update status. Please try again.');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Error updating status. Please try again.');
    } finally {
      setUpdating(null);
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (window.confirm('Are you sure you want to delete this item? This action cannot be undone.')) {
      setUpdating(itemId);
      try {
        const result = await deleteLostFoundItem(itemId);
        if (result.success) {
          // Reload items to get updated data
          await loadItems();
          console.log('✅ Item deleted successfully');
        } else {
          console.error('Failed to delete item:', result.message);
          alert('Failed to delete item. Please try again.');
        }
      } catch (error) {
        console.error('Error deleting item:', error);
        alert('Error deleting item. Please try again.');
      } finally {
        setUpdating(null);
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStats = () => {
    const total = items.length;
    const lost = items.filter(item => item.type === 'lost').length;
    const found = items.filter(item => item.type === 'found').length;
    const pending = items.filter(item => item.status === 'pending').length;
    const resolved = items.filter(item => item.status === 'resolved' || item.status === 'claimed').length;
    
    return { total, lost, found, pending, resolved };
  };

  const stats = getStats();

  if (loading) {
    return (
      <div style={containerStyle}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <div style={{ textAlign: 'center', color: 'white' }}>
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🔄</div>
            <div>Loading lost and found items...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <header style={headerStyle}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <button style={backButtonStyle} onClick={onBack}>
            ← Back to Dashboard
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.5rem', fontWeight: '800', color: '#333' }}>
            <span style={{ fontSize: '2rem' }}>🔍</span>
            Lost & Found Management
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
            <p style={{ margin: 0, color: '#666' }}>Total Items</p>
          </div>
          <div style={{ ...cardStyle, padding: '1.5rem', textAlign: 'center' }}>
            <h3 style={{ fontSize: '2rem', margin: '0 0 0.5rem 0', color: '#ef4444' }}>{stats.lost}</h3>
            <p style={{ margin: 0, color: '#666' }}>Lost Items</p>
          </div>
          <div style={{ ...cardStyle, padding: '1.5rem', textAlign: 'center' }}>
            <h3 style={{ fontSize: '2rem', margin: '0 0 0.5rem 0', color: '#10b981' }}>{stats.found}</h3>
            <p style={{ margin: 0, color: '#666' }}>Found Items</p>
          </div>
          <div style={{ ...cardStyle, padding: '1.5rem', textAlign: 'center' }}>
            <h3 style={{ fontSize: '2rem', margin: '0 0 0.5rem 0', color: '#f59e0b' }}>{stats.pending}</h3>
            <p style={{ margin: 0, color: '#666' }}>Pending</p>
          </div>
          <div style={{ ...cardStyle, padding: '1.5rem', textAlign: 'center' }}>
            <h3 style={{ fontSize: '2rem', margin: '0 0 0.5rem 0', color: '#6b7280' }}>{stats.resolved}</h3>
            <p style={{ margin: 0, color: '#666' }}>Resolved</p>
          </div>
        </div>

        <div style={cardStyle}>
          <h2 style={{ margin: '0 0 1.5rem 0', color: '#333', fontSize: '1.5rem' }}>
            Manage Lost & Found Items ({filteredItems.length})
          </h2>
          
          <div style={filterStyle}>
            <select
              style={selectStyle}
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as 'all' | 'lost' | 'found')}
            >
              <option value="all">All Items</option>
              <option value="lost">Lost Items Only</option>
              <option value="found">Found Items Only</option>
            </select>
            
            <select
              style={selectStyle}
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="">All Statuses</option>
              {statuses.map(status => (
                <option key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </select>
            
            <select
              style={selectStyle}
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          <div style={itemGridStyle}>
            {filteredItems.map(item => (
              <div
                key={item.id}
                style={itemCardStyle}
                onClick={() => setSelectedItem(item)}
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
                  {item.description.length > 100 
                    ? `${item.description.substring(0, 100)}...` 
                    : item.description
                  }
                </p>
                
                <p style={{ margin: '0 0 1rem 0', color: '#6b7280', fontSize: '0.875rem' }}>
                  <strong>Reported by:</strong> {item.reportedBy}
                </p>
                
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {item.status === 'pending' && (
                    <>
                      <button
                        style={{
                          ...buttonStyle,
                          background: updating === item.id ? '#6b7280' : '#10b981',
                          color: 'white',
                          opacity: updating === item.id ? 0.7 : 1
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (item.id) handleStatusChange(item.id, item.type === 'lost' ? 'resolved' : 'claimed');
                        }}
                        disabled={updating === item.id}
                      >
                        {updating === item.id ? '⏳ Updating...' : (item.type === 'lost' ? 'Mark Found' : 'Mark Claimed')}
                      </button>
                    </>
                  )}
                  <button
                    style={{
                      ...buttonStyle,
                      background: updating === item.id ? '#6b7280' : '#ef4444',
                      color: 'white',
                      opacity: updating === item.id ? 0.7 : 1
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (item.id) handleDeleteItem(item.id);
                    }}
                    disabled={updating === item.id}
                  >
                    {updating === item.id ? '⏳ Deleting...' : 'Delete'}
                  </button>
                </div>
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
              <p style={{ margin: 0 }}>No items match your current filters.</p>
            </div>
          )}
        </div>

        {/* Item Details Modal */}
        {selectedItem && (
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
                <h3 style={{ margin: 0, color: '#333' }}>{selectedItem.itemName}</h3>
                <button
                  style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}
                  onClick={() => setSelectedItem(null)}
                >
                  ✕
                </button>
              </div>
              
              <div style={{ marginBottom: '1rem' }}>
                <span style={typeBadgeStyle(selectedItem.type)}>
                  {selectedItem.type.toUpperCase()}
                </span>
                <span style={{ ...statusBadgeStyle(selectedItem.status), marginLeft: '0.5rem' }}>
                  {selectedItem.status.toUpperCase()}
                </span>
              </div>
              
              <div style={{ marginBottom: '1rem' }}>
                <strong>Category:</strong> {selectedItem.category}
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <strong>Location:</strong> {selectedItem.location}
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <strong>Date:</strong> {formatDate(selectedItem.date)}
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <strong>Reported by:</strong> {selectedItem.reportedBy}
              </div>
              <div style={{ marginBottom: '2rem' }}>
                <strong>Description:</strong>
                <p style={{ margin: '0.5rem 0 0 0', color: '#4b5563' }}>{selectedItem.description}</p>
              </div>
              
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                {selectedItem.status === 'pending' && (
                  <button
                    style={{ ...buttonStyle, background: '#10b981', color: 'white' }}
                    onClick={() => {
                      if (selectedItem.id) {
                        handleStatusChange(selectedItem.id, selectedItem.type === 'lost' ? 'resolved' : 'claimed');
                        setSelectedItem(null);
                      }
                    }}
                  >
                    {selectedItem.type === 'lost' ? 'Mark as Found' : 'Mark as Claimed'}
                  </button>
                )}
                <button
                  style={{ ...buttonStyle, background: '#6b7280', color: 'white' }}
                  onClick={() => setSelectedItem(null)}
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

export default LostFoundManagement;
