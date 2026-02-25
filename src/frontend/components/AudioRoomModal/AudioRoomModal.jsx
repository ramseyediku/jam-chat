// components/Create/AudioRoomModal.jsx
import React, { useState } from 'react';
import './AudioRoomModal.css';

export default function AudioRoomModal({ onClose }) {
  const [formData, setFormData] = useState({
    image: null,
    name: '',
    description: '',
    type: 'public',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append('name', formData.name);
    data.append('description', formData.description);
    data.append('type', formData.type);
    if (formData.image) data.append('image', formData.image);

    try {
      const res = await fetch('/api/rooms', {
        method: 'POST',
        body: data,
      });
      const room = await res.json();
      if (room.id) {
        window.location.href = `/audio/${room.id}`; // Redirect to room
      }
    } catch (err) {
      console.error('Room creation failed');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="audio-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Create Audio Room</h2>
          <button className="close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="room-form">
          <div className="form-group">
            <label>Room Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) =>
                setFormData({ ...formData, image: e.target.files[0] })
              }
              className="file-input"
            />
            {formData.image && (
              <img
                src={URL.createObjectURL(formData.image)}
                alt="Preview"
                className="image-preview"
              />
            )}
          </div>

          <div className="form-group">
            <label>Room Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              maxLength={50}
              required
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              maxLength={200}
              rows={3}
              placeholder="What's this room about?"
            />
          </div>

          <div className="form-group">
            <label>Room Type</label>
            <select
              value={formData.type}
              onChange={(e) =>
                setFormData({ ...formData, type: e.target.value })
              }
            >
              <option value="public">Public</option>
              <option value="private">Private (Invite only)</option>
            </select>
          </div>

          <button
            onSubmit={(e) => {
              handleSubmit();
            }}
            type="submit"
            className="create-room-btn"
          >
            Start audio live
          </button>
        </form>
      </div>
    </div>
  );
}
