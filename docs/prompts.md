# Engineering Prompts for PixelForge Nexus

This document showcases a selection of the key prompts that guided the AI development partner in building the PixelForge Nexus application. These examples illustrate how to effectively request features, implement security controls, and generate documentation, following the defined Software Development Lifecycle (SDLC).

---

## 1. Foundational Prompt: Initial Application Setup

This prompt establishes the core concept of PixelForge Nexus, directly aligning with the objectives from the SDLC Initiation and Requirements phases.

> **Prompt:**
>
> "Let's build a new secure project management application called **'PixelForge Nexus'** for a game development studio.
>
> **Core Requirements (from SDLC docs):**
> 1.  **System Core**: A secure, role-based project management tool.
> 2.  **User Roles**: Implement three roles: `'admin'`, `'project-lead'`, and `'developer'`. The primary admin user should be `moqadri`.
> 3.  **Data Model**: The central concepts are 'Projects' and 'Documents'. Create a `projects.ts` library to define these. Projects must have a name, description, lead, and assigned developers.
> 4.  **UI/UX**:
>     - The main dashboard must display a grid of `ProjectCard` components.
>     - UI must be role-aware. For example, Admins need buttons to create projects and manage users.
>     - The UI should be built with ShadCN components.
>
> **Styling:**
> - Use a dark theme with a professional, tech-focused feel.
> - Fonts: 'PT Sans' for body, 'Space Grotesk' for headlines."

---

## 2. Implementing a Core Feature (FR-07)

This prompt shows how to request a complex, role-aware feature for the main dashboard, directly implementing functional requirement FR-07 from the SDLC.

> **Prompt:**
>
> "On the main dashboard page (`src/app/dashboard/page.tsx`), I need to add the ability for Admins and Project Leads to manage project documents.
>
> **Requirements:**
> 1.  **File Upload**: Add an 'Upload Docs' button to each `ProjectCard`. This button must only be visible to the `admin` role and the specific `project-lead` assigned to that project. Clicking it should open a file picker.
> 2.  **File Storage**: When a file is selected, read it using the `FileReader` API and store its contents as a Base64 Data URI in the `documents` state.
> 3.  **Display Documents**: List the uploaded documents on their respective project card. Each document item should have 'View' and 'Download' buttons.
> 4.  **Persistence**: Ensure that all changes to the documents list are saved to `localStorage` so they persist after a page refresh.
> 5.  **Delete Documents (SR-06)**: Add a 'Delete' button with a trash can icon next to each document. This button must also only be visible to Admins and the project's Lead. Before deleting, show a confirmation dialog to prevent accidental data loss, fulfilling security requirement SR-06."

---

## 3. Hardening Security (NFR-04, NFR-05, SR-01)

This set of prompts demonstrates how to request specific, industry-standard security enhancements based on the non-functional and security requirements.

> **Login Security Prompt:**
>
> "Let's harden the login flow in `src/lib/auth.ts` according to the defined security requirements.
>
> 1.  **Brute-Force Protection (NFR-04)**: Implement an account lockout mechanism. After 3 consecutive failed login attempts, lock the user's account by setting the `isLocked` flag to `true`.
> 2.  **User Enumeration Prevention (NFR-05)**: Ensure the `checkCredentials` function returns the exact same generic error message ('Invalid username or password.') whether the username is wrong or the password is wrong.
> 3.  **Input Validation (SR-01)**: Add strict server-side validation using Zod for the username field to only allow alphanumeric characters, underscores, periods, and hyphens. This will help prevent injection attacks."

> **MFA Implementation Prompt:**
>
> "Add Multi-Factor Authentication (MFA) to the application using TOTP (Time-based One-Time Passwords).
>
> 1.  **Create MFA Service**: Create a new file `src/lib/mfa.ts`. It should use the `otplib` and `qrcode` libraries to handle all MFA logic: generating secrets, creating QR codes, and verifying tokens. Keep this logic separate from `auth.ts` for better modularity.
> 2.  **Account Settings UI**: On the `Account Settings` page (`/dashboard/profile`), add a new 'Security' tab. In this tab, create a component that allows a user to:
>     - See if MFA is enabled.
>     - Click 'Enable MFA' to see a QR code to scan with their authenticator app.
>     - Enter the 6-digit code to verify and complete the setup.
>     - Click 'Disable MFA' if it's already active.
> 3.  **Update Login Flow**: Modify the login process. After a user with MFA enabled enters their correct password, don't log them in immediately. Instead, show a new screen prompting for their 6-digit MFA code."

---

## 4. Generating Formal Documentation

This prompt shows how to request the generation of detailed, formal documentation for the project, which is crucial for meeting compliance and security standards.

> **Prompt:**
>
> "Please generate a formal security analysis document for the PixelForge Nexus application. The file should be named `docs/security/owasp-top-10.md`.
>
> For each of the OWASP Top 10 2021 risks (A01 through A10), provide a section that includes:
> 1.  A brief description of the risk category.
> 2.  A detailed explanation of the specific mitigation strategies implemented within the PixelForge Nexus codebase.
> 3.  Reference the exact files (e.g., `src/lib/auth.ts`) and principles (e.g., RBAC, Zod validation, HttpOnly cookies) that address the risk."
>
> Make sure the analysis accurately reflects the application's final state, including all security features like MFA and account lockouts."