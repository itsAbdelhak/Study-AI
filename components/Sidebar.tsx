
import React, { useState } from 'react';
import {
  LogoIcon,
  SearchIcon,
  HomeIcon,
  ClipboardListIcon,
  CalendarIcon,
  ChatBubbleIcon,
  InboxIcon,
  ChartBarIcon,
  NewspaperIcon,
  CogIcon,
  ChevronDoubleLeftIcon,
  LogoutIcon,
  XIcon,
} from './icons';
import type { View } from '../App';
import { useAuth } from '../lib/AuthContext';


interface SidebarProps {
  activeView: View;
  setActiveView: (view: View) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const navItems: { view: View; label: string; icon: React.ReactNode; badge?: number }[] = [
  { view: 'tutor', label: 'Dashboard', icon: <HomeIcon className="h-5 w-5" /> },
  { view: 'library', label: 'Orders', icon: <ClipboardListIcon className="h-5 w-5" />, badge: 6 },
  { view: 'schedules', label: 'Schedules', icon: <CalendarIcon className="h-5 w-5" /> },
  { view: 'messages', label: 'Messages', icon: <ChatBubbleIcon className="h-5 w-5" />, badge: 3 },
  { view: 'inbox', label: 'Inbox', icon: <InboxIcon className="h-5 w-5" /> },
  { view: 'analytics', label: 'Analytics', icon: <ChartBarIcon className="h-5 w-5" /> },
  { view: 'news', label: 'News', icon: <NewspaperIcon className="h-5 w-5" /> },
  { view: 'settings', label: 'Settings', icon: <CogIcon className="h-5 w-5" /> },
];

const NavItem: React.FC<{
  item: typeof navItems[0];
  isActive: boolean;
  isCollapsed: boolean;
  onClick: () => void;
}> = ({ item, isActive, isCollapsed, onClick }) => (
  <li>
    <button
      onClick={onClick}
      className={`relative flex items-center w-full h-11 px-3.5 text-sm font-medium rounded-lg transition-colors duration-200 group ${
        isActive
          ? 'bg-blue-50 text-blue-600'
          : 'text-slate-600 hover:bg-slate-100'
      }`}
    >
      {isActive && <div className="absolute left-0 h-6 w-1 bg-blue-500 rounded-r-full"></div>}
      <span className={`transition-colors ${isActive ? 'text-blue-500' : 'text-slate-500 group-hover:text-slate-700'}`}>{item.icon}</span>
      <span className={`ml-3 whitespace-nowrap overflow-hidden transition-opacity duration-200 ${isCollapsed ? 'opacity-0 w-0' : 'opacity-100'}`}>
        {item.label}
      </span>
      {item.badge && !isCollapsed && (
        <span className={`ml-auto text-xs font-semibold px-2 py-0.5 rounded-full ${isActive ? 'bg-blue-500 text-white' : 'bg-slate-200 text-slate-600'}`}>
          {item.badge}
        </span>
      )}
    </button>
  </li>
);

const UserProfile: React.FC<{ isCollapsed: boolean }> = ({ isCollapsed }) => {
    const { user, signOut } = useAuth();
    const fullName = user?.user_metadata?.full_name || 'User';
    const email = user?.email || 'No email found';

    return (
        <div className={`flex items-center h-14 p-2 rounded-lg transition-colors hover:bg-slate-100 ${isCollapsed ? 'justify-center' : ''}`}>
            <img src={`https://i.pravatar.cc/40?u=${email}`} alt="User" className="w-10 h-10 rounded-full" />
            <div className={`ml-3 overflow-hidden ${isCollapsed ? 'w-0' : 'w-auto'}`}>
                <p className="font-semibold text-sm text-slate-800 whitespace-nowrap">{fullName}</p>
                <p className="text-xs text-slate-500 whitespace-nowrap truncate">{email}</p>
            </div>
            <button onClick={signOut} className={`ml-auto text-slate-500 hover:text-slate-800 ${isCollapsed ? 'hidden' : ''}`} aria-label="Sign out">
                <LogoutIcon className="w-5 h-5" />
            </button>
        </div>
    );
};


const SidebarContent: React.FC<{
    isCollapsed: boolean;
    activeView: View;
    setActiveView: (view: View) => void;
    onClose?: () => void;
}> = ({ isCollapsed, activeView, setActiveView, onClose }) => (
     <div className="h-full flex flex-col p-3">
        {/* Header */}
        <div className={`flex items-center mb-4 pl-2 ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
            <div className={`flex items-center gap-2 overflow-hidden ${isCollapsed ? 'w-0' : 'w-auto'}`}>
                <LogoIcon className="h-7 w-7 flex-shrink-0" />
                <span className="text-xl font-bold text-slate-800 whitespace-nowrap tracking-tight">StudyGen</span>
            </div>
            {onClose && (
                <button onClick={onClose} className="lg:hidden p-1 text-slate-500 hover:text-slate-800">
                    <XIcon className="w-6 h-6"/>
                </button>
            )}
        </div>

        {/* Search */}
        <div className={`relative mb-4 ${isCollapsed ? 'px-1' : ''}`}>
            <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400"/>
            <input 
                type="text" 
                placeholder="Search" 
                className={`w-full h-10 bg-slate-100 border border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${isCollapsed ? 'pl-10 text-transparent' : 'pl-10'}`}
            />
        </div>

        {/* Navigation */}
        <nav className="flex-grow">
          <ul className="space-y-1">
            {navItems.map((item) => (
              <NavItem
                key={item.view}
                item={item}
                isActive={activeView === item.view}
                isCollapsed={isCollapsed}
                onClick={() => {
                    setActiveView(item.view);
                    onClose?.();
                }}
              />
            ))}
          </ul>
        </nav>

        {/* Footer */}
        <div className="mt-auto pt-4 border-t border-slate-200">
            <UserProfile isCollapsed={isCollapsed} />
        </div>
    </div>
);


export const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView, isOpen, setIsOpen }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <>
        {/* Mobile Sidebar */}
        <div 
            className={`fixed inset-0 bg-slate-900/50 z-30 lg:hidden transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
            onClick={() => setIsOpen(false)}
        ></div>
        <aside 
            className={`fixed inset-y-0 left-0 w-64 bg-white z-40 lg:hidden transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
        >
             <SidebarContent 
                isCollapsed={false}
                activeView={activeView}
                setActiveView={setActiveView}
                onClose={() => setIsOpen(false)}
            />
        </aside>

        {/* Desktop Sidebar */}
        <aside className={`relative flex-shrink-0 bg-white border-r border-slate-200 flex-col transition-all duration-300 ease-in-out hidden lg:flex ${isCollapsed ? 'w-20' : 'w-64'}`}>
            <SidebarContent 
                isCollapsed={isCollapsed}
                activeView={activeView}
                setActiveView={setActiveView}
            />
            {/* Collapse Toggle */}
            <button 
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="absolute top-8 -right-3 h-6 w-6 bg-white border-2 border-slate-200 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-transform focus:outline-none z-10"
                >
                <ChevronDoubleLeftIcon className={`w-4 h-4 transition-transform duration-300 ${isCollapsed ? 'rotate-180' : 'rotate-0'}`} />
            </button>
        </aside>
    </>
  );
};