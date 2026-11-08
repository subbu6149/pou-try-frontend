import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AuthUser, Permission } from '../types';

interface AuthState {
  token: string | null;
  user: AuthUser | null;
  permissions: Permission[];
  isAuthenticated: boolean;
  setAuth: (token: string, user: AuthUser, permissions: Permission[]) => void;
  logout: () => void;
  hasPermission: (module: string, action: string) => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      permissions: [],
      isAuthenticated: false,

      setAuth: (token, user, permissions) => {
        localStorage.setItem('token', token);
        set({ token, user, permissions, isAuthenticated: true });
      },

      logout: () => {
        localStorage.removeItem('token');
        set({ token: null, user: null, permissions: [], isAuthenticated: false });
      },

      hasPermission: (module, action) => {
        const { user, permissions } = get();
        
        // Super Admin has all permissions
        if (user?.role_id === 1) return true;
        
        // For write operations (anything except VIEW), check for EDIT permission
        // For VIEW operations, check for either VIEW or EDIT permission
        if (action === 'VIEW') {
          return permissions.some(
            (p) => p.module === module && (p.action === 'VIEW' || p.action === 'EDIT')
          );
        } else {
          // All write operations require EDIT permission
          return permissions.some(
            (p) => p.module === module && p.action === 'EDIT'
          );
        }
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);
