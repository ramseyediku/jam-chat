// Messages.jsx - Simple messages page with Sidebar
import React from 'react';
import Sidebar from '../../components/Sidebar/Sidebar';
import './Messages.css';

export default function Messages() {
  return (
    <div className="messages">
      <header className="messages__header">
        <h1 className="messages__title">Messages</h1>
      </header>

      <section className="messages__container">
        <Sidebar />
        <main className="messages__main">
          <div className="messages__empty">No messages yet.</div>
        </main>
      </section>
    </div>
  );
}
