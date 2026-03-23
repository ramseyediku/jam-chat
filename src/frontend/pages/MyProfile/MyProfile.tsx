import useMyProfile from '@/frontend/api/myprofile';
import iconDiamond from '../../assets/icon_diamond.png';
import './MyProfile.css';

export default function MyProfile() {
  const { data: profile, isLoading, isError, error } = useMyProfile();

  return (
    <main className="profile">
      {isLoading && (
        <div className="profile-loading">Loading your profile...</div>
      )}

      {isError && !isLoading && (
        <div className="profile-error">
          {error?.message || 'Profile info not available'}
          <br />
          <a href="/">Go to Login</a>
        </div>
      )}

      {!isLoading && !isError && profile && (
        <>
          {/* Profile Header */}
          <div className="profile__header">
            <div className="profile__header__info">
              <img
                src={profile.profile_image_url}
                alt={profile.username}
                className="profile__avatar"
              />
              <h1 className="profile__username">
                {profile?.username || 'Guest'}
              </h1>
              {/* <span>ID {profile?.uniqueid || 'user'}</span> */}
              <span className="profile__age-gender">
                <span>{profile?.age}</span>
                <span>{profile?.gender}</span>
              </span>
              <span className="profile__level">Level {profile?.level}</span>
            </div>

            <button className="profile-btn-primary">Edit Profile</button>
          </div>

          {/* Cards Section */}
          <div className="profile__cards">
            {/* Diamonds/Wallet */}
            <div className="profile__card profile__card--diamonds">
              <img src={iconDiamond} alt="diamond icon" />
              <div className="card-main">
                <span className="card-value">
                  My Diamonds
                  <br />
                  {profile.diamonds}
                </span>
              </div>
              <button className="card-btn">My Wallet</button>
            </div>

            {/* Host & Privilege */}
            <div className="profile__card profile__card--follow">
              <div className="card-title">Host & Privilege</div>
              <div className="card-buttons">
                {profile?.isHost ? (
                  <button className="host-btn primary">Host Active</button>
                ) : (
                  <button className="host-btn">Become Host</button>
                )}
                <span className="vip-badge">VIP Lv{profile.level}</span>
                {profile?.agency && (
                  <span className="agency-tag">{profile?.agency}</span>
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
        </>
      )}
    </main>
  );
}
