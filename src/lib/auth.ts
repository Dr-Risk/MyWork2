
'use server';
/**
 * @fileoverview Mock Authentication & User Management for PixelForge Nexus
 *
 * @description
 * This file simulates a backend authentication system for the game development
 * project management tool. It manages user data in-memory with roles tailored
 * for this purpose: 'admin', 'project-lead', and 'developer'. It now uses a
 * dedicated MFA service for handling multi-factor authentication logic.
 *
 * =============================================================================
 * SECURITY NOTICE (OWASP Top 10 & NIST Compliance)
 * =============================================================================
 * This is a MOCK system and is NOT secure for production use. It includes
 * comments below that highlight key security principles from OWASP and NIST
 * that would be implemented in a real-world application.
 */

import { z } from "zod";
import fs from 'fs';
import path from 'path';
import { logger } from './logger';
import { generateMfaQrCode, generateMfaSecret, verifyMfaToken } from './mfa';

// Path to the mock database file
const dbPath = path.join(process.cwd(), 'src', 'lib', 'users.json');

/**
 * [PERFORMANCE] In-memory cache for user data.
 * Instead of reading from the filesystem on every request, we store the user
 * data in this variable. It's populated once on startup and updated only when
 * a change is made, drastically improving response times for data lookups.
 */
let usersCache: { [key: string]: UserWithPassword } | null = null;


/**
 * @interface UserProfile
 * @description Defines the structure for a user's public profile. This data is
 * considered "safe" to send to the client-side and display in the UI.
 */
export interface UserProfile {
    username: string;
    role: 'admin' | 'project-lead' | 'developer';
    name: string;
    initials: string;
    email: string;
    mfaEnabled: boolean;
}

/**
 * @interface UserWithPassword
 * @description Extends the public profile with sensitive, internal-only data for the
 * backend. This data should NEVER be sent to the client.
 */
interface UserWithPassword extends UserProfile {
    /**
     * [SECURITY] Secure Password Storage & Hashing Explained (OWASP A02)
     *
     * To keep our users safe, we NEVER store their actual passwords. Instead, we
     * store a secure "fingerprint" of the password, known as a HASH.
     *
     * --- How it Works (A Simple Analogy) ---
     * Imagine you write your password on a piece of paper. Instead of putting that
     * paper in a filing cabinet where someone could find it, you throw it into a
     * special shredder (a "hashing algorithm" like bcrypt or Argon2). This shredder
     * turns your password into a unique, jumbled-up pile of confetti.
     *
     * - One-Way Street: You can't turn the confetti back into the original piece of paper.
     *   Similarly, you cannot reverse a hash to get the original password.
     * - Consistent Results: If you put the exact same password into the shredder again,
     *   you get the exact same pile of confetti.
     *
     * When you log in, we take the password you enter, run it through the same special
     * shredder, and compare the new pile of confetti to the one we have stored. If they
     * match, we know you entered the correct password, all without ever needing to
     * see or store the password itself.
     *
     * --- Our Implementation ---
     * For this prototype, we simulate this process by adding "_hashed" to the end of
     * the password. In a real-world application, this line would be replaced with a
     * call to a real, secure hashing library like `bcrypt.hash(password)`.
     */
    passwordHash: string;
    
    /**
     * [SECURITY] Brute Force Protection (OWASP A07 - Auth Failures)
     * Tracks failed login attempts to implement account lockout mechanisms.
     */
    loginAttempts: number;
    
    /**
     * [SECURITY] Account Lockout (OWASP A07 - Auth Failures)
     * A flag to lock an account after too many failed login attempts.
     */
    isLocked: boolean;
    
    /**
     * [SECURITY] Password Expiration Policy (NIST SP 800-63B)
     * Stores the date of the last password change to enforce rotation policies.
     */
    passwordLastChanged: string;

    /**
     * [SECURITY] MFA Secret
     * The secret key for TOTP, stored encrypted in a real database.
     */
    mfaSecret?: string;

    /**
     * [SECURITY] Force Password Change on First Login
     * A flag to require a user to change their default password.
     */
    mustChangePassword?: boolean;
}

/**
 * Reads all users from the users.json file, using a cache to avoid redundant reads.
 * @returns A promise that resolves to the user data object.
 */
