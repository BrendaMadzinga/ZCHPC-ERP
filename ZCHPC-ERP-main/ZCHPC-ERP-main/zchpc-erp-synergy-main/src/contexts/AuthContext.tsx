import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  permissions: string[];
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  checkPermission: (permission: string) => boolean;
}

// API base url – override with Vite env var if provided
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const defaultUser: User = {
  id: '0',
  name: '',
  email: '',
  role: '',
  permissions: []
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Convert backend user payload to our User interface
function buildUserFromPayload(payload: any): User {
  // Normalise roles / permissions coming from backend in various shapes:
  // 1. "role": string
  // 2. "roles": string[]
  // 3. "permissions": string[]
  // Convert everything to lowercase so our FE checks are case-insensitive.
  const rawPermissions: string[] = (
    payload.permissions ??
    payload.roles ??
    (payload.role ? [payload.role] : [])
  ) as string[];

  const permissions = rawPermissions
    .filter(Boolean)
    .map((p) => p.toLowerCase());

  return {
    id: payload.id ?? payload.employeeid ?? '',
    name:
      `${payload.firstname ?? ''} ${payload.surname ?? ''}`.trim() ||
      payload.name ||
      payload.username ||
      '',
    email: payload.email,
    role: permissions[0] ?? '', // first role as primary role
    avatar: undefined,
    permissions,
  };
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored auth token
    const storedUser = localStorage.getItem('zchpc_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Failed to parse stored user data:', error);
        localStorage.removeItem('zchpc_user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: email, password })
      });
      if (res.ok) {
        const data = await res.json();
        const token = data.token ?? data.key;
        localStorage.setItem('zchpc_token', token);
        let builtUser: User | null = null;
        if (data.user) {
          builtUser = buildUserFromPayload(data.user);
        } else {
          // Backend did not include user details – create a generic admin user
          builtUser = {
            id: '0',
            name: 'User',
            email: email,
            role: 'admin',
            permissions: ['admin', 'hr', 'sales', 'accounting', 'procurement', 'inventory'],
          };
        }
        setUser(builtUser);
        localStorage.setItem('zchpc_user', JSON.stringify(builtUser));
        toast.success('Login successful');
        return true;
      } else {
        toast.error('Invalid credentials');
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Login failed. Please try again.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/signup/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      if (res.ok) {
        const data = await res.json();
        const token = data.token;
        localStorage.setItem('zchpc_token', token);
        if (data.user) {
          const builtUser = buildUserFromPayload(data.user);
          setUser(builtUser);
          localStorage.setItem('zchpc_user', JSON.stringify(builtUser));
        }
        toast.success('Account created');
        return true;
      }
      toast.error('Signup failed');
      return false;
    } catch (e) {
      console.error(e);
      toast.error('Signup failed');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('zchpc_user');
    toast.success('Logged out successfully');
  };

  // Authorize user based on their permissions/roles
  const checkPermission = (permission: string): boolean => {
    if (!user) return false;

    // If no specific permission passed, allow by default (route unprotected)
    if (!permission) return true;

    const requested = permission.toLowerCase();

    // Admins bypass checks
    if (user.role?.toLowerCase() === 'admin') {
      return true;
    }

    // Compare against user's permissions array and primary role
    return (
      user.permissions.includes(requested) ||
      user.role?.toLowerCase() === requested
    );
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        login,
        signup,
        logout,
        checkPermission
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
