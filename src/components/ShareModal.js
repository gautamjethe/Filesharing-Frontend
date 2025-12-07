import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import API_URL from '../config/api';
import './ShareModal.css';

const ShareModal = ({ file, onClose, onShare }) => {
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [shareLink, setShareLink] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [activeTab, setActiveTab] = useState('users');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [alreadySharedUsers, setAlreadySharedUsers] = useState([]);

  useEffect(() => {
    fetchUsers();
    fetchShares();
  }, [file]);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${API_URL}/users`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      setUsers(response.data.users || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchShares = async () => {
    try {
      const response = await axios.get(`${API_URL}/files/${file.id}/shares`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const shares = response.data.shares || [];
      const linkShare = shares.find(s => s.share_token && !s.user_id);
      if (linkShare) {
        setShareLink(`${window.location.origin}/share/${linkShare.share_token}`);
      }
      const sharedUserIds = shares
        .filter(s => s.user_id && (!s.expires_at || new Date(s.expires_at) > new Date()))
        .map(s => s.user_id);
      setAlreadySharedUsers(sharedUserIds);
    } catch (error) {
      console.error('Error fetching shares:', error);
    }
  };

  const handleUserToggle = (userId) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleShareWithUsers = async () => {
    if (selectedUsers.length === 0) {
      setError('Please select at least one user');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await axios.post(
        `${API_URL}/files/${file.id}/share`,
        {
          userIds: selectedUsers,
          expiresAt: expiresAt || null
        },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      setSelectedUsers([]);
      setExpiresAt('');
      
      if (response.data.alreadyShared && response.data.alreadyShared.length > 0) {
        const names = response.data.alreadyShared.map(u => u.username).join(', ');
        toast.warning(`File shared! Note: ${names} already had access.`);
      } else {
        toast.success('File shared successfully!');
      }
      
      if (onShare) {
        onShare();
      }
      fetchShares();
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Failed to share file';
      if (error.response?.data?.alreadyShared) {
        const names = error.response.data.alreadyShared.map(u => u.username).join(', ');
        setError(`${errorMsg}: ${names}`);
      } else {
        setError(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateLink = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await axios.post(
        `${API_URL}/files/${file.id}/share-link`,
        {
          expiresAt: expiresAt || null
        },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      const shareUrl = `${window.location.origin}/share/${response.data.shareToken}`;
      setShareLink(shareUrl);
      if (onShare) {
        onShare();
      }
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to generate link');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Link copied to clipboard!');
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Share: {file.original_filename || file.filename}</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="modal-tabs">
          <button
            className={activeTab === 'users' ? 'active' : ''}
            onClick={() => setActiveTab('users')}
          >
            Share with Users
          </button>
          <button
            className={activeTab === 'link' ? 'active' : ''}
            onClick={() => setActiveTab('link')}
          >
            Share via Link
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}

        {activeTab === 'users' && (
          <div className="share-users">
            <div className="expiry-section">
              <label>Expiry Date (Optional)</label>
              <input
                type="datetime-local"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
              />
            </div>

            <div className="users-list">
              <h3>Select Users</h3>
              {users.map(user => {
                const isAlreadyShared = alreadySharedUsers.includes(user.id);
                return (
                  <label key={user.id} className={`user-checkbox ${isAlreadyShared ? 'disabled' : ''}`}>
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user.id)}
                      onChange={() => handleUserToggle(user.id)}
                      disabled={isAlreadyShared}
                    />
                    <span>
                      {user.username} ({user.email})
                      {isAlreadyShared && <span className="already-shared-badge">Already shared</span>}
                    </span>
                  </label>
                );
              })}
            </div>

            <button
              onClick={handleShareWithUsers}
              disabled={loading || selectedUsers.length === 0}
              className="share-btn"
            >
              {loading ? 'Sharing...' : 'Share'}
            </button>
          </div>
        )}

        {activeTab === 'link' && (
          <div className="share-link">
            <div className="expiry-section">
              <label>Expiry Date (Optional)</label>
              <input
                type="datetime-local"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
              />
            </div>

            {shareLink ? (
              <div className="link-display">
                <input type="text" value={shareLink} readOnly />
                <button onClick={() => copyToClipboard(shareLink)} className="copy-btn">
                  Copy
                </button>
              </div>
            ) : (
              <button
                onClick={handleGenerateLink}
                disabled={loading}
                className="generate-btn"
              >
                {loading ? 'Generating...' : 'Generate Share Link'}
              </button>
            )}

            <p className="link-note">
              Note: Only users with an account can access files via this link.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShareModal;

