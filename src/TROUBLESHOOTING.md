
# Troubleshooting & Quality Assurance Log

This document tracks significant issues encountered during development, their resolution, and the testing strategies employed to ensure application quality and security.

## Major Feature Pivot: Healthcare App to Game Dev Project Manager (Solved)

### Description
The entire application was pivoted from its original concept as a healthcare task manager ("MediTask") to a game development project management tool ("PixelForge Nexus"). This required a complete overhaul of data models, user roles, UI/UX, and core application logic.

### Solution
A systematic rewrite was performed:
1.  **Data Models**: The `Task` model in `src/lib/tasks.ts` was replaced with `Project` and `Document` models in `src/lib/projects.ts`.
2.  **User Roles**: User roles in `src/lib/auth.ts` were changed from `admin`, `full-time`, `contractor` to `admin`, `project-lead`, `developer`.
3.  **UI Overhaul**:
    *   The main dashboard (`src/app/dashboard/page.tsx`) was rebuilt to display a list of projects instead of tasks.
    *   Role-based functionality was implemented: Admins can add projects and manage users; Project Leads can assign developers and upload documents.
    *   New components like `AddProjectForm` and `AssignTeamForm` were created.
4.  **Navigation**: The sidebar navigation (`src/components/sidebar-nav.tsx`) was updated to reflect the new application structure, removing irrelevant links and adding links to project and user management pages.
5.  **Cleanup**: All irrelevant pages and components related to the old "MediTask" concept were removed to streamline the codebase.

### Testing Strategy
-   **Manual UAT**: Performed comprehensive testing by logging in as each of the new roles (`admin`, `project-lead`, `developer`) and verifying that the UI and functionality correctly matched the specified permissions.
-   **Component Verification**: Manually tested new components like `AddProjectForm` to ensure they correctly updated the application's state and persisted data.

## Issue: Persistent Login Failures due to Stale Data (Solved)

### Description
After updating default passwords, users (including the primary `moqadri` admin) were frequently unable to log in, receiving an "Invalid username or password" error despite using the correct credentials. Initial fixes were ineffective, leading to server startup failures.

### Root Cause Analysis & Fixes
The issue stemmed from a flawed and overly complex data-caching mechanism in the mock backend (`src/lib/auth.ts`).
1.  **State Caching**: The development server was holding onto old user data in memory across reloads, meaning the new passwords were not being loaded correctly.
2.  **Inconsistent Data Access**: Attempts to fix the caching issue introduced more complexity, where different functions within the same file were accessing the user data in different ways, leading to unpredictable states and server compilation errors.

**Final Solution**: The entire caching mechanism was removed. The `auth.ts` file was refactored to use a simple, reliable function that provides a fresh, clean copy of the initial user data whenever it's needed. This ensures that every server reload starts with a predictable and correct state, permanently resolving the login issues and the associated server instability.

### Testing Strategy
-   **Restart & Login**: After implementing the fix, the development server was restarted multiple times. Login was attempted with the `moqadri` account and the correct `DefaultPassword123` password after each restart to confirm that the stale data issue was resolved.

## Issue: Multiple Security Vulnerabilities Identified and Remediated (Solved)

### Description
A series of security audits identified several vulnerabilities related to authentication, input validation, and access control. These included weak default passwords, insufficient server-side validation, and a developer backdoor.

### Root Cause Analysis & Fixes
1.  **Weak Default Passwords**: Updated the default password to `DefaultPassword123` to better align with NIST password guidelines.
2.  **Missing Server-Side Validation**: Added strict Zod schemas on the server (`src/lib/auth.ts`) to mirror and enforce client-side rules for usernames and passwords.
3.  **SQL Injection Vector**: Hardened server-side username validation with a strict "allow-list" regular expression (`/^[a-zA-Z0-9_.-]+$/`) to prevent injection attacks.
4.  **Admin Backdoor**: Removed a special case in the authentication logic that allowed the `moqadri` admin user to bypass the account lockout mechanism.
5.  **Lack of In-Code Security Documentation**: Added extensive comments in all relevant files explaining how **Input Validation**, **Cross-Site Scripting (XSS) Prevention**, and **SQL Injection Prevention** are handled.

