import { NavLink } from 'react-router-dom';
import { useState } from 'react';
import HomeIcon from '../../assets/menu/home.webp';
import ExploreIcon from '../../assets/menu/feed.webp';
import VideoIcon from '../../assets/menu/video.webp';
import AddIcon from '../../assets/menu/new.webp';
import MessageIcon from '../../assets/menu/message.webp';
import SettingsIcon from '../../assets/menu/settings.webp';
import TransLogo from '../../assets/translogo.png';
import './Sidebar.css';

export default function Sidebar() {
  const [mini, setMini] = useState(false);

  return (
    <aside className={`sidebar ${mini == true ? 'mini' : ''}`}>
      {mini == true ? (
        <button onClick={() => setMini(!mini)} className="minimize">
          →
        </button>
      ) : (
        <button onClick={() => setMini(!mini)} className="minimize">
          ←
        </button>
      )}
      <img id="applogo" src={TransLogo} alt="Jam Chat Logo" />
      <ul>
        <li>
          <NavLink
            to="/jam/home"
            end
            className={({ isActive }) => (isActive ? 'active' : '')}
          >
            <img src={HomeIcon} alt="Home" />
            <span>Home</span>
          </NavLink>
        </li>

        <li>
          <NavLink
            to="/jam/explore/posts"
            className={({ isActive }) => (isActive ? 'active' : '')}
          >
            <img src={ExploreIcon} alt="Explore" />
            <span>Feed</span>
          </NavLink>
        </li>

        <li>
          <NavLink
            to="/jam/create"
            className={({ isActive }) => (isActive ? 'active' : '')}
          >
            <img src={AddIcon} alt="Create" />
            <span>New</span>
          </NavLink>
        </li>

        <li>
          <NavLink
            to="/jam/random"
            className={({ isActive }) => (isActive ? 'active' : '')}
          >
            <img src={VideoIcon} alt="Live" />
            <span>Random Match</span>
          </NavLink>
        </li>

        <li>
          <NavLink
            to="/jam/messages"
            className={({ isActive }) => (isActive ? 'active' : '')}
          >
            <img src={MessageIcon} alt="Messages" />
            <span>Messages</span>
          </NavLink>
        </li>

        <li>
          <NavLink
            to="/jam/settings"
            className={({ isActive }) => (isActive ? 'active' : '')}
          >
            <img src={SettingsIcon} alt="Settings" />
            <span>Settings</span>
          </NavLink>
        </li>
      </ul>
    </aside>
  );
}
