import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import SearchBar from '../SearchBar/SearchBar';
import logoWhite from '../../assets/logo-white.png';
import './Header.css';

export default function Header({
  searchQuery = '',
  setSearchQuery = () => {},
  username = 'Guest',
  setUsername = () => {},
}) {
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
  }, [setUsername]);

  return (
    <header className="home__header">
      <div className="header-topbar">
        <div className="header-topbar__content">
          <div className="home__logo-section">
            <img src={logoWhite} alt="JAM logo" className="home__logo" />
          </div>

          <SearchBar
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />

          <div className="home__user-section">
            <Link to="/profile" className="home__username-link">
              <span className="home__username">{username}</span>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
