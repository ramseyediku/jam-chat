// Home.jsx - Top bar ONLY (search + username + logo)
import React, { useEffect, useState } from 'react';
import Sidebar from '../../components/Sidebar/Sidebar';
import SearchBar from '../../components/SearchBar/SearchBar';
import logoWhite from '../../assets/logo-white.png';
import './Home.css';

export default function Home() {
  const [username, setUsername] = useState('Guest');
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState([]);

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

  useEffect(() => {
    const fetchAllUsers = async () => {
      try {
        const res = await fetch('/api/users');
        if (res.ok) {
          const allUsers = await res.json();
          setUsers(allUsers);
        }
      } catch (error) {
        console.error('Failed to fetch users:', error);
      }
    };
    fetchAllUsers();
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
            <SearchBar
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
            />

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
