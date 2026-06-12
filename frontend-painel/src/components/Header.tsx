import { useState, useEffect } from 'react';
import { Menu, LogOut, User } from 'lucide-react';
import { useMobileMenu } from '../contexts/MobileMenuContext';
import { STORAGE_KEYS } from '../constants';
import NotificationBell from './NotificationBell';
import './Header.css';
import './NotificationBell.css';

export default function Header() {
  const { openMenu } = useMobileMenu();
  const [user, setUser] = useState<{ name: string; email: string; role: string } | null>(null);

  useEffect(() => {
    const userData = localStorage.getItem(STORAGE_KEYS.USER);
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (e) {
        console.error('Error parsing user data');
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
    window.location.href = '/painel/login';
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  return (
    <header className="header">
      <div className="header-left">
        <button className="menu-toggle" onClick={openMenu} aria-label="Abrir menu">
          <Menu size={20} />
        </button>
        <h1 className="header-title">Woojuris</h1>
      </div>

        <div className="header-right">
          <div className="header-actions">
            <NotificationBell />
          </div>

        <div className="header-user" role="button" tabIndex={0}>
          <div className="user-avatar">
            {user ? getInitials(user.name) : <User size={16} />}
          </div>
          <div className="user-info">
            <span className="user-name">{user?.name || 'Usuário'}</span>
            <span className="user-role">{user?.role === 'ADMIN' ? 'Administrador' : 'Usuário'}</span>
          </div>
        </div>

        <button className="header-btn" onClick={handleLogout} title="Sair">
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
}
