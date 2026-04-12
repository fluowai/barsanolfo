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
  FileText,
  BookOpen,
  MessageSquare,
  ExternalLink,
  X,
  ChevronRight,
  LogOut
} from 'lucide-react';
import { useMobileMenu } from '../contexts/MobileMenuContext';
import Logo from './Logo';
import './Sidebar.css';

const menuItems = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard', badge: null },
  { path: '/leads', icon: UserPlus, label: 'Leads', badge: null },
  { path: '/clientes', icon: Users, label: 'Clientes', badge: null },
  { path: '/processos', icon: Scale, label: 'Processos', badge: null },
  { path: '/jurisprudencia', icon: BookOpen, label: 'Jurisprudência', badge: null },
  { path: '/prazos', icon: Calendar, label: 'Prazos', badge: null },
  { path: '/tarefas', icon: CheckSquare, label: 'Tarefas', badge: null },
  { path: '/financeiro', icon: Landmark, label: 'Financeiro', badge: null },
  { path: '/peticoes', icon: FileText, label: 'Petições', badge: null },
  { path: '/whatsapp', icon: MessageSquare, label: 'WhatsApp', badge: null },
];

const bottomItems = [
  { path: '/configuracoes', icon: Settings, label: 'Configurações' },
];

export default function Sidebar() {
  const { isOpen, closeMenu } = useMobileMenu();

  const handleLogout = () => {
    localStorage.removeItem('barsa_auth_token');
    localStorage.removeItem('barsa_user');
    window.location.href = '/painel/login';
  };

  const handleViewSite = () => {
    window.open('http://localhost:5033', '_blank');
  };

  const handleNavClick = () => {
    if (window.innerWidth <= 768) {
      closeMenu();
    }
  };

  return (
    <>
      <div 
        className={`sidebar-overlay ${isOpen ? 'active' : ''}`} 
        onClick={closeMenu}
      />
      
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        {/* Header */}
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <div className="brand-logo">
              <Logo imgClassName="h-8 w-auto" />
            </div>
            <div className="brand-text">
              <span className="brand-name">Barsa</span>
              <span className="brand-tagline">Advocacia</span>
            </div>
          </div>
          <button className="sidebar-close" onClick={closeMenu} aria-label="Fechar menu">
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          <div className="nav-section">
            <span className="nav-section-label">Menu Principal</span>
            {menuItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                onClick={handleNavClick}
                className={({ isActive }) => 
                  `nav-item ${isActive ? 'active' : ''}`
                }
              >
                <span className="nav-icon">
                  <item.icon size={20} />
                </span>
                <span className="nav-label">{item.label}</span>
                {item.badge && <span className="nav-badge">{item.badge}</span>}
                <ChevronRight size={16} className="nav-arrow" />
              </NavLink>
            ))}
          </div>

          <div className="nav-section">
            <span className="nav-section-label">Sistema</span>
            {bottomItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                onClick={handleNavClick}
                className={({ isActive }) => 
                  `nav-item ${isActive ? 'active' : ''}`
                }
              >
                <span className="nav-icon">
                  <item.icon size={20} />
                </span>
                <span className="nav-label">{item.label}</span>
                <ChevronRight size={16} className="nav-arrow" />
              </NavLink>
            ))}
          </div>
        </nav>

        {/* Footer */}
        <div className="sidebar-footer">
          <div className="footer-divider" />
          
          <button 
            onClick={handleViewSite}
            className="nav-item view-site-btn"
          >
            <span className="nav-icon">
              <ExternalLink size={20} />
            </span>
            <span className="nav-label">Ver Site</span>
          </button>

          <button className="nav-item" onClick={handleLogout}>
            <span className="nav-icon logout-icon">
              <LogOut size={20} />
            </span>
            <span className="nav-label">Sair</span>
          </button>
        </div>
      </aside>
    </>
  );
}
