'use server';

import { z } from "zod";

export interface UserProfile {
    username: string;
    role: 'admin' | 'full-time' | 'contractor';
    name: string;
    initials: string;
    email: string;
}

interface UserWithPassword extends UserProfile {
    passwordHash: string;
    loginAttempts: number;
    isLocked: boolean;
    passwordLastChanged: string; // ISO 8601 date string
}

// NOTE: This is a mock database. In a real application, this data would be
// stored securely in a database. For this prototype, we are using a global
// variable to simulate a persistent data store across server requests.
const initialUsers: { [key: string]: UserWithPassword } = {
  'moqadri': {
    username: 'moqadri',
    passwordHash: '12345_hashed', // This is a mock hash
    role: 'admin',
    name: 'Mo Qadri',
    initials: 'MQ',
    email: 'mo.qadri@example.com',
    loginAttempts: 0,
    isLocked: false,
    passwordLastChanged: new Date().toISOString(),
  },
  'casey.white': {
    username: 'casey.white',
    passwordHash: 'password123_hashed', // This is a mock hash
    role: 'full-time',
    name: 'Dr. Casey White',
    initials: 'CW',
    email: 'casey.white@health.org',
    loginAttempts: 0,
    isLocked: false,
    passwordLastChanged: new Date().toISOString(),
  },
  'john.doe': {
    username: 'john.doe',
    passwordHash: 'password_hashed', // This is a mock hash
    role: 'contractor',
    name: 'John Doe',
    initials: 'JD',
    email: 'john.doe@contractor.com',
    loginAttempts: 0,
    isLocked: false,
    // Set this user's password to be "expired" for demonstration
    passwordLastChanged: new Date(new Date().setDate(new Date().getDate() - 91)).toISOString(),
  }
};

if (!(global as any).users) {
  (global as any).users = initialUsers;
}

const users: { [key: string]: UserWithPassword } = (global as any).users;


const CreateUserSchema = z.object({
  name: z.string().min(2),
  username: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(12),
});

type CreateUserInput = z.infer<typeof CreateUserSchema>;

export const createUser = async (userData: CreateUserInput): Promise<{ success: boolean; message: string }> => {
    if (users[userData.username]) {
        return { success: false, message: "Username already exists." };
    }

    const initials = (userData.name.match(/\b\w/g) || []).join('').toUpperCase() || '??';

    // A simple mock for creating a new user.
    // We'll give new users the 'full-time' role by default.
    users[userData.username] = {
        username: userData.username,
        passwordHash: `${userData.password}_hashed`, // MOCK HASHING
        role: 'full-time', 
        name: userData.name,
        initials: initials,
        email: userData.email,
        loginAttempts: 0,
        isLocked: false,
        passwordLastChanged: new Date().toISOString(),
    };

    // In a real app, this would be an atomic database operation.
    console.log(`User '${userData.username}' created in mock database.`);
    
    return { success: true, message: "User created successfully." };
};

// Mock password hashing function. In a real app, use bcrypt.
const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
    return `${password}_hashed` === hash;
}

const MAX_LOGIN_ATTEMPTS = 3;

export type AuthResponse = 
    | { status: 'success'; user: UserProfile }
    | { status: 'invalid'; message: string }
    | { status: 'locked'; message: string }
    | { status: 'expired'; message: string };

export const checkCredentials = async (username: string, pass: string): Promise<AuthResponse> => {
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
    const attemptsRemaining = MAX_LOGIN_ATTEMPTS - user.loginAttempts;
    return { status: 'invalid', message: `Invalid password. ${attemptsRemaining} attempt(s) remaining.` };
  }
  
  // Check for password expiration
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
  
  if (new Date(user.passwordLastChanged) < ninetyDaysAgo) {
    return { status: 'expired', message: 'Your password has expired. Please change it to continue.' };
  }

  // On successful login
  user.loginAttempts = 0;
  
  // Destructure to remove sensitive info before returning
  const { passwordHash, loginAttempts, isLocked, passwordLastChanged, ...userProfile } = user;
  
  return { status: 'success', user: userProfile };
}
