import React, { useState } from 'react';
import axios from 'axios';
import API_URL from '../config/api';
import './FileUpload.css';

const FileUpload = ({ onUpload }) => {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles(selectedFiles);
    setError('');
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      setError('Please select at least one file');
      return;
    }

    setUploading(true);
    setError('');

    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });

    try {
      await axios.post(`${API_URL}/files/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      setFiles([]);
      setError('');
      if (onUpload) {
        onUpload();
      }
    } catch (error) {
      setError(error.response?.data?.error || 'Upload failed');
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

      {files.length > 0 && (
        <div className="file-list-preview">
          <h3>Selected Files ({files.length})</h3>
          <ul>
            {files.map((file, index) => (
              <li key={index}>
                <span>{file.name}</span>
                <span className="file-size">({(file.size / 1024).toFixed(2)} KB)</span>
                <button onClick={() => removeFile(index)} className="remove-btn">×</button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default FileUpload;

