// pages/AudioRoom/AudioRoom.jsx - Complete with WS + cleanup
import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import Sidebar from '../../components/Sidebar/Sidebar';
import './AudioRoom.css';

export default function AudioRoom() {
  const { roomId } = useParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [username, setUsername] = useState('Guest');
  const [room, setRoom] = useState(null);
  const [myId, setMyId] = useState(null);
  const [speakers, setSpeakers] = useState([]);
  const ws = useRef(null);
  const [hostUsername, setHostUsername] = useState('');

  // 1. Fetch profile + room data (FIXED deps)
  useEffect(() => {
    // Always fetch profile first
    fetch('/api/profile')
      .then((res) => res.json())
      .then((user) => {
        setUsername(user.username);
        setMyId(user.id);
        console.log('👤 My profile:', user.id, user.username);
      });

    // Fetch room separately
    fetch(`/api/rooms/${roomId}`)
      .then((res) => res.json())
      .then((roomData) => {
        console.log('🏠 Room loaded:', roomData); // ← Check hostId here
        setRoom(roomData);
      })
      .catch((err) => console.error('Room fetch failed:', err));
  }, []); // ← Empty deps - only run once

  // NEW useEffect - fetch host username if not me
  useEffect(() => {
    if (room?.hostId && room.hostId !== myId && !hostUsername) {
      fetch(`/api/users/${room.hostId}`) // Assumes /api/users/:id endpoint
        .then((res) => res.json())
        .then((user) => setHostUsername(user.username))
        .catch(() => setHostUsername(`User ${room.hostId}`));
    }
  }, [room, myId, hostUsername]);

  // 2. WebSocket connection
  useEffect(() => {
    if (!roomId || !myId || !username) return;

    console.log('🎤 Connecting WS to audio room:', roomId);
    ws.current = new WebSocket(`/api/audio?roomId=${roomId}`); // Relative URL (cookies auto-sent)

    ws.current.onopen = () => {
      console.log('✅ Audio room connected');
      // Announce join
      ws.current.send(
        JSON.stringify({
          type: 'user_joined',
          username,
          userId: myId,
          roomId,
        })
      );
    };

    ws.current.onmessage = (e) => {
      const data = JSON.parse(e.data);
      console.log('🎤 Audio msg:', data);

      if (data.type === 'user_joined') {
        if (!speakers.some((s) => s.userId === data.userId)) {
          setSpeakers((prev) => [...prev, data]);
        }
      } else if (data.type === 'user_left') {
        setSpeakers((prev) => prev.filter((u) => u.userId !== data.userId));
      }
    };

    ws.current.onclose = (e) => {
      console.log('❌ AUDIO WS CLOSE:', e.code, e.reason);
    };
    ws.current.onerror = (err) => console.error('Audio WS error:', err);

    return () => {
      if (ws.current?.readyState === WebSocket.OPEN) {
        ws.current.send(
          JSON.stringify({
            type: 'user_left',
            username,
            userId: myId,
            roomId,
          })
        );
      }
      ws.current?.close();
    };
  }, [roomId, myId, username]);

  // 3. HOST CLEANUP: Delete on leave
  // useEffect(() => {
  //   if (!room || !myId) return;

  //   const isHost = room.hostId === myId;

  //   return () => {
  //     if (isHost) {
  //       fetch(`/api/rooms/${roomId}`, { method: 'DELETE' })
  //         .then(() => console.log('🗑️ Room deleted by host'))
  //         .catch(console.error);
  //     }
  //   };
  // }, [roomId, room, myId]);

  if (!room || !myId) {
    return (
      <div className="audio-room">
        <Header
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          username={username}
          setUsername={setUsername}
        />
        <div style={{ padding: '40px', textAlign: 'center', color: '#9aa4b2' }}>
          Loading room...
        </div>
      </div>
    );
  }

  return (
    <div className="audio-room">
      <Header
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        username={username}
        setUsername={setUsername}
      />

      <section className="audio-room__container">
        <Sidebar />

        <main className="audio-room__main">
          <div className="audio-room__overlay">
            {/* Host section */}
            <div className="audio-room__host">
              <div className="audio-room__host-avatar">
                <img
                  src={
                    room.imageUrl ||
                    `https://ui-avatars.com/api/?name=${room.hostId}&size=100&background=6366f1&color=fff`
                  }
                  alt="Host"
                />
              </div>
              <div className="audio-room__host-info">
                <h2 className="audio-room__room-name">{room.name}</h2>
                <p className="audio-room__room-owner">
                  Hosted by {hostUsername || `User ${room.hostId}`}
                  {room.hostId === myId && ' (You)'}
                </p>
              </div>
            </div>

            {/* Seats grid (show live speakers) */}
            <div className="audio-room__seats">
              {Array.from({ length: 12 }, (_, i) => {
                const speaker = speakers[i]; // Seat 1 = speakers[0]
                return (
                  <div
                    key={i}
                    className={`audio-room__seat ${speaker ? 'active-speaker' : ''}`}
                  >
                    <div className="audio-room__seat-circle">
                      {speaker ? (
                        <img
                          src={`https://ui-avatars.com/api/?name=${speaker.username}&size=60&background=f97316&color=fff`}
                          alt={speaker.username}
                        />
                      ) : (
                        <span className="seat-empty">🛋️</span>
                      )}
                    </div>
                    <span className="audio-room__seat-label">{i + 1}</span>
                  </div>
                );
              })}
            </div>

            {/* Bottom chat/controls */}
            <div className="audio-room__bottom">
              <div className="audio-room__announcement">
                Welcome to {room.name}! Jump in and have fun 🎉
              </div>

              <div className="audio-room__chat-input">
                <input placeholder="Add a comment..." />
                <button>➤</button>
              </div>
            </div>
          </div>
        </main>
      </section>
    </div>
  );
}
