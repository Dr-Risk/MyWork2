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
