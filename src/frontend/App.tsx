import AuthForm from './pages/AuthForm/AuthForm';
import Home from './pages/Home/Home';
import Messages from './pages/Messages/Messages';
import FeedPosts from './pages/FeedPosts/FeedPosts';
import FeedReels from './pages/FeedReels/FeedReels';
import RandomMatch from './pages/Live/RandomMatch';
import Create from './pages/Create/Create';
import Profile from './pages/Profile/Profile';
import Chat from './pages/Chat/Chat';
import MyProfile from './pages/MyProfile/MyProfile';
import AudioRoom from './pages/AudioRoom/AudioRoom';
import BaseLayout from '../frontend/layouts/BaseLayout';
import BaseLayout2 from './layouts/BaseLayout2';
import Settings from './pages/Settings/Settings';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
const queryClient = new QueryClient();

export function App() {
  return (
    <>
      <BrowserRouter>
        <QueryClientProvider client={queryClient}>
          <Routes>
            <Route path="/" element={<AuthForm />} />

            <Route element={<BaseLayout />}>
              <Route path="jam/home" element={<Home />} />
              <Route path="jam/create" element={<Create />} />
              <Route path="jam/explore/posts" element={<FeedPosts />} />
              <Route path="jam/explore/reels" element={<FeedReels />} />
              <Route path="jam/random" element={<RandomMatch />} />
            </Route>
            <Route element={<BaseLayout2 />}>
              <Route path="jam/me" element={<MyProfile />} />
              <Route path="jam/profile" element={<Profile />} />
              <Route path="jam/messages" element={<Messages />} />
              <Route path="jam/chat/:id" element={<Chat />} />
              <Route path="jam/user/:id" element={<Profile />} />
              <Route path="jam/settings" element={<Settings />} />
            </Route>
            <Route path="jam/audio/:roomId" element={<AudioRoom />} />
          </Routes>
          <ReactQueryDevtools />
        </QueryClientProvider>
      </BrowserRouter>
    </>
  );
}

export default App;
