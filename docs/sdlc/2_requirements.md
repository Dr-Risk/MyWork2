
# SDLC Stage 2: Requirements

This document details the functional and non-functional requirements for the PixelForge Nexus application, derived from the objectives set in the Initiation phase. It also includes a more detailed risk analysis and the definitive security requirements.

## 2.1 Functional Requirements (FR)

Functional requirements define what the system must *do*.

| ID | Requirement Description | User Role | Priority |
| :--- | :--- | :--- | :--- |
| **FR-01** | The system shall allow users to log in using a username and password. | All | Must Have |
| **FR-02** | The system shall display a dashboard of projects a user is authorized to see. | All | Must Have |
| **FR-03** | An Admin shall be able to create, view, and manage all user accounts (CRUD operations). | Admin | Must Have |
| **FR-04** | An Admin shall be able to create new projects and assign a Project Lead. | Admin | Must Have |
| **FR-05** | An Admin shall be able to mark any project as "Completed". | Admin | Must Have |
| **FR-06** | A Project Lead shall be able to assign/un-assign Developers to projects they lead. | Project Lead | Must Have |
| **FR-07** | A Project Lead shall be able to upload and delete documents for projects they lead. | Project Lead | Must Have |
| **FR-08** | A Developer shall only be able to view projects and documents they are assigned to. | Developer | Must Have |
| **FR-09** | Users shall be able to update their own profile information (name, email). | All | Should Have |
| **FR-10** | Users shall be able to change their own password. | All | Should Have |
| **FR-11** | The system shall force a new user to change their default password upon first login. | All | Must Have |


## 2.2 Non-Functional Requirements (NFR)

Non-functional requirements define *how* the system should perform.

| ID | Category | Requirement Description |
| :--- | :--- | :--- |
| **NFR-01** | **Security** | All data transmission between the client and server must be encrypted using HTTPS. |
| **NFR-02** | **Security** | User passwords must be securely hashed and salted on the server (mocked in this project). |
| **NFR-03** | **Security** | The system must implement Role-Based Access Control (RBAC) to enforce permissions. |
| **NFR-04** | **Security** | The system must lock a user's account after 3 consecutive failed login attempts to align with NIST guidelines. |
| **NFR-05** | **Security** | The system must prevent user enumeration by providing a generic error message for invalid login attempts. |
| **NFR-06** | **Performance** | The main dashboard page must load within 3 seconds on a standard internet connection. |
| **NFR-07** | **Usability** | The user interface must be intuitive and responsive on both desktop and mobile devices. |
| **NFR-08** | **Reliability** | The system shall aim for 99.9% uptime (simulated by robust error handling). |

## 2.3 Detailed Risk Analysis

Building upon the initial assessment, this section provides a more detailed analysis of key security risks, referencing the OWASP Top 10.

| Risk ID | Threat | Vulnerability (OWASP Category) | Impact | Mitigation Controls |
| :--- | :--- | :--- | :--- | :--- |
| **R-01** | **Authentication Bypass** | An attacker could bypass login via SQL injection in the username field. (**A03:2021-Injection**) | **Critical** | **SR-01**: Implement strict server-side input validation using an allow-list regex. |
| **R-02** | **Broken Access Control** | A Developer could access admin-only functions by guessing URLs. (**A01:2021-Broken Access Control**) | **High** | **SR-02, SR-03**: Enforce server-side authorization checks on every sensitive action and client-side checks for page access. |
| **R-03** | **Credential Theft** | An attacker performs a brute-force attack to guess passwords. (**A07:2021-Identification and Authentication Failures**) | **High** | **SR-04**: Implement an account lockout mechanism after 3 failed attempts. |
| **R-04** | **User Enumeration** | An attacker uses login error messages to determine valid usernames. (**A07:2021-Identification and Authentication Failures**) | **Medium** | **SR-05**: Provide a generic error message for both invalid usernames and passwords. |
| **R-05** | **Accidental Data Deletion** | A legitimate user accidentally deletes a critical document or project. (**A04:2021-Insecure Design**) | **Medium** | **SR-06**: Implement a confirmation dialog for all destructive actions to improve user experience and prevent mistakes. |

## 2.4 Final Security Requirements (SR)

These are the definitive, testable security requirements that will be implemented in the system.

| ID | Requirement Description |
| :--- | :--- |
| **SR-01** | **Input Validation**: The server must validate all user-supplied input against a strict schema before processing. Specifically, usernames must only contain alphanumeric characters, underscores, periods, and hyphens. |
| **SR-02** | **Server-Side Authorization**: Every action that modifies data (e.g., creating a project, assigning a user, deleting a document) must be authorized on the server to ensure the requesting user has the required role and permissions. |
| **SR-03** | **Client-Side Route Protection**: The client application must check the user's role before rendering pages or UI components that are restricted to certain roles (e.g., the "User Management" page is admin-only). |
| **SR-04** | **Account Lockout**: The system must lock a non-admin user account if 3 consecutive login attempts fail. |
| **SR-05** | **Generic Authentication Errors**: The login system must return an identical, generic error message whether the username does not exist or the password is incorrect. |
| **SR-06** | **Confirmation for Destructive Actions**: The UI must require explicit user confirmation before executing any irreversible action, such as deleting a user, project, or document. |
| **SR-07** | **Secure Defaults**: Self-registration will be disabled. New users can only be created by an administrator, establishing a secure default posture. |
| **SR-08** | **Forced Password Change**: A new user created by an admin must be forced to change their default password upon their first successful login. |
| **SR-09** | **Password Length**: The system must enforce a minimum password length of 8 characters, which aligns with **NIST Special Publication 800-63B** guidelines for memorized secrets. |
