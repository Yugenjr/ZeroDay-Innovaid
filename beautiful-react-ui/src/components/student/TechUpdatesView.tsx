import React, { useState, useEffect } from 'react';
import { User } from '../../types/User';
import {
  TechUpdate,
  UserNotification,
  getActiveTechUpdates,
  getUserNotifications,
  getUnreadNotificationsCount,
  markTechUpdateAsRead
} from '../../firebase/techUpdates';

interface TechUpdatesViewProps {
  user: User;
  isDarkMode: boolean;
}

const TechUpdatesView: React.FC<TechUpdatesViewProps> = ({ user, isDarkMode }) => {
  const [updates, setUpdates] = useState<TechUpdate[]>([]);
  const [notifications, setNotifications] = useState<UserNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'updates' | 'notifications'>('updates');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedUpdate, setExpandedUpdate] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load active tech updates
      const updatesResult = await getActiveTechUpdates(user.role);
      if (updatesResult.success) {
        setUpdates(updatesResult.updates);
      }

      // Load user notifications
      const notificationsResult = await getUserNotifications(user._id);
      if (notificationsResult.success) {
        setNotifications(notificationsResult.notifications);
      }

      // Load unread count
      const unreadResult = await getUnreadNotificationsCount(user._id);
      if (unreadResult.success) {
        setUnreadCount(unreadResult.count);
      }
    } catch (error) {
      console.error('Error loading tech updates data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReadUpdate = async (updateId: string) => {
    try {
      await markTechUpdateAsRead(updateId, user._id);
      // Refresh data to update read status
      loadData();
    } catch (error) {
      console.error('Error marking update as read:', error);
    }
  };

  const toggleUpdateExpansion = (updateId: string) => {
    if (expandedUpdate === updateId) {
      setExpandedUpdate(null);
    } else {
      setExpandedUpdate(updateId);
      handleReadUpdate(updateId);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'announcement': return '📢';
      case 'feature': return '✨';
      case 'maintenance': return '🔧';
      case 'security': return '🔒';
      case 'bug-fix': return '🐛';
      default: return '📝';
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

  const filteredUpdates = selectedCategory === 'all' 
    ? updates 
    : updates.filter(update => update.category === selectedCategory);

  const categories = ['all', ...Array.from(new Set(updates.map(update => update.category)))];

  const isUpdateRead = (updateId: string) => {
    return updates.find(update => update.id === updateId)?.readBy.includes(user._id) || false;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">📢 Tech Updates</h2>
        <div className="flex items-center space-x-4">
          {/* Tab Navigation */}
          <div className="flex space-x-1">
            <button
              onClick={() => setActiveTab('updates')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'updates'
                  ? isDarkMode ? 'bg-blue-600 text-white' : 'bg-blue-600 text-white'
                  : isDarkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              📋 Updates
            </button>
            <button
              onClick={() => setActiveTab('notifications')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors relative ${
                activeTab === 'notifications'
                  ? isDarkMode ? 'bg-blue-600 text-white' : 'bg-blue-600 text-white'
                  : isDarkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              🔔 Notifications
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="text-lg">Loading tech updates...</div>
        </div>
      ) : (
        <>
          {/* Updates Tab */}
          {activeTab === 'updates' && (
            <div className="space-y-6">
              {/* Category Filter */}
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                      selectedCategory === category
                        ? 'bg-blue-600 text-white'
                        : isDarkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {category === 'all' ? '📋 All' : `${getCategoryIcon(category)} ${category.charAt(0).toUpperCase() + category.slice(1)}`}
                  </button>
                ))}
              </div>

              {/* Updates List */}
              {filteredUpdates.length === 0 ? (
                <div className={`text-center py-12 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-sm`}>
                  <div className="text-6xl mb-4">📢</div>
                  <div className="text-xl font-semibold mb-2">No Updates Available</div>
                  <div className="text-gray-500">Check back later for new tech updates</div>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredUpdates.map((update) => (
                    <div
                      key={update.id}
                      className={`rounded-lg shadow-sm border transition-all ${
                        isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                      } ${
                        update.isPinned ? 'border-yellow-400 shadow-md' : ''
                      } ${
                        !isUpdateRead(update.id) ? 'ring-2 ring-blue-500 ring-opacity-50' : ''
                      }`}
                    >
                      <div className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              {update.isPinned && <span className="text-yellow-500">📌</span>}
                              <span className="text-lg">{getCategoryIcon(update.category)}</span>
                              <h3 className="text-lg font-semibold">{update.title}</h3>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(update.priority)}`}>
                                {update.priority.toUpperCase()}
                              </span>
                              {!isUpdateRead(update.id) && (
                                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                                  NEW
                                </span>
                              )}
                            </div>
                            
                            <p className="text-gray-600 mb-3">{update.summary}</p>
                            
                            <div className="flex flex-wrap gap-2 mb-3">
                              {update.tags.map((tag, index) => (
                                <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                                  {tag}
                                </span>
                              ))}
                            </div>
                            
                            <div className="text-sm text-gray-500">
                              {formatDate(update.createdAt)} • {update.totalReads} reads
                              {update.expiresAt && (
                                <span className="ml-2">• Expires: {formatDate(update.expiresAt)}</span>
                              )}
                            </div>
                          </div>
                          
                          <button
                            onClick={() => toggleUpdateExpansion(update.id)}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                              expandedUpdate === update.id
                                ? 'bg-blue-600 text-white'
                                : isDarkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                          >
                            {expandedUpdate === update.id ? 'Collapse' : 'Read More'}
                          </button>
                        </div>
                        
                        {/* Expanded Content */}
                        {expandedUpdate === update.id && (
                          <div className={`mt-4 p-4 rounded ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} border-t ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                            <div className="whitespace-pre-wrap">{update.content}</div>
                            
                            {update.attachments && update.attachments.length > 0 && (
                              <div className="mt-4">
                                <h4 className="font-medium mb-2">Attachments:</h4>
                                <div className="space-y-2">
                                  {update.attachments.map((attachment, index) => (
                                    <a
                                      key={index}
                                      href={attachment.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
                                    >
                                      📎 {attachment.name}
                                    </a>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="space-y-4">
              {notifications.length === 0 ? (
                <div className={`text-center py-12 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-sm`}>
                  <div className="text-6xl mb-4">🔔</div>
                  <div className="text-xl font-semibold mb-2">No Notifications</div>
                  <div className="text-gray-500">You're all caught up!</div>
                </div>
              ) : (
                <div className="space-y-3">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 rounded-lg border transition-all ${
                        isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                      } ${
                        !notification.isRead ? 'ring-2 ring-blue-500 ring-opacity-50' : 'opacity-75'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-lg">{getCategoryIcon(notification.category)}</span>
                            <h4 className="font-semibold">{notification.title}</h4>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(notification.priority)}`}>
                              {notification.priority.toUpperCase()}
                            </span>
                            {!notification.isRead && (
                              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                                NEW
                              </span>
                            )}
                          </div>

                          <p className="text-gray-600 mb-2">{notification.summary}</p>

                          <div className="text-sm text-gray-500">
                            {formatDate(notification.createdAt)}
                            {notification.readAt && (
                              <span className="ml-2">• Read: {formatDate(notification.readAt)}</span>
                            )}
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            // Find the corresponding update and expand it
                            const update = updates.find(u => u.id === notification.updateId);
                            if (update) {
                              setActiveTab('updates');
                              setExpandedUpdate(notification.updateId);
                              handleReadUpdate(notification.updateId);
                            }
                          }}
                          className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                            isDarkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                        >
                          View Update
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default TechUpdatesView;
