// Live.jsx - Simple live page with Sidebar
import { useState } from 'react';
import './RandomMatch.css';

export default function RandomMatch() {
  return (
    <div className="live">
      <section className="live__container">
        <main className="live__main">
          <p>Match with random person.</p>
          <div
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
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
        </main>
      </section>
    </div>
  );
}
