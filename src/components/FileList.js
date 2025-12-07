import React from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import API_URL from '../config/api';
import './FileList.css';

const FileList = ({ files, loading, onShare, onDelete, onAuditLog, isShared, formatDate, formatFileSize }) => {

  const handleDownload = (fileId, filename) => {
    const token = localStorage.getItem('token');
    const downloadUrl = `${API_URL}/files/${fileId}/download`;
    
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename;
    link.style.display = 'none';
    
    const xhr = new XMLHttpRequest();
    xhr.open('GET', downloadUrl, true);
    xhr.setRequestHeader('Authorization', `Bearer ${token}`);
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
        toast.success('File downloaded successfully!');
      } else {
        toast.error('Failed to download file');
      }
    };
    
    xhr.onerror = function() {
      toast.error('Failed to download file');
    };
    
    xhr.send();
  };

  const handleDelete = async (fileId) => {
    if (!window.confirm('Are you sure you want to delete this file?')) {
      return;
    }

    try {
      await axios.delete(`${API_URL}/files/${fileId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (onDelete) {
        onDelete();
      }
      toast.success('File deleted successfully');
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete file');
    }
  };

  if (loading) {
    return <div className="loading">Loading files...</div>;
  }

  if (files.length === 0) {
    return (
      <div className="empty-state">
        <p>No files found</p>
      </div>
    );
  }

  return (
    <div className="file-list">
      <table>
        <thead>
          <tr>
            <th>Filename</th>
            <th>Type</th>
            <th>Size</th>
            <th>Upload Date</th>
            {isShared && <th>Owner</th>}
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {files.map((file) => (
            <tr key={file.id}>
              <td>{file.original_filename || file.filename}</td>
              <td>
                <span className="file-type">{file.file_type.toUpperCase()}</span>
              </td>
              <td>{formatFileSize(file.file_size)}</td>
              <td>{formatDate(file.upload_date || file.shared_at)}</td>
              {isShared && <td>{file.owner_name}</td>}
              <td>
                <div className="action-buttons">
                  <button
                    onClick={() => handleDownload(file.id, file.original_filename || file.filename)}
                    className="btn-download"
                  >
                    Download
                  </button>
                  {!isShared && onShare && (
                    <button
                      onClick={() => onShare(file)}
                      className="btn-share"
                    >
                      Share
                    </button>
                  )}
                  {!isShared && onAuditLog && (
                    <button
                      onClick={() => onAuditLog(file)}
                      className="btn-audit"
                    >
                      Audit Log
                    </button>
                  )}
                  {!isShared && onDelete && (
                    <button
                      onClick={() => handleDelete(file.id)}
                      className="btn-delete"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default FileList;

