// Create.jsx - Updated with 4 action buttons
import Sidebar from '../../components/Sidebar/Sidebar';
import './Create.css';
import Header from '../../components/Header/Header';
import { useEffect, useState } from 'react';

export default function Create() {
  const [username, setUsername] = useState('Guest');
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="create">
      <Header
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        username={username}
        setUsername={setUsername}
      />

      <header className="create__header">
        <h1 className="create__title">Create</h1>
      </header>

      <section className="create__container">
        <Sidebar />
        <main className="create__main">
          <div className="create-actions">
            <button className="create-action live">
              <div className="create-icon">📡</div>
              <span>Go Live</span>
            </button>

            <button className="create-action audio">
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
      </section>
    </div>
  );
}
