# SDLC Stage 4: Development

This document describes the practices and principles followed during the coding and implementation phase of the PixelForge Nexus project.

## 4.1 Development Methodology and Tools

As defined in the Initiation phase, this project was developed using an **iterative Agile SDLC model**. This methodology allowed for the incremental development of features, with security considerations being integrated into each cycle rather than being treated as a final-stage task.

- **Key Stages**: Each iteration involved a cycle of design, development, and testing. For example, the user management feature was first designed with RBAC in mind, then developed, and finally tested with manual UAT from the perspective of each user role.
- **Tools Used**:
    - **IDE**: Visual Studio Code
    - **Framework**: Next.js 15 with the App Router
    - **Language**: TypeScript
    - **UI**: ShadCN UI Components, Tailwind CSS
    - **Version Control**: Git (via GitHub)
    - **Package Management**: npm

## 4.2 Secure Coding Practices

The development process adhered to several key secure coding practices to minimize vulnerabilities. All security-related logic is centralized in the mock backend (`src/lib/`) for easier auditing.

- **Input Validation**: All data received from the client is untrusted. The mock backend in `src/lib/auth.ts` uses **Zod schemas** to perform strict server-side validation. This is the authoritative source of validation and protects against injection attacks (OWASP A03) and other malformed data submissions.

  **Example from `src/lib/auth.ts`**:
  ```typescript
  // [SECURITY] Input Validation (OWASP A03 - Injection)
  // This Zod schema validates login credentials. The regex is a strict
  // "allow-list" to prevent common injection characters.
  const LoginCredentialsSchema = z.object({
    username: z.string().regex(/^[a-zA-Z0-9_.-]+$/),
    password: z.string().min(8),
  });
  ```

- **Cross-Site Scripting (XSS) Prevention**: The application is built with React and Next.js, which provide strong, default protection against XSS attacks. Data rendered in JSX is automatically escaped, converting dangerous characters like `<` and `>` into strings.

  **Example from `src/app/dashboard/page.tsx`**:
  ```tsx
  // If `project.name` contained "<script>alert('XSS')</script>", React would
  // render the literal string, not execute the script.
  <CardTitle className="font-headline text-xl">{project.name}</CardTitle>
  ```

- **Server-Side Access Control**: All sensitive actions are validated on the server-side logic to ensure the user has the correct permissions, preventing unauthorized actions even if a user bypasses client-side UI restrictions.

    **Example from `src/lib/auth.ts`**:
    ```typescript
    // This server-side check prevents anyone from changing an admin's role.
    export const updateUserRole = async (username: string, newRole: 'project-lead' | 'developer') => {
      // ...
      // [SECURITY] Access Control (OWASP A01)
      if (user.role === 'admin') {
        return { success: false, message: 'Cannot change the role of an admin user.' };
      }
      // ... proceed with role change
    };
    ```

- **Strong Typing & Error Handling**: The project uses **TypeScript** to prevent common errors. Additionally, a centralized `logger.ts` service is used to log detailed errors on the server while sending only generic, non-sensitive error messages to the client, preventing information leakage.

## 4.3 User Management and CRUD Operations

User management is a critical, admin-only function handled via secure CRUD (Create, Read, Update, Delete) operations in `src/lib/auth.ts`.

- **Create**: The `createUser` function validates new user data against a strict schema and sets secure defaults, such as forcing a password change on first login.
- **Read**: The `getUsers` function retrieves a list of all users but sanitizes the data by removing sensitive fields like `passwordHash` and `mfaSecret` before returning it.
- **Update**: Functions like `updateUserRole` and `updateUserProfile` contain specific business logic to prevent unauthorized changes, such as attempting to change an admin's role.
- **Delete**: The `removeUser` function includes a check to prevent the admin account from being deleted.

## 4.4 Testing During Development

Testing was an integral part of the development process.

- **Static Testing (SAST) / Code Review**: TypeScript and ESLint provided continuous static analysis. Manual code reviews of key files like `src/lib/auth.ts` were critical for finding and fixing vulnerabilities like a developer backdoor (documented in `TROUBLESHOOTING.md`).
- **Integration Testing (Manual)**: After developing new features, manual tests were performed to ensure they worked correctly with the existing system. This process found and fixed a critical bug where newly created users would not appear in dropdown lists due to a state management issue.
- **System Testing (Manual)**: Before any major change was considered complete, the application was tested end-to-end from the perspective of each user role (`admin`, `project-lead`, `developer`) to validate permissions and functionality.