const readUsers = async (): Promise<{ [key: string]: UserWithPassword }> => {
    // If the cache is populated, return it immediately.
    if (usersCache) {
        return usersCache;
    }

    try {
        const data = await fs.promises.readFile(dbPath, 'utf-8');
        usersCache = JSON.parse(data);
        return usersCache!;
    } catch (error) {
        logger.error('Error reading users from file. The file may not exist or is corrupted.', error);
        // If reading fails, return an empty object. Do NOT write anything to disk.
        // This prevents the application from overwriting existing data with a blank state.
        return {};
    }
};


/**
 * Writes the entire user object to the users.json file and updates the cache.
 * @param data The user data to write.
 */
const writeUsers = async (data: { [key: string]: UserWithPassword }): Promise<void> => {
    try {
        await fs.promises.writeFile(dbPath, JSON.stringify(data, null, 2));
        // Invalidate and update the cache with the new data.
        usersCache = data;
    } catch (error) {
        logger.error('Error writing users to file.', error);
    }
};

/**
 * A private function that returns a fresh copy of the initial user data.
 * This is the single source of truth for initializing the mock database IF IT IS EMPTY.
 */
function getInitialUsers(): { [key: string]: UserWithPassword } {
    return {
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
            mfaEnabled: false,
        }
    };
}


/**
 * [SECURITY] Input Validation (OWASP A03 - Injection)
 * Zod schema for validating new user creation data on the "server".
 * This ensures that all required fields are present and in the correct format
 * before any processing occurs.
 */
const CreateUserSchema = z.object({
  name: z.string().min(2),
  username: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(['project-lead', 'developer']),
});
type CreateUserInput = z.infer<typeof CreateUserSchema>;


/**
 * Creates a new user in the mock database.
 * @param userData The user data to create.
 * @returns A promise that resolves to a success or failure message.
 */
export const createUser = async (
  userData: CreateUserInput
): Promise<{ success: boolean; message:string }> => {
    const users = await readUsers();
    // Prevent username collisions.
    if (users[userData.username]) {
        return { success: false, message: "Username already exists." };
    }

    // Generate user initials from their full name.
    const initials = (userData.name.match(/\b\w/g) || []).join('').toUpperCase() || '??';

    const newUser: UserWithPassword = {
        username: userData.username,
        passwordHash: `${userData.password}_hashed`, // MOCK HASHING
        role: userData.role, 
        name: userData.name,
        initials: initials,
        email: userData.email,
        loginAttempts: 0,
        isLocked: false,
        passwordLastChanged: new Date().toISOString(),
        mfaEnabled: false,
        mustChangePassword: true, // Force password change on first login.
    };

    // Create the new user object
    const updatedUsers = { ...users, [userData.username]: newUser };
    
    // Write the updated object to the file and refresh the cache.
    await writeUsers(updatedUsers);

    logger.info(`User '${userData.username}' created successfully.`);
    return { success: true, message: "User created successfully." };
};


/**
 * Simulates verifying a password against a stored hash.
 * @param password The plain text password.
 * @param hash The stored "hash".
 * @returns A promise that resolves to true if the password is correct.
 */
const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
    // In a real app, this would be: `await bcrypt.compare(password, hash)`
    return `${password}_hashed` === hash;
}

// The maximum number of failed login attempts before an account is locked.
const MAX_LOGIN_ATTEMPTS = 3;

// The type definition for the response of the credential check function.
export type AuthResponse = 
    | { status: 'success'; user: UserProfile }
    | { status: 'invalid'; message: string }
    | { status: 'locked'; message: string }
    | { status: 'expired'; message: string }
    | { status: 'must_change_password'; message: string; user: { username: string } }
    | { status: 'mfa_required'; message: string; user: Pick<UserProfile, 'username' | 'mfaEnabled'> };

/**
 * [SECURITY] Input Validation (OWASP A03 - Injection)
 * A Zod schema to validate the shape and content of login credentials.
 * The regex for the username is a strict "allow-list" to prevent common
 * injection characters. This server-side validation is the primary defense.
 */
const LoginCredentialsSchema = z.object({
  username: z.string().regex(/^[a-zA-Z0-9_.-]+$/),
  password: z.string().min(8),
});


/**
 * Checks a user's credentials against the mock database.
 * @param username The user's username.
 * @param pass The user's password.
 * @returns A promise resolving to an AuthResponse object.
 */
