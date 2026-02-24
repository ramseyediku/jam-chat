// Explore.jsx - Simple explore page with Sidebar
import React, { useEffect, useState } from 'react';
import Header from '../../components/Header/Header';
import Sidebar from '../../components/Sidebar/Sidebar';
import './Explore.css';

export default function Explore() {
  const [username, setUsername] = useState('Guest');
  const [searchQuery, setSearchQuery] = useState('');
  return (
    <div className="explore">
      {/* Reusable Header */}
      <Header
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        username={username}
        setUsername={setUsername}
      />

      <header className="explore__header">
        <h1 className="explore__title">Explore</h1>
      </header>

      <section className="explore__container">
        <Sidebar />
        <main className="explore__main">
          <p>Discover new content here.</p>
        </main>
      </section>
    </div>
  );
}
