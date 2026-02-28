// Explore.jsx - Simple explore page with Sidebar
import { useState } from 'react';
import Sidebar from '../../components/Sidebar/Sidebar';
import './Explore.css';

export default function Explore() {
  const [username, setUsername] = useState('Guest');
  const [searchQuery, setSearchQuery] = useState('');
  return (
    <div className="explore">
      <section className="explore__container">
        <Sidebar />
        <main className="explore__main">
          <p>Discover new content here.</p>
        </main>
      </section>
    </div>
  );
}