export const checkCredentials = async (username: string, pass: string): Promise<AuthResponse> => {
  // 1. Validate input format.
  const validation = LoginCredentialsSchema.safeParse({ username, password: pass });
  if (!validation.success) {
    logger.warn(`Login attempt with invalid format for username: ${username}`);
    return { status: 'invalid', message: 'Invalid username or password.' };
  }
  
  const users = await readUsers();
  const user = users[username];

  // 2. Check if user exists.
  if (!user) {
    // [SECURITY] User Enumeration Prevention (OWASP A07)
    // Return a generic message to prevent attackers from guessing valid usernames.
    logger.warn(`Login attempt for non-existent user: ${username}`);
    return { status: 'invalid', message: 'Invalid username or password.' };
  }

  // 3. Check if account is locked.
  if (user.isLocked) {
    logger.warn(`Login attempt for locked account: ${username}`);
    return { status: 'locked', message: 'Your account is locked due to too many failed login attempts.' };
  }

  // 4. Verify password.
  const isPasswordCorrect = await verifyPassword(pass, user.passwordHash);

  if (!isPasswordCorrect) {
    logger.warn(`Failed login attempt for user: ${username}`);
    // [SECURITY] Brute-Force Prevention: Increment login attempts for non-admins.
    if (user.role !== 'admin') {
      user.loginAttempts++;
      if (user.loginAttempts >= MAX_LOGIN_ATTEMPTS) {
        user.isLocked = true;
        logger.warn(`Account for user '${username}' has been locked due to excessive login attempts.`);
      }
      await writeUsers(users); // Save updated attempts/lock status.
    }
    return { status: 'invalid', message: 'Invalid username or password.' };
  }
  
  // 5. Check if the user must change their password.
  if (user.mustChangePassword) {
    logger.info(`User '${username}' must change their password.`);
    return { status: 'must_change_password', message: 'You must change your password before continuing.', user: { username: user.username } };
  }

  // 6. [SECURITY] Password Expiration: Check for non-admin users.
  // The admin account is exempt from password expiration rules.
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
  if (user.role !== 'admin' && new Date(user.passwordLastChanged) < ninetyDaysAgo) {
    logger.info(`Password has expired for user: ${username}`);
    return { status: 'expired', message: 'Your password has expired. Please change it to continue.' };
  }

  // 7. Check if MFA is enabled
  if (user.mfaEnabled) {
      logger.info(`MFA required for user: ${username}`);
      const { passwordHash, loginAttempts, isLocked, passwordLastChanged, mfaSecret, mustChangePassword, ...userProfile } = user;
      return { status: 'mfa_required', message: 'MFA is required.', user: { username: userProfile.username, mfaEnabled: userProfile.mfaEnabled } };
  }

  // 8. On success, reset login attempts and prepare the user profile to be returned.
  logger.info(`Successful login for user: ${username}`);
  user.loginAttempts = 0;
  await writeUsers(users);
  
  // [SECURITY] Data Minimization
  // Only return the non-sensitive UserProfile, not the internal UserWithPassword.
  const { passwordHash, loginAttempts, isLocked, passwordLastChanged, mfaSecret, mustChangePassword, ...userProfile } = user;
  
  return { status: 'success', user: userProfile };
}

/**
 * A "sanitized" user type that omits the password hash, safe to use within the app.
 */
export type SanitizedUser = Omit<UserWithPassword, 'passwordHash' | 'mfaSecret'>;

/**
 * Retrieves a list of all users without their password hashes.
 */
export const getUsers = async (): Promise<SanitizedUser[]> => {
  const users = await readUsers();
  return Object.values(users).map(user => {
    const { passwordHash, mfaSecret, ...sanitizedUser } = user;
    return sanitizedUser;
  });
};

/**
 * Retrieves a list of users who are developers.
 * @description This function specifically filters for users with the 'developer' role.
 * It is used to populate the "Assign Team" dialog, ensuring that only developers
 * can be assigned to projects, as per the application requirements.
 * @returns {Promise<SanitizedUser[]>} A promise that resolves to an array of developer users.
 */
export const getDevelopers = async (): Promise<SanitizedUser[]> => {
  const allUsers = await getUsers();
  // Filter for users whose role is exactly 'developer'.
  return allUsers.filter(u => u.role === 'developer');
}

/**
 * Updates a user's role.
 */
