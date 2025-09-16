export interface User {
  id: string;
  email: string;
  phoneNumber: string;
  firstName?: string;
  lastName?: string;
  role: UserRole;
  isActive: boolean;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  email: string;
  password: string;
  phoneNumber: string;
  firstName?: string;
  lastName?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken?: string;
  expiresIn: number;
}

export interface RequestOtpDto {
  phoneNumber: string;
}

export interface RequestOtpResponse {
  message: string;
  expiresIn: number;
}

export interface VerifyOtpDto {
  phoneNumber: string;
  otpCode: string;
}

export interface VerifyOtpResponse {
  user: User;
  token: string;
  refreshToken?: string;
  isNewUser: boolean;
}

export interface RefreshTokenDto {
  refreshToken: string;
}

export interface JwtPayload {
  sub: string;
  email: string;
  phoneNumber: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

export interface SessionData {
  verificationCode?: string;
  phoneNumber?: string;
  userExists?: boolean;
}

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  MODERATOR = 'moderator',
}

export enum AuthProvider {
  LOCAL = 'local',
  GOOGLE = 'google',
  FACEBOOK = 'facebook',
}

export interface PasswordResetDto {
  token: string;
  newPassword: string;
}

export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
}
