// Messages.jsx - Messages overview with chats list
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../../components/Sidebar/Sidebar';
import './Messages.css';

export default function Messages() {
  const [chats, setChats] = useState([]);
  const [myId, setMyId] = useState(null);
  const [username, setUsername] = useState('Guest');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch my ID and recent chats
  useEffect(() => {
    fetch('https://jam-chat.onrender.com/api/profile')
      .then((res) => res.json())
      .then((user) => {
        setMyId(user.id);
        // Fetch recent chats (last message per partner)
        fetch('https://jam-chat.onrender.com/api/chathistory?partnerId=recent') // Or custom endpoint
          .then((res) => res.json())
          .then((history) => {
            const recentChats = {};
            history.forEach((msg) => {
              const partnerId = msg.fromid === user.id ? msg.toid : msg.fromid;
              if (!recentChats[partnerId]) {
                recentChats[partnerId] = {
                  partnerId,
                  lastMessage: msg.message,
                  timestamp: msg.createdat,
                  unread: msg.fromid !== user.id,
                };
              }
            });
            setChats(Object.values(recentChats));
          });
      });
  }, []);

  return (
    <div className="messages">
      <section className="messages__container">
        <Sidebar />
        <div className="messages__content">
          <aside className="chats-sidebar">
            <div className="chats-header">
              <h2>Chats</h2>
              <button className="new-chat-btn">+</button>
            </div>
            <div className="chats-list">
              {chats.length === 0 ? (
                <div className="no-chats">No messages yet. Start a chat!</div>
              ) : (
                chats.map((chat) => (
                  <Link
                    key={chat.partnerId}
                    to={`/chat/${chat.partnerId}`}
                    className={`chat-item ${chat.unread ? 'unread' : ''}`}
                  >
                    <div className="chat-avatar">U</div>
                    <div className="chat-info">
                      <div className="chat-partner">User {chat.partnerId}</div>
                      <div className="chat-preview">{chat.lastMessage}</div>
                    </div>
                    {chat.unread && <div className="unread-dot" />}
                  </Link>
                ))
              )}
            </div>
          </aside>
          <main className="messages__main">
            <div className="messages__empty">
              Select a chat to start messaging.
              <div
                style={{
                  background:
                    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  padding: '1rem 2rem',
                  borderRadius: '12px',
                  textAlign: 'center',
                  margin: '2rem auto',
                  maxWidth: '400px',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                }}
              >
                <h3 style={{ margin: '0 0 0.5rem 0' }}>
                  🚧 <br></br>Coming Soon
                </h3>
                <p style={{ margin: 0, opacity: 0.9 }}>
                  This feature is under active development!
                </p>
              </div>
            </div>
          </main>
        </div>
      </section>
    </div>
  );
}
