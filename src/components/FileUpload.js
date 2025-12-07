import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import API_URL from '../config/api';
import './FileUpload.css';

const FileUpload = ({ onUpload }) => {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);

  const MAX_FILE_SIZE = 500 * 1024 * 1024;

  const formatFileSize = (bytes) => {
    if (bytes >= 1024 * 1024 * 1024) {
      return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
    } else if (bytes >= 1024 * 1024) {
      return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    } else {
      return (bytes / 1024).toFixed(2) + ' KB';
    }
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    const maxSize = MAX_FILE_SIZE;
    
    const oversizedFiles = selectedFiles.filter(file => file.size > maxSize);
    
    if (oversizedFiles.length > 0) {
      const fileNames = oversizedFiles.map(f => `${f.name} (${formatFileSize(f.size)})`).join(', ');
      const errorMsg = `File size exceeds 500MB limit: ${fileNames}`;
      setError(errorMsg);
      toast.error(errorMsg);
      e.target.value = '';
      setFiles([]);
      return;
    }
    
    setFiles(selectedFiles);
    setError('');
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      setError('Please select at least one file');
      toast.error('Please select at least one file');
      return;
    }

    const maxSize = MAX_FILE_SIZE;
    const oversizedFiles = files.filter(file => file.size > maxSize);
    
    if (oversizedFiles.length > 0) {
      const fileNames = oversizedFiles.map(f => `${f.name} (${formatFileSize(f.size)})`).join(', ');
      const errorMsg = `File size exceeds 500MB limit: ${fileNames}`;
      setError(errorMsg);
      toast.error(errorMsg);
      return;
    }

    setUploading(true);
    setError('');
    setUploadProgress(0);

    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });

    try {
      await axios.post(`${API_URL}/files/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(percentCompleted);
        }
      });

      setFiles([]);
      setError('');
      setUploadProgress(0);
      toast.success(`Successfully uploaded ${files.length} file(s)!`);
      if (onUpload) {
        onUpload();
      }
    } catch (error) {
      let errorMsg = 'Upload failed';
      
      if (error.response?.data?.error) {
        errorMsg = error.response.data.error;
      } else if (error.message && error.message.includes('File too large')) {
        errorMsg = 'File size exceeds 500MB limit';
      } else if (error.code === 'ECONNABORTED') {
        errorMsg = 'Upload timeout - file may be too large';
      }
      
      setError(errorMsg);
      toast.error(errorMsg);
      setUploadProgress(0);
    } finally {
      setUploading(false);
    }
  };

  const removeFile = (index) => {
    const newFiles = files.filter((_, i) => i !== index);
    setFiles(newFiles);
  };

  return (
    <div className="file-upload">
      <div className="upload-box">
        <input
          type="file"
          id="file-input"
          multiple
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
        <label htmlFor="file-input" className="upload-label">
          Choose Files
        </label>
        {files.length > 0 && (
          <button onClick={handleUpload} disabled={uploading} className="upload-btn">
            {uploading ? 'Uploading...' : 'Upload Files'}
          </button>
        )}
      </div>

      {error && <div className="error-message">{error}</div>}

      {uploading && (
        <div className="upload-progress-container">
          <div className="upload-progress-bar">
            <div 
              className="upload-progress-fill" 
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
          <span className="upload-progress-text">{uploadProgress}%</span>
        </div>
      )}

      {files.length > 0 && (
        <div className="file-list-preview">
          <h3>Selected Files ({files.length})</h3>
          <ul>
            {files.map((file, index) => {
              const isOversized = file.size > MAX_FILE_SIZE;
              return (
                <li key={index} className={isOversized ? 'file-oversized' : ''}>
                  <span>{file.name}</span>
                  <span className={`file-size ${isOversized ? 'oversized' : ''}`}>
                    ({formatFileSize(file.size)})
                    {isOversized && ' - Exceeds 500MB limit'}
                  </span>
                  <button onClick={() => removeFile(index)} className="remove-btn">×</button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
};

export default FileUpload;

