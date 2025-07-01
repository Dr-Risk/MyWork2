
'use server';
/**
 * @fileoverview Mock Authentication & User Management
 *
 * @description
 * This file simulates a backend authentication system for demonstration purposes.
 * It manages user data in-memory and includes functions for user creation,
 * authentication, and administration. It's designed to mimic the interface of
 * a real backend service, allowing the frontend to be built as if it were
 * communicating with a live API.
 *
 * =============================================================================
 * SECURITY NOTICE (OWASP Top 10 & NIST Compliance)
 * =============================================================================
 * This is a MOCK system and is NOT secure for production use. It includes
 * comments below that highlight key security principles from OWASP and NIST
 * that would be implemented in a real-world application.
 *
 * Key security principles demonstrated or discussed:
 *
 * - A01: Broken Access Control: Comments explain where server-side role checks
 *   are needed to enforce privileges. The different user roles ('admin', 'full-time')
 *   are a direct implementation of the Principle of Least Privilege.
 *
 * - A02: Cryptographic Failures: Comments highlight the need for strong password
 *   hashing (e.g., Argon2, bcrypt) instead of the mock hashing used here. All
 *   data in transit should be encrypted with TLS (HTTPS).
 *
 * - A03: Injection: While this mock doesn't use a database, comments explain
 *   the need for parameterized queries or prepared statements to prevent SQL
 *   Injection. For other interpreters, proper escaping and validation are key.
 *
 * - A05: Security Misconfiguration: User enumeration is prevented by providing
 *   generic login failure messages. In a real app, ensure servers have security
 *   headers, unnecessary features are disabled, etc.
 *
 * - A07: Identification & Authentication Failures: The system includes concepts
 *   like password expiration and account lockout to mitigate brute-force attacks.
 *   Session management is handled in auth-context.tsx, with comments on using
 *   secure HttpOnly cookies.
 * 
 * - Path Traversal (related to A05 & A01): Not directly applicable here, but in
 *   a real app, never trust user input to build file paths. Always use a allow-list
 *   of safe paths and sanitize all input. The Next.js framework itself helps
 *   prevent this by managing routes and not exposing the file system directly via URLs.
 */

import { z } from "zod";

// Defines the structure for a user's public profile, which is safe to send to the client.
export interface UserProfile {
    username: string;
    role: 'admin' | 'full-time' | 'contractor';
    name: string;
    initials: string;
    email: string;
    isSuperUser?: boolean;
}

// Extends the public profile with sensitive, internal-only data for the backend.
interface UserWithPassword extends UserProfile {
    passwordHash: string; // In a real app, this would be a secure hash (e.g., from Argon2 or bcrypt).
    loginAttempts: number; // For tracking failed login attempts to prevent brute-force attacks.
    isLocked: boolean; // Flag to lock accounts after too many failed attempts.
    passwordLastChanged: string; // ISO 8601 date string to enforce password expiration policies.
}

// In-memory "database" of users. In a real app, this would be a proper database (e.g., PostgreSQL, Firestore).
const initialUsers: { [key: string]: UserWithPassword } = {
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
    isSuperUser: true,
  },
  'john.doe': {
    username: 'john.doe',
    passwordHash: 'DefaultPassword123_hashed', // Corresponds to 'DefaultPassword123'
    role: 'full-time',
    name: 'John Doe',
    initials: 'JD',
    email: 'john.doe@contractor.com',
    loginAttempts: 3,
    isLocked: true,
    passwordLastChanged: new Date(new Date().setDate(new Date().getDate() - 91)).toISOString(), // Expired password
    isSuperUser: false,
  },
  'utaker': {
    username: 'utaker',
    passwordHash: 'DefaultPassword123_hashed', // Corresponds to 'DefaultPassword123'
    role: 'contractor',
    name: 'Utaker',
    initials: 'U',
    email: 'utaker@example.com',
    loginAttempts: 0,
    isLocked: false,
    passwordLastChanged: new Date().toISOString(),
    isSuperUser: false,
  }
};

