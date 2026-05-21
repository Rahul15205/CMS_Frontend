import api from '@/lib/api';
import { Role } from '@/components/user-setup/types';

const getStoredTokens = () => {
  const raw = localStorage.getItem('cms_auth_tokens');
  if (!raw) return null;

  try {
    return JSON.parse(raw) as { accessToken?: string; refreshToken?: string };
  } catch {
    localStorage.removeItem('cms_auth_tokens');
    return null;
  }
};

const buildRoles = (user: any): Role[] => {
  const roleNames = Array.isArray(user?.roles) ? user.roles : [];
  const permissions = user?.permissions && typeof user.permissions === 'object' ? user.permissions : {};

  return roleNames.map((roleName: string, index: number) => ({
    id: roleName.toLowerCase().replace(/\s+/g, '-'),
    name: roleName,
    description: `${roleName} role`,
    isSystemRole: true,
    status: 'active',
    usersCount: 0,
    permissions,
    createdAt: new Date(0).toISOString(),
    tenantId: user?.tenant?.id,
  }));
};

const normalizeUser = (user: any) => {
  const roles = buildRoles(user);
  const primaryRole = roles[0];

  return {
    user: {
      id: user?.id,
      username: user?.email || user?.name || '',
      name: user?.name,
      email: user?.email,
      roleId: primaryRole?.id || '',
      tenantName: user?.tenant?.name || user?.tenant || '',
      lastLogin: user?.lastLogin || null,
      aadhaarVerified: user?.aadhaarVerified || false,
      permissions: user?.permissions || {},
      mustResetPassword: user?.mustResetPassword || false,
    },
    roles,
  };
};

export const authService = {
  login: async (email: string, password: string) => {
    const res = await api.post('/api/v1/auth/login', { email, password });
    
    if (res.data.accessToken) {
      localStorage.setItem('cms_auth_tokens', JSON.stringify({
        accessToken: res.data.accessToken,
        refreshToken: res.data.refreshToken,
      }));
    }

    return normalizeUser(res.data.user);
  },

  logout: async () => {
    const tokens = getStoredTokens();
    try {
      if (tokens?.accessToken) {
        await api.post('/api/v1/auth/logout');
      }
    } catch (err) {
      console.error('Logout error', err);
    } finally {
      localStorage.removeItem('cms_auth_tokens');
      localStorage.removeItem('cms_auth_data');
    }
  },

  getProfile: async () => {
    const tokens = getStoredTokens();
    if (!tokens?.accessToken) {
      return null;
    }

    const res = await api.get('/api/v1/auth/me');
    return normalizeUser(res.data);
  },

  changePassword: async (oldPassword: string, newPassword: string) => {
    const res = await api.post('/api/v1/auth/change-password', { oldPassword, newPassword });
    return res.data;
  },

  forgotPassword: async (email: string) => {
    const res = await api.post('/api/v1/auth/forgot-password', { email });
    return res.data;
  },

  resetPassword: async (email: string, otp: string, newPassword: string) => {
    const res = await api.post('/api/v1/auth/reset-password', { email, otp, newPassword });
    return res.data;
  },

  verifyResetOtp: async (email: string, otp: string) => {
    const res = await api.post('/api/v1/auth/verify-reset-otp', { email, otp });
    return res.data;
  }
};
