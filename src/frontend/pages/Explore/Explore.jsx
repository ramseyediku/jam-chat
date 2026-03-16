// Explore.jsx - Full post feed with likes
import { useState, useEffect, useCallback } from 'react';
import Sidebar from '../../components/Sidebar/Sidebar';
import UserSideBar from '@/frontend/components/UserSidebar/UserSidebar';
import defaultpfp from '../../assets/default-pfp.png';
import SearchBar from '@/frontend/components/SearchBar/SearchBar';
import { useNavigate } from 'react-router-dom';
import './Explore.css';

export default function Explore() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [likes, setLikes] = useState({}); // Track user likes
  const [username, setUsername] = useState('Loading...');
  const [profileImage, setProfileImage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const handleMyProfileClick = () => navigate('/myprofile');

  const fetchUserProfile = useCallback(async () => {
    try {
      const res = await fetch('https://jam-chat.onrender.com/api/myprofile', {
        credentials: 'include',
      });
      if (res.ok) {
        const { user } = await res.json();
        setUsername(user.username || 'Guest');
        if (user.profile_image_url == '') {
          setProfileImage(defaultpfp);
        } else {
          setProfileImage(user.profile_image_url);
        }
        console.log(user.profile_image_url);
      } else {
        setUsername('Guest');
        console.error('Bad response from my profile');
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      setUsername('Guest');
    }
  }, []);
  useEffect(() => {
    fetchUserProfile();
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await fetch('https://jam-chat.onrender.com/api/posts', {
        credentials: 'include',
      });
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
    <div className="home">
      <Sidebar />
      <main className="explore__main">
        <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
        <div className="home__nav-buttons">
          <button className="nav-button nav-button--explore">Posts</button>
          <button className="nav-button nav-button--live">Reels</button>
        </div>

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
                <p>{post.caption || ''}</p>
              </div>
            </article>
          ))}
        </div>
      </main>
      <UserSideBar
        username={username}
        profileImage={profileImage}
        onMyProfileClick={handleMyProfileClick}
      />{' '}
    </div>
  );
}
