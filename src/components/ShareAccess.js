import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import API_URL from '../config/api';
import './ShareAccess.css';

const ShareAccess = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [fileInfo, setFileInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [authLoading, user, navigate]);

  useEffect(() => {
    if (user && token) {
      fetchFileInfo();
    }
  }, [user, token]);

  const fetchFileInfo = async () => {
    try {
      const response = await axios.get(`${API_URL}/files/share/${token}/info`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      setFileInfo(response.data.file);
    } catch (error) {
      setError(error.response?.data?.error || 'Invalid or expired link');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    try {
      const response = await fetch(`${API_URL}/files/share/${token}/download`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileInfo.original_filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Download error:', error);
      alert('Failed to download file');
    }
  };

  if (authLoading || loading) {
    return <div className="loading">Loading...</div>;
  }

  if (error) {
    return (
      <div className="share-access">
        <div className="error-box">
          <h2>Access Denied</h2>
          <p>{error}</p>
          <button onClick={() => navigate('/dashboard')}>Go to Dashboard</button>
        </div>
      </div>
    );
  }

  return (
    <div className="share-access">
      <div className="share-box">
        <h2>Shared File</h2>
        {fileInfo && (
          <div className="file-info">
            <p><strong>Filename:</strong> {fileInfo.original_filename}</p>
            <p><strong>Type:</strong> {fileInfo.file_type.toUpperCase()}</p>
            <p><strong>Size:</strong> {(fileInfo.file_size / 1024).toFixed(2)} KB</p>
            <button onClick={handleDownload} className="download-btn">
              Download File
            </button>
          </div>
        )}
        <button onClick={() => navigate('/dashboard')} className="back-btn">
          Back to Dashboard
        </button>
      </div>
    </div>
  );
};

export default ShareAccess;

