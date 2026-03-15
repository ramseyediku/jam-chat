// PostUploadModal.jsx - Preview fixed, original styling preserved
import { useState, useCallback, useRef, useEffect } from 'react';

export default function PostUploadModal({ onClose }) {
  const [caption, setCaption] = useState('');
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Revoke old preview if exists
      if (preview) URL.revokeObjectURL(preview);

      const url = URL.createObjectURL(selectedFile);
      setFile(selectedFile);
      setPreview(url);
      setError('');
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };
  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      if (!file || !caption.trim()) {
        setError('Add image and caption');
        return;
      }

      setUploading(true);
      setError('');

      const formData = new FormData();
      formData.append('image', file);
      formData.append('caption', caption.trim());
      formData.append('locationCountry', 'United Kingdom');
      formData.append('visibility', 'public');

      try {
        const response = await fetch(
          'https://jam-chat.onrender.com/api/posts',
          {
            method: 'POST',
            body: formData,
            credentials: 'include', // 👈 Sends auth cookie
          }
        );

        if (response.ok) {
          const result = await response.json();
          console.log('✅ Post created:', result.post);
          onClose(); // Close + refresh feed
          window.location.href = '/explore'; // 👈 Simple redirect
        } else {
          const errData = await response.json();
          setError(errData.error || 'Upload failed');
        }
      } catch (err) {
        console.error('Upload error:', err);
        setError('Network error - try again');
      } finally {
        setUploading(false);
      }
    },
    [file, caption, onClose]
  );

  return (
    <div
      className="audio-modal"
      style={{
        pointerEvents: 'auto',
        backdropFilter: 'none',
        WebkitBackdropFilter: 'none',
        zIndex: 1002,
        position: 'relative',
        maxWidth: '500px',
        width: '90vw',
      }}
    >
      <div className="modal-header">
        <h2>Create Post</h2>
        <button className="close-btn" onClick={onClose}>
          ×
        </button>
      </div>

      <form className="room-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Photo</label>

          {/* Custom styled upload button/zone - compact */}
          <div
            className="upload-trigger"
            onClick={handleUploadClick}
            style={{
              width: '100%',
              padding: '12px 16px',
              border: '2px dashed #d1d5db',
              borderRadius: '8px',
              backgroundColor: '#f9fafb',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s',
              fontSize: '14px',
              color: '#6b7280',
            }}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17,8 12,13 7,8" />
              <line x1="12" y1="13" x2="12" y2="21" />
            </svg>
            <span
              style={{ display: 'block', marginTop: '4px', fontWeight: '500' }}
            >
              {file ? 'Change photo' : 'Choose photo'}
            </span>
          </div>

          {/* Hidden real input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            onChange={handleFileChange}
            style={{ display: 'none' }}
            required
          />

          {/* Original preview below - now reliable */}
          {preview && (
            <div style={{ marginTop: '12px' }}>
              {file?.type?.startsWith('image/') ? (
                <img
                  src={preview}
                  alt="Preview"
                  className="image-preview"
                  style={{
                    maxHeight: '500px',
                    width: '100%',
                    objectFit: 'contain',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  }}
                />
              ) : (
                <video
                  src={preview}
                  controls
                  style={{
                    maxHeight: '200px',
                    width: '100%',
                    objectFit: 'cover',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  }}
                />
              )}
            </div>
          )}
        </div>

        <div className="form-group">
          <label>Caption</label>
          <textarea
            rows="3"
            placeholder="What's on your mind?"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            maxLength={2200}
          />
          <small>{caption.length}/2200</small>
        </div>

        {error && <div className="error">{error}</div>}

        <button
          type="submit"
          className="create-room-btn"
          disabled={uploading || !file}
          style={{ backgroundColor: '#8b5cf6' }} // Purple override
        >
          {uploading ? '📤 Uploading...' : '📸 Post'}
        </button>
      </form>
    </div>
  );
}
