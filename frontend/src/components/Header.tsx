import React from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { SidebarToggle } from './Sidebar';

const pageTitles: Record<string, string> = {
  '/': 'Dashboard',
  '/inventories': 'Inventories',
  '/items': 'All Items',
  '/login': 'Login',
  '/register': 'Register',
};

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const location = useLocation();
  const { user } = useAuth();

  const getPageTitle = () => {
    if (location.pathname.startsWith('/inventories/')) {
      const pathParts = location.pathname.split('/');
      if (pathParts.length === 3) {
        return 'Categories';
      } else if (pathParts.length === 4) {
        return 'Items';
      }
    }
    return pageTitles[location.pathname] || 'InvenTrack';
  };

  return (
    <header className="sticky top-0 z-10 h-16 bg-slate-900 border-b border-slate-800 px-4 lg:px-6">
      <div className="flex items-center justify-between h-full">
        <div className="flex items-center gap-4">
          <SidebarToggle onClick={onMenuClick} />
          <h1 className="text-lg lg:text-xl font-semibold text-white">
            {getPageTitle()}
          </h1>
        </div>
        <div className="text-sm text-slate-400">
          {user?.email}
        </div>
      </div>
    </header>
  );
}
