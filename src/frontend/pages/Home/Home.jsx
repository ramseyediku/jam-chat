// Home.jsx - Top bar ONLY (search + username + logo)
import React, { useEffect, useState } from 'react';
import Sidebar from '../../components/Sidebar/Sidebar';
import logoWhite from '../../assets/logo-white.png';
import './Home.css';

export default function Home() {
  const [username, setUsername] = useState('Guest');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch('/api/profile', { credentials: 'include' });
        if (res.ok) {
          const user = await res.json();
          setUsername(user.username);
        }
      } catch (error) {
        console.error('Failed to fetch user:', error);
      }
    };
    fetchUser();
  }, []);

  return (
    <div className="home">
      {/* ===== TOP BAR ONLY ===== */}
      {/* Home.jsx - Logo LEFT + Username RIGHT */}
      <header className="home__header">
        <div className="header-topbar">
          <div className="header-topbar__content">
            {/* JAM Logo - FAR LEFT */}
            <div className="home__logo-section">
              <img src={logoWhite} alt="JAM logo" className="home__logo" />
            </div>

            {/* Search - CENTER */}
            <div className="home__search-section">
              <div className="search-container">
                <svg
                  className="search-icon"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <input
                  type="text"
                  className="search-input"
                  placeholder="Search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Username - FAR RIGHT */}
            <div className="home__user-section">
              <span className="home__username">{username}</span>
            </div>
          </div>
        </div>
      </header>

      {/* ===== SIDEBAR WITH TABS BELOW ===== */}
      <section className="home__container">
        <Sidebar />
        <main className="home__main">
          <div className="home__nav-buttons">
            <button className="nav-button nav-button--pk">PK Battles</button>
            <button className="nav-button nav-button--party">Party</button>
            <button className="nav-button nav-button--live">
              Live Streaming
            </button>
            <button className="nav-button nav-button--explore">Explore</button>
          </div>
        </main>
      </section>
    </div>
  );
}
