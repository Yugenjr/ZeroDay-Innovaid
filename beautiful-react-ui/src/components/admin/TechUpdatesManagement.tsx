import React, { useState, useEffect } from 'react';
import { User } from '../../types/User';
import {
  TechUpdate,
  createTechUpdate,
  getAllTechUpdates,
  updateTechUpdateStatus,
  toggleTechUpdatePin,
  deleteTechUpdate
} from '../../firebase/techUpdates';

interface TechUpdatesManagementProps {
  user: User;
  onBack: () => void;
  onLogout: () => void;
  isDarkMode: boolean;
}

interface NewTechUpdate {
  title: string;
  content: string;
  summary: string;
  category: 'announcement' | 'feature' | 'maintenance' | 'security' | 'bug-fix' | 'general';
  priority: 'low' | 'medium' | 'high' | 'critical';
  targetAudience: 'all' | 'students' | 'faculty' | 'admin';
  expiresAt: string;
  tags: string[];
  isPinned: boolean;
  scheduledFor: string;
}

const TechUpdatesManagement: React.FC<TechUpdatesManagementProps> = ({ user, onBack, onLogout, isDarkMode }) => {
  const [updates, setUpdates] = useState<TechUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [activeTab, setActiveTab] = useState<'list' | 'create' | 'analytics'>('list');
  
  const [newUpdate, setNewUpdate] = useState<NewTechUpdate>({
    title: '',
    content: '',
    summary: '',
    category: 'general',
    priority: 'medium',
    targetAudience: 'all',
    expiresAt: '',
    tags: [],
    isPinned: false,
    scheduledFor: ''
  });

  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    loadUpdates();
  }, []);

  const loadUpdates = async () => {
    try {
      setLoading(true);
      const result = await getAllTechUpdates();
      if (result.success) {
        setUpdates(result.updates);
      } else {
        setMessage(`❌ ${result.message}`);
        setTimeout(() => setMessage(''), 5000);
      }
    } catch (error) {
      console.error('Error loading tech updates:', error);
      setMessage('❌ Failed to load tech updates');
      setTimeout(() => setMessage(''), 5000);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUpdate = async () => {
    if (!newUpdate.title || !newUpdate.content || !newUpdate.summary) {
      setMessage('❌ Please fill in all required fields');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    setSubmitting(true);
    setMessage('');

    try {
      const updateData = {
        title: newUpdate.title,
        content: newUpdate.content,
        summary: newUpdate.summary,
        category: newUpdate.category,
        priority: newUpdate.priority,
        targetAudience: newUpdate.targetAudience,
        isActive: true,
        isPinned: newUpdate.isPinned,
        createdBy: user._id,
        createdByName: user.name,
        expiresAt: newUpdate.expiresAt || null,
        attachments: [],
        tags: newUpdate.tags,
        scheduledFor: newUpdate.scheduledFor || null
      };

      const result = await createTechUpdate(updateData);

      if (result.success) {
        setMessage('✅ Tech update created successfully!');
        setNewUpdate({
          title: '',
          content: '',
          summary: '',
          category: 'general',
          priority: 'medium',
          targetAudience: 'all',
          expiresAt: '',
          tags: [],
          isPinned: false,
          scheduledFor: ''
        });
        setTagInput('');
        setShowCreateForm(false);
        setActiveTab('list');
        loadUpdates();
        setTimeout(() => setMessage(''), 5000);
      } else {
        setMessage(`❌ ${result.message}`);
        setTimeout(() => setMessage(''), 5000);
      }
    } catch (error) {
      console.error('❌ Error creating tech update:', error);
      setMessage('❌ Failed to create tech update. Please try again.');
      setTimeout(() => setMessage(''), 5000);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (updateId: string, currentStatus: boolean) => {
    try {
      const result = await updateTechUpdateStatus(updateId, !currentStatus);
      if (result.success) {
        setMessage(`✅ ${result.message}`);
        loadUpdates();
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage(`❌ ${result.message}`);
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (error) {
      console.error('Error toggling update status:', error);
      setMessage('❌ Failed to update status');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleTogglePin = async (updateId: string, currentPin: boolean) => {
    try {
      const result = await toggleTechUpdatePin(updateId, !currentPin);
      if (result.success) {
        setMessage(`✅ ${result.message}`);
        loadUpdates();
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage(`❌ ${result.message}`);
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (error) {
      console.error('Error toggling update pin:', error);
      setMessage('❌ Failed to update pin status');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleDeleteUpdate = async (updateId: string, title: string) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const result = await deleteTechUpdate(updateId);
      if (result.success) {
        setMessage(`✅ ${result.message}`);
        loadUpdates();
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage(`❌ ${result.message}`);
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (error) {
      console.error('Error deleting update:', error);
      setMessage('❌ Failed to delete update');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !newUpdate.tags.includes(tagInput.trim())) {
      setNewUpdate(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setNewUpdate(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
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

  const activeUpdates = updates.filter(update => update.isActive);
  const inactiveUpdates = updates.filter(update => !update.isActive);
  const pinnedUpdates = updates.filter(update => update.isPinned);

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Header */}
      <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBack}
                className={`p-2 rounded-lg ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors`}
              >
                ← Back
              </button>
              <h1 className="text-2xl font-bold">📢 Tech Updates Management</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm">Welcome, {user.name}</span>
              <button
                onClick={onLogout}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <div className={`p-4 rounded-lg ${message.includes('❌') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
            {message}
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="flex space-x-1 mb-6">
          {[
            { id: 'list', label: 'All Updates', icon: '📋' },
            { id: 'create', label: 'Create Update', icon: '➕' },
            { id: 'analytics', label: 'Analytics', icon: '📊' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === tab.id
                  ? isDarkMode ? 'bg-blue-600 text-white' : 'bg-blue-600 text-white'
                  : isDarkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        {/* List Tab */}
        {activeTab === 'list' && (
          <div className="space-y-6">
            {loading ? (
              <div className="text-center py-8">
                <div className="text-lg">Loading tech updates...</div>
              </div>
            ) : updates.length === 0 ? (
              <div className={`text-center py-12 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-sm`}>
                <div className="text-6xl mb-4">📢</div>
                <div className="text-xl font-semibold mb-2">No Tech Updates Yet</div>
                <div className="text-gray-500 mb-6">Create your first tech update to get started</div>
                <button
                  onClick={() => setActiveTab('create')}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Create First Update
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {updates.map((update) => (
                  <div
                    key={update.id}
                    className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm border ${
                      update.isPinned ? 'border-yellow-400' : isDarkMode ? 'border-gray-700' : 'border-gray-200'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {update.isPinned && <span className="text-yellow-500">📌</span>}
                          <span className="text-lg">{getCategoryIcon(update.category)}</span>
                          <h3 className="text-lg font-semibold">{update.title}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(update.priority)}`}>
                            {update.priority.toUpperCase()}
                          </span>
                        </div>

                        <p className="text-gray-600 mb-3">{update.summary}</p>

                        <div className="flex flex-wrap gap-2 mb-3">
                          <span className={`px-2 py-1 rounded text-xs ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                            👥 {update.targetAudience}
                          </span>
                          {update.tags.map((tag, index) => (
                            <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                              {tag}
                            </span>
                          ))}
                        </div>

                        <div className="text-sm text-gray-500">
                          Created by {update.createdByName} • {formatDate(update.createdAt)} • {update.totalReads} reads
                          {update.expiresAt && (
                            <span className="ml-2">• Expires: {formatDate(update.expiresAt)}</span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 ml-4">
                        <button
                          onClick={() => handleTogglePin(update.id, update.isPinned)}
                          className={`p-2 rounded ${update.isPinned ? 'text-yellow-600' : 'text-gray-400'} hover:bg-gray-100`}
                          title={update.isPinned ? 'Unpin' : 'Pin'}
                        >
                          📌
                        </button>

                        <button
                          onClick={() => handleToggleStatus(update.id, update.isActive)}
                          className={`px-3 py-1 rounded text-sm font-medium ${
                            update.isActive
                              ? 'bg-green-100 text-green-800 hover:bg-green-200'
                              : 'bg-red-100 text-red-800 hover:bg-red-200'
                          }`}
                        >
                          {update.isActive ? 'Active' : 'Inactive'}
                        </button>

                        <button
                          onClick={() => handleDeleteUpdate(update.id, update.title)}
                          className="p-2 text-red-600 hover:bg-red-100 rounded"
                          title="Delete"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>

                    {/* Content Preview */}
                    <div className={`mt-4 p-4 rounded ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                      <div className="text-sm">
                        {update.content.length > 200
                          ? `${update.content.substring(0, 200)}...`
                          : update.content
                        }
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Create Update Tab */}
        {activeTab === 'create' && (
          <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
            <h2 className="text-xl font-bold mb-6">Create New Tech Update</h2>

            <div className="space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium mb-2">Title *</label>
                <input
                  type="text"
                  value={newUpdate.title}
                  onChange={(e) => setNewUpdate(prev => ({ ...prev, title: e.target.value }))}
                  className={`w-full p-3 border rounded-lg ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                  placeholder="Enter update title..."
                />
              </div>

              {/* Summary */}
              <div>
                <label className="block text-sm font-medium mb-2">Summary * (for notifications)</label>
                <input
                  type="text"
                  value={newUpdate.summary}
                  onChange={(e) => setNewUpdate(prev => ({ ...prev, summary: e.target.value }))}
                  className={`w-full p-3 border rounded-lg ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                  placeholder="Brief summary for notifications..."
                  maxLength={150}
                />
                <div className="text-xs text-gray-500 mt-1">{newUpdate.summary.length}/150 characters</div>
              </div>

              {/* Content */}
              <div>
                <label className="block text-sm font-medium mb-2">Content *</label>
                <textarea
                  value={newUpdate.content}
                  onChange={(e) => setNewUpdate(prev => ({ ...prev, content: e.target.value }))}
                  rows={8}
                  className={`w-full p-3 border rounded-lg ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                  placeholder="Enter detailed update content..."
                />
              </div>

              {/* Category and Priority */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Category</label>
                  <select
                    value={newUpdate.category}
                    onChange={(e) => setNewUpdate(prev => ({ ...prev, category: e.target.value as any }))}
                    className={`w-full p-3 border rounded-lg ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                  >
                    <option value="general">📝 General</option>
                    <option value="announcement">📢 Announcement</option>
                    <option value="feature">✨ New Feature</option>
                    <option value="maintenance">🔧 Maintenance</option>
                    <option value="security">🔒 Security</option>
                    <option value="bug-fix">🐛 Bug Fix</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Priority</label>
                  <select
                    value={newUpdate.priority}
                    onChange={(e) => setNewUpdate(prev => ({ ...prev, priority: e.target.value as any }))}
                    className={`w-full p-3 border rounded-lg ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                  >
                    <option value="low">🟢 Low</option>
                    <option value="medium">🟡 Medium</option>
                    <option value="high">🟠 High</option>
                    <option value="critical">🔴 Critical</option>
                  </select>
                </div>
              </div>

              {/* Target Audience */}
              <div>
                <label className="block text-sm font-medium mb-2">Target Audience</label>
                <select
                  value={newUpdate.targetAudience}
                  onChange={(e) => setNewUpdate(prev => ({ ...prev, targetAudience: e.target.value as any }))}
                  className={`w-full p-3 border rounded-lg ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                >
                  <option value="all">👥 All Users</option>
                  <option value="students">🎓 Students Only</option>
                  <option value="faculty">👨‍🏫 Faculty Only</option>
                  <option value="admin">👑 Admin Only</option>
                </select>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium mb-2">Tags</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {newUpdate.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm flex items-center gap-1"
                    >
                      {tag}
                      <button
                        onClick={() => removeTag(tag)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addTag()}
                    className={`flex-1 p-3 border rounded-lg ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                    placeholder="Add tags..."
                  />
                  <button
                    onClick={addTag}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Expiry Date and Scheduling */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Expiry Date (Optional)</label>
                  <input
                    type="datetime-local"
                    value={newUpdate.expiresAt}
                    onChange={(e) => setNewUpdate(prev => ({ ...prev, expiresAt: e.target.value }))}
                    className={`w-full p-3 border rounded-lg ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Schedule For (Optional)</label>
                  <input
                    type="datetime-local"
                    value={newUpdate.scheduledFor}
                    onChange={(e) => setNewUpdate(prev => ({ ...prev, scheduledFor: e.target.value }))}
                    className={`w-full p-3 border rounded-lg ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                  />
                </div>
              </div>

              {/* Pin Option */}
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isPinned"
                  checked={newUpdate.isPinned}
                  onChange={(e) => setNewUpdate(prev => ({ ...prev, isPinned: e.target.checked }))}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <label htmlFor="isPinned" className="text-sm font-medium">📌 Pin this update (appears at top)</label>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setActiveTab('list')}
                  className={`px-6 py-2 rounded-lg ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateUpdate}
                  disabled={submitting}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {submitting ? 'Creating...' : 'Create Update'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
                <div className="text-2xl font-bold text-blue-600">{updates.length}</div>
                <div className="text-sm text-gray-500">Total Updates</div>
              </div>
              <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
                <div className="text-2xl font-bold text-green-600">{activeUpdates.length}</div>
                <div className="text-sm text-gray-500">Active Updates</div>
              </div>
              <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
                <div className="text-2xl font-bold text-yellow-600">{pinnedUpdates.length}</div>
                <div className="text-sm text-gray-500">Pinned Updates</div>
              </div>
              <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
                <div className="text-2xl font-bold text-purple-600">{updates.reduce((sum, update) => sum + update.totalReads, 0)}</div>
                <div className="text-sm text-gray-500">Total Reads</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TechUpdatesManagement;
