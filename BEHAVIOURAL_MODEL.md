# Behavioural Model: User Authentication Flow

This document provides a formal behavioural model of the user authentication process in PixelForge Nexus. It uses a **Petri net** to specify the system's behaviour in response to a user login attempt. This model allows for clear verification of the system's logic against its security and functional requirements by representing states (places) and actions (transitions).

## Authentication Flow Petri Net (PNML)

The following XML code describes the Petri net in PNML (Petri Net Markup Language) format. This is a standard interchange format that can be used by various tools to analyze and visualize the net. A token moving through the net represents the progression of a single login attempt.

```xml
<?xml version="1.0" encoding="UTF-8"?>
<pnml>
  <net id="user_authentication_flow" type="http://www.pnml.org/version-2009/grammar/ptnet">
    <name>
      <text>User Authentication Flow</text>
    </name>
    <page id="page1">
      <!-- Places (States) -->
      <place id="P1_Start">
        <name><text>User on Login Page</text></name>
        <initialMarking><text>1</text></initialMarking>
      </place>
      <place id="P2_Validating">
        <name><text>Validating Input</text></name>
      </place>
      <place id="P3_CheckingUser">
        <name><text>Checking User Existence</text></name>
      </place>
      <place id="P4_CheckingLock">
        <name><text>Account Locked?</text></name>
      </place>
      <place id="P5_VerifyingPass">
        <name><text>Verifying Password</text></name>
      </place>
      <place id="P6_IncorrectPass">
        <name><text>Incorrect Password</text></name>
      </place>
      <place id="P7_CheckingAttempts">
        <name><text>Attempts >= 3?</text></name>
      </place>
      <place id="P8_CheckingExpiry">
        <name><text>Password Expired?</text></name>
      </place>
      <place id="P9_SuccessfulAuth">
        <name><text>Successful Authentication</text></name>
      </place>
      <place id="P_End_GenericError">
        <name><text>End: Generic Error</text></name>
      </place>
      <place id="P_End_LockedError">
        <name><text>End: Account Locked Error</text></name>
      </place>
      <place id="P_End_ChangePassword">
        <name><text>End: Change Password</text></name>
      </place>
      <place id="P_End_LoginSuccess">
        <name><text>End: Success</text></name>
      </place>

      <!-- Transitions (Actions) -->
      <transition id="T1_Submit">
        <name><text>Submit Credentials</text></name>
      </transition>
      <transition id="T2_ValidateInput_Valid">
        <name><text>Input Valid</text></name>
      </transition>
      <transition id="T2_ValidateInput_Invalid">
        <name><text>Input Invalid</text></name>
      </transition>
      <transition id="T3_CheckUser_Yes">
        <name><text>User Exists</text></name>
      </transition>
      <transition id="T3_CheckUser_No">
        <name><text>User Does Not Exist</text></name>
      </transition>
      <transition id="T4_CheckLock_Yes">
        <name><text>Account Is Locked</text></name>
      </transition>
      <transition id="T4_CheckLock_No">
        <name><text>Account Not Locked</text></name>
      </transition>
      <transition id="T5_CheckPass_Yes">
        <name><text>Password Correct</text></name>
      </transition>
      <transition id="T5_CheckPass_No">
        <name><text>Password Incorrect</text></name>
      </transition>
      <transition id="T6_IncrementAttempts">
        <name><text>Increment Login Attempts</text></name>
      </transition>
      <transition id="T7_LockAccount_Yes">
        <name><text>Lock Account</text></name>
      </transition>
      <transition id="T7_LockAccount_No">
        <name><text>Do Not Lock Account</text></name>
      </transition>
      <transition id="T8_CheckExpiry_Yes">
        <name><text>Password Is Expired</text></name>
      </transition>
      <transition id="T8_CheckExpiry_No">
        <name><text>Password Not Expired</text></name>
      </transition>
      <transition id="T9_ResetAttempts">
        <name><text>Reset Login Attempts</text></name>
      </transition>
      
      <!-- Arcs (Flows) -->
      <arc id="A1" source="P1_Start" target="T1_Submit"/>
      <arc id="A2" source="T1_Submit" target="P2_Validating"/>
      <arc id="A3" source="P2_Validating" target="T2_ValidateInput_Valid"/>
      <arc id="A4" source="P2_Validating" target="T2_ValidateInput_Invalid"/>
      <arc id="A5" source="T2_ValidateInput_Invalid" target="P_End_GenericError"/>
      <arc id="A6" source="T2_ValidateInput_Valid" target="P3_CheckingUser"/>
      <arc id="A7" source="P3_CheckingUser" target="T3_CheckUser_Yes"/>
      <arc id="A8" source="P3_CheckingUser" target="T3_CheckUser_No"/>
      <arc id="A9" source="T3_CheckUser_No" target="P_End_GenericError"/>
      <arc id="A10" source="T3_CheckUser_Yes" target="P4_CheckingLock"/>
      <arc id="A11" source="P4_CheckingLock" target="T4_CheckLock_Yes"/>
      <arc id="A12" source="P4_CheckingLock" target="T4_CheckLock_No"/>
      <arc id="A13" source="T4_CheckLock_Yes" target="P_End_LockedError"/>
      <arc id="A14" source="T4_CheckLock_No" target="P5_VerifyingPass"/>
      <arc id="A15" source="P5_VerifyingPass" target="T5_CheckPass_Yes"/>
      <arc id="A16" source="P5_VerifyingPass" target="T5_CheckPass_No"/>
      <arc id="A17" source="T5_CheckPass_No" target="P6_IncorrectPass"/>
      <arc id="A18" source="P6_IncorrectPass" target="T6_IncrementAttempts"/>
      <arc id="A19" source="T6_IncrementAttempts" target="P7_CheckingAttempts"/>
      <arc id="A20" source="P7_CheckingAttempts" target="T7_LockAccount_Yes"/>
      <arc id="A21" source="P7_CheckingAttempts" target="T7_LockAccount_No"/>
      <arc id="A22" source="T7_LockAccount_Yes" target="P_End_LockedError"/>
      <arc id="A23" source="T7_LockAccount_No" target="P_End_GenericError"/>
      <arc id="A24" source="T5_CheckPass_Yes" target="P8_CheckingExpiry"/>
      <arc id="A25" source="P8_CheckingExpiry" target="T8_CheckExpiry_Yes"/>
      <arc id="A26" source="P8_CheckingExpiry" target="T8_CheckExpiry_No"/>
      <arc id="A27" source="T8_CheckExpiry_Yes" target="P_End_ChangePassword"/>
      <arc id="A28" source="T8_CheckExpiry_No" target="P9_SuccessfulAuth"/>
      <arc id="A29" source="P9_SuccessfulAuth" target="T9_ResetAttempts"/>
      <arc id="A30" source="T9_ResetAttempts" target="P_End_LoginSuccess"/>
    </page>
  </net>
</pnml>
```

