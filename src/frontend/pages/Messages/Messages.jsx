// Messages.jsx - Messages overview with chats list
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../../components/Header/Header';
import Sidebar from '../../components/Sidebar/Sidebar';
import './Messages.css';

export default function Messages() {
  const [chats, setChats] = useState([]);
  const [myId, setMyId] = useState(null);
  const [username, setUsername] = useState('Guest');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch my ID and recent chats
  useEffect(() => {
    fetch('/api/profile')
      .then((res) => res.json())
      .then((user) => {
        setMyId(user.id);
        // Fetch recent chats (last message per partner)
        fetch('/api/chathistory?partnerId=recent') // Or custom endpoint
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
      {/* Reusable Header */}
      <Header
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        username={username}
        setUsername={setUsername}
      />
      <header className="messages__header">
        <h1 className="messages__title">Messages</h1>
      </header>

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
            </div>
          </main>
        </div>
      </section>
    </div>
  );
}