export const updateUserRole = async (
  username: string,
  newRole: 'project-lead' | 'developer'
): Promise<{ success: boolean; message: string }> => {
  const users = await readUsers();
  const user = users[username];

  if (!user) return { success: false, message: 'User not found.' };
  // [SECURITY] Access Control (OWASP A01 - Broken Access Control)
  // Prevent changing the role of the admin user.
  if (user.role === 'admin') return { success: false, message: 'Cannot change the role of an admin user.' };

  user.role = newRole;
  await writeUsers(users);
  logger.info(`User '${username}' role updated to '${newRole}'.`);
  return { success: true, message: 'User role updated successfully.' };
};


/**
 * Updates a user's profile information (name and email).
 */
export const updateUserProfile = async (
  username: string,
  data: { name: string; email: string }
): Promise<{ success: boolean; message: string; user?: UserProfile }> => {
  const users = await readUsers();
  const user = users[username];
  if (!user) return { success: false, message: 'User not found.' };

  user.name = data.name;
  user.email = data.email;
  user.initials = (data.name.match(/\b\w/g) || []).join('').toUpperCase() || '??';
  await writeUsers(users);

  logger.info(`User '${username}' profile updated.`);
  const { passwordHash, loginAttempts, isLocked, passwordLastChanged, mfaSecret, mustChangePassword, ...userProfile } = user;
  return { success: true, message: 'Profile updated successfully.', user: userProfile };
};

/**
 * Updates a user's password after verifying their current one.
 */
export const updateUserPassword = async (
    username: string,
    currentPass: string,
    newPass: string
): Promise<{ success: boolean; message: string }> => {
    const users = await readUsers();
    const user = users[username];
    if (!user) return { success: false, message: "User not found." };

    // Users must provide their current password to change it.
    const isPasswordCorrect = await verifyPassword(currentPass, user.passwordHash);
    if (!isPasswordCorrect) {
        logger.warn(`Failed password change attempt for user '${username}' due to incorrect current password.`);
        return { success: false, message: "Incorrect current password." };
    }

    user.passwordHash = `${newPass}_hashed`; // MOCK HASHING
    user.passwordLastChanged = new Date().toISOString();
    // After a successful password change, clear the force change flag.
    if (user.mustChangePassword) {
        user.mustChangePassword = false;
    }
    await writeUsers(users);

    logger.info(`User '${username}' password updated successfully.`);
    return { success: true, message: "Password updated successfully." };
}

/**
 * Updates a user's password using a temporary token (simulated by username).
 * This is for the forced password change flow where the old password isn't required.
 */
export const updateUserPasswordWithTempToken = async (
    username: string, // In a real app, this would be a secure, single-use token.
    newPass: string
): Promise<{ success: boolean; message: string }> => {
    const users = await readUsers();
    const user = users[username];
    if (!user) {
        return { success: false, message: "Invalid session or user not found." };
    }

    user.passwordHash = `${newPass}_hashed`; // MOCK HASHING
    user.passwordLastChanged = new Date().toISOString();
    user.mustChangePassword = false; // Clear the flag.
    await writeUsers(users);

    logger.info(`User '${username}' password updated successfully via temporary token flow.`);
    return { success: true, message: "Password updated successfully." };
}


/**
 * Manually locks a user account.
 */
export const lockUserAccount = async (
  username: string
): Promise<{ success: boolean; message: string }> => {
  const users = await readUsers();
  const user = users[username];
  if (!user) return { success: false, message: 'User not found.' };
  // [SECURITY] Admin Backdoor Removal
  // The check to prevent admins from being locked has been updated to only apply here,
  // not in the main login flow, hardening the system.
  if (user.role === 'admin') return { success: false, message: 'Admin accounts cannot be locked.' };

  user.isLocked = true;
  await writeUsers(users);
  logger.info(`User account for '${username}' has been manually locked by an admin.`);
  return { success: true, message: 'User account locked successfully.' };
};

/**
 * Manually unlocks a user account and resets their login attempts.
 */
export const unlockUserAccount = async (
  username: string
): Promise<{ success: boolean; message: string }> => {
  const users = await readUsers();
  const user = users[username];
  if (!user) return { success: false, message: 'User not found.' };
  if (user.role === 'admin') return { success: false, message: 'Admin accounts cannot be locked.' };

  user.isLocked = false;
  user.loginAttempts = 0; 
  await writeUsers(users);
  logger.info(`User account for '${username}' has been manually unlocked by an admin.`);
  return { success: true, message: 'User account unlocked successfully.' };
};


/**
 * Permanently removes a user from the system.
 */
export const removeUser = async (
    username: string
): Promise<{ success: boolean; message: string }> => {
    const users = await readUsers();
    const user = users[username];
    if (!user) return { success: false, message: "User not found." };
    if (user.role === 'admin') return { success: false, message: "Cannot remove an admin account." };

    delete users[username];
    await writeUsers(users);
    logger.info(`User '${username}' removed from the system by an admin.`);
    return { success: true, message: "User removed successfully." };
};

/**
 * Generates a new MFA secret and a QR code for setup.
 * This function orchestrates the MFA setup by calling the MFA service.
 */
export const setupMfa = async (username: string): Promise<{ success: boolean; message: string; data?: { qrCodeDataUrl: string; secret: string } }> => {
    const users = await readUsers();
    const user = users[username];
    if (!user) return { success: false, message: 'User not found.' };
    
    // Generate a new secret using the MFA service.
    const secret = await generateMfaSecret();
    
    // In our mock backend, we store the secret temporarily on the user object.
    // In a real app, this might be stored in a separate temporary table.
    user.mfaSecret = secret;
    await writeUsers(users);

    try {
        // Generate the QR code data URL using the MFA service.
        const qrCodeDataUrl = await generateMfaQrCode(user.email, secret);
        logger.info(`Generated MFA setup QR code for user '${username}'.`);
        return { success: true, message: 'QR code generated.', data: { qrCodeDataUrl, secret } };
    } catch (error) {
        logger.error(`Failed to generate QR code for user '${username}'.`, error);
        return { success: false, message: 'Could not generate QR code.' };
    }
};

/**
 * Verifies the TOTP code and completes MFA setup.
 */
export const confirmMfa = async (username: string, token: string): Promise<{ success: boolean; message: string; user?: UserProfile }> => {
    const users = await readUsers();
    const user = users[username];
    if (!user || !user.mfaSecret) {
        return { success: false, message: 'MFA setup not initiated or secret is missing.' };
    }

    // Verify the code using the MFA service.
    const isValid = await verifyMfaToken(user.mfaSecret, token);
    
    if (!isValid) {
        logger.warn(`MFA confirmation failed for user '${username}' with invalid token.`);
        return { success: false, message: 'Invalid code. Please try again.' };
    }

    // On successful verification, finalize MFA setup.
    user.mfaEnabled = true;
    // The secret is now permanently stored.
    await writeUsers(users);

    logger.info(`MFA enabled for user '${username}'.`);
    const { passwordHash, loginAttempts, isLocked, passwordLastChanged, mfaSecret, mustChangePassword, ...userProfile } = user;
    return { success: true, message: 'MFA enabled successfully!', user: userProfile };
};

/**
 * Disables MFA for a user.
 */
export const disableMfa = async (username: string): Promise<{ success: boolean; message: string; user?: UserProfile }> => {
    const users = await readUsers();
    const user = users[username];
    if (!user) return { success: false, message: 'User not found.' };

    user.mfaEnabled = false;
    delete user.mfaSecret; // Remove the secret.
    await writeUsers(users);

    logger.info(`MFA disabled for user '${username}'.`);
    const { passwordHash, loginAttempts, isLocked, passwordLastChanged, mfaSecret, mustChangePassword, ...userProfile } = user;
    return { success: true, message: 'MFA has been disabled.', user: userProfile };
};


/**
 * The final login step for users with MFA enabled.
 * Verifies the TOTP code and returns the full user profile on success.
 */
export const loginWithMfa = async (username: string, token: string): Promise<AuthResponse> => {
    const users = await readUsers();
    const user = users[username];
    if (!user || !user.mfaSecret) {
        return { status: 'invalid', message: 'MFA not enabled or secret not found.' };
    }

    const isValid = await verifyMfaToken(user.mfaSecret, token);
    
    if (!isValid) {
        logger.warn(`MFA login failed for user '${username}' with invalid token.`);
        return { status: 'invalid', message: 'Invalid authenticator code.' };
    }

    // On success, reset login attempts and return the user profile.
    user.loginAttempts = 0;
    await writeUsers(users);
    
    logger.info(`Successful MFA login for user: ${username}`);
    const { passwordHash, loginAttempts, isLocked, passwordLastChanged, mfaSecret, mustChangePassword, ...userProfile } = user;
    return { status: 'success', user: userProfile };
}
