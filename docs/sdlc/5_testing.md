# SDLC Stage 5: Testing

This document outlines the comprehensive testing strategies used to verify and validate the security, functionality, and reliability of the PixelForge Nexus application. This phase focuses on testing the application as a whole, after the development cycles are complete, using a mix of functional and security-focused testing methods.

## 5.1 Functional Testing

### Unit Testing
**Objective**: To test individual components or functions in isolation to validate their internal logic and boundary conditions.

-   **Methodology**: While this prototype does not include an automated unit test suite (e.g., using Jest or Vitest), the principles of unit testing were applied throughout development. Reusable components like `AddUserForm` or `ChangeLeadForm` were developed and tested in isolation to ensure their internal validation schemas (Zod) and state management logic worked correctly before being integrated into the main application.

### Integration Testing
**Objective**: To verify that different components and modules work together correctly as outlined in the design specifications.

-   **Process & Outcome**: After developing new features, manual integration tests were performed to ensure they worked with the existing system. For example, during the development of the user management feature, tests were conducted to verify that:
    1.  The `AddUserForm` component successfully called the `createUser` function in `src/lib/auth.ts`.
    2.  The `onSuccess` callback from the form correctly triggered the `fetchUsers` function on the `UsersPage`.
    3.  The main user table re-rendered correctly with the newly added user.
-   This process was critical for identifying and fixing bugs related to state management and data flow between components (documented in `TROUBLESHOOTING.md`).

### User Acceptance Testing (UAT)
**Objective**: To ensure that the system meets the functional requirements from the perspective of the end-user.

-   **Process & Outcome**: Extensive UAT was performed by simulating the actions of each defined user role to validate the functional requirements (FR-01 to FR-11 from `2_requirements.md`).
    -   **Admin Path**: Logged in as `moqadri`. Verified they could create projects, create and manage all users, and access the "All Projects" and "User Management" pages. This testing uncovered a critical bug where newly created users would not appear in dropdowns until a page refresh, which was subsequently fixed.
    -   **Project Lead Path**: Logged in as a `project-lead`. Verified they could assign developers and manage documents *only* for their assigned projects and could not access admin-only pages or actions.
    -   **Developer Path**: Logged in as a `developer`. Verified they could only view assigned projects and had no access to any management functionality (like "Assign Team" or "Delete Document" buttons).

### Regression Testing
**Objective**: To re-test the system after a change is made to ensure that the update has not broken any existing functionality or introduced new bugs.

-   **Process**: After every significant bug fix or feature addition (like implementing MFA or fixing the account lockout logic), a suite of manual regression tests was performed. This involved logging in as each user role and quickly verifying core functionality:
    -   Can users still log in?
    -   Is the dashboard still displaying the correct projects?
    -   Are role-based permissions still being enforced correctly on buttons and pages?
-   This ensured that fixes for one issue did not have unintended side effects on other parts of the application.

## 5.2 Dynamic Application Security Testing (DAST)

While no automated DAST tools were used, **manual dynamic security testing** was performed to identify vulnerabilities in the running application.

-   **Manual Penetration Testing**:
    -   **Objective**: To simulate an attacker's actions to find and exploit vulnerabilities.
    -   **Process & Outcome**:
        1.  **Authentication Bypass**: Attempted to log in using common SQL injection payloads (`' OR 1=1 --`). All attempts were rejected by the server-side validation schema (SR-01), as expected.
        2.  **Privilege Escalation**: Logged in as a `developer` and attempted to directly navigate to admin-only URLs like `/dashboard/users`. The application correctly redirected the user back to the main dashboard, confirming the route protection (SR-03) was effective.
        3.  **Brute-Force Attack Simulation**: Intentionally entered the wrong password for a standard user multiple times to confirm that the account lockout mechanism (SR-04) was triggered correctly after 3 attempts.
        4.  **Issue Found**: A significant vulnerability was discovered during this process: the primary `moqadri` admin account was **immune to the lockout mechanism**. This developer backdoor was a violation of security principles. The issue was logged, and the code was remediated to ensure the lockout applied to all non-admin accounts consistently.

## 5.3 Verification and Validation (V&V) Summary

-   **Verification: *"Are we building the product right?"***
    -   This was addressed by continuously checking the implementation against the formal design documents. Code reviews of `src/lib/auth.ts` were performed against the data flow diagram in `3_architecture_and_design.md` to ensure all logic paths were implemented as designed.
-   **Validation: *"Are we building the right product?"***
    -   This was addressed by the extensive UAT process, which validated that the application's features met all the user and business requirements defined in `2_requirements.md`.
