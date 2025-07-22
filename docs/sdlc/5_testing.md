# SDLC Stage 5: Testing

This document outlines the testing strategies used to verify and validate the security, functionality, and reliability of the PixelForge Nexus application.

## 5.1 Dynamic Application Security Testing (DAST)

While no automated DAST tools were used, manual dynamic testing was performed to identify vulnerabilities in the running application.

- **Fuzzing for Data Validation**:
  - **Objective**: To test the robustness of input validation controls.
  - **Process**: Manually entered malformed data into input fields, such as the login and profile update forms.
  - **Examples**:
    - Submitted usernames with special characters commonly used in injection attacks (e.g., `'`, `;`, `--`, `<script>`).
    - Submitted overly long strings to test for buffer overflow potential (though less relevant in a managed language like JS/TS).
  - **Outcome**: The strict, allow-list regex on the server-side (`/^[a-zA-Z0-9_.-]+$/`) successfully rejected all injection attempts, verifying the effectiveness of the input validation controls.

- **Manual Penetration Testing**:
  - **Objective**: To simulate an attacker's actions to find and exploit vulnerabilities.
  - **Process**:
    1. **Authentication Bypass**: Attempted to log in using common SQL injection payloads (`' OR 1=1 --`). The attempts were rejected.
    2. **Privilege Escalation**: Logged in as a `developer` and attempted to directly navigate to admin-only URLs like `/dashboard/users`. The application correctly redirected the user back to the main dashboard, confirming the route protection was effective.
    3. **Brute-Force Attack Simulation**: Intentionally entered the wrong password for a user multiple times to confirm that the account lockout mechanism (3 attempts) was triggered correctly.
  - **Outcome**: These tests validated the core security mechanisms (Input Validation, Authorization, Account Lockout) were functioning as designed. An issue with the admin account being immune to lockout was discovered and fixed, as documented in `TROUBLESHOOTING.md`.

## 5.2 Verification and Validation (V&V)

- **Verification: *"Are we building the product right?"***
  - This was addressed by continuously checking the implementation against the formal design documents.
  - **Code Reviews**: The code in `src/lib/auth.ts` was reviewed against the data flow diagram in `3_architecture_and_design.md` to ensure all logic paths (e.g., user not found, account locked) were implemented correctly.
  - **Security Requirement Check**: Each implemented feature was checked against the security requirements list (`2_requirements.md`). For example, after implementing the delete document feature, it was verified that the `canManageDocs` permission check was in place, satisfying **SR-02 (Server-Side Authorization)**.

- **Validation: *"Are we building the right product?"***
  - This was addressed by testing against the user and business needs defined in the requirements phase.
  - **User Acceptance Testing (UAT)**: UAT was performed by simulating the actions of each defined user role.
    - **Admin Path**: Logged in as `moqadri`, created a new project, created new users, assigned roles, and verified access to all pages.
    - **Project Lead Path**: Logged in as a `project-lead`, verified they could assign developers and manage documents *only* for their assigned projects.
    - **Developer Path**: Logged in as a `developer` and verified they could only view assigned projects and had no access to any management functionality.
  - **Outcome**: The UAT process confirmed that the application met all the functional requirements (FR-01 to FR-10) defined in the requirements document.

## 5.3 Certification and Accreditation

For this prototype, a formal certification and accreditation process is simulated.

- **Certification**:
  - **Statement**: "The PixelForge Nexus application has been technically evaluated through the testing processes described above. The results of the manual penetration tests, verification checks, and validation exercises confirm that the system's security controls are implemented as designed and are effective at mitigating the identified risks (R-01 to R-05). The system complies with the defined security requirements (SR-01 to SR-07)."
  - **Certifying Body (Simulated)**: Lead Developer.

- **Accreditation**:
  - **Statement**: "Based on the successful certification report and a review of the residual risks (which are deemed acceptable for a prototype of this nature), senior management formally accredits the PixelForge Nexus application for its intended purpose as a secure software development demonstrator. Management accepts the risk and authorizes its use."
  - **Accrediting Authority (Simulated)**: Project Sponsor/Management.

This simulated process provides a formal checkpoint, ensuring that the system's security posture has been reviewed and accepted before moving forward.