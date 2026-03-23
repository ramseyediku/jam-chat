import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './SearchBar.css';

export default function SearchBar() {
  const [results, setResults] = useState([]);
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

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

  const handleUserClick = (userId) => {
    setResults([]);
    setSearchQuery('');
    navigate(`/jam/user/${userId}`);
  };

  return (
    <div className="search">
      <input
        type="text"
        name="search"
        className="input search__input"
        placeholder="Search People.."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      {results.length > 0 && (
        <ol className="search__results" role="listbox">
          {results.map((user) => (
            <li
              key={user.id}
              className="search__result__item"
              role="option"
              onClick={() => handleUserClick(user.id, user.username)}
              onMouseDown={(e) => e.preventDefault()}
              tabIndex={0}
            >
              <img
                src={user.profile_image_url}
                alt={user.username}
                className="search__result__avatar"
              />
              <div className="search__result__info">
                <span>{user.username}</span>
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
