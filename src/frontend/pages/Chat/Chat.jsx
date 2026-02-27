import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import AC from 'agora-chat';
import Header from '../../components/Header/Header';
import Sidebar from '../../components/Sidebar/Sidebar';
import './Chat.css';

export default function Chat() {
  const { id } = useParams(); // Partner ID
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [username, setUsername] = useState('Guest');
  const [myUserId, setMyUserId] = useState(null);
  const [partner, setPartner] = useState({ username: 'Loading...' });
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const clientRef = useRef(null);
  const messagesEndRef = useRef(null);

  // 1. MY PROFILE
  useEffect(() => {
    fetch('/api/profile')
      .then((res) => res.json())
      .then((user) => {
        setUsername(user.username);
        setMyUserId(user.id.toString());
      });
  }, []);

  // 2. PARTNER + AGORA CHAT SDK
  useEffect(() => {
    if (!id || !myUserId) return;

    fetch(`/api/user?id=${id}`)
      .then((res) => res.json())
      .then(setPartner);

    const initChat = async () => {
      try {
        // REGISTER (once)
        await fetch('/api/agora/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: myUserId }),
        });

        setLoading(true);

        // Chat Token
        const token = await (
          await fetch(`/api/agora/token?userId=${myUserId}`)
        ).text();

        // Chat SDK: connection(appKey)
        const appKey = '7110029131#1664881'; // From .env.AGORA_APP_KEY
        const conn = new AC.default.connection({ appKey: appKey });
        clientRef.current = conn;

        // Events
        conn.listen('onOpened', () => {
          console.log('Chat login success');
        });

        conn.listen('onMessage', ({ data: [msg] }) => {
          setMessages((prev) => [
            ...prev,
            {
              message: msg.body.msg,
              timestamp: Date.now(),
              from_id: msg.from,
              isMe: false,
            },
          ]);
        });

        // LOGIN
        await new Promise((resolve, reject) => {
          conn.open(
            {
              user: myUserId,
              accessToken: token,
            },
            (err) => {
              if (err) {
                console.error('SDK login failed:', err); // Logs full error
                return reject(err);
              }
              resolve(null);
            }
          );
        });

        setLoading(false);
      } catch (err) {
        console.error('Chat init error:', err);
        if (err?.error_description)
          console.error('Agora error:', err.error_description); // SDK details
        setLoading(false);
      }
    };

    initChat();

    return () => {
      clientRef.current?.close();
    };
  }, [id, myUserId]);

  const sendMessage = useCallback(
    async (e) => {
      e?.preventDefault();
      if (!input.trim() || !clientRef.current) return;

      const msgText = input.trim();
      const conn = clientRef.current;

      // OPTIMISTIC UI
      const optimisticMsg = {
        message: msgText,
        timestamp: Date.now(),
        from_id: myUserId,
        isMe: true,
      };
      setMessages((prev) => [...prev, optimisticMsg]);

      // Send singleChat
      const option = {
        chatType: 'singleChat',
        type: 'txt',
        to: id,
        msg: msgText,
      };
      const msg = AC.message.create(option);
      conn.send(msg).catch((err) => console.error('Send failed:', err));

      setInput('');
    },
    [input, myUserId, id]
  );

  if (loading) return <div>Loading chat...</div>;

  return (
    <>
      <Header
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        username={username}
        setUsername={setUsername}
      />
      <div className="profile-root">
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
                  className={`chat-message ${msg.isMe ? 'sent' : 'received'}`}
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
    </>
  );
}
