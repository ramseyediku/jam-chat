// myprofile.jsx - Updated to match exact API response fields
import React, { useEffect, useState } from 'react';
import './MyProfile.css';
import Sidebar from '../../components/Sidebar/Sidebar';
import defaultpfp from '../../assets/default-pfp.png';
import iconDiamond from '../../assets/icon_diamond.png';

export default function MyProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch('/api/myprofile', { credentials: 'include' });

        if (!res.ok) {
          if (res.status === 401) setError('Please log in');
          else if (res.status === 404) setError('User not found');
          else setError('Failed to load profile');
          setLoading(false);
          return;
        }

        const data = await res.json();
        const userData = data.user;

        // Handle empty/null profile_image → default avatar
        if (!userData.profile_image || userData.profile_image === '')
          userData.profile_image = defaultpfp;

        setProfile(userData);
      } catch (err) {
        setError('Network error - check connection');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading)
    return (
      <div className="profile-root">
        <Sidebar />
        <div className="profile-loading">Loading your profile...</div>
      </div>
    );

  if (error || !profile)
    return (
      <div className="profile-root">
        <Sidebar />
        <div className="profile-error">
          {error || 'Profile not available'}
          <br />
          <a href="/login">Go to Login</a>
        </div>
      </div>
    );

  return (
    <div
      style={{
        display: 'flex',
      }}
    >
      <Sidebar />
      <div className="profile">
        {/* Profile Header - Uses API fields */}
        <div className="profile__header">
          <img
            src={profile.profile_image_url}
            alt={profile.username}
            className="profile__avatar"
          />

          <div className="profile__header__info">
            <h1 className="profile__username">{profile.username || 'Guest'}</h1>
            <span>ID {profile.uniqueid || 'user'}</span>
            <span className="profile__age-gender">
              <span>{profile.age || 'N/A'}</span>
              <span>{profile.gender || 'N/A'}</span>
            </span>
            <span className="profile__level">
              Level {profile.level || 'N/A'}
            </span>
          </div>

          <button className="profile-btn-primary">Edit Profile</button>
        </div>

        {/* Cards Section - Uses API data */}
        <div className="profile__cards">
          {/* Diamonds/Wallet */}
          <div className="profile__card profile__card--diamonds">
            <img src={iconDiamond} alt="diamond icon" />
            <div className="card-main">
              <span className="card-value">
                My Diamonds <br></br>
                {profile.diamonds}
              </span>
            </div>
            <button className="card-btn">My Wallet</button>
          </div>

          {/* Host & Privilege - Uses isHost */}
          <div className="profile__card profile__card--follow">
            <div className="card-title">Host & Privilege</div>
            <div className="card-buttons">
              {profile.isHost ? (
                <button className="host-btn primary">Host Active</button>
              ) : (
                <button className="host-btn">Become Host</button>
              )}
              <span className="vip-badge">VIP Lv{profile.level || 1}</span>
              {profile.agency && (
                <span className="agency-tag">{profile.agency}</span>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="profile-tabs">
          <button className="nav-button active">Posts</button>
          <button className="nav-button">Reels</button>
          <button className="nav-button">Store</button>
          <button className="nav-button">User Level</button>
        </div>

        <div className="profile-content-placeholder">
          Select a tab above to view content
        </div>
      </div>
    </div>
  );
}
