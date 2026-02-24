// Live.jsx - Simple live page with Sidebar
import React, { useEffect, useState } from 'react';
import Header from '../../components/Header/Header';
import Sidebar from '../../components/Sidebar/Sidebar';
import './Live.css';

export default function Live() {
  const [username, setUsername] = useState('Guest');
  const [searchQuery, setSearchQuery] = useState('');
  return (
    <div className="live">
      {/* Reusable Header */}
      <Header
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        username={username}
        setUsername={setUsername}
      />
      <header className="live__header">
        <h1 className="live__title">Live</h1>
      </header>

      <section className="live__container">
        <Sidebar />
        <main className="live__main">
          <p>Live streaming and channels.</p>
        </main>
      </section>
    </div>
  );
}
