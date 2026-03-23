import { Link } from 'react-router-dom';
import defaultpfp from '../../assets/default-pfp.png';
import './FeedPosts.css';
import { useFetchAllPosts } from '@/frontend/api/allposts';

export default function FeedPosts() {
  const { data: posts, isLoading, isError, error } = useFetchAllPosts();

  return (
    <main className="explore__main">
      <div className="home__nav-buttons">
        <Link to="/explore/posts" className="nav-button nav-button--explore">
          Posts
        </Link>
        <Link to="/explore/reels" className="nav-button nav-button--explore">
          Reels
        </Link>
      </div>

      <div className="posts-grid">
        {isLoading ? (
          <p>Loading posts...</p>
        ) : isError ? (
          <p>Error loading posts: {error?.message}</p>
        ) : posts?.length === 0 ? (
          <p>No posts available.</p>
        ) : (
          posts?.map((post) => (
            <article key={post.id} className="post-card">
              <div className="post-header">
                <img
                  src={post.user?.profile_image || defaultpfp}
                  alt={post.user?.username || 'User'}
                  className="pfp"
                />
                <span className="username">
                  {post.user?.username || 'Anonymous'}
                </span>
              </div>

              <div className="post-image">
                <img
                  src={post.image_url}
                  alt={post.caption || ''}
                  className="image"
                />
              </div>

              <div className="post-actions">
                <p>{post.caption || ''}</p>
              </div>
            </article>
          ))
        )}
      </div>
    </main>
  );
}
