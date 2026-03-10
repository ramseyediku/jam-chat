// Create.jsx - Blur‑fixed with states
import Sidebar from '../../components/Sidebar/Sidebar';
import './Create.css';
import AudioRoomModal from '../../components/AudioRoomModal/AudioRoomModal';
import PostUploadModal from '../../components/PostUploadModal/PostUploadModal';
import { useEffect, useState, useCallback } from 'react';

export default function Create() {
  const [username, setUsername] = useState('Guest');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAudioModal, setShowAudioModal] = useState(false);
  const [showPostModal, setShowPostModal] = useState(false);

  // 👇 Close handlers
  const closeAllModals = useCallback(() => {
    setShowAudioModal(false);
    setShowPostModal(false);
  }, []);

  const openAudioModal = useCallback(() => setShowAudioModal(true), []);
  const openPostModal = useCallback(() => setShowPostModal(true), []);

  // 👇 ESC key
  useEffect(() => {
    const handleEscape = (e) => e.key === 'Escape' && closeAllModals();
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [closeAllModals]);

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

            <button className="create-action audio" onClick={openAudioModal}>
              <div className="create-icon">🎤</div>
              <span>Audio Live</span>
            </button>

            <button className="create-action reels">
              <div className="create-icon">🎬</div>
              <span>Reels</span>
            </button>

            <button className="create-action post" onClick={openPostModal}>
              <div className="create-icon">✏️</div>
              <span>Post</span>
            </button>
          </div>
        </main>

        {/* 👇 FIXED: Backdrop + modals (no blur!) */}
        {(showAudioModal || showPostModal) && (
          <>
            {/* Backdrop */}
            <div
              onClick={closeAllModals}
              style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0, 0, 0, 0.4)',
                zIndex: 1000,
                cursor: 'default',
              }}
            />

            {/* Modals */}
            <div
              style={{
                position: 'fixed',
                zIndex: 1001,
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                pointerEvents: 'none', // Backdrop handles clicks
              }}
            >
              {showAudioModal && (
                <div style={{ pointerEvents: 'auto' }}>
                  <AudioRoomModal onClose={closeAllModals} />
                </div>
              )}
              {showPostModal && (
                <div style={{ pointerEvents: 'auto' }}>
                  <PostUploadModal onClose={closeAllModals} />
                </div>
              )}
            </div>
          </>
        )}
      </section>
    </div>
  );
}
