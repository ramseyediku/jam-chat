// Explore.jsx - Full post feed with likes
import { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar/Sidebar';
import './Explore.css';

export default function Explore() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [likes, setLikes] = useState({}); // Track user likes

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await fetch('/api/posts', { credentials: 'include' });
      if (!response.ok) throw new Error('Failed to fetch');

      const result = await response.json();
      console.log('Posts response:', result); // Debug

      setPosts(Array.isArray(result.posts) ? result.posts : []);
    } catch (error) {
      console.error('Posts fetch error:', error);
      setPosts([]); // Empty array fallback
    } finally {
      setLoading(false);
    }
  };

  const toggleLike = async (postId) => {
    const isLiked = likes[postId];
    setLikes((prev) => ({ ...prev, [postId]: !isLiked }));

    // TODO: POST /api/posts/{id}/like with auth cookie
    // await fetch(`/api/posts/${postId}/like`, {
    //   method: 'POST',
    //   credentials: 'include'
    // });
  };

  if (loading) {
    return (
      <div className="explore">
        <section className="explore__container">
          <Sidebar />
          <main className="explore__main">
            <div className="loading">Loading posts...</div>
          </main>
        </section>
      </div>
    );
  }

  return (
    <div className="explore">
      <section className="explore__container">
        <Sidebar />
        <main className="explore__main">
          <h1 className="feed">My Feed</h1>
          <div className="posts-grid">
            {posts.map((post) => (
              <article key={post.id} className="post-card">
                <div className="post-header">
                  <img
                    src={post.users?.profile_image_url || '/default-avatar.svg'}
                    alt={post.users?.username || 'User'}
                    className="pfp"
                    onError={(e) => {
                      e.target.src = '/default-avatar.svg';
                    }}
                  />
                  <span className="username">
                    {post.users?.username || 'Anonymous'}
                  </span>
                </div>

                <div className="post-image">
                  <img
                    src={post.image_url}
                    alt={post.caption || ''}
                    className="image"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                </div>

                <div className="post-actions">
                  <button
                    className={`like-btn ${likes[post.id] ? 'liked' : ''}`}
                    onClick={() => toggleLike(post.id)}
                  >
                    {likes[post.id] ? '❤️' : '🤍'}
                  </button>
                </div>

                <div className="post-caption">
                  <p>{post.caption || ''}</p>
                </div>

                <div className="post-meta">
                  <span>{post.locationcountry || ''}</span>
                  <span className="timestamp">
                    {post.created_at
                      ? new Date(post.created_at).toLocaleDateString()
                      : ''}
                  </span>
                </div>
              </article>
            ))}
          </div>
        </main>
      </section>
    </div>
  );
}
