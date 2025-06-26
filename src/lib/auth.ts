
'use server';

import { z } from "zod";

export interface UserProfile {
    username: string;
    role: 'admin' | 'full-time' | 'contractor';
    name: string;
    initials: string;
    email: string;
    isSuperUser?: boolean;
}

interface UserWithPassword extends UserProfile {
    passwordHash: string;
    loginAttempts: number;
    isLocked: boolean;
    passwordLastChanged: string; // ISO 8601 date string
}

const initialUsers: { [key: string]: UserWithPassword } = {
  'moqadri': {
    username: 'moqadri',
    passwordHash: '71697169@Yawer_hashed', // This is a mock hash
    role: 'admin',
    name: 'Mo Qadri',
    initials: 'MQ',
    email: 'mo.qadri@example.com',
    loginAttempts: 0,
    isLocked: false,
    passwordLastChanged: new Date().toISOString(),
    isSuperUser: true,
  },
  'casey.white': {
    username: 'casey.white',
    passwordHash: 'FullTimePassword123!_hashed', // This is a mock hash
    role: 'full-time',
    name: 'Dr. Casey White',
    initials: 'CW',
    email: 'casey.white@health.org',
    loginAttempts: 0,
    isLocked: false,
    passwordLastChanged: new Date().toISOString(),
    isSuperUser: false,
  },
  'john.doe': {
    username: 'john.doe',
    passwordHash: 'ContractorPass123!_hashed', // This is a mock hash
    role: 'contractor',
    name: 'John Doe',
    initials: 'JD',
    email: 'john.doe@contractor.com',
    loginAttempts: 0,
    isLocked: false,
    passwordLastChanged: new Date(new Date().setDate(new Date().getDate() - 91)).toISOString(),
    isSuperUser: false,
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

    users[userData.username] = {
        username: userData.username,
        passwordHash: `${userData.password}_hashed`,
        role: 'full-time', 
        name: userData.name,
        initials: initials,
        email: userData.email,
        loginAttempts: 0,
        isLocked: false,
        passwordLastChanged: new Date().toISOString(),
        isSuperUser: false,
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

export const checkCredentials = async (username: string, pass: string): Promise<AuthResponse> => {
  const user = users[username];

  if (!user) {
    return { status: 'invalid', message: 'Invalid username or password.' };
  }

  if (user.isLocked && user.role !== 'admin') {
    return { status: 'locked', message: 'Your account is locked due to too many failed login attempts.' };
  }

  const isPasswordCorrect = await verifyPassword(pass, user.passwordHash);

  if (!isPasswordCorrect) {
    if (user.role !== 'admin') {
      user.loginAttempts++;
      if (user.loginAttempts >= MAX_LOGIN_ATTEMPTS) {
        user.isLocked = true;
        return { status: 'locked', message: 'Your account has been locked. Please contact support.' };
      }
      const attemptsRemaining = MAX_LOGIN_ATTEMPTS - user.loginAttempts;
      return { status: 'invalid', message: `Invalid password. ${attemptsRemaining} attempt(s) remaining.` };
    } else {
      // For admins, just return an invalid password message without consequences.
      return { status: 'invalid', message: 'Invalid username or password.' };
    }
  }
  
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
  
  if (new Date(user.passwordLastChanged) < ninetyDaysAgo) {
    return { status: 'expired', message: 'Your password has expired. Please change it to continue.' };
  }

  // On successful login, reset attempts and unlock account
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

export const updateUserRole = async (
  username: string,
  newRole: 'full-time' | 'contractor'
): Promise<{ success: boolean; message: string }> => {
  const user = users[username];

  if (!user) {
    return { success: false, message: 'User not found.' };
  }

  if (user.role === 'admin') {
    return { success: false, message: 'Cannot change the role of an admin user.' };
  }

  user.role = newRole;
  console.log(`User '${username}' role updated to '${newRole}' in mock database.`);

  return { success: true, message: 'User role updated successfully.' };
};

export const updateUserProfile = async (
  username: string,
  data: { name: string; email: string }
): Promise<{ success: boolean; message: string; user?: UserProfile }> => {
  const user = users[username];

  if (!user) {
    return { success: false, message: 'User not found.' };
  }

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
    if (!user) {
        return { success: false, message: "User not found." };
    }

    const isPasswordCorrect = await verifyPassword(currentPass, user.passwordHash);
    if (!isPasswordCorrect) {
        return { success: false, message: "Incorrect current password." };
    }

    user.passwordHash = `${newPass}_hashed`;
    user.passwordLastChanged = new Date().toISOString();

    console.log(`User '${username}' password updated in mock database.`);

    return { success: true, message: "Password updated successfully." };
}

export const updateUserSuperUserStatus = async (
  username: string,
  isSuperUser: boolean
): Promise<{ success: boolean; message: string }> => {
  const user = users[username];

  if (!user) {
    return { success: false, message: 'User not found.' };
  }

  if (user.role === 'admin') {
    return { success: false, message: 'Cannot change super user status for an admin.' };
  }

  user.isSuperUser = isSuperUser;
  console.log(`User '${username}' super user status updated to '${isSuperUser}' in mock database.`);

  return { success: true, message: 'Super user status updated successfully.' };
};
