import Sidebar from '../components/Sidebar/Sidebar';
import { Outlet } from 'react-router-dom';
import './Layout.css';
// base layout 2 coloumns
export default function BaseLayout2() {
  return (
    <div className="baseLayout2">
      <Sidebar />
      <>
        <Outlet />
      </>
    </div>
  );
}
