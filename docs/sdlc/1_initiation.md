# SDLC Stage 1: Initiation

This document outlines the initiation phase for the PixelForge Nexus project, establishing its purpose, scope, and initial security posture.

## 1.1 Project Objectives, Scope, and Strategy

### Objectives
- **Primary Objective**: To create a secure, role-based project management web application specifically for a game development studio.
- **Secondary Objectives**:
    - To provide clear separation of duties between different user roles (Admin, Project Lead, Developer).
    - To ensure secure handling of project-related documents and data.
    - To serve as a demonstration of implementing a Secure Software Development Lifecycle (SDLC) in a modern web application.

### Scope
- **In-Scope**:
    - User authentication with role-based access control (RBAC).
    - Project creation and management.
    - Document uploading, viewing, and deletion based on user roles.
    - User account management (creation, role changes, locking/unlocking) by administrators.
- **Out-of-Scope**:
    - Real-time collaboration features (e.g., live chat, document co-editing).
    - Public user registration (all users are created by an admin).
    - Integration with third-party services beyond the core tech stack.
    - Financial or billing features.

### Strategy
- **Development Methodology**: An iterative approach, allowing for continuous feedback and refinement of security controls and features.
- **Technology Stack**: Next.js (React), TypeScript, Tailwind CSS, ShadCN for UI components, and Genkit for potential AI features. This stack was chosen for its modern features, performance, and strong community support.

## 1.2 Initial Security Requirements

The following high-level security requirements were established as foundational pillars for the project:

- **Confidentiality**: Project data and documents must only be accessible to authorized users.
- **Integrity**: Data must be protected from unauthorized modification. Only users with the correct privileges should be able to create, edit, or delete information.
- **Availability**: The application should be available to authorized users when needed.
- **Authentication**: The system must have a robust mechanism to verify user identities.
- **Authorization**: The system must enforce a strict "Principle of Least Privilege," granting users the minimum access required to perform their jobs.

## 1.3 Initial Risk Assessment

A preliminary risk assessment was conducted to identify high-level threats to the project.

| Risk ID | Threat Description | Potential Impact | Likelihood | Initial Risk Level | Mitigation Strategy |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **R-01** | **Unauthorized Access** | An attacker gains access to the system, potentially viewing or stealing sensitive project data. | Medium | **High** | Implement strong authentication and role-based access control (RBAC). |
| **R-02** | **Privilege Escalation** | A lower-privileged user (e.g., Developer) finds a way to perform actions of a higher-privileged user (e.g., Admin). | Medium | **High** | Enforce strict server-side authorization checks for all actions. |
| **R-03** | **Data Breach** | Sensitive documents or user credentials are leaked due to insecure storage or transmission. | High | **High** | Use HTTPS for all communication and implement secure password hashing (simulated with `_hashed` suffix in this mock). |
| **R-04** | **Denial of Service (DoS)** | An attacker overwhelms the system, making it unavailable for legitimate users (e.g., through brute-force login attempts). | Low | **Medium** | Implement account lockout mechanisms after a certain number of failed login attempts. |
| **R-05** | **Data Injection** | An attacker injects malicious data (e.g., SQL, XSS payloads) into input fields, leading to data corruption or code execution. | Medium | **High** | Apply strict input validation on both client and server-side. |

## 1.4 Management Approval

Based on the defined objectives, scope, and initial risk assessment, formal approval was granted to proceed to the Requirements phase of the SDLC. Management acknowledged the project's strategic importance as a secure software demonstrator and allocated the necessary resources for its development.
