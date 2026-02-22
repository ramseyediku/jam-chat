// Create.jsx - New content / Create page with Sidebar
import React from 'react';
import Sidebar from '../../components/Sidebar/Sidebar';
import './Create.css';

export default function Create() {
  return (
    <div className="create">
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
