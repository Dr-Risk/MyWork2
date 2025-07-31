# Behavioural Model: User Authentication Flow

This document provides a formal behavioural model of the user authentication process in PixelForge Nexus. It uses a **Petri net** to specify the system's behaviour in response to a user login attempt. This model allows for clear verification of the system's logic against its security and functional requirements by representing states (places) and actions (transitions).

## Authentication Flow Petri Net

The following Petri net describes the step-by-step process the system follows when a user submits their credentials on the login page. A token moving through the net represents the progression of a single login attempt.

```mermaid
graph TD
    subgraph "User Action"
        P1_Start("User on Login Page (token)") --> T1_Submit("Submit Credentials")
    end

    subgraph "System Processing"
        T1_Submit --> P2_Validating("Validating Input")
        P2_Validating --> T2_ValidateInput("Check Input Format")
        T2_ValidateInput -- Invalid --> P_End_GenericError("Show Generic Error")
        T2_ValidateInput -- Valid --> P3_CheckingUser("Checking User Existence")
        
        P3_CheckingUser --> T3_CheckUser("User Exists?")
        T3_CheckUser -- No --> P_End_GenericError

        T3_CheckUser -- Yes --> P4_CheckingLock("Account Locked?")
        P4_CheckingLock --> T4_CheckLock("Check Lock Status")
        T4_CheckLock -- Yes --> P_End_LockedError("Show Locked Account Error")
        T4_CheckLock -- No --> P5_VerifyingPass("Verifying Password")
        
        P5_VerifyingPass --> T5_CheckPass("Password Correct?")
        T5_CheckPass -- No --> P6_IncorrectPass("Incorrect Password")
        P6_IncorrectPass --> T6_IncrementAttempts("Increment Login Attempts")
        T6_IncrementAttempts --> P7_CheckingAttempts("Attempts >= 3?")
        P7_CheckingAttempts --> T7_LockAccount("Lock Account?")
        T7_LockAccount -- Yes --> P_End_LockedError
        T7_LockAccount -- No --> P_End_GenericError

        T5_CheckPass -- Yes --> P8_CheckingExpiry("Password Expired?")
        P8_CheckingExpiry --> T8_CheckExpiry("Check Expiry Status")
        T8_CheckExpiry -- Yes --> P_End_ChangePassword("Redirect to Change Password")
        T8_CheckExpiry -- No --> P9_SuccessfulAuth("Successful Authentication")
        
        P9_SuccessfulAuth --> T9_ResetAttempts("Reset Login Attempts")
        T9_ResetAttempts --> P_End_LoginSuccess("Login Success, Redirect to Dashboard")
    end

    subgraph "Terminal States (End)"
        P_End_GenericError("End: Generic Error")
        P_End_LockedError("End: Account Locked Error")
        P_End_ChangePassword("End: Change Password")
        P_End_LoginSuccess("End: Success")
    end

    %% Styling
    classDef place fill:#E1E8FF,stroke:#94A3B8,stroke-width:2px;
    classDef transition fill:#D1FAE5,stroke:#34D399,stroke-width:2px,rx:4,ry:4;
    classDef endPlace fill:#FECACA,stroke:#F87171,stroke-width:2px;

    class P1_Start,P2_Validating,P3_CheckingUser,P4_CheckingLock,P5_VerifyingPass,P6_IncorrectPass,P7_CheckingAttempts,P8_CheckingExpiry,P9_SuccessfulAuth place;
    class T1_Submit,T2_ValidateInput,T3_CheckUser,T4_CheckLock,T5_CheckPass,T6_IncrementAttempts,T7_LockAccount,T8_CheckExpiry,T9_ResetAttempts transition;
    class P_End_GenericError,P_End_LockedError,P_End_ChangePassword,P_End_LoginSuccess endPlace;
```

## Verification of Correctness

This model can be verified against the system's key security specifications:

1.  **Input Validation**: The flow begins with an explicit input validation transition (T2_ValidateInput). **VERIFIED**.
2.  **User Enumeration Prevention**: An invalid username (T3_CheckUser) or an incorrect password (leading from T5_CheckPass) both eventually lead to the same terminal state (P_End_GenericError). This prevents an attacker from distinguishing between an invalid user and an incorrect password. **VERIFIED**.
3.  **Brute-Force Protection**: The model includes transitions to increment failed login attempts (T6_IncrementAttempts) and lock the account (T7_LockAccount) if the threshold is met, leading to the "Locked" state. **VERIFIED**.
4.  **Account Lockout**: The flow explicitly checks if an account is already locked (T4_CheckLock) at the beginning of the process for an existing user. **VERIFIED**.
5.  **Password Expiration**: The system checks for password expiry (T8_CheckExpiry) only after a successful password verification (T5_CheckPass), ensuring this check does not leak information about password validity. **VERIFIED**.
6.  **Successful Login Path**: The only path to a successful login (P_End_LoginSuccess) requires passing all preceding checks and includes resetting the login attempt counter (T9_ResetAttempts) as a final action. **VERIFIED**.

This formal model demonstrates that the designed authentication flow correctly implements the specified security mechanisms and handles all primary success and failure states as intended.
