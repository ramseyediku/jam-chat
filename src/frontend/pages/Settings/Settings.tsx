import useMyProfile from '@/frontend/api/myprofile';
import './Settings.css';

export default function Settings() {
  const { data: profile, isLoading, isError, error } = useMyProfile();

  return (
    <main className="settings">
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
          <h1>{profile?.username}</h1>
          <img
            src={profile?.profile_image_url}
            alt={profile?.username}
            className="settings__avatar"
          />
        </>
      )}
    </main>
  );
}
