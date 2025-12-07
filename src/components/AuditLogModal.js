import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_URL from '../config/api';
import './AuditLogModal.css';

const AuditLogModal = ({ file, onClose }) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAuditLogs();
  }, [file]);

  const fetchAuditLogs = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get(`${API_URL}/files/${file.id}/audit-log`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      setLogs(response.data.logs || []);
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to fetch audit logs');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
  };

  const getActionLabel = (action) => {
    const actionMap = {
      'upload': 'Uploaded',
      'download': 'Downloaded',
      'share': 'Shared',
      'share_link': 'Share Link Created'
    };
    return actionMap[action] || action;
  };

  const getRoleBadge = (role) => {
    return role === 'owner' ? 'Owner' : 'Viewer';
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content audit-log-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Audit Log: {file.original_filename || file.filename}</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        {error && <div className="error-message">{error}</div>}

        {loading ? (
          <div className="loading">Loading audit logs...</div>
        ) : logs.length === 0 ? (
          <div className="empty-state">
            <p>No audit logs found for this file</p>
          </div>
        ) : (
          <div className="audit-log-content">
            <table className="audit-log-table">
              <thead>
                <tr>
                  <th>Date & Time</th>
                  <th>User</th>
                  <th>Role</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id}>
                    <td>{formatDate(log.created_at)}</td>
                    <td>
                      <div className="user-info">
                        <span className="username">{log.username}</span>
                        <span className="email">{log.email}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`role-badge role-${log.role}`}>
                        {getRoleBadge(log.role)}
                      </span>
                    </td>
                    <td>
                      <span className={`action-badge action-${log.action}`}>
                        {getActionLabel(log.action)}
                      </span>
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

export default AuditLogModal;

