import React, { useEffect, useState } from 'react';
import Header from '../../components/Header/Header';
import Sidebar from '../../components/Sidebar/Sidebar';
import './Home.css';

export default function Home() {
  const [username, setUsername] = useState('Guest');
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState([]);

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
      {/* Reusable Header */}
      <Header
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        username={username}
        setUse
        rname={setUsername}
      />

      <header className="create__header">
        <h1 className="create__title">Home</h1>
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
