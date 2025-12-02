import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Mail, 
  ClipboardList, 
  PlusCircle, 
  List,
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/pendentes', icon: Mail, label: 'E-mails Pendentes' },
  { to: '/novo', icon: PlusCircle, label: 'Cadastro Manual' },
  { to: '/lista', icon: List, label: 'Lista Geral' },
];

export function Sidebar() {
  const location = useLocation();
  const { profile, signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 lg:hidden"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </Button>

      {/* Overlay */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={cn(
          "fixed lg:static inset-y-0 left-0 z-40 w-64 transform transition-transform duration-300 ease-in-out lg:transform-none",
          "bg-sidebar text-sidebar-foreground flex flex-col",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
        style={{ background: 'var(--gradient-sidebar)' }}
      >
        {/* Logo */}
        <div className="p-6 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sidebar-primary flex items-center justify-center">
              <Mail className="h-5 w-5 text-sidebar-primary-foreground" />
            </div>
            <div>
              <h1 className="font-bold text-lg text-sidebar-accent-foreground">MailGestor</h1>
              <p className="text-xs text-sidebar-foreground/60">Sistema de E-mails</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                cn(
                  "sidebar-link",
                  isActive && "active"
                )
              }
            >
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* User section */}
        <div className="p-4 border-t border-sidebar-border">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-10 h-10 rounded-full bg-sidebar-accent flex items-center justify-center">
              <span className="text-sm font-semibold text-sidebar-accent-foreground">
                {profile?.nome?.charAt(0).toUpperCase() || 'U'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-accent-foreground truncate">
                {profile?.nome || 'Usuário'}
              </p>
              <p className="text-xs text-sidebar-foreground/60 truncate">
                {profile?.email}
              </p>
            </div>
          </div>
          <button
            onClick={signOut}
            className="sidebar-link w-full text-destructive hover:bg-destructive/10 hover:text-destructive"
          >
            <LogOut className="h-5 w-5" />
            <span>Sair</span>
          </button>
        </div>
      </aside>
    </>
  );
}
