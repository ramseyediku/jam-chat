// Profile.jsx - Other users only, matches MyProfile styling exactly
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import '../MyProfile/MyProfile.css';
import Sidebar from '../../components/Sidebar/Sidebar';
import { useNavigate } from 'react-router-dom';
import defaultpfp from '../../assets/default-pfp.png';

export default function Profile() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(`/api/user?id=${id}`, {
          credentials: 'include',
        });

        if (!res.ok) {
          if (res.status === 404) setError('User not found');
          else setError('Failed to load profile');
          setLoading(false);
          return;
        }

        const data = await res.json();

        // Default pfp
        if (!data.profile_image_url || data.profile_image_url === '') {
          data.profile_image_url = defaultpfp;
        }

        setProfile(data);
      } catch (err) {
        setError('Network error');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [id]);

  if (loading)
    return (
      <div className="profile-root">
        <Sidebar />
        <div className="profile-loading">Loading profile...</div>
      </div>
    );

  if (error || !profile)
    return (
      <div className="profile-root">
        <Sidebar />
        <div className="profile-error">{error || 'No profile found'}</div>
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
        {/* Header - Exact MyProfile match */}
        {/* Profile Header - Uses API fields */}
        <div className="profile__header">
          <img
            src={profile.profile_image_url}
            alt={profile.username}
            className="profile__avatar"
          />

          <div className="profile__header__info">
            <h1 className="profile__username">{profile.username || 'Guest'}</h1>
            <span>ID {profile.uniqueId || 'user'}</span>
            <span className="profile__age-gender">
              <span>{profile.age || 'N/A'}</span>
              <span>{profile.gender || 'N/A'}</span>
            </span>
            <span className="profile__level">
              Level {profile.level || 'N/A'}
            </span>
          </div>

          <button className="profile-btn-primary">Message</button>
        </div>

        {/* Cards - Fans/Following only (no private info) */}
        <div className="profile__cards">
          <div className="profile__card profile__card--stats">
            <div className="card-main">
              <span className="card-value">{profile.fans || 0}</span>
              <span className="card-label">Fans</span>
            </div>
            <div className="card-divider" />
            <div className="card-main">
              <span className="card-value">{profile.following || 0}</span>
              <span className="card-label">Following</span>
            </div>
          </div>
        </div>

        {/* Other user tabs */}
        <div className="profile-tabs">
          <button className="nav-button active">Posts</button>
          <button className="nav-button">Fans</button>
          <button className="nav-button">Following</button>
        </div>

        <div className="profile-content-placeholder">
          Content will appear here
        </div>
      </div>
    </div>
  );
}
