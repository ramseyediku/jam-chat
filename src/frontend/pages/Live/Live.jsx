// Live.jsx - Simple live page with Sidebar
import { useState } from 'react';
import Sidebar from '../../components/Sidebar/Sidebar';
import './Live.css';

export default function Live() {
  const [username, setUsername] = useState('Guest');
  const [searchQuery, setSearchQuery] = useState('');
  return (
    <div className="live">
      <section className="live__container">
        <Sidebar />
        <main className="live__main">
          <p>Live streaming and channels.</p>
        </main>
      </section>
    </div>
  );
}
