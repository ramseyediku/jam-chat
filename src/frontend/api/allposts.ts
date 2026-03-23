import { useQuery } from '@tanstack/react-query';

export interface Posts {
  id: number;
  image_url: string;
  locationcountry: string;
  caption: string;
  visibiity: string;
  comments_allowed: boolean;
  user: {
    username: string;
    profile_image: string;
  };
}

async function fetchAllPosts(): Promise<Posts[]> {
  const response = await fetch('https://jam-chat.onrender.com/api/posts', {
    credentials: 'include',
  });
  if (!response.ok) throw new Error('Failed to fetch posts');
  const result = await response.json();
  return result.posts;
}

// fetch all post query hook
export function useFetchAllPosts() {
  return useQuery<Posts[]>({
    queryKey: ['fetchAllPosts'],
    queryFn: fetchAllPosts,
  });
}
