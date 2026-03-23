// Profile.tsx - to view other peoples profile only
import { useParams, useNavigate } from 'react-router-dom';
import SearchBar from '@/frontend/components/SearchBar/SearchBar';
import '../MyProfile/MyProfile.css';
import { useProfile } from '@/frontend/api/userprofile';

export default function Profile() {
  const navigate = useNavigate();
  const { id } = useParams();

  const { data: profile, isLoading, error } = useProfile(Number(id)); // <-- useProfile here

  return (
    <div className="profile">
      <SearchBar />
      {isLoading && <div className="profile-loading">Loading profile...</div>}

      {error && !isLoading && (
        <div className="profile-error">
          {error.message || 'No profile found'}
        </div>
      )}

      {!isLoading && !error && profile && (
        <div>
          {/* Profile Header */}
          <div className="profile__header">
            <h1 className="profile__username">{profile.username}</h1>

            <img
              src={profile.profile_image_url}
              alt={profile.username}
              className="profile__avatar"
            />

            <div className="profile__header__info">
              <span>ID {profile.uniqueid}</span>
              <span className="profile__age-gender">
                <span>{profile.age}</span>
                <span>{profile.gender}</span>
              </span>
              <span className="profile__level">Level {profile.level}</span>
            </div>

            {/* <button
              className="profile-btn-primary"
              onClick={() => navigate(`/chat/${profile.id}`)}
            >
              Message
            </button> */}
          </div>

          {/* Stats Cards */}
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

          {/* Profile Tabs */}
          <div className="profile-tabs">
            <button className="nav-button active">Posts</button>
            <button className="nav-button">Relite</button>
          </div>

          <div className="profile-content-placeholder"></div>
        </div>
      )}
    </div>
  );
}
