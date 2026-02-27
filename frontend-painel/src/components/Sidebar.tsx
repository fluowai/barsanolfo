import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  UserPlus, 
  Scale, 
  Landmark, 
  Settings,
  Calendar,
  CheckSquare,
  ExternalLink,
  X
} from 'lucide-react';
import { useMobileMenu } from '../contexts/MobileMenuContext';
import './Sidebar.css';

import Logo from './Logo';

export default function Sidebar() {
  const { isOpen, closeMenu } = useMobileMenu();

  const handleViewSite = () => {
    window.open('http://localhost:3003', '_blank');
  };

  const menuItems = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/leads', icon: UserPlus, label: 'Leads' },
    { path: '/clientes', icon: Users, label: 'Clientes' },
    { path: '/processos', icon: Scale, label: 'Processos' },
    { path: '/prazos', icon: Calendar, label: 'Prazos' },
    { path: '/tarefas', icon: CheckSquare, label: 'Tarefas' },
    { path: '/financeiro', icon: Landmark, label: 'Financeiro' },
    { path: '/configuracoes', icon: Settings, label: 'Configurações' },
  ];

  const handleNavClick = () => {
    // Fecha o menu em mobile após navegar
    if (window.innerWidth <= 768) {
      closeMenu();
    }
  };

  return (
    <>
      {/* Overlay escuro para mobile */}
      <div 
        className={`sidebar-overlay ${isOpen ? 'active' : ''}`} 
        onClick={closeMenu}
      />
      
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <Logo imgClassName="h-10 w-auto" />
            <div>
              <h1 className="sidebar-title">Barsa</h1>
              <p className="sidebar-subtitle">Advocacia</p>
            </div>
          </div>
          {/* Botão fechar - visível apenas em mobile */}
          <button className="sidebar-close" onClick={closeMenu}>
            <X size={24} />
          </button>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              onClick={handleNavClick}
              className={({ isActive }) => 
                `sidebar-link ${isActive ? 'active' : ''}`
              }
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button 
            onClick={handleViewSite}
            className="sidebar-link view-site-btn"
            style={{ width: '100%', border: '1px solid var(--gold)', color: 'var(--gold)', marginBottom: '15px' }}
          >
            <ExternalLink size={20} />
            <span>Ver Site</span>
          </button>
          <p className="sidebar-version">v1.0.0</p>
        </div>
      </aside>
    </>
  );
}

