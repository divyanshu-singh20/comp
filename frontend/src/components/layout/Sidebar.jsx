import { NavLink } from 'react-router-dom';
import {
  BarChart3,
  BriefcaseBusiness,
  Clapperboard,
  CreditCard,
  FileText,
  LayoutDashboard,
  LifeBuoy,
  LogOut,
  Package,
  PanelLeftClose,
  PanelLeftOpen,
  Settings2,
  Users,
  Video,
  WalletCards
} from 'lucide-react';

const allNavigation = [
  { label: 'Command Center', to: '/', icon: LayoutDashboard, roles: ['Owner', 'Admin', 'Operations Manager'] },
  { label: 'Clients', to: '/clients', icon: BriefcaseBusiness, roles: ['Owner', 'Admin', 'Operations Manager'] },
  { label: 'Orders', to: '/orders', icon: Package, roles: ['Owner', 'Admin', 'Operations Manager'] },
  { label: 'Scripts', to: '/scripts', icon: FileText, roles: ['Owner', 'Admin', 'Operations Manager'] },
  { label: 'Creator Hub', to: '/creators', icon: Users, roles: ['Owner', 'Admin', 'Operations Manager'] },
  { label: 'Shoots', to: '/shoots', icon: Clapperboard, roles: ['Owner', 'Admin', 'Operations Manager'] },
  { label: 'Video Pipeline', to: '/videos', icon: Video, roles: ['Owner', 'Admin', 'Operations Manager'] },
  { label: 'Finance', to: '/finance', icon: WalletCards, roles: ['Owner', 'Admin'] },
  { label: 'My Workspace', to: '/portal', icon: Video, roles: ['Client'] },
  { label: 'Support', to: '/support', icon: LifeBuoy, roles: ['Client', 'Owner', 'Admin'] }
];

const roleLabel = (role) => role === 'ShootManager' ? 'Operations Manager' : role;

export default function Sidebar({ role, collapsed, mobileOpen, onToggle, onNavigate }) {
  const visibleNavigation = allNavigation.filter((item) => item.roles.includes(roleLabel(role)));

  const logout = () => {
    localStorage.removeItem('leadyfy_token');
    localStorage.removeItem('leadyfy_user');
    window.location.href = '/login';
  };

  return (
    <aside className={`fixed inset-y-0 left-0 z-40 flex w-62 flex-col border-r border-line bg-ink transition-transform duration-300 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 ${collapsed ? 'lg:w-19.5' : ''}`}>
      <div className={`flex h-19 items-center border-b border-line px-5 ${collapsed ? 'lg:justify-center lg:px-0' : 'justify-between'}`}>
        <NavLink to="/" onClick={onNavigate} className={`flex items-center gap-3 ${collapsed ? 'lg:hidden' : ''}`}>
          <span className="grid h-9 w-9 place-items-center bg-amber text-sm font-bold text-ink">L</span>
          <span>
            <span className="block text-[15px] font-bold tracking-tight text-white">leadyfy<span className="text-amber">.</span></span>
            <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-muted">OS / control</span>
          </span>
        </NavLink>
        <button onClick={onToggle} title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'} className="grid h-8 w-8 place-items-center text-muted transition hover:bg-panel hover:text-white">
          {collapsed ? <PanelLeftOpen size={17} /> : <PanelLeftClose size={17} />}
        </button>
      </div>

      <div className={`flex items-center gap-3 border-b border-line px-5 py-5 ${collapsed ? 'lg:justify-center lg:px-0' : ''}`}>
        <div className="grid h-9 w-9 shrink-0 place-items-center bg-[#2b2110] font-mono text-xs text-amber">{role === 'Client' ? 'CL' : 'AK'}</div>
        <div className={`${collapsed ? 'lg:hidden' : ''}`}>
          <p className="text-xs font-semibold text-white">{role === 'Client' ? 'Client account' : 'Aarav Kapoor'}</p>
          <p className="mt-0.5 font-mono text-[9px] uppercase tracking-[0.18em] text-muted">{roleLabel(role)}</p>
        </div>
      </div>

      <nav className="scrollbar-thin flex-1 space-y-1 overflow-y-auto px-3 py-5">
        <p className={`mb-3 px-3 font-mono text-[9px] uppercase tracking-[0.2em] text-[#5d5d5d] ${collapsed ? 'lg:hidden' : ''}`}>Workspace</p>
        {visibleNavigation.map(({ label, to, icon: Icon }) => (
          <NavLink key={to} to={to} onClick={onNavigate} title={collapsed ? label : undefined} className={({ isActive }) => `group flex items-center gap-3 border-l-2 px-3 py-2.5 text-xs font-medium transition ${isActive ? 'border-amber bg-[#211a0e] text-amber' : 'border-transparent text-muted hover:bg-panel hover:text-white'} ${collapsed ? 'lg:justify-center lg:border-l-0 lg:px-0' : ''}`}>
            <Icon size={17} strokeWidth={1.7} />
            <span className={`${collapsed ? 'lg:hidden' : ''}`}>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className={`border-t border-line p-3 ${collapsed ? 'lg:px-0' : ''}`}>
        <NavLink to="/settings" onClick={onNavigate} title={collapsed ? 'Settings' : undefined} className={`flex items-center gap-3 px-3 py-2.5 text-xs text-muted transition hover:bg-panel hover:text-white ${collapsed ? 'lg:justify-center lg:px-0' : ''}`}>
          <Settings2 size={17} strokeWidth={1.7} /><span className={`${collapsed ? 'lg:hidden' : ''}`}>Settings</span>
        </NavLink>
        <button onClick={logout} title={collapsed ? 'Sign out' : undefined} className={`mt-1 flex w-full items-center gap-3 px-3 py-2.5 text-xs text-muted transition hover:bg-[#291512] hover:text-[#fca5a5] ${collapsed ? 'lg:justify-center lg:px-0' : ''}`}>
          <LogOut size={17} strokeWidth={1.7} /><span className={`${collapsed ? 'lg:hidden' : ''}`}>Sign out</span>
        </button>
      </div>
    </aside>
  );
}
