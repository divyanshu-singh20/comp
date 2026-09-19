import { useState } from 'react';
import { Bell, Menu, Search } from 'lucide-react';
import { Outlet, useOutletContext } from 'react-router-dom';
import Sidebar from './Sidebar';

export default function Layout() {
  const session = useOutletContext();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-ink text-white">
      <div className={`fixed inset-0 z-30 bg-black/60 lg:hidden ${mobileOpen ? 'block' : 'hidden'}`} onClick={() => setMobileOpen(false)} />
      <Sidebar
        role={session.user.role}
        collapsed={sidebarCollapsed}
        mobileOpen={mobileOpen}
        onToggle={() => setSidebarCollapsed((value) => !value)}
        onNavigate={() => setMobileOpen(false)}
      />
      <div className={`min-h-screen transition-[padding] duration-300 ${sidebarCollapsed ? 'lg:pl-19.5' : 'lg:pl-62'}`}>
        <header className="sticky top-0 z-30 flex h-19 items-center justify-between border-b border-line bg-ink/95 px-5 backdrop-blur lg:px-8">
          <button onClick={() => setMobileOpen(true)} className="grid h-9 w-9 place-items-center text-muted hover:bg-panel hover:text-white lg:hidden"><Menu size={19} /></button>
          <div className="relative hidden w-80 md:block">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input aria-label="Search workspace" placeholder="Search workspace" className="h-9 w-full border border-line bg-panel pl-9 pr-3 text-xs text-white outline-none placeholder:text-[#666] focus:border-amber" />
          </div>
          <div className="ml-auto flex items-center gap-4">
            <span className="hidden font-mono text-[10px] uppercase tracking-[0.16em] text-muted sm:block">Fri, 18 Sep 2026</span>
            <button title="Notifications" className="relative grid h-9 w-9 place-items-center border border-line text-muted transition hover:border-amber hover:text-amber"><Bell size={16} /><span className="absolute right-2 top-1.5 h-1.5 w-1.5 bg-amber" /></button>
            <div className="grid h-9 w-9 place-items-center bg-amber text-xs font-bold text-ink">{session.user.role === 'Client' ? 'CL' : 'AK'}</div>
          </div>
        </header>
        <main className="mx-auto max-w-400 px-5 py-7 lg:px-8 lg:py-9">
          <Outlet context={session} />
        </main>
      </div>
    </div>
  );
}
