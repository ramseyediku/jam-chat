// src/frontend/api/userprofile.ts
import { useQuery } from '@tanstack/react-query';
import defaultpfp from '../assets/default-pfp.png';

export interface UserProfile {
  username: string;
  profile_image_url: string;
  uniqueid: string;
  age: number;
  gender: string;
  level: number;
  fans: number;
  following: number;
}

async function fetchProfile(userId: number): Promise<UserProfile> {
  const res = await fetch(
    `https://jam-chat.onrender.com/api/user?id=${userId}`,
    {
      credentials: 'include',
    }
  );

  if (!res.ok) {
    if (res.status === 404) throw new Error('User not found');
    throw new Error('Failed to load profile');
  }

  const data = await res.json();

  if (!data.profile_image_url || data.profile_image_url === '')
    data.profile_image_url = defaultpfp;

  return data;
}

export function useProfile(userId: Number) {
  return useQuery<UserProfile>({
    queryKey: ['profile', userId],
    queryFn: () => fetchProfile(Number(userId)),
    enabled: !!userId,
  });
}
