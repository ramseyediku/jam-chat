import { useEffect, useState, useCallback } from 'react';
import SearchBar from '../../components/SearchBar/SearchBar';
import Sidebar from '../../components/Sidebar/Sidebar';
import { useNavigate } from 'react-router-dom';
import defaultpfp from '../../assets/default-pfp.png';
import bannerImage from '../../assets/banner.png';
import './Home.css';

export default function Home() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('Loading...');
  const [profileImage, setProfileImage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState([]);

  const handleMyProfileClick = () => navigate('/myprofile');

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
        <a
          className="home__main__banner"
          target="_blank"
          href="https://ko-fi.com/jamstudio"
        >
          <img src={bannerImage} alt="ko-fi banner image" />
        </a>
        <section className="home__main__content">
          <div className="home__nav-buttons">
            <button className="nav-button nav-button--explore">Explore</button>
            <button className="nav-button nav-button--live">
              Live Streaming
            </button>
            <button className="nav-button nav-button--pk">PK Battles</button>
            <button className="nav-button nav-button--party">Party</button>
          </div>
        </section>
      </main>

      {/* ===== CURRENT USER CARD ===== */}
      <aside className="home__aside">
        <div className="user-card" onClick={handleMyProfileClick}>
          <img
            src={profileImage}
            alt={`${username}'s profile`}
            className="user-card__avatar"
          />
          <div className="user-card__info">
            <span className="user-card__username">{username}</span>
            <span className="user-card__label">My Profile</span>
          </div>
        </div>

        <div class="home__aside__footer">
          <a target="_blank" href="https://jamchat.live/terms-and-conditions">
            Terms of Service
          </a>{' '}
          ·{' '}
          <a target="_blank" href="https://jamchat.live/privacy-policy">
            Privacy Policy
          </a>{' '}
          ·
          <a target="_blank" href="https://jamchat.live/about-us">
            {' '}
            About Us
          </a>{' '}
          ·{' '}
          <a target="_blank" href="https://jamchat.live/reports">
            Have an issue?
          </a>
          <br />
          <p>Copyright © 2026 JAM - All rights reserved</p>
        </div>
      </aside>
    </div>
  );
}
