// Live.jsx - Simple live page with Sidebar
import React from 'react';
import Sidebar from '../../components/Sidebar/Sidebar';
import './Live.css';

export default function Live() {
  return (
    <div className="live">
      <header className="live__header">
        <h1 className="live__title">Live</h1>
      </header>

      <section className="live__container">
        <Sidebar />
        <main className="live__main">
          <p>Live streaming and channels.</p>
        </main>
      </section>
    </div>
  );
}
