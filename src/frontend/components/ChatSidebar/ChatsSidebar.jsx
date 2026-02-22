// ChatsSidebar.jsx - list of current chats
import React from 'react';
import './ChatsSidebar.css';

export default function ChatsSidebar() {
  const mockChats = [{ id: 1, name: 'Ramsey', last: 'Hey Baby' }];

  return (
    <aside className="chats-sidebar">
      <div className="chats-sidebar__header">Chats</div>
      <ul className="chats-sidebar__list">
        {mockChats.map((c) => (
          <li key={c.id} className="chats-sidebar__item">
            <div className="chats-sidebar__meta">
              <div className="chats-sidebar__name">{c.name}</div>
              <div className="chats-sidebar__last">{c.last}</div>
            </div>
          </li>
        ))}
      </ul>
    </aside>
  );
}
