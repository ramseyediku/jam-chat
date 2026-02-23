import React, { useState, useEffect, useRef } from 'react';
import './SearchBar.css';

export default function SearchBar({ searchQuery, setSearchQuery }) {
  const [results, setResults] = useState([]);
  const debounceTimerRef = useRef(null);
  const lastCallTimeRef = useRef(0);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(() => {
      fetch(`/api/search?query=${encodeURIComponent(searchQuery)}`)
        .then((res) => res.json())
        .then(setResults)
        .catch(console.error);
    }, 300); // 300ms debounce (we can adjust this as needed)

    return () => clearTimeout(timer);
  }, [searchQuery]);

  return (
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
        {results.length > 0 && (
          <ul className="search-results">
            {results.map((user) => (
              <li key={user.id} className="search-result-item">
                <img
                  src={user.prof_pic}
                  alt={user.username}
                  className="search-result-avatar"
                />
                <div className="search-result-info">
                  <span className="search-result-username">
                    {user.username}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
