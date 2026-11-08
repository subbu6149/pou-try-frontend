import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Home, Users, Building2, Bird, Package, Egg,
  Heart, FileText, DollarSign, AlertCircle, LogOut, Menu, X,
  ChevronDown, Settings
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

interface NavItem {
  name: string;
  path: string;
  icon: React.ReactNode;
  module?: string;
  action?: string;
}

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, hasPermission } = useAuthStore();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const navItems: NavItem[] = [
    { name: 'Dashboard', path: '/', icon: <Home className="w-5 h-5" />, module: 'DASHBOARD', action: 'VIEW' },
    { name: 'User Management', path: '/users', icon: <Users className="w-5 h-5" />, module: 'USERS', action: 'VIEW' },
    { name: 'Farms & Sites', path: '/farms', icon: <Building2 className="w-5 h-5" />, module: 'FARMS', action: 'VIEW' },
    { name: 'Batches', path: '/batches', icon: <Bird className="w-5 h-5" />, module: 'BATCHES', action: 'VIEW' },
    { name: 'Production', path: '/production', icon: <Package className="w-5 h-5" />, module: 'PRODUCTION', action: 'VIEW' },
    { name: 'Feed Management', path: '/feed', icon: <Package className="w-5 h-5" />, module: 'FEED', action: 'VIEW' },
    { name: 'Inventory', path: '/inventory', icon: <Package className="w-5 h-5" />, module: 'INVENTORY', action: 'VIEW' },
    { name: 'Egg Management', path: '/eggs', icon: <Egg className="w-5 h-5" />, module: 'EGGS', action: 'VIEW' },
    { name: 'Health', path: '/health', icon: <Heart className="w-5 h-5" />, module: 'HEALTH', action: 'VIEW' },
    { name: 'Accounts', path: '/accounts', icon: <DollarSign className="w-5 h-5" />, module: 'ACCOUNTS', action: 'VIEW' },
    { name: 'Reports', path: '/reports', icon: <FileText className="w-5 h-5" />, module: 'REPORTS', action: 'VIEW' },
    { name: 'Complaints', path: '/complaints', icon: <AlertCircle className="w-5 h-5" />, module: 'COMPLAINTS', action: 'VIEW' },
  ];

  const visibleNavItems = navItems.filter(item => {
    if (!item.module || !item.action) return true;
    return hasPermission(item.module, item.action);
  });

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <nav className="bg-white border-b border-gray-200 fixed w-full z-30 top-0">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              >
                {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
              <h1 className="ml-4 text-xl font-bold text-primary-600">Farm Manager</h1>
            </div>

            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100"
              >
                <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center text-white font-semibold">
                  {user?.full_name.charAt(0).toUpperCase()}
                </div>
                <div className="text-left hidden sm:block">
                  <p className="text-sm font-medium text-gray-900">{user?.full_name}</p>
                  <p className="text-xs text-gray-600">{user?.role_name}</p>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-600" />
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 border border-gray-200">
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      navigate('/profile');
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                  >
                    <Settings className="w-4 h-4" />
                    Profile Settings
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-16 h-[calc(100vh-4rem)] bg-white border-r border-gray-200 transition-all duration-300 z-20 ${
          isSidebarOpen ? 'w-64' : 'w-0'
        } overflow-hidden`}
      >
        <nav className="p-4 space-y-1">
          {visibleNavItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-primary-50 text-primary-700 font-medium'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {item.icon}
                <span className="text-sm">{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main
        className={`pt-16 transition-all duration-300 ${
          isSidebarOpen ? 'ml-64' : 'ml-0'
        }`}
      >
        <div className="p-6 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
