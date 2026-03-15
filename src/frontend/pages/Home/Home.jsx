import { useEffect, useState, useCallback } from 'react';
import SearchBar from '../../components/SearchBar/SearchBar';
import Sidebar from '../../components/Sidebar/Sidebar';
import { useNavigate } from 'react-router-dom';
import defaultpfp from '../../assets/default-pfp.png';
import './Home.css';

export default function Home() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('Loading...');
  const [profileImage, setProfileImage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState([]);

  const handleMyProfileClick = () => {
    navigate('/myprofile'); // ✅ Navigate to your new MyProfile
  };

  // Fetch current user profile
  const fetchUserProfile = useCallback(async () => {
    try {
      const res = await fetch('https://jam-chat.onrender.com/api/myprofile', {
        credentials: 'include',
      });
      if (res.ok) {
        const { user } = await res.json();
        setUsername(user.username || 'Guest');
        if (user.profile_image_url == '') {
          setProfileImage(defaultpfp);
        } else {
          setProfileImage(user.profile_image_url);
        }
        console.log(user.profile_image_url);
      } else {
        setUsername('Guest');
        console.error('Bad response from my profile');
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      setUsername('Guest');
    }
  }, []);

  useEffect(() => {
    fetchUserProfile();
    const fetchAllUsers = async () => {
      try {
        const res = await fetch('https://jam-chat.onrender.com/api/users');
        if (res.ok) {
          const allUsers = await res.json();
          setUsers(allUsers);
        }
      } catch (error) {
        console.error('Failed to fetch users:', error);
      }
    };
    fetchAllUsers();
  }, [fetchUserProfile]);

  return (
    <div className="home">
      <Sidebar />

      <main className="home__main">
        <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
        <section className="home__main__content">
          <div className="home__nav-buttons">
            <button className="nav-button nav-button--pk">PK Battles</button>
            <button className="nav-button nav-button--party">Party</button>
            <button className="nav-button nav-button--live">
              Live Streaming
            </button>
            <button className="nav-button nav-button--explore">Explore</button>
          </div>
        </section>
      </main>

      {/* ===== CURRENT USER CARD ===== */}
      <aside className="home__aside">
        <div
          className="user-card"
          onClick={handleMyProfileClick}
          style={{ cursor: 'pointer' }}
        >
          <div className="user-card__avatar">
            <img
              src={profileImage}
              alt={`${username}'s profile`}
              className="user-avatar"
            />
          </div>
          <div className="user-card__info">
            <span className="user-card__username">{username}</span>
            <span className="user-card__label">My Profile</span>
          </div>
        </div>
      </aside>
    </div>
  );
}
