
'use server';
/**
 * @fileoverview Mock Authentication & User Management for PixelForge Nexus
 *
 * @description
 * This file simulates a backend authentication system for the game development
 * project management tool. It manages user data in-memory with roles tailored
 * for this purpose: 'admin', 'project-lead', and 'developer'.
 *
 * =============================================================================
 * SECURITY NOTICE (OWASP Top 10 & NIST Compliance)
 * =============================================================================
 * This is a MOCK system and is NOT secure for production use. It includes
 * comments below that highlight key security principles from OWASP and NIST
 * that would be implemented in a real-world application.
 */

import { z } from "zod";

// Defines the structure for a user's public profile, which is safe to send to the client.
export interface UserProfile {
    username: string;
    role: 'admin' | 'project-lead' | 'developer';
    name: string;
    initials: string;
    email: string;
}

// Extends the public profile with sensitive, internal-only data for the backend.
interface UserWithPassword extends UserProfile {
    passwordHash: string; // In a real app, this would be a secure hash (e.g., from Argon2 or bcrypt).
    loginAttempts: number; // For tracking failed login attempts to prevent brute-force attacks.
    isLocked: boolean; // Flag to lock accounts after too many failed attempts.
    passwordLastChanged: string; // ISO 8601 date string to enforce password expiration policies.
}

// In-memory "database" of users.
const users: { [key: string]: UserWithPassword } = {
  'moqadri': {
    username: 'moqadri',
    passwordHash: 'DefaultPassword123_hashed', // Corresponds to 'DefaultPassword123'
    role: 'admin',
    name: 'Mo Qadri',
    initials: 'MQ',
    email: 'mo.qadri@example.com',
    loginAttempts: 0,
    isLocked: false,
    passwordLastChanged: new Date().toISOString(),
  },
  'jane_lead': {
    username: 'jane_lead',
    passwordHash: 'DefaultPassword123_hashed',
    role: 'project-lead',
    name: 'Jane Lead',
    initials: 'JL',
    email: 'jane.lead@example.com',
    loginAttempts: 0,
    isLocked: false,
    passwordLastChanged: new Date().toISOString(),
  },
  'dev_squad': {
    username: 'dev_squad',
    passwordHash: 'DefaultPassword123_hashed',
    role: 'developer',
    name: 'Dev Squad',
    initials: 'DS',
    email: 'dev.squad@example.com',
    loginAttempts: 0,
    isLocked: false,
    passwordLastChanged: new Date().toISOString(),
  }
};

// Zod schema for validating new user creation data on the "server".
const CreateUserSchema = z.object({
  name: z.string().min(2),
  username: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(['project-lead', 'developer']),
});
type CreateUserInput = z.infer<typeof CreateUserSchema>;


export const createUser = async (
  userData: CreateUserInput
): Promise<{ success: boolean; message: string }> => {
    if (users[userData.username]) {
        return { success: false, message: "Username already exists." };
    }

    const initials = (userData.name.match(/\b\w/g) || []).join('').toUpperCase() || '??';

    users[userData.username] = {
        username: userData.username,
        passwordHash: `${userData.password}_hashed`,
        role: userData.role, 
        name: userData.name,
        initials: initials,
        email: userData.email,
        loginAttempts: 0,
        isLocked: false,
        passwordLastChanged: new Date().toISOString(),
    };

    console.log(`User '${userData.username}' created in mock database.`);
    return { success: true, message: "User created successfully." };
};


const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
    return `${password}_hashed` === hash;
}

const MAX_LOGIN_ATTEMPTS = 3;

export type AuthResponse = 
    | { status: 'success'; user: UserProfile }
    | { status: 'invalid'; message: string }
    | { status: 'locked'; message: string }
    | { status: 'expired'; message: string };

const LoginCredentialsSchema = z.object({
  username: z.string().regex(/^[a-zA-Z0-9_.-]+$/),
  password: z.string().min(8),
});


