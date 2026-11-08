export interface User {
  id: number;
  username: string;
  full_name: string;
  phone?: string;
  role_id: number;
  role_name: string;
  is_active: boolean;
  last_login?: string;
  created_at: string;
}

export interface Role {
  id: number;
  name: string;
  description?: string;
  is_system: boolean;
  user_count?: number;
  created_at: string;
}

export interface Permission {
  id: number;
  module: string;
  action: string;
  description?: string;
  granted?: boolean;
}

export interface AuthUser {
  id: number;
  username: string;
  full_name: string;
  role_id: number;
  role_name: string;
}

export interface LoginResponse {
  token: string;
  user: AuthUser;
  permissions: Permission[];
}
