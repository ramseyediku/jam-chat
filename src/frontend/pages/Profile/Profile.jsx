import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import './Profile.css';
import Sidebar from '../../components/Sidebar/Sidebar';
import Header from '@/frontend/components/Header/Header';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [username, setUsername] = useState('Guest');

  const isOwnProfile = !id;

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const endpoint = isOwnProfile ? '/api/profile' : `/api/user?id=${id}`;
        const res = await fetch(endpoint, { credentials: 'include' });

        if (!res.ok) {
          if (res.status === 401) setError('Unauthorized');
          else if (res.status === 404) setError('User not found');
          else setError('Failed to load profile');
          setLoading(false);
          return;
        }

        const data = await res.json();
        setProfile(data);
      } catch (err) {
        setError('Network error');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [id, isOwnProfile]);

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
        <Header />
        <Sidebar />
        <div className="profile-error">{error || 'No profile found'}</div>
      </div>
    );

  return (
    <>
      <Header
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        username={username}
        setUsername={setUsername}
      />
      <div className="profile-root">
        <Sidebar />
        <div className="profile-main">
          <div className="profile-header">
            <img
              src={profile.prof_pic}
              alt={profile.username}
              className="profile-avatar"
            />
            <div className="profile-info">
              <h1 className="profile-username">{profile.username}</h1>
              <div className="profile-meta">
                <span>{profile.age}</span>
                <span>•</span>
                <span>{profile.gender}</span>
              </div>
              <div className="profile-stats">
                <span>Level {profile.level || 1}</span>
                <span>•</span>
                <span>{profile.following || 0} following</span>
                <span>•</span>
                <span>{profile.fans || 0} fans</span>
              </div>
              {profile.bio && <p className="profile-bio">{profile.bio}</p>}
            </div>
            <div className="profile-actions">
              {isOwnProfile ? (
                <button className="profile-btn-primary">Edit Profile</button>
              ) : (
                <>
                  <button className="profile-btn-primary">Follow</button>
                  <button
                    className="profile-btn-secondary"
                    onClick={() => navigate(`/chat/${profile.id}`)}
                  >
                    Message
                  </button>{' '}
                </>
              )}
            </div>
          </div>

          <div className="profile-tabs">
            <button className="nav-button">Posts</button>
            <button className="nav-button">Fans</button>
            <button className="nav-button">Following</button>
          </div>

          <div className="profile-content-placeholder">
            Content tabs go here (posts, etc.)
          </div>
        </div>
      </div>
    </>
  );
}
