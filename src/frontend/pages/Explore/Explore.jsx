// Explore.jsx - Simple explore page with Sidebar
import React from 'react';
import Sidebar from '../../components/Sidebar/Sidebar';
import './Explore.css';

export default function Explore() {
  return (
    <div className="explore">
      <header className="explore__header">
        <h1 className="explore__title">Explore</h1>
      </header>

      <section className="explore__container">
        <Sidebar />
        <main className="explore__main">
          <p>Discover new content here.</p>
        </main>
      </section>
    </div>
  );
}
