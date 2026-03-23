import { useNavigate } from 'react-router-dom';
import useMyProfile from '@/frontend/api/myprofile';
import './UserSidebar.css';

const UserSideBar = () => {
  const navigate = useNavigate();
  const handleMyProfileClick = () => navigate('jam/me');

  const { data: profile, isLoading, isError, error } = useMyProfile();

  return (
    <aside className="home__aside">
      <div className="user-card" onClick={handleMyProfileClick}>
        <img
          src={profile?.profile_image_url}
          alt={`${profile?.username}'s profile`}
          className="user-card__avatar"
        />
        <div className="user-card__info">
          <span className="user-card__username">{profile?.username}</span>
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
