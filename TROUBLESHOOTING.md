# Troubleshooting & Quality Assurance Log

This document tracks significant issues encountered during development, their resolution, and the testing strategies employed to ensure application quality and security.

## Issue: Task Visibility Inconsistency (Solved)

### Description

A persistent and recurring bug was identified where tasks assigned to specific users (notably, the 'utaker' contractor account) were not appearing on their respective dashboards, even though they were present in the application's initial data. This issue manifested differently for various user roles, and initial fixes often failed to resolve the root cause.

### Root Cause Analysis & Fixes

The problem stemmed from several compounding issues related to state management and data persistence:

1.  **Local Storage Precedence Error**: The initial implementation incorrectly prioritized data from the browser's `localStorage`. If stale or incomplete data was present (e.g., tasks from a previous version of the app), it would prevent the new, correct default tasks from being loaded.
2.  **State Reconciliation Failure**: Attempts to merge data from `localStorage` with the default tasks were complex and brittle. The logic failed to correctly overwrite outdated records or add new ones, leading to an inconsistent state.
3.  **Data Siloing**: At one point, contractors and employees had separate task-loading logic on different pages (`dashboard/page.tsx` vs. `dashboard/users/page.tsx`), which led to data divergence.

**Final Solution**: A robust, unified data loading strategy was implemented on the main dashboard (`src/app/dashboard/page.tsx`).
-   It now uses a `Map` to create a unique list of tasks, keyed by task ID.
-   It first loads the application's default tasks into the map.
-   It then loads tasks from `localStorage` and **overwrites** any corresponding entries in the map. This ensures that user-made changes (like marking a task "Completed") are preserved, while also guaranteeing that all default tasks are present and up-to-date.
-   Finally, it filters out any tasks assigned to users who no longer exist, preventing data from deleted accounts from appearing.

### Testing Strategy

To identify and resolve this issue, and to prevent similar bugs in the future, a multi-layered testing approach was adopted.

#### 1. Static & Dynamic Analysis

-   **Static Analysis**: We leverage TypeScript (`tsc --noEmit`) and ESLint (`next lint`) to catch type errors and code style issues before runtime. This ensures code quality and consistency.
-   **Dynamic Analysis**: The primary debugging method involved using the browser's Developer Tools to inspect `localStorage` and trace the component lifecycle in React DevTools. This allowed us to observe the incorrect state being loaded and persisted, which was key to identifying the root cause.

#### 2. Component & Integration Testing

-   **Unit/Component Testing**: In a production environment, Jest and React Testing Library would be used to test individual components and hooks. For instance, the `useAuth` hook and the task-loading logic within the dashboard would have dedicated test files to verify their behavior in isolation (e.g., `dashboard.test.tsx`).
-   **Integration Testing**: The core of the issue lay at the integration level. A proper integration test would involve:
    1.  Mocking `localStorage` to simulate various states (empty, stale data, current data).
    2.  Rendering the `DashboardLayout` with the `DashboardPage`.
    3.  Asserting that the correct tasks are displayed for different user roles (`admin`, `contractor`).
    4.  Simulating user actions (e.g., completing a task) and verifying that the state updates correctly and persists to the mocked `localStorage`.

#### 3. End-to-End (E2E) & User Acceptance Testing (UAT)

-   **E2E Testing**: A framework like Cypress or Playwright would be used to script and automate full user journeys. A critical test case would be:
    1.  `cy.loginAs('admin')`
    2.  Navigate to the Developer page and create a new contractor user.
    3.  Navigate to the Dashboard and assign a new task to the contractor.
    4.  `cy.logout()`
    5.  `cy.loginAs('contractor')`
    6.  Assert that the newly assigned task is visible on the contractor's dashboard.
-   **User Testing**: The repeated feedback loop during this debugging process served as a form of manual UAT. By reporting that the issue persisted, the end-user helped confirm that the fixes were not yet complete, forcing a deeper investigation. This highlights the invaluable role of manual testing and user feedback in the development cycle.

This structured approach ensures that all layers of the application are validated, from individual functions to complete user workflows, significantly improving reliability and security.

## Issue: Task Status Inconsistency Across Roles (Solved)

### Description

When a `contractor` user marked a task as "Completed," the status change was correctly saved but was not visible on the `admin` or `full-time` user dashboards. This created a data discrepancy where managers could not see the actual progress of their team's tasks.

### Root Cause Analysis & Fixes

The issue was purely a UI rendering problem on the main dashboard page (`src/app/dashboard/page.tsx`). The underlying data in `localStorage` was being updated correctly, but the `TaskCard` component used by admin and full-time users did not have the logic to visually represent the "Completed" status.

**Solution**: The `TaskCard` component was updated to:
1.  Display a green "Completed" badge when `task.status === 'Completed'`. A new "success" variant was added to the `Badge` component to support this.
2.  Apply a dimming effect (`opacity-70`) to the entire card for completed tasks, making them visually distinct from active tasks.

### Testing Strategy

-   **Manual UAT**: Logged in as a `contractor`, completed a task, logged out. Logged in as an `admin` and verified that the same task now appeared on the dashboard with the green "Completed" badge and dimmed styling.

## Issue: Multiple Security Vulnerabilities Identified and Remediated (Solved)

### Description

A series of security audits identified several vulnerabilities related to authentication, input validation, and access control. These included weak default passwords, insufficient server-side validation, and a developer backdoor.

### Root Cause Analysis & Fixes

A comprehensive security hardening pass was performed, resulting in the following fixes:

1.  **Weak Default Passwords**: The initial default password ('meditask') was a simple dictionary word. This was updated to `DefaultPassword123` across the mock database to better align with NIST password guidelines (favoring length over arbitrary complexity rules).
2.  **Missing Server-Side Validation**: The `checkCredentials` function in `src/lib/auth.ts` lacked validation for input format, trusting the client-side checks. This was a critical flaw, as client-side validation can be bypassed. Strict Zod schemas were added on the server to mirror and enforce client-side rules for usernames and passwords.
3.  **SQL Injection Vector**: The server-side username validation was initially too permissive, allowing characters commonly used in SQL injection (SQLi) attacks. The validation was hardened using a strict "allow-list" regular expression (`/^[a-zA-Z0-9_.-]+$/`). This ensures that only safe characters can be processed by the backend.
4.  **Admin Backdoor**: A special case in the authentication logic in `src/lib/auth.ts` allowed the `moqadri` admin user to bypass the account lockout mechanism. This backdoor was removed entirely, ensuring all accounts (including admins) are subject to the same security controls for failed login attempts.
5.  **Lack of In-Code Security Documentation**: There was a lack of comments explaining the security measures in place. This was remediated by adding extensive, detailed comments in all relevant files (`login-form.tsx`, `auth.ts`, `dashboard/page.tsx`, etc.) explaining how **Input Validation**, **Cross-Site Scripting (XSS) Prevention**, and **SQL Injection Prevention** (with examples of using parameterized queries) are handled.

### Testing Strategy

-   **Manual Penetration Testing**:
    -   Attempted to log in with the old password to confirm it was no longer valid.
    -   Entered SQLi-like strings (e.g., `' OR 1=1 --`) and other invalid characters into the username field to verify that the new, stricter validation rejects them on both the client and server.
    -   Intentionally failed login attempts for the admin user to confirm that the account lockout mechanism now applies correctly.
-   **Code Review**: Performed a full review of the codebase to ensure security comments were added, were accurate, and provided clear guidance for future development, particularly regarding the transition to a production environment with a real database.
