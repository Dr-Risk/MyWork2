# SDLC Stage 7: Operation and Maintenance

This document describes the ongoing processes required to keep the PixelForge Nexus application secure, stable, and effective once it is in production.

## 7.1 Change Management

All modifications to the live application, including feature updates, bug fixes, and security patches, must follow a formal change management process.

1.  **Request**: A change is requested via an issue tracker.
2.  **Analysis**: The change is analyzed for its impact on security and functionality.
3.  **Approval**: The change is approved by the project lead.
4.  **Development & Testing**: The change is developed and rigorously tested in a non-production environment.
5.  **Deployment**: The change is deployed to production during a scheduled maintenance window.

## 7.2 Monitoring and Incident Management

- **Log Monitoring**:
  - **Objective**: To detect suspicious activity and diagnose issues.
  - **Process (Simulated)**: In a real application, all application and server logs would be aggregated into a centralized logging system (e.g., Datadog, Splunk). For this prototype, logs are written to the browser/server console.
  - **Key Events to Monitor**:
    - Failed login attempts.
    - Account lockouts.
    - Administrative actions (e.g., user creation, role changes).
    - Application errors (5xx server errors, 4xx client errors).

- **Incident Management**:
  - **Objective**: To have a clear plan for responding to security incidents.
  - **Plan**:
    1. **Identification**: Detect an incident via monitoring or user reports.
    2. **Containment**: Isolate the affected system to prevent further damage (e.g., temporarily locking a compromised account).
    3. **Eradication**: Identify the root cause of the incident and remove it (e.g., patch the vulnerability).
    4. **Recovery**: Restore the system to a secure, operational state.
    5. **Post-Mortem**: Analyze the incident to identify lessons learned and improve security controls.

## 7.3 Vulnerability Assessment and Security Updates

Security is an ongoing process, not a one-time event.

- **Vulnerability Scanning**:
  - **Process**: The application and its dependencies will be regularly scanned for known vulnerabilities using automated tools (e.g., `npm audit`, commercial DAST/SAST scanners).
- **Penetration Testing**:
  - **Process**: A manual penetration test will be conducted on an annual basis, or after any major feature release, to proactively identify new vulnerabilities.
- **Security Patching**:
  - **Process**: When a vulnerability is found in a third-party dependency, it must be patched promptly. A security patch is treated as a high-priority change and follows the expedited change management process.

## 7.4 Regression and Security Testing

Every update, no matter how small, carries the risk of introducing new bugs or security flaws.

- **Regression Testing**: A suite of automated or manual tests will be run before each release to ensure that the new changes have not broken any existing functionality.
- **Security Testing**: Key security tests (as described in Stage 5) will be re-run to ensure that the update has not introduced new security vulnerabilities (e.g., a change to a form accidentally removing input validation).

## 7.5 User Support and Feedback

- **Feedback Channel**: Users will have a designated channel to report issues or suggest improvements.
- **Issue Tracking**: All user-reported issues will be logged in an issue tracker, prioritized, and assigned for resolution. This feedback loop is crucial for continuously improving the application's functionality and security.
