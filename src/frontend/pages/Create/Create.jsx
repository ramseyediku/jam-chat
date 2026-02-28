// Create.jsx - Updated with 4 action buttons
import Sidebar from '../../components/Sidebar/Sidebar';
import './Create.css';
import AudioRoomModal from '../../components/AudioRoomModal/AudioRoomModal'; // ADD
import { useEffect, useState } from 'react';

export default function Create() {
  const [username, setUsername] = useState('Guest');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAudioModal, setShowAudioModal] = useState(false); // ADD

  return (
    <div className="create">
      <section className="create__container">
        <Sidebar />
        <main className="create__main">
          <div className="create-actions">
            <button className="create-action live">
              <div className="create-icon">📡</div>
              <span>Go Live</span>
            </button>

            <button
              className="create-action audio"
              onClick={() => setShowAudioModal(true)} // ADD
            >
              <div className="create-icon">🎤</div>
              <span>Audio Live</span>
            </button>

            <button className="create-action reels">
              <div className="create-icon">🎬</div>
              <span>Reels</span>
            </button>

            <button className="create-action post">
              <div className="create-icon">✏️</div>
              <span>Post</span>
            </button>
          </div>
        </main>
        {/* ADD: Audio Room Modal */}
        {showAudioModal && (
          <AudioRoomModal onClose={() => setShowAudioModal(false)} />
        )}
      </section>
    </div>
  );
}
