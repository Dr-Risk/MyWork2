# Engineering Prompts for PixelForge Nexus

This document showcases a selection of the key prompts that guided the AI development partner in building the PixelForge Nexus application. These examples illustrate how to effectively request features, implement security controls, and generate documentation.

---

## 1. Initial Concept & The Major Pivot

This sequence demonstrates how to initiate a project and then make a significant strategic pivot, which is a common occurrence in development.

> **Initial Prompt:**
>
> "Let's start building a new application called **'MediTask'**. It will be a task management tool for healthcare workers.
>
> **Core Features:**
> - A main dashboard to display assigned tasks.
> - Secure login for healthcare workers.
> - Navigation for blogs, events, and resources.
>
> **Styling:**
> - Primary color: Calm blue (#5DADE2)
> - Background: Light, desaturated blue (#EBF5FB)
> - Fonts: 'PT Sans' for body, 'Space Grotesk' for headlines."

> **Pivot Prompt:**
>
> "This isn't working. We need to pivot. Let's change the entire application from 'MediTask' to a secure project management tool for a game development studio called **'PixelForge Nexus'**.
>
> Please perform the following overhaul:
> 1.  **Change User Roles**: Replace the existing roles with `'admin'`, `'project-lead'`, and `'developer'`. The primary admin user should be `moqadri`.
> 2.  **Replace Data Model**: The core concept is now 'Projects', not 'Tasks'. Create a `projects.ts` library to define `Project` and `Document` interfaces. Projects should have a name, description, lead, and assigned developers.
> 3.  **Rebuild the UI**:
>     - The main dashboard must now display a grid of `ProjectCard` components.
>     - Admins need buttons to create new projects and manage users.
>     - Project Leads need controls to assign developers to their projects and upload documents.
>     - Developers should only have view-only access.
> 4.  **Update All Copy**: Change all references of 'MediTask' to 'PixelForge Nexus' and update UI text to be relevant to game development project management."

---

## 2. Implementing Core Features

This prompt shows how to request a complex, role-aware feature for the main dashboard.

> **Prompt:**
>
> "On the main dashboard page (`src/app/dashboard/page.tsx`), I need to add the ability for Admins and Project Leads to manage project documents.
>
> **Requirements:**
> 1.  **File Upload**: Add an 'Upload Docs' button to each `ProjectCard`. This button should only be visible to the `admin` role and the specific `project-lead` assigned to that project. Clicking it should open a file picker.
> 2.  **File Storage**: When a file is selected, read it using the `FileReader` API and store its contents as a Base64 Data URI in the `documents` state.
> 3.  **Display Documents**: List the uploaded documents on their respective project card. Each document item should have 'View' and 'Download' buttons.
> 4.  **Persistence**: Ensure that all changes to the documents list are saved to `localStorage` so they persist after a page refresh.
> 5.  **Delete Documents**: Add a 'Delete' button with a trash can icon next to each document. This button must also only be visible to Admins and the project's Lead. Before deleting, show a confirmation dialog to prevent accidental data loss."

---

## 3. Hardening Security

This set of prompts demonstrates how to request specific, industry-standard security enhancements.

> **Login Security Prompt:**
>
> "Let's harden the login flow in `src/lib/auth.ts` according to OWASP and NIST best practices.
>
> 1.  **Brute-Force Protection**: Implement an account lockout mechanism. After 3 consecutive failed login attempts, lock the user's account by setting the `isLocked` flag to `true`. The admin account `moqadri` should be exempt from this.
> 2.  **User Enumeration Prevention**: Ensure the `checkCredentials` function returns the exact same generic error message ('Invalid username or password.') whether the username is wrong or the password is wrong.
> 3.  **Input Validation**: Add strict server-side validation using Zod for the username field to only allow alphanumeric characters, underscores, periods, and hyphens. This will help prevent injection attacks."

> **MFA Implementation Prompt:**
>
> "Add Multi-Factor Authentication (MFA) to the application using TOTP (Time-based One-Time Passwords).
>
> 1.  **Create MFA Service**: Create a new file `src/lib/mfa.ts`. It should use the `otplib` and `qrcode` libraries to handle all MFA logic: generating secrets, creating QR codes, and verifying tokens. Keep this logic separate from `auth.ts`.
> 2.  **Account Settings UI**: On the `Account Settings` page (`/dashboard/profile`), add a new 'Security' tab. In this tab, create a component that allows a user to:
>     - See if MFA is enabled.
>     - Click 'Enable MFA' to see a QR code to scan with their authenticator app.
>     - Enter the 6-digit code to verify and complete the setup.
>     - Click 'Disable MFA' if it's already active.
> 3.  **Update Login Flow**: Modify the login process. After a user with MFA enabled enters their correct password, don't log them in immediately. Instead, show a new screen prompting for their 6-digit MFA code."

---

## 4. Generating Formal Documentation

This prompt shows how to request the generation of detailed, formal documentation for the project, which is crucial for meeting compliance and security standards.

> **Documentation Prompt:**
>
> "Please generate a formal security analysis document for the PixelForge Nexus application. The file should be named `docs/security/owasp-top-10.md`.
>
> For each of the OWASP Top 10 2021 risks (A01 through A10), provide a section that includes:
> 1.  A brief description of the risk category.
> 2.  A detailed explanation of the specific mitigation strategies implemented within the PixelForge Nexus codebase.
> 3.  Reference the exact files (e.g., `src/lib/auth.ts`) and functions or principles (e.g., RBAC, Zod validation, HttpOnly cookies) that address the risk."
