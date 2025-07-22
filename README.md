# PixelForge Nexus: A Secure Project Management Tool

This is a Next.js web application designed as a secure, role-based project management tool for a game development studio. It demonstrates key security principles and a defense-in-depth approach within a modern web architecture.

## Running Locally

To run this application on your local machine, follow these steps.

### 1. Set Up Environment Variables

The application uses Genkit for its AI features, which requires an API key from Google AI.

1.  Create a copy of the `.env.example` file and name it `.env.local`.
    ```bash
    cp .env.example .env.local
    ```
2.  Open the new `.env.local` file.
3.  Get your API key from [Google AI Studio](https://aistudio.google.com/app/apikey).
4.  Replace `YOUR_API_KEY_HERE` with your actual key.

### 2. Install Dependencies

Open your terminal in the project's root directory and run the following command to install the necessary packages:

```bash
npm install
```

### 3. Run the Development Servers

This application requires two separate processes to run concurrently in two separate terminal windows.

**Terminal 1: Start the Next.js App**

This command starts the main web application.

```bash
npm run dev
```

Your application will be available at `http://localhost:3000`.

**Terminal 2: Start the Genkit AI Flows**

This command starts the Genkit server, which runs your AI logic. The `--watch` flag will automatically restart the server when you make changes to your AI flows.

```bash
npm run genkit:watch
```

This will start the Genkit development UI, typically on `http://localhost:4000`, where you can inspect and test your AI flows.

---

## System Design & Security

This project was designed and built with a "security-first" mindset, incorporating several core principles to protect data and ensure system integrity.

### Architectural Overview

*   **Frontend**: Built with Next.js and React, using server components to reduce client-side load and enhance performance.
*   **UI**: Utilizes ShadCN UI components for a modern, consistent, and accessible user interface.
*   **Styling**: Styled with Tailwind CSS for a utility-first approach.
*   **Backend (Mock)**: A mock backend is simulated in `src/lib/auth.ts` and `src/lib/projects.ts` to handle user authentication, authorization, and data persistence via `localStorage` and a `users.json` file. This simulates a real database for development purposes.

### Core Security Principles

The following principles were central to the design and development of PixelForge Nexus:

#### 1. Role-Based Access Control (RBAC)

RBAC is the cornerstone of the application's security model. It ensures that users can only perform actions and access data that is appropriate for their role.

*   **Roles Defined**:
    *   **Admin**: Superuser with full system access. Can create projects, manage all users (create, change roles, lock/unlock), and has full control over all documents.
    *   **Project Lead**: Can be assigned to lead projects. Can manage the team for their assigned project (assign developers) and can upload/delete documents for that project.
    *   **Developer**: Can only view projects they are assigned to and the documents within them. They have no management capabilities.
*   **Implementation**: Access control checks are implemented on both the client-side (to show/hide UI elements like buttons) and, crucially, on the server-side (mocked in `lib/auth.ts`) to authorize actions. This prevents users from bypassing client-side restrictions.

#### 2. Principle of Least Privilege

This principle is strictly enforced. Each role is granted the minimum level of access necessary to perform its duties. For example, a `developer` cannot see projects they are not assigned to, and a `project-lead` cannot manage users or delete projects. This minimizes the potential damage from a compromised account.

#### 3. Defense in Depth

The system employs multiple layers of security, so that if one layer fails, another is in place to protect the system.
*   **Client-Side Validation**: Forms use Zod schemas to provide immediate feedback to users and prevent malformed data from being sent.
*   **Server-Side Validation**: The mock backend (`lib/auth.ts`) re-validates all incoming data using strict Zod schemas. This is the authoritative validation layer and protects against attacks that bypass the client.
*   **Input Sanitization**: Strict regular expressions (`/^[a-zA-Z0-9_.-]+$/`) are used to validate usernames, preventing common injection characters (`'`, `--`, `=`) and mitigating risks of SQL injection.
*   **Authentication Flow Hardening**:
    *   **Account Lockout**: The system locks accounts after a set number of failed login attempts to thwart brute-force attacks.
    *   **User Enumeration Prevention**: The login page returns a generic error message for both invalid usernames and invalid passwords, preventing attackers from discovering valid user accounts.
    *   **Secure Dependencies**: The project uses up-to-date libraries to avoid known vulnerabilities.

#### 4. Secure Defaults

*   **Registration Disabled**: Public user registration is disabled by default. New users can only be created by an administrator, preventing unauthorized access.
*   **Strong Default Passwords**: A reasonably strong default password (`DefaultPassword123`) is set for new users, who are implicitly expected to change it.
*   **Confirmation Dialogs**: Destructive actions, such as deleting a user or a document, require explicit confirmation from the user to prevent accidental data loss.

### Further Reading

For a detailed log of issues discovered and remediated during development, including specific testing strategies, see the [Troubleshooting Log](src/TROUBLESHOOTING.md).