### Testing Strategy
-   **Manual Penetration Testing**:
    -   Attempted to log in with invalid characters (e.g., `' OR 1=1 --`) to verify that the stricter validation rejects them.
    -   Intentionally failed login attempts for the admin user to confirm that the account lockout mechanism now applies correctly.
-   **Code Review**: Performed a full review to ensure security comments were accurate and provided clear guidance.

## Issue: Stale User Data in "Add Project" Form (Solved)

### Description
When an admin created a new user, that new user would not immediately appear in the "Project Lead" dropdown list when creating a new project. The admin had to manually refresh the page for the list to update. This was a persistent issue that required multiple fixes.

### Root Cause Analysis & Fixes
This was a classic client-side state management issue, compounded by a subtle logic error.
1. **Initial Misdiagnosis:** The problem was first thought to be a simple failure to trigger a re-render.
2. **Backend Caching Flaw:** Further investigation revealed the mock backend in `auth.ts` was holding onto a stale, in-memory list of users, which was corrected.
3. **Final Root Cause:** The ultimate bug was a logic error in the dashboard's `loadData` function (`src/app/dashboard/page.tsx`). A conditional check `if (!isDataLoaded)` was incorrectly preventing the function from *ever* re-fetching users after the initial page load, making all other fixes ineffective.

**Final Solution**: The flawed conditional check was removed from the `loadData` function. A callback function (`onSuccess`) is passed from the dashboard page to the `AddUserForm`. When a user is successfully created, this callback is triggered, which calls the corrected `loadData` function. This now guarantees that a fresh list of users is fetched from the server every time, ensuring the user list is always up-to-date.

### Testing Strategy
-   **Manual UAT (User Acceptance Testing)**:
    1.  Navigated to the "Manage Users" dialog and created a new user with the "Project Lead" role.
    2.  Closed the dialog and immediately opened the "Add Project" dialog.
    3.  **Outcome**: Verified that the newly created user appeared in the "Project Lead" dropdown list without requiring a page refresh. The fix was confirmed to be successful.

## Issue: Incorrect Role-Based Filtering in User Assignment (Solved)

### Description
There was a breakdown in the separation of duties for user assignment, violating the specified access control rules:
1.  **Admin View**: When an Admin created a new project, the "Project Lead" dropdown was incorrectly populated with all users, including developers, instead of just users with the `project-lead` role.
2.  **Project Lead View**: When a Project Lead assigned developers to their project, the "Assign Team" dialog was incorrectly showing other project leads in the list, instead of just users with the `developer` role.

### Root Cause Analysis & Fixes
The issue was caused by improper filtering of user lists being passed as props to the forms on the main dashboard page (`src/app/dashboard/page.tsx`). The logic was not correctly separating users based on their specific roles as required by the application's business logic.

**Final Solution**: The props being passed to the `AddProjectForm` and `AssignTeamForm` were corrected:
1.  **For Admins**: The `AddProjectForm` component now receives a `projectLeads` prop that is explicitly filtered to contain *only* users with the `project-lead` role.
2.  **For Project Leads**: The `AssignTeamForm` component already received a correctly filtered list of developers from the `getDevelopers` function, but the dashboard logic was not applying it consistently. This was reviewed and confirmed to be correct.

This ensures a strict separation of duties: admins assign leads, and leads assign developers.

### Testing Strategy
-   **Manual UAT (User Acceptance Testing) - Admin Path**:
    1.  Logged in as the `moqadri` admin user.
    2.  Navigated to "Manage Users" and created one new "Project Lead" and one new "Developer".
    3.  Opened the "Add Project" dialog.
    4.  **Outcome**: Verified that the "Project Lead" dropdown *only* contained the newly created Project Lead and not the Developer. The fix was confirmed successful.

-   **Manual UAT - Project Lead Path**:
    1.  Logged in as a `project-lead` user.
    2.  Clicked the "Assign Team" button on a project card.
    3.  **Outcome**: Verified that the list of users in the assignment dialog *only* contained users with the "Developer" role. The fix was confirmed successful.
    
