import AudioRoomModal from '../../components/AudioRoomModal/AudioRoomModal';
import PostUploadModal from '../../components/PostUploadModal/PostUploadModal';
import { useEffect, useState, useCallback } from 'react';
import './Create.css';

export default function Create() {
  const [showAudioModal, setShowAudioModal] = useState(false);
  const [showPostModal, setShowPostModal] = useState(false);

  // Close modal handlers
  const closeAllModals = useCallback(() => {
    setShowAudioModal(false);
    setShowPostModal(false);
  }, []);

  const openAudioModal = useCallback(() => setShowAudioModal(true), []);
  const openPostModal = useCallback(() => setShowPostModal(true), []);

  // escape modals on ESC key
  useEffect(() => {
    const handleEscape = (e: { key: string }) =>
      e.key === 'Escape' && closeAllModals();
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [closeAllModals]);

  return (
    <section className="create__container">
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
  );
}
