import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import Sidebar from '../../components/Sidebar/Sidebar';
import './Chat.css';

export default function Chat() {
  const { id } = useParams(); // Partner ID from URL
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [username, setUsername] = useState('Guest');
  const [myUserId, setMyUserId] = useState(null); // ← ADD: Track own ID
  const [partner, setPartner] = useState({ username: 'Loading...' });
  const [searchQuery, setSearchQuery] = useState('');
  const ws = useRef(null);
  const messagesEndRef = useRef(null);

  // 1. My profile FIRST (stable)
  useEffect(() => {
    fetch('/api/profile')
      .then((res) => res.json())
      .then((user) => {
        setUsername(user.username);
        setMyUserId(user.id);
      });
  }, []);

  // 2. Partner + History (run ONCE after myUserId)
  useEffect(() => {
    if (!id || !myUserId) return;

    // Partner
    fetch(`/api/user?id=${id}`)
      .then((res) => res.json())
      .then(setPartner);

    // History (empty messages first)
    setMessages([]);
    fetch(`/api/chat/history?partnerId=${id}`)
      .then((res) => res.json())
      .then((history) => {
        setMessages(
          history.map((msg) => ({
            message: msg.message,
            from_id: msg.from_id,
            isMe: msg.from_id === myUserId,
            timestamp: new Date(msg.created_at).getTime(),
          }))
        );
      });
  }, [id, myUserId]); // Single effect!

  // 3. WS LAST (only after everything stable)
  useEffect(() => {
    if (!id || !myUserId || !username) return;

    ws.current?.close(); // Cleanup old
    console.log('Connecting to WS chat...');
    ws.current = new WebSocket(`ws://localhost:3000/api/chat?toId=${id}`);
    console.log('WebSocket instance created:', ws.current);
    ws.current.onopen = () => console.log('✅ Chat connected');
    ws.current.onmessage = (e) => {
      console.log('📨 CLIENT MSG:', e.data);
      setMessages((prev) => [
        ...prev,
        {
          message: e.data,
          timestamp: Date.now(),
          from_id: Number(id),
          isMe: false,
        },
      ]);
    };
    ws.current.onerror = (err) => console.log('🚨 WS ERROR:', err);
    ws.current.onclose = (e) => {
      console.log('❌ CLIENT CLOSE:', e.code, e.reason);
      console.log('Disconnected');
    };

    return () => ws.current?.close();
  }, [id, myUserId, username]); // Stable deps

  const sendMessage = useCallback(
    async (e) => {
      e?.preventDefault();
      if (!input.trim() || !ws.current?.readyState || !myUserId) return;

      const messageText = input.trim();

      // 1. Optimistic + WS FIRST (non-blocking)
      const myMsg = {
        message: messageText,
        timestamp: Date.now(),
        from_id: myUserId,
        isMe: true,
      };

      setMessages((prev) => [...prev, myMsg]);
      ws.current.send(messageText); // LIVE

      // 2. DB save in background (no await)
      fetch('/api/chat/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ toId: id, message: messageText }),
      }).catch(console.error); // Silent fail OK

      setInput('');
    },
    [input, myUserId, id]
  );

  return (
    <div className="home">
      <Sidebar />
      <div className="chat-container">
        <div className="chat-main">
          <div className="chat-header">
            <h2>{partner.username}</h2>
          </div>

          <div className="chat-messages">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`chat-message ${msg.isMe ? 'sent' : 'received'}`} // ← FIXED: Use isMe
              >
                <span>{msg.message}</span>
                <small>{new Date(msg.timestamp).toLocaleTimeString()}</small>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={sendMessage} className="chat-input-container">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message..."
              className="chat-input"
              maxLength={1000}
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="chat-send-btn"
            >
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
