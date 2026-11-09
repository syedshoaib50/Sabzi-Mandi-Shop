export type UserRole = 'customer' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  role: UserRole;
  createdAt: string;
  password?: string;
  passwordUpdatedAt?: string;
  authProvider?: 'email' | 'google';
  isGoogleVerified?: boolean;
  avatarUrl?: string;
}

export interface SecurityStatus {
  isHackerShieldActive: boolean;
  failedAttemptsCount: number;
  lockedAccountsCount: number;
  encryptionStandard: string;
  protocol: string;
  firewallStatus: string;
}

export interface AuthState {
  currentUser: User | null;
  isAuthenticated: boolean;
}
