import Login from './pages/Login/Login';
import Home from './pages/Home/Home';
import Messages from './pages/Messages/Messages';
import Explore from './pages/Explore/Explore';
import Live from './pages/Live/Live';
import Create from './pages/Create/Create';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

export function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/home" element={<Home />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/live" element={<Live />} />
          <Route path="/create" element={<Create />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
