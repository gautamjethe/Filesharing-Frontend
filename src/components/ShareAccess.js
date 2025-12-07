import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { toast } from 'react-toastify';
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

  const handleDownload = () => {
    const authToken = localStorage.getItem('token');
    const downloadUrl = `${API_URL}/files/share/${token}/download`;
    
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = fileInfo.original_filename;
    link.style.display = 'none';
    
    const xhr = new XMLHttpRequest();
    xhr.open('GET', downloadUrl, true);
    xhr.setRequestHeader('Authorization', `Bearer ${authToken}`);
    xhr.responseType = 'blob';
    
    xhr.onload = function() {
      if (xhr.status === 200) {
        const blob = xhr.response;
        const url = window.URL.createObjectURL(blob);
        link.href = url;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        toast.success('File downloaded successfully');
      } else {
        toast.error('Failed to download file');
      }
    };
    
    xhr.onerror = function() {
      toast.error('Failed to download file');
    };
    
    xhr.send();
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
          <button onClick={() => navigate('/dashboard')} className="back-btn">Go to Dashboard</button>
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

