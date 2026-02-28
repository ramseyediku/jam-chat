import AuthForm from './pages/AuthForm/AuthForm';
import Home from './pages/Home/Home';
import Messages from './pages/Messages/Messages';
import Explore from './pages/Explore/Explore';
import Live from './pages/Live/Live';
import Create from './pages/Create/Create';
import Profile from './pages/Profile/Profile';
import Chat from './pages/Chat/Chat';
import MyProfile from './pages/MyProfile/MyProfile';
import AudioRoom from './pages/AudioRoom/AudioRoom';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

export function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AuthForm />} />
          <Route path="/home" element={<Home />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/live" element={<Live />} />
          <Route path="/create" element={<Create />} />
          {/* Separate own profile vs others */}
          <Route path="/profile" element={<Profile />} /> {/* Current user's */}
          <Route path="/myprofile" element={<MyProfile />} />{' '}
          {/* Current user's */}
          <Route path="/user/:id" element={<Profile />} />{' '}
          {/* Other users from search */}
          <Route path="/chat/:id" element={<Chat />} /> {/* ← THIS ONE */}
          <Route path="/audio/:roomId" element={<AudioRoom />} />{' '}
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
