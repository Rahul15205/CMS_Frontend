import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider, useAuth } from './AuthContext';
import { authService } from '@/services/authService';
import React from 'react';

// Mock dependencies
vi.mock('@/services/authService', () => ({
  authService: {
    login: vi.fn(),
    logout: vi.fn(),
    getProfile: vi.fn(),
  }
}));

vi.mock('@/lib/featureFlags', () => ({
  FEATURE_FLAGS: { auth: true } // Force real API mode to hit authService mock
}));

vi.mock('@/lib/errorHandler', () => ({
  handleApiError: vi.fn(),
}));

const TestComponent = () => {
  const { isAuthenticated, user, login, logout, isLoading } = useAuth();

  if (isLoading) return <div data-testid="loading">Loading...</div>;

  return (
    <div>
      <div data-testid="status">{isAuthenticated ? 'Logged In' : 'Logged Out'}</div>
      {user && <div data-testid="username">{user.username}</div>}
      <button onClick={() => login('admin@proteccio.com', 'password')}>Login</button>
      <button onClick={() => logout()}>Logout</button>
    </div>
  );
};

describe('AuthContext Integration', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('should initialize as logged out when no tokens exist', async () => {
    vi.mocked(authService.getProfile).mockRejectedValue(new Error('No token'));
    
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
    });

    expect(screen.getByTestId('status').textContent).toBe('Logged Out');
  });

  it('should successfully authenticate when login is triggered', async () => {
    vi.mocked(authService.getProfile).mockRejectedValue(new Error('No token'));

    const mockLoginResponse = {
      user: { username: 'admin@proteccio.com', roleId: 'role-1' },
      roles: [{ id: 'role-1', permissions: {} }]
    };
    
    vi.mocked(authService.login).mockResolvedValue(mockLoginResponse as any);

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Wait out initialization
    await waitFor(() => {
      expect(screen.getByTestId('status').textContent).toBe('Logged Out');
    });

    // Act
    const user = userEvent.setup();
    await user.click(screen.getByText('Login'));

    // Assert
    await waitFor(() => {
      expect(screen.getByTestId('status').textContent).toBe('Logged In');
      expect(screen.getByTestId('username').textContent).toBe('admin@proteccio.com');
    });
  });

  it('should invalidate state upon logout', async () => {
    // Pre-authenticate the context by mocking getProfile during init
    const mockProfileResponse = {
      user: { username: 'testuser', roleId: 'role-1' },
      roles: [{ id: 'role-1', permissions: {} }]
    };
    vi.mocked(authService.getProfile).mockResolvedValue(mockProfileResponse as any);
    vi.mocked(authService.logout).mockResolvedValue();

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Await init authenticated state
    await waitFor(() => {
      expect(screen.getByTestId('status').textContent).toBe('Logged In');
    });

    const user = userEvent.setup();
    await user.click(screen.getByText('Logout'));

    await waitFor(() => {
      expect(screen.getByTestId('status').textContent).toBe('Logged Out');
      expect(screen.queryByTestId('username')).not.toBeInTheDocument();
    });
  });
});
