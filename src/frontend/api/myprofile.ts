import { useQuery } from '@tanstack/react-query';
import defaultpfp from '../assets/default-pfp.png';

// my profile Interface
export interface Profile {
  username: string;
  profile_image_url: string;
  age: number;
  gender: string;
  diamonds: number;
  rcoins: number;
  agency: string;
  isHost: boolean;
  isBlocked: boolean;
  following: number;
  fans: number;
  level: number;
  bio: string;
  country: string;
}

// fetch my profile information (currently logged in user)
async function fetchMyProfile(): Promise<Profile> {
  const res = await fetch('https://jam-chat.onrender.com/api/myprofile', {
    credentials: 'include',
  });

  if (!res.ok) {
    if (res.status === 401) throw new Error('Please log in');
    throw new Error('Failed to load profile');
  }

  const data = await res.json();
  const userData = data.user;

  if (!userData.profile_image || userData.profile_image === '')
    userData.profile_image = defaultpfp;

  return userData;
}

// my profile query hook
export default function useMyProfile() {
  return useQuery({
    queryKey: ['myProfile'],
    queryFn: fetchMyProfile,
    staleTime: 1000 * 60 * 5, // current profile info stale for 5 min
    gcTime: 1000 * 60 * 30, // current profile info refetched every 30 min
  });
}
