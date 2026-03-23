// Explore.jsx - Full post feed with likes
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import './FeedReels.css';

// async function fetchPosts() {
//   const response = await fetch('https://jam-chat.onrender.com/api/posts', {
//     credentials: 'include',
//   });
//   if (!response.ok) throw new Error('Failed to fetch posts');
//   const result = await response.json();
//   return result.posts;
// }

export default function FeedReels() {
  const navigate = useNavigate();

  //   const {
  //     data: posts,
  //     isLoading,
  //     isError,
  //     error,
  //   } = useQuery({
  //     queryKey: ['fetchposts'],
  //     queryFn: fetchPosts,
  //   });

  return (
    <main className="explore__main">
      <div className="home__nav-buttons">
        <Link to="/explore/posts" className="nav-button nav-button--explore">
          {' '}
          Posts
        </Link>
        <Link to="/explore/reels" className="nav-button nav-button--explore">
          {' '}
          Reels
        </Link>
      </div>

      <div className="posts-grid"></div>
    </main>
  );
}
