import { config } from 'dotenv';

// Load environment variables
config();

// Database Configuration
export const DATABASE_URL = process.env.DATABASE_URL || 'postgres://user:pass@localhost:5432/db';
export const DB_TYPE = process.env.DB_TYPE || 'postgres';
export const DB_HOST = process.env.DB_HOST || 'localhost';
export const DB_PORT = parseInt(process.env.DB_PORT || '5432', 10);
export const DB_USER = process.env.DB_USER || 'postgres';
export const DB_PASS = process.env.DB_PASS || 'postgres';
export const DB_NAME = process.env.DB_NAME || 'bingo_backend_v3';

// JWT Configuration
export const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key';
export const JWT_EXPIRY = process.env.JWT_EXPIRY || '24h';
export const JWT_REFRESH_EXPIRY = process.env.JWT_REFRESH_EXPIRY || '7d';

// Session Configuration
export const SESSION_SECRET = process.env.SESSION_SECRET || 'default-session-secret';

// Application Configuration
export const NODE_ENV = process.env.NODE_ENV || 'development';
export const PORT = parseInt(process.env.PORT || '3000', 10);
export const LOG_LEVEL = process.env.LOG_LEVEL || 'info';

// OTP Configuration
export const OTP_EXPIRY_MINUTES = parseInt(process.env.OTP_EXPIRY_MINUTES || '5', 10);
export const OTP_MAX_ATTEMPTS = parseInt(process.env.OTP_MAX_ATTEMPTS || '3', 10);

// Game Configuration
export const GAME_ROOM_MAX_PLAYERS = parseInt(process.env.GAME_ROOM_MAX_PLAYERS || '100', 10);
export const GAME_DURATION_MINUTES = parseInt(process.env.GAME_DURATION_MINUTES || '30', 10);

// Referral Configuration
export const REFERRAL_CODE_LENGTH = parseInt(process.env.REFERRAL_CODE_LENGTH || '5', 10);
export const REFERRAL_REWARD_AMOUNT = parseInt(process.env.REFERRAL_REWARD_AMOUNT || '1000', 10);

// API Configuration
export const API_PREFIX = process.env.API_PREFIX || 'api';
export const ENABLE_REFRESH_TOKEN = process.env.ENABLE_REFRESH_TOKEN === 'true';

// CORS Configuration
export const CORS_ORIGIN = process.env.CORS_ORIGIN || true;

// File Upload Configuration
export const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE || '10485760', 10); // 10MB
export const UPLOAD_PATH = process.env.UPLOAD_PATH || 'uploads';
