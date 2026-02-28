// Sidebar.jsx - React Router Links + SVG icons
import React from 'react';
import { Link } from 'react-router-dom';

import HomeIcon from '../../assets/menu/home.webp';
import ExploreIcon from '../../assets/menu/feed.webp';
import VideoIcon from '../../assets/menu/video.webp';
import AddIcon from '../../assets/menu/new.webp';
import MessageIcon from '../../assets/menu/message.webp';
import './Sidebar.css';

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <h1
        id="apptitle"
        style={{
          position: 'relative',
          marginLeft: '.65em',
        }}
      >
        JAM
      </h1>
      <ul className="sidebar__list">
        <li className="sidebar__item">
          <Link to="/home" className="sidebar__link sidebar__link--active">
            <img src={HomeIcon} alt="Home" className="sidebar__icon" />
            <span className="sidebar__label">Home</span>
          </Link>
        </li>

        <li className="sidebar__item">
          <Link to="/explore" className="sidebar__link">
            <img src={ExploreIcon} alt="Explore" className="sidebar__icon" />
            <span className="sidebar__label">Feed</span>
          </Link>
        </li>

        <li className="sidebar__item">
          <Link to="/create" className="sidebar__link">
            <img src={AddIcon} alt="Create" className="sidebar__icon" />
            <span className="sidebar__label">New</span>
          </Link>
        </li>

        <li className="sidebar__item">
          <Link to="/live" className="sidebar__link">
            <img src={VideoIcon} alt="Live" className="sidebar__icon" />
            <span className="sidebar__label">Random Match</span>
          </Link>
        </li>

        <li className="sidebar__item">
          <Link to="/messages" className="sidebar__link">
            <img src={MessageIcon} alt="Messages" className="sidebar__icon" />
            <span className="sidebar__label">Messages</span>
          </Link>
        </li>
      </ul>
    </aside>
  );
}
