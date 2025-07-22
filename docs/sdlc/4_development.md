# SDLC Stage 4: Development

This document describes the practices and principles followed during the coding and implementation phase of the PixelForge Nexus project.

## 4.1 Secure Coding Practices

The development process adhered to several key secure coding practices to minimize vulnerabilities.

- **Input Validation**: All data received from the client is untrusted. The mock backend in `src/lib/auth.ts` uses **Zod schemas** to perform strict server-side validation. This is the authoritative source of validation and protects against injection attacks (OWASP A03) and other malformed data submissions. Client-side validation is also used for better UX but is not relied upon for security.
- **Strong Typing**: The project is developed using **TypeScript**. This helps prevent a wide range of common JavaScript errors, such as type coercion bugs, null pointer exceptions, and undefined properties, which can sometimes lead to security vulnerabilities.
- **Error Handling**: The application avoids leaking sensitive information in error messages. Generic error messages are sent to the client (e.g., "Invalid username or password"), while detailed error information is logged to the console (simulating server-side logs) for debugging purposes.
- **Separation of Concerns**: The codebase is logically separated. UI components are distinct from business logic (`/lib`) and global state (`/context`). This makes the code easier to review for security flaws and maintain over time.

## 4.2 Use of Trusted Sources

The application is built upon a foundation of well-known, trusted, and actively maintained open-source libraries.

- **Next.js**: A full-stack React framework that provides many security features out-of-the-box, such as basic XSS protection in React rendering and CSRF protection mechanisms.
- **ShadCN UI & Radix UI**: Headless component libraries that are focused on accessibility (WAI-ARIA standards) and are non-render-blocking, which reduces the attack surface for certain types of client-side vulnerabilities.
- **Zod**: A TypeScript-first schema declaration and validation library. It is used to enforce strict data structures, which is a key part of preventing data-based vulnerabilities.
- **Lucide-React**: A well-maintained and widely used library for icons, reducing the risk of using compromised or poorly coded SVG assets.

Dependency versions are managed in `package.json` and can be audited for known vulnerabilities using tools like `npm audit`.

## 4.3 Source Code Generation

The primary source code was developed manually, adhering to the designs laid out in the previous phase. No automated code generation tools were used beyond the standard scaffolding provided by `create-next-app`.

## 4.4 Testing During Development

Testing was an integral part of the development process, not a separate phase.

- **Static Testing / Code Review**:
    - The use of TypeScript and ESLint provides continuous static analysis, catching potential issues as the code is written.
    - A manual code review process was simulated, focusing on key security files like `src/lib/auth.ts` to ensure that authorization checks were correctly implemented for every sensitive action. This process is documented in the `TROUBLESHOOTING.md` file.
- **Unit Testing (Conceptual)**:
    - While formal unit test files were not created for this prototype, the concept was applied by developing functions in isolation and testing them individually. For example, the `checkCredentials` function was tested with various inputs (valid user, invalid user, locked user) to ensure it returned the correct `AuthResponse` in each case.
- **Integration Testing (Manual)**:
    - After developing new features, manual integration tests were performed to ensure they worked with the existing system. For example, after creating the "Add User" form, testing was done to confirm that the new user immediately appeared in the "Assign Project Lead" dropdown on the dashboard, which involved verifying the interaction between the form component, the auth context, the backend API, and the dashboard page. This is documented in the `TROUBLESHOOTING.md`.
- **System Testing (Manual)**:
    - The application was tested as a whole from the perspective of each user role (`admin`, `project-lead`, `developer`). This involved logging in as each role and navigating through the entire application to ensure that all features worked as expected and that permissions were correctly enforced at a system level.