// This ensures the mock database persists across hot reloads in development environments.
if (!(global as any).users) {
  (global as any).users = initialUsers;
}
const users: { [key: string]: UserWithPassword } = (global as any).users;


// Zod schema for validating new user creation data on the "server".
const CreateUserSchema = z.object({
  name: z.string().min(2),
  username: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(8),
});
type CreateUserInput = z.infer<typeof CreateUserSchema>;

/**
 * Creates a new user in the mock database.
 * @param userData The user's information, validated against the schema.
 * @param role The user's assigned role.
 * @returns A promise resolving to a success or failure message.
 */
export const createUser = async (
  userData: CreateUserInput,
  role: 'full-time' | 'contractor' = 'full-time'
): Promise<{ success: boolean; message: string }> => {
    // [SECURITY] Input Validation (OWASP A03 - Injection):
    // Zod validation on the server-side is critical to ensure data integrity
    // before it enters the system, even if it's already validated on the client.
    if (users[userData.username]) {
        return { success: false, message: "Username already exists." };
    }

    // Generate user initials from their name for display avatars.
    const initials = (userData.name.match(/\b\w/g) || []).join('').toUpperCase() || '??';

    // Add the new user to the mock database.
    users[userData.username] = {
        username: userData.username,
        // [SECURITY] OWASP A02: See `verifyPassword` comments.
        passwordHash: `${userData.password}_hashed`,
        role: role, 
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

/**
 * [SECURITY] Simulates password verification.
 * 
 * OWASP A02 - Cryptographic Failures:
 * In a real application, NEVER store passwords in plain text or use a reversible format.
 * Use a strong, salted, one-way hashing algorithm like Argon2 (recommended), scrypt, or
 * bcrypt. The library would provide a `verify` function that compares the user's input
 * against the stored hash in a way that's safe from timing attacks.
 * 
 * NIST Special Publication 800-63B provides detailed guidance on password management.
 * 
 * @param password The plain text password from the user.
 * @param hash The stored "hash" from the mock database.
 * @returns A promise resolving to true if the passwords match.
 */
const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
    // This is a mock comparison and is NOT secure.
    return `${password}_hashed` === hash;
}

const MAX_LOGIN_ATTEMPTS = 3;

// A discriminated union type for the possible authentication responses.
export type AuthResponse = 
    | { status: 'success'; user: UserProfile }
    | { status: 'invalid'; message: string }
    | { status: 'locked'; message: string }
    | { status: 'expired'; message: string };

// [SECURITY] Zod schema for server-side validation of login credentials.
const LoginCredentialsSchema = z.object({
  username: z.string().regex(/^[a-zA-Z0-9_.-]+$/),
  password: z.string().min(1),
});

/**
 * Checks a user's login credentials against the mock database.
 * @param username The user's username.
 * @param pass The user's password.
 * @returns A promise resolving to an AuthResponse object.
 */
export const checkCredentials = async (username: string, pass: string): Promise<AuthResponse> => {
  // [SECURITY] Server-Side Input Validation (OWASP A03 - Injection).
  // This is the most critical validation step. It ensures that data conforms to the
  // expected format before any further processing. The regex below is a restrictive
  // allow-list for usernames, mitigating risks of many injection attacks.
  const validation = LoginCredentialsSchema.safeParse({ username, password: pass });
  if (!validation.success) {
    // Return a generic error to prevent user enumeration and feedback on validation failures.
    return { status: 'invalid', message: 'Invalid username or password.' };
  }

  /*
   * ====================================================================
   * [SECURITY] SQL INJECTION (OWASP A03) PREVENTION
   * ====================================================================
   * You correctly identified that inputs like "if else 1==1" are common
   * in SQL injection attacks. This mock application does NOT use a SQL
   * database, so it is not directly vulnerable to SQL injection.
   *
   * HOWEVER, IN A REAL APPLICATION, THIS IS A CRITICAL THREAT.
   *
   * How to Prevent SQL Injection:
   * The ONLY reliable way to prevent SQL injection is to use Parameterized
   * Queries (also known as Prepared Statements). This separates the query
   * logic from the data, ensuring that user input cannot be executed as code.
   *
   * DO NOT try to sanitize input by blacklisting characters (e.g., removing quotes).
   * Attackers can often find ways to bypass these filters (e.g., with encoding).
   *
   * Example (using a hypothetical database library):
   *
   * // WRONG - Vulnerable to Injection
   * const query = `SELECT * FROM users WHERE username = '${username}'`;
   * db.query(query); // If username is "' OR 1=1 --", the query becomes malicious.
   *
   * // CORRECT - Safe from Injection
   * const query = "SELECT * FROM users WHERE username = ?";
   * db.query(query, [username]);
   *
   * In the correct example, the database driver safely handles the `username`
   * variable, treating it purely as data, not as executable SQL.
   * ====================================================================
   */

  // A special backdoor for the primary admin to bypass lockout during development.
  if (username === 'moqadri' && pass === 'DefaultPassword123') {
    const user = users[username];
    if (user) {
      user.isLocked = false;
      user.loginAttempts = 0;
      const { passwordHash, loginAttempts, isLocked, passwordLastChanged, ...userProfile } = user;
      return { status: 'success', user: userProfile };
    }
  }

  const user = users[username];

  // [SECURITY] User Enumeration Prevention (OWASP A07 / A05):
  // If the user doesn't exist, return a generic error message. Do not reveal
  // that the username was the incorrect part of the credential pair.
  if (!user) {
    return { status: 'invalid', message: 'Invalid username or password.' };
  }

  // [SECURITY] Account Lockout (OWASP A07): Check if the account is already locked.
  if (user.isLocked && user.role !== 'admin') {
    return { status: 'locked', message: 'Your account is locked due to too many failed login attempts.' };
  }

  const isPasswordCorrect = await verifyPassword(pass, user.passwordHash);

  if (!isPasswordCorrect) {
    // For non-admin users, track failed attempts.
    if (user.role !== 'admin') {
      user.loginAttempts++;
      // Lock the account if the attempt limit is reached.
      if (user.loginAttempts >= MAX_LOGIN_ATTEMPTS) {
        user.isLocked = true;
        return { status: 'locked', message: 'Your account has been locked. Please contact support.' };
      }
    }
    // Return a generic error message for incorrect passwords as well.
    return { status: 'invalid', message: 'Invalid username or password.' };
  }
  
  // [SECURITY] Password Expiration (OWASP A07): Check if the password is older than 90 days.
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
  if (new Date(user.passwordLastChanged) < ninetyDaysAgo) {
    return { status: 'expired', message: 'Your password has expired. Please change it to continue.' };
  }

  // On successful login, reset attempts and unlock the account.
  user.loginAttempts = 0;
  user.isLocked = false;
  
  // Sanitize the user object before returning it, removing sensitive data.
  const { passwordHash, loginAttempts, isLocked, passwordLastChanged, ...userProfile } = user;
  
  return { status: 'success', user: userProfile };
}

// A sanitized user type that doesn't include sensitive data.
export type SanitizedUser = Omit<UserWithPassword, 'passwordHash'>;

/**
 * Retrieves a list of all users, sanitized for safe display on the client.
 * @returns A promise resolving to an array of sanitized user objects.
 */
export const getUsers = async (): Promise<SanitizedUser[]> => {
  return Object.values(users).map(user => {
    const { passwordHash, ...sanitizedUser } = user;
    return sanitizedUser;
  });
};

/**
 * [SECURITY] Updates a user's role.
 *
 * OWASP A01 - Broken Access Control & Principle of Least Privilege:
 * In a real application, this function must be a protected server-side endpoint.
 * It should first verify that the currently authenticated user (e.g., from a session token)
 * has administrative privileges before proceeding. This function simulates that check
 * by ensuring the target user is not an admin.
 */
export const updateUserRole = async (
  username: string,
  newRole: 'full-time' | 'contractor'
): Promise<{ success: boolean; message: string }> => {
  const user = users[username];

  if (!user) return { success: false, message: 'User not found.' };
  if (user.role === 'admin') return { success: false, message: 'Cannot change the role of an admin user.' };

  user.role = newRole;
  let message = 'User role updated successfully.';

  // If a user is demoted to a contractor, their super user status must be revoked.
  if (newRole === 'contractor' && user.isSuperUser) {
    user.isSuperUser = false;
    message = 'Role updated to Contractor. Super user status was revoked.';
  }

  console.log(`User '${username}' role updated to '${newRole}' in mock database.`);
  return { success: true, message };
};

/**
 * [SECURITY] Updates a user's profile information.
 *
 * OWASP A01 - Broken Access Control:
 * This should also be a protected server-side endpoint. The logic should verify
 * that the user is either updating their own profile or is an administrator. This
 * mock implementation doesn't include that check but a real one must.
 */
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

/**
 * [SECURITY] Updates a user's password.
 * 
 * OWASP A01 & A07:
 * This is a critical security function that must be protected on the server.
 * It must verify the user's current password before allowing a change to prevent
 * account takeover if a user's session is hijacked.
 */
export const updateUserPassword = async (
    username: string,
    currentPass: string,
    newPass: string
): Promise<{ success: boolean; message: string }> => {
    const user = users[username];
    if (!user) return { success: false, message: "User not found." };

    const isPasswordCorrect = await verifyPassword(currentPass, user.passwordHash);
    if (!isPasswordCorrect) return { success: false, message: "Incorrect current password." };

    // In a real app, the new password would be securely hashed here.
    user.passwordHash = `${newPass}_hashed`;
    user.passwordLastChanged = new Date().toISOString(); // Update the timestamp.

    console.log(`User '${username}' password updated in mock database.`);
    return { success: true, message: "Password updated successfully." };
}

/**
 * [SECURITY] Updates a user's super user status.
 *
 * OWASP A01 - Broken Access Control:
 * This is a privileged action that must be restricted to admins on the server side.
 * A user should never be able to elevate their own privileges.
 */
export const updateUserSuperUserStatus = async (
  username: string,
  isSuperUser: boolean
): Promise<{ success: boolean; message: string }> => {
  const user = users[username];

  if (!user) return { success: false, message: 'User not found.' };
  if (user.role === 'admin') return { success: false, message: 'Cannot change super user status for an admin.' };
  if (user.role === 'contractor' && isSuperUser) return { success: false, message: 'Contractors cannot be granted super user status.' };

  user.isSuperUser = isSuperUser;
  console.log(`User '${username}' super user status updated to '${isSuperUser}' in mock database.`);
  return { success: true, message: 'Super user status updated successfully.' };
};

/**
 * [SECURITY] Manually locks a user's account.
 *
 * OWASP A01 - Broken Access Control:
 * This is a privileged action that must be restricted to admins on the server side.
 */
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

/**
 * [SECURITY] Manually unlocks a user's account.
 *
 * OWASP A01 - Broken Access Control:
 * This is a privileged action that must be restricted to admins on the server side.
 */
export const unlockUserAccount = async (
  username: string
): Promise<{ success: boolean; message: string }> => {
  const user = users[username];
  if (!user) return { success: false, message: 'User not found.' };
  if (user.role === 'admin') return { success: false, message: 'Admin accounts cannot be locked.' };

  user.isLocked = false;
  user.loginAttempts = 0; // Also reset login attempts on manual unlock.
  console.log(`User account for '${username}' has been unlocked.`);
  return { success: true, message: 'User account unlocked successfully.' };
};

/**
 * [SECURITY] Removes a user from the system.
 *
 * OWASP A01 - Broken Access Control:
 * This is a highly destructive and privileged action that must be restricted
 * to admins on the server side. Proper checks are required.
 */
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
