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
    <div className="profile-root">
      <Sidebar />
      <div className="profile-main">
        {/* Profile Header - Uses API fields */}
        <div className="profile-header">
          <img
            src={profile.profile_image}
            alt={profile.username}
            className="profile-avatar"
          />
          <div className="profile-info">
            <h1 className="profile-username">
              {profile.username || 'Guest'}
              <span className="username-badge">
                {profile.uniqueId || 'user'}
              </span>
            </h1>
            <div className="profile-meta">
              <span>{profile.age || 'N/A'}</span>
              <span>•</span>
              <span>{profile.gender || 'N/A'}</span>
            </div>
            <div className="profile-stats">
              <span>Level {profile.level || 1}</span>
              <span>•</span>
              <span>{profile.following || 0} following</span>
              <span>•</span>
              <span>{profile.fans || 0} fans</span>
            </div>
          </div>
          <div className="profile-actions">
            <button className="profile-btn-primary">Edit Profile</button>
          </div>
        </div>

        {/* Cards Section - Uses API data */}
        <div className="profile-cards">
          {/* Diamonds/Wallet */}
          <div className="profile-card diamonds">
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
          <div className="profile-card host">
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
