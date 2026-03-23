import UserSideBar from '../components/UserSidebar/UserSidebar';
import Sidebar from '../components/Sidebar/Sidebar';
import { Outlet } from 'react-router-dom';
import './Layout.css';
// base layout 3 coloumns
export default function BaseLayout() {
  return (
    <div className="baseLayout">
      <Sidebar />
      <>
        <Outlet />
      </>
      <UserSideBar />
    </div>
  );
}
