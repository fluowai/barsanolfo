import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  UserPlus,
  ClipboardList,
  Users,
  Scale,
  Calendar,
  Video,
  CheckSquare,
  FileText,
  FileSignature,
  Landmark,
  MessageSquare,
  Megaphone,
  BarChart3,
  Users2,
  Bot,
  Settings,
  ExternalLink,
  LogOut,
  X,
  ChevronRight,
  ChevronDown,
} from 'lucide-react';
import { useMobileMenu } from '../contexts/MobileMenuContext';
import Logo from './Logo';
import './Sidebar.css';

interface MenuItem {
  path: string;
  icon: React.ComponentType<any>;
  label: string;
  badge?: number | null;
}

interface MenuSection {
  label: string;
  items: MenuItem[];
}

const sections: MenuSection[] = [
  {
    label: 'Visão Geral',
    items: [
      { path: '/', icon: LayoutDashboard, label: 'Dashboard', badge: null },
    ],
  },
  {
    label: 'Comercial',
    items: [
      { path: '/leads', icon: UserPlus, label: 'Leads', badge: null },
      { path: '/triagem', icon: ClipboardList, label: 'Triagem', badge: null },
      { path: '/marketing', icon: Megaphone, label: 'Marketing Jurídico', badge: null },
    ],
  },
  {
    label: 'Jurídico',
    items: [
      { path: '/clientes', icon: Users, label: 'Clientes', badge: null },
      { path: '/processos', icon: Scale, label: 'Processos', badge: null },
      { path: '/prazos', icon: Calendar, label: 'Prazos', badge: null },
      { path: '/audiencias', icon: Video, label: 'Audiências', badge: null },
      { path: '/tarefas', icon: CheckSquare, label: 'Tarefas', badge: null },
    ],
  },
  {
    label: 'Gestão',
    items: [
      { path: '/documentos', icon: FileText, label: 'Documentos', badge: null },
      { path: '/contratos', icon: FileSignature, label: 'Contratos', badge: null },
      { path: '/financeiro', icon: Landmark, label: 'Financeiro', badge: null },
      { path: '/relatorios', icon: BarChart3, label: 'BI / Relatórios', badge: null },
    ],
  },
  {
    label: 'Operacional',
    items: [
      { path: '/atendimento', icon: MessageSquare, label: 'Atendimento', badge: null },
      { path: '/equipe', icon: Users2, label: 'Equipe', badge: null },
      { path: '/automacoes', icon: Bot, label: 'Automações', badge: null },
      { path: '/configuracoes', icon: Settings, label: 'Configurações', badge: null },
    ],
  },
];

export default function Sidebar() {
  const { isOpen, closeMenu } = useMobileMenu();
  const [collapsedSections, setCollapsedSections] = useState<Set<number>>(new Set());

  const toggleSection = (index: number) => {
    setCollapsedSections((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

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

  const handleExternalClick = (url: string) => {
    window.open(url, '_blank');
    if (window.innerWidth <= 768) {
      closeMenu();
    }
  };

  let userName = 'Usuário';
  let userEmail = '';
  try {
    const stored = localStorage.getItem('barsa_user');
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.name) userName = parsed.name;
      if (parsed.email) userEmail = parsed.email;
    }
  } catch {
    // ignore parse errors
  }

  const renderNavItems = (items: MenuItem[]) =>
    items.map((item) => (
      <NavLink
        key={item.path}
        to={item.path}
        end={item.path === '/'}
        onClick={handleNavClick}
        className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
      >
        <span className="nav-icon">
          <item.icon size={20} />
        </span>
        <span className="nav-label">{item.label}</span>
        {item.badge != null && <span className="nav-badge">{item.badge}</span>}
        <ChevronRight size={16} className="nav-arrow" />
      </NavLink>
    ));

  return (
    <>
      <div
        className={`sidebar-overlay ${isOpen ? 'active' : ''}`}
        onClick={closeMenu}
      />

      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <div className="brand-logo">
              <Logo imgClassName="h-8 w-auto" />
            </div>
            <div className="brand-text">
              <span className="brand-name">Barsa</span>
              <span className="brand-tagline">Advocacia 360</span>
            </div>
          </div>
          <button className="sidebar-close" onClick={closeMenu} aria-label="Fechar menu">
            <X size={20} />
          </button>
        </div>

        <nav className="sidebar-nav">
          {sections.map((section, index) => {
            const isCollapsed = collapsedSections.has(index);
            return (
              <div key={`${section.label}-${index}`} className="nav-section">
                <button
                  onClick={() => toggleSection(index)}
                  style={{
                    cursor: 'pointer',
                    background: 'none',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: '100%',
                    padding: 'var(--space-2) var(--space-3)',
                    fontSize: 'var(--font-size-xs)',
                    fontWeight: 600,
                    color: 'var(--text-tertiary)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}
                >
                  <span>{section.label}</span>
                  {isCollapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
                </button>
                {!isCollapsed && renderNavItems(section.items)}
              </div>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-3)',
              padding: 'var(--space-2) var(--space-3)',
              marginBottom: 'var(--space-3)',
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 'var(--radius-full)',
                background: 'var(--primary-gradient)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: 'var(--font-size-sm)',
                fontWeight: 700,
                flexShrink: 0,
              }}
            >
              {userName.charAt(0).toUpperCase()}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div
                style={{
                  fontSize: 'var(--font-size-sm)',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {userName}
              </div>
              {userEmail && (
                <div
                  style={{
                    fontSize: 'var(--font-size-xs)',
                    color: 'var(--text-tertiary)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {userEmail}
                </div>
              )}
            </div>
          </div>

          <div className="footer-divider" />

          <button
            className="nav-item"
            onClick={() => handleExternalClick('/portal-cliente')}
          >
            <span className="nav-icon">
              <ExternalLink size={20} />
            </span>
            <span className="nav-label">Portal do Cliente</span>
            <ChevronRight size={16} className="nav-arrow" />
          </button>

          <button onClick={handleViewSite} className="nav-item view-site-btn">
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
