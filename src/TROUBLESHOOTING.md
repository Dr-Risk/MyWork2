
# Troubleshooting & Quality Assurance Log

This document tracks significant issues encountered during development, their resolution, and the testing strategies employed to ensure application quality and security.

## Issue: No Ability to Delete Documents & Missing Access Control (Solved)

### Description
Following the implementation of document uploads, a critical feature was missing: the ability to delete uploaded documents. This presented two significant problems:
1.  **Data Management Failure**: There was no way for users to remove incorrect, outdated, or sensitive documents from a project, leading to data clutter and potential compliance issues.
2.  **Inherent Security Risk**: Even if a delete function existed, there were no access controls defined for it. This created a high risk that an unauthorized user (e.g., a Developer) could have been given the ability to delete critical project files, compromising data integrity.

### Root Cause Analysis & Fixes
The issue was a feature omission during the initial implementation of document handling. The focus was on uploading and viewing, and the delete functionality was overlooked.

**Final Solution**: A secure delete feature was implemented with strict role-based access control:
1.  **Delete Handler**: A `handleDeleteDocument` function was created in `src/app/dashboard/page.tsx` to handle the logic of removing a document from the application's state.
2.  **Confirmation Dialog**: To prevent accidental deletions, the delete action is wrapped in an `AlertDialog` component. This requires the user to explicitly confirm their choice before the document is permanently removed.
3.  **Role-Based Access Control (RBAC)**: A new "Delete" button (using a `Trash2` icon) was added to each document item in the `ProjectCard`. The visibility of this button is strictly controlled by the existing `canManageDocs` permission flag. This ensures that **only** users with the `admin` role or the designated `project-lead` for that specific project can see and use the delete button.

### Testing Strategy
-   **Integration Testing**:
    -   Verified that the `AlertDialog` component correctly triggers the `handleDeleteDocument` function upon confirmation.
    -   Confirmed that the `handleDeleteDocument` function successfully filters the document from the `documents` state array and that this change is correctly persisted to `localStorage`.

-   **Manual UAT (User Acceptance Testing) - Role Paths**:
    1.  **Admin Path**: Logged in as an `admin`. Uploaded a document. Verified the "Delete" button was visible. Clicked "Delete," confirmed the dialog appeared, and successfully deleted the document. Verified the document was removed from the UI and `localStorage`.
    2.  **Project Lead Path**: Logged in as a `project-lead`. Navigated to a project they lead. Uploaded a document. Verified the "Delete" button was visible and functional. Navigated to a project they *do not* lead and verified the button was **not** visible.
    3.  **Developer Path**: Logged in as a `developer`. Navigated to their assigned project. Verified that the "Delete" button was **not** visible for any documents.

-   **Post-Fix Regression Testing**:
    -   Confirmed that viewing and downloading documents were unaffected by the changes.
    -   Confirmed that other role-based actions (like "Assign Team" or "Mark as Complete") were still functioning correctly.

**Outcome**: The issue is fully resolved. Document deletion is now a functional, secure, and intuitive part of the application, adhering to the principle of least privilege.


## Issue: Document Uploads Not Persisting or Displaying Correctly (Solved)

### Description
A critical and persistent bug prevented users from viewing or downloading documents after they were uploaded. Symptoms included:
1.  Uploaded documents would not appear on the project card immediately.
2.  Documents would disappear entirely after a page refresh.
3.  Attempting to download an uploaded file resulted in an empty or corrupted file.
4.  The "View" button would incorrectly redirect to the login page or an empty tab instead of showing the document.

This issue affected all user roles (Admin, Project Lead, Developer) and was a major blocker for core application functionality.

### Root Cause Analysis & Fixes
The problem was traced to a cascade of multiple, distinct bugs that together created the failure:

1.  **File Content Not Stored**: The primary error was in the `handleFileUpload` function in `src/app/dashboard/page.tsx`. It was creating a `Document` object but was failing to read the file's content using the `FileReader` API and store the resulting `Data URI` in the object's `url` property. This was the reason downloaded files were empty.
2.  **State Persistence Race Condition**: A subtle race condition existed in the `loadData` function. It was marking the application's data as "loaded" (`setIsDataLoaded(true)`) *before* asynchronous operations (like fetching user lists) had completed. This caused a `useEffect` hook to save an incomplete state back to `localStorage`, effectively erasing the documents that had just been uploaded.
3.  **Incorrect Rendering Logic**: A typo in the `ProjectCard` component's render method caused it to iterate over the main `documents` array instead of the correctly filtered `projectDocs` array, preventing any documents from being displayed even when they were correctly loaded into the state.
4.  **Improper View Handling**: The "View" button was implemented as a standard link, which was being intercepted by the Next.js router. This caused a client-side navigation attempt that failed and redirected to the login page.

**Final Solution**: A comprehensive fix was implemented:
1.  The `handleFileUpload` function was completely rewritten to correctly use a `FileReader` to read the file as a `Data URI` and store it in the `documents` state.
2.  The `loadData` function was refactored to be fully asynchronous, ensuring `setIsDataLoaded(true)` is only called after all data fetching is complete, eliminating the race condition.
3.  The rendering typo in `ProjectCard` was corrected to map over the `projectDocs` array.
4.  The "View" button's `onClick` handler was updated to programmatically open a new window and write an `<iframe>` with the Data URI source. This bypasses the Next.js router and correctly displays the document in a clean popup.

### Testing Strategy
A multi-layered testing approach was used to validate the final fix.

-   **Integration Testing**:
    -   Verified that the file input, `FileReader` API, React state (`useState`), `localStorage` persistence, and the `ProjectCard` rendering component all work together seamlessly.
    -   Confirmed that the `loadData` function now correctly orchestrates asynchronous calls and state updates in the proper sequence.

-   **Manual UAT (User Acceptance Testing)**:
    1.  Logged in as an **Admin**. Uploaded a document (e.g., PDF, image) to a project.
    2.  **Verification**: Confirmed the document appeared instantly on the project card with "View" and "Download" buttons.
    3.  **Verification**: Clicked "View" and confirmed the document opened in a clean popup window. Clicked "Download" and confirmed the file downloaded correctly and was not empty.
    4.  **Verification**: Performed a hard refresh of the browser page and confirmed the document was still present, viewable, and downloadable.
    5.  Logged out and logged in as the **Project Lead** assigned to that project. Repeated all verification steps.
    6.  Logged out and logged in as a **Developer** assigned to that project. Repeated all verification steps.

-   **Post-Fix Regression Testing**:
    -   Confirmed that unrelated functionality, such as adding projects, assigning users, and changing roles, was not negatively impacted by the fix.

**Outcome**: The issue is now fully resolved. All user roles can reliably upload, view, download, and persist documents across sessions.

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
When an admin created a new user, that new user would not immediately appear in the "Project Lead" dropdown list when creating a new project. This was a persistent issue that required multiple fixes.

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
    
