export interface User {
  id: string;
  email: string;
  phoneNumber: string;
  firstName?: string;
  lastName?: string;
  role: 'admin' | 'user' | 'moderator';
  isActive: boolean;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
  avatar?: string;
  referralCode?: string;
  referredBy?: string;
  referralCount?: number;
  totalEarnings?: number;
}

export interface CreateUserDto {
  email: string;
  phoneNumber: string;
  password: string;
  firstName?: string;
  lastName?: string;
  role?: 'admin' | 'user' | 'moderator';
}

export interface UpdateUserDto {
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  isActive?: boolean;
  role?: 'admin' | 'user' | 'moderator';
}

export interface UserProfile {
  id: string;
  email: string;
  phoneNumber: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  role: string;
  isActive: boolean;
  isVerified: boolean;
  createdAt: Date;
  lastLoginAt?: Date;
  referralCode?: string;
  referralCount?: number;
  totalEarnings?: number;
}

export interface UserListItem {
  id: string;
  email: string;
  phoneNumber: string;
  firstName?: string;
  lastName?: string;
  role: string;
  isActive: boolean;
  isVerified: boolean;
  createdAt: Date;
  lastLoginAt?: Date;
}

export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  verifiedUsers: number;
  newUsersToday: number;
  newUsersThisWeek: number;
  newUsersThisMonth: number;
}

export interface UserFilters {
  role?: 'admin' | 'user' | 'moderator';
  isActive?: boolean;
  isVerified?: boolean;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'lastLoginAt' | 'email';
  sortOrder?: 'asc' | 'desc';
}
