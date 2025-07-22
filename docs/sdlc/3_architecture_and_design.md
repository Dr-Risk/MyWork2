# SDLC Stage 3: Architecture and Design

This document details the architecture and design of the PixelForge Nexus application, focusing on how security principles are embedded into its foundation.

## 3.1 Architecture Phase

### System Architecture
The application is designed as a modern, client-server web application.

- **Frontend (Client)**: A **Next.js (React)** single-page application (SPA). It uses server components to improve performance and reduce the client-side JavaScript bundle size. The UI is built with **ShadCN components** and styled with **Tailwind CSS**.
- **Backend (Server-Side Logic)**: For this prototype, the backend is **mocked within the Next.js application** itself in `src/lib/`. The `auth.ts` and `projects.ts` files simulate a server API and database, using a `users.json` file for persistence. This allows for realistic testing of server-side validation and authorization logic without the overhead of a separate server.
- **Data Flow**: The client-side components make asynchronous calls to the "server" functions in `src/lib/`. These functions read from and write to the `users.json` file (for user data) or browser `localStorage` (for project data), simulating a full-stack data flow.

### Integration with Existing Infrastructure
- The application is self-contained. It requires a Node.js environment for running the Next.js server.
- Environment variables (for services like Genkit) are managed via a `.env.local` file, separating configuration from code.

### Security by Design Principles
The architecture is founded on core security principles:

1.  **Defense in Depth**: Security is applied in layers.
    - **Client-Side**: Input validation in forms (using Zod) provides immediate user feedback.
    - **Server-Side**: The same validation rules are re-enforced on the mock backend (`auth.ts`), serving as the authoritative layer of defense.
    - **UI**: Components are conditionally rendered based on user roles, preventing users from seeing options they are not authorized to use.
2.  **Principle of Least Privilege**: The entire application is built around a strict Role-Based Access Control (RBAC) model. Each role (`admin`, `project-lead`, `developer`) is granted the absolute minimum set of permissions required to perform its function. For example, a `developer` cannot even see the API endpoint logic for deleting a project.
3.  **Secure Defaults**: The default state of the application is the most secure state. Public registration is disabled, and new users must be explicitly created by an administrator.

## 3.2 Design Phase

### Application Structure Blueprint
The application is structured logically to separate concerns:

- **`/src/app/`**: Contains the main application routes (pages) and layouts, following the Next.js App Router convention.
- **`/src/components/`**: Houses all reusable React components. UI-specific components from ShadCN are in `/src/components/ui/`.
- **`/src/lib/`**: Contains the core business logic and mock backend services (`auth.ts`, `projects.ts`). This isolates the application's "server-side" logic.
- **`/src/context/`**: Manages global state, specifically authentication (`auth-context.tsx`).
- **`/docs/`**: Contains all project documentation, including SDLC files and formal models.

### Data Flow Diagram (Authentication)
This diagram shows the flow for a user login attempt.

```mermaid
sequenceDiagram
    participant Client as User's Browser
    participant Server as Mock Backend (auth.ts)
    participant DB as Mock DB (users.json)

    Client->>Server: Submits username and password
    Server->>Server: Validates input format (Zod schema)
    alt Input Invalid
        Server-->>Client: Return generic error
    else Input Valid
        Server->>DB: Read user data for the given username
        DB-->>Server: Return user data (or null if not found)
        alt User not found
            Server-->>Client: Return generic error (prevents user enumeration)
        else User exists
            Server->>Server: Check if account is locked
            alt Account is locked
                 Server-->>Client: Return "Account Locked" error
            else Account is active
                Server->>Server: Verify password against stored hash
                alt Password Incorrect
                    Server->>DB: Increment login attempts & lock if needed
                    DB-->>Server: Confirm update
                    Server-->>Client: Return generic error
                else Password Correct
                    Server->>DB: Reset login attempts
                    DB-->>Server: Confirm reset
                    Server-->>Client: Return success + user profile (no password hash)
                end
            end
        end
    end
```

### Threat Modeling
A simplified threat modeling exercise was performed using the **STRIDE** model as a guide.

- **Spoofing**: Threat of a user impersonating another.
  - **Mitigation**: Strong password policies (enforced by schema) and a secure login process.
- **Tampering**: Threat of unauthorized data modification.
  - **Mitigation**: Strict, server-side RBAC ensures only authorized users can modify specific data (e.g., only an Admin can change a user's role).
- **Repudiation**: A user denying they performed an action.
  - **Mitigation**: In a real app, this would be addressed with comprehensive audit logging. For this prototype, it's an accepted risk.
- **Information Disclosure**: Threat of exposing sensitive data to unauthorized users.
  - **Mitigation**: RBAC ensures users only see data they are assigned to. HTTPS (assumed standard) prevents data interception in transit. The backend never sends sensitive data (like password hashes) to the client.
- **Denial of Service**: Threat of making the system unavailable.
  - **Mitigation**: The account lockout mechanism protects against brute-force login attacks.
- **Elevation of Privilege**: A user gaining higher-level permissions.
  - **Mitigation**: This is the most critical threat addressed. Every sensitive action is validated on the server against the user's role, preventing a user from bypassing client-side UI restrictions to perform unauthorized actions.