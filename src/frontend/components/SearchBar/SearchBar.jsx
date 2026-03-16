import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './SearchBar.css';

export default function SearchBar({ searchQuery, setSearchQuery }) {
  const [results, setResults] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(() => {
      fetch(
        `https://jam-chat.onrender.com/api/search?query=${encodeURIComponent(searchQuery)}`
      )
        .then((res) => res.json())
        .then(setResults)
        .catch(console.error);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleUserClick = (userId, username) => {
    setResults([]);
    setSearchQuery('');
    navigate(`/user/${userId}`);
  };

  return (
    <div className="search">
      <input
        type="text"
        className="input search-input"
        placeholder="Search People.."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      {results.length > 0 && (
        <ul className="search-results" role="listbox">
          {results.map((user) => (
            <li
              key={user.id}
              className="search-result-item"
              role="option"
              onClick={() => handleUserClick(user.id, user.username)}
              onMouseDown={(e) => e.preventDefault()}
              tabIndex={0}
            >
              <img
                src={user.profile_image_url}
                alt={user.username}
                className="search-result-avatar"
              />
              <div className="search-result-info">
                <span className="search-result-username">{user.username}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
