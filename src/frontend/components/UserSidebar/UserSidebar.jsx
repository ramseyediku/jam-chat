import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import defaultpfp from '../../assets/default-pfp.png';
import './UserSidebar.css';

const UserSideBar = () => {
  const [username, setUsername] = useState('Loading...');
  const [profileImage, setProfileImage] = useState(defaultpfp);
  const navigate = useNavigate();
  const handleMyProfileClick = () => navigate('jam/me');

  const fetchUserProfile = useCallback(async () => {
    try {
      const res = await fetch('https://jam-chat.onrender.com/api/myprofile', {
        credentials: 'include',
      });

      if (res.ok) {
        const { user } = await res.json();
        setUsername(user.username);

        if (user.profile_image_url != '')
          setProfileImage(user.profile_image_url);
      } else {
        setUsername('Guest');
        setProfileImage(defaultpfp);
        console.error('Bad response from my profile');
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      setUsername('Guest');
    }
  }, []);

  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  return (
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

      <div className="home__aside__footer">
        <a target="_blank" href="https://jamchat.live/terms-and-conditions">
          Terms of Service
        </a>{' '}
        ·{' '}
        <a target="_blank" href="https://jamchat.live/privacy-policy">
          Privacy Policy
        </a>{' '}
        ·
        <a target="_blank" href="https://jamchat.live/about-us">
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
  );
};

export default UserSideBar;