export const checkCredentials = async (username: string, pass: string): Promise<AuthResponse> => {
  const validation = LoginCredentialsSchema.safeParse({ username, password: pass });
  if (!validation.success) {
    return { status: 'invalid', message: 'Invalid username or password.' };
  }
  const user = users[username];

  if (!user) {
    return { status: 'invalid', message: 'Invalid username or password.' };
  }

  if (user.isLocked) {
    return { status: 'locked', message: 'Your account is locked due to too many failed login attempts.' };
  }

  const isPasswordCorrect = await verifyPassword(pass, user.passwordHash);

  if (!isPasswordCorrect) {
    user.loginAttempts++;
    if (user.loginAttempts >= MAX_LOGIN_ATTEMPTS) {
      user.isLocked = true;
      return { status: 'locked', message: 'Your account has been locked. Please contact support.' };
    }
    return { status: 'invalid', message: 'Invalid username or password.' };
  }
  
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
  if (new Date(user.passwordLastChanged) < ninetyDaysAgo) {
    return { status: 'expired', message: 'Your password has expired. Please change it to continue.' };
  }

  user.loginAttempts = 0;
  user.isLocked = false;
  
  const { passwordHash, loginAttempts, isLocked, passwordLastChanged, ...userProfile } = user;
  
  return { status: 'success', user: userProfile };
}

export type SanitizedUser = Omit<UserWithPassword, 'passwordHash'>;

export const getUsers = async (): Promise<SanitizedUser[]> => {
  return Object.values(users).map(user => {
    const { passwordHash, ...sanitizedUser } = user;
    return sanitizedUser;
  });
};

export const getDevelopers = async (): Promise<SanitizedUser[]> => {
  const allUsers = await getUsers();
  return allUsers.filter(u => u.role === 'developer' || u.role === 'project-lead');
}

export const updateUserRole = async (
  username: string,
  newRole: 'project-lead' | 'developer'
): Promise<{ success: boolean; message: string }> => {
  const user = users[username];

  if (!user) return { success: false, message: 'User not found.' };
  if (user.role === 'admin') return { success: false, message: 'Cannot change the role of an admin user.' };

  user.role = newRole;
  console.log(`User '${username}' role updated to '${newRole}' in mock database.`);
  return { success: true, message: 'User role updated successfully.' };
};


export const updateUserProfile = async (
  username: string,
  data: { name: string; email: string }
): Promise<{ success: boolean; message: string; user?: UserProfile }> => {
  const user = users[username];
  if (!user) return { success: false, message: 'User not found.' };

  user.name = data.name;
  user.email = data.email;
  user.initials = (data.name.match(/\b\w/g) || []).join('').toUpperCase() || '??';

  console.log(`User '${username}' profile updated in mock database.`);
  const { passwordHash, loginAttempts, isLocked, passwordLastChanged, ...userProfile } = user;
  return { success: true, message: 'Profile updated successfully.', user: userProfile };
};


export const updateUserPassword = async (
    username: string,
    currentPass: string,
    newPass: string
): Promise<{ success: boolean; message: string }> => {
    const user = users[username];
    if (!user) return { success: false, message: "User not found." };

    const isPasswordCorrect = await verifyPassword(currentPass, user.passwordHash);
    if (!isPasswordCorrect) return { success: false, message: "Incorrect current password." };

    user.passwordHash = `${newPass}_hashed`;
    user.passwordLastChanged = new Date().toISOString(); 

    console.log(`User '${username}' password updated in mock database.`);
    return { success: true, message: "Password updated successfully." };
}

export const lockUserAccount = async (
  username: string
): Promise<{ success: boolean; message: string }> => {
  const user = users[username];
  if (!user) return { success: false, message: 'User not found.' };
  if (user.role === 'admin') return { success: false, message: 'Admin accounts cannot be locked.' };

  user.isLocked = true;
  console.log(`User account for '${username}' has been manually locked.`);
  return { success: true, message: 'User account locked successfully.' };
};

export const unlockUserAccount = async (
  username: string
): Promise<{ success: boolean; message: string }> => {
  const user = users[username];
  if (!user) return { success: false, message: 'User not found.' };
  if (user.role === 'admin') return { success: false, message: 'Admin accounts cannot be locked.' };

  user.isLocked = false;
  user.loginAttempts = 0; 
  console.log(`User account for '${username}' has been unlocked.`);
  return { success: true, message: 'User account unlocked successfully.' };
};


export const removeUser = async (
    username: string
): Promise<{ success: boolean; message: string }> => {
    const user = users[username];
    if (!user) return { success: false, message: "User not found." };
    if (user.role === 'admin') return { success: false, message: "Cannot remove an admin account." };

    delete users[username];
    console.log(`User '${username}' removed from mock database.`);
    return { success: true, message: "User removed successfully." };
};
