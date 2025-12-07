import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import FileUpload from './FileUpload';
import FileList from './FileList';
import ShareModal from './ShareModal';
import AuditLogModal from './AuditLogModal';
import API_URL from '../config/api';
import './Dashboard.css';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('my-files');
  const [files, setFiles] = useState([]);
  const [sharedFiles, setSharedFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showAuditLogModal, setShowAuditLogModal] = useState(false);

  useEffect(() => {
    fetchFiles();
  }, [activeTab]);

  const fetchFiles = async () => {
    setLoading(true);
    try {
      if (activeTab === 'my-files') {
        const response = await fetch(`${API_URL}/files/my-files`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        const data = await response.json();
        setFiles(data.files || []);
      } else {
        const response = await fetch(`${API_URL}/files/shared-with-me`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        const data = await response.json();
        setSharedFiles(data.files || []);
      }
    } catch (error) {
      console.error('Error fetching files:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUploaded = () => {
    fetchFiles();
  };

  const handleShareClick = (file) => {
    setSelectedFile(file);
    setShowShareModal(true);
  };

  const handleCloseShareModal = () => {
    setShowShareModal(false);
    setSelectedFile(null);
  };

  const handleAuditLogClick = (file) => {
    setSelectedFile(file);
    setShowAuditLogModal(true);
  };

  const handleCloseAuditLogModal = () => {
    setShowAuditLogModal(false);
    setSelectedFile(null);
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

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>File Sharing App</h1>
        <div className="user-info">
          <span>Welcome, {user?.username}</span>
          <button onClick={logout} className="logout-btn">Logout</button>
        </div>
      </header>

      <div className="dashboard-content">
        <div className="tabs">
          <button
            className={activeTab === 'my-files' ? 'active' : ''}
            onClick={() => setActiveTab('my-files')}
          >
            My Files
          </button>
          <button
            className={activeTab === 'shared' ? 'active' : ''}
            onClick={() => setActiveTab('shared')}
          >
            Shared with Me
          </button>
        </div>

        {activeTab === 'my-files' && (
          <>
            <FileUpload onUpload={handleFileUploaded} />
            <FileList
              files={files}
              loading={loading}
              onShare={handleShareClick}
              onAuditLog={handleAuditLogClick}
              onDelete={fetchFiles}
              formatDate={formatDate}
              formatFileSize={formatFileSize}
            />
          </>
        )}

        {activeTab === 'shared' && (
          <FileList
            files={sharedFiles}
            loading={loading}
            isShared={true}
            formatDate={formatDate}
            formatFileSize={formatFileSize}
          />
        )}
      </div>

      {showShareModal && selectedFile && (
        <ShareModal
          file={selectedFile}
          onClose={handleCloseShareModal}
          onShare={fetchFiles}
        />
      )}

      {showAuditLogModal && selectedFile && (
        <AuditLogModal
          file={selectedFile}
          onClose={handleCloseAuditLogModal}
        />
      )}
    </div>
  );
};

export default Dashboard;

