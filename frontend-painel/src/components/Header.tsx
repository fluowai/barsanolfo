import { Bell, User, LogOut, Menu } from 'lucide-react';
import { useMobileMenu } from '../contexts/MobileMenuContext';
import './Header.css';

export default function Header() {
  const { openMenu } = useMobileMenu();

  return (
    <header className="header">
      <div className="header-left">
        <button className="menu-toggle" onClick={openMenu} title="Menu">
          <Menu size={24} />
        </button>
        <h2 className="header-title">Painel Administrativo</h2>
      </div>

      <div className="header-right">
        <button className="header-btn" title="Notificações">
          <Bell size={20} />
          <span className="badge">3</span>
        </button>

        <div className="header-user">
          <div className="user-avatar">
            <User size={18} />
          </div>
          <div className="user-info">
            <p className="user-name">Admin</p>
            <p className="user-role">Administrador</p>
          </div>
        </div>

        <button className="header-btn" title="Sair">
          <LogOut size={20} />
        </button>
      </div>
    </header>
  );
}

