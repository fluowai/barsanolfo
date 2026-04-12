import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import './Layout.css';

export default function Layout() {
  return (
    <div className="layout">
      <Sidebar />
      <div className="layout-main">
        <div className="layout-header">
          <Header />
        </div>
        <main className="layout-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