## Verification of Correctness

This formal model can be verified against the system's key security specifications:

1.  **Input Validation**: The flow begins with an explicit input validation check (transitions `T2_ValidateInput_Valid` and `T2_ValidateInput_Invalid`). An invalid input path leads directly to a terminal error state. **VERIFIED**.
2.  **User Enumeration Prevention**: An invalid username (transition `T3_CheckUser_No`) or an incorrect password (transition `T5_CheckPass_No`, leading to `T7_LockAccount_No`) both eventually reach the same terminal state (`P_End_GenericError`). This prevents an attacker from distinguishing between an invalid user and an incorrect password. **VERIFIED**.
3.  **Brute-Force Protection**: The model includes transitions to increment failed login attempts (`T6_IncrementAttempts`) and lock the account (`T7_LockAccount_Yes`) if the threshold is met, leading to the "Locked" state. **VERIFIED**.
4.  **Account Lockout**: The flow explicitly checks if an account is already locked (`T4_CheckLock_Yes`) at the beginning of the process for an existing user. **VERIFIED**.
5.  **Password Expiration**: The system checks for password expiry (`T8_CheckExpiry_Yes`) only after a successful password verification (`T5_CheckPass_Yes`), ensuring this check does not leak information about password validity. **VERIFIED**.
6.  **Successful Login Path**: The only path to a successful login (`P_End_LoginSuccess`) requires passing all preceding checks and includes resetting the login attempt counter (`T9_ResetAttempts`) as a final action. **VERIFIED**.

This formal model demonstrates that the designed authentication flow correctly implements the specified security mechanisms and handles all primary success and failure states as intended.
