// Create.jsx - New content / Create page with Sidebar
import Sidebar from '../../components/Sidebar/Sidebar';
import './Create.css';
import Header from '../../components/Header/Header';
import { useEffect, useState } from 'react';

export default function Create() {
  const [username, setUsername] = useState('Guest');
  const [searchQuery, setSearchQuery] = useState('');
  return (
    <div className="create">
      {/* Reusable Header */}
      <Header
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        username={username}
        setUsername={setUsername}
      />
      <header className="create__header">
        <h1 className="create__title">Create</h1>
      </header>

      <section className="create__container">
        <Sidebar />
        <main className="create__main">
          <p>Create new content here.</p>
        </main>
      </section>
    </div>
  );
}
