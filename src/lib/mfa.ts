
'use server';
/**
 * @fileoverview Centralized Multi-Factor Authentication (MFA) Service
 *
 * @description
 * This file encapsulates all the core logic related to Time-based One-Time
 * Passwords (TOTP) for Multi-Factor Authentication. By isolating this
 * functionality, we create a clear separation of concerns, making the `auth.ts`
 * file cleaner and the MFA logic easier to maintain and audit for security.
 *
 * This service uses the `otplib` library for generating secrets and verifying
 * tokens, and the `qrcode` library for generating QR codes for easy setup
 * in authenticator apps.
 *
 * =============================================================================
 * SECURITY CONSIDERATIONS
 * =============================================================================
 * - **Secret Key Storage**: The TOTP secret (`mfaSecret`) is highly sensitive.
 *   In a real production application, this secret MUST be stored encrypted at
 *   rest in the database. Exposing it would allow an attacker to generate
 *   their own valid TOTP codes.
 *
 * - **Brute-Force on Verification**: The token verification endpoint should be
 *   rate-limited to prevent an attacker from repeatedly trying to guess a
 *   valid 6-digit code.
 *
 * - **Transport Security**: All communication involving MFA setup and verification
 *   must occur over a secure (HTTPS) connection to prevent secrets or tokens
 *   from being intercepted.
 */

import { authenticator } from 'otplib';
import qrcode from 'qrcode';
import { logger } from './logger';

/**
 * Generates a new, cryptographically strong secret for a user's TOTP setup.
 * @returns {string} A new base32-encoded secret key.
 */
export async function generateMfaSecret(): Promise<string> {
  return authenticator.generateSecret();
}

/**
 * Generates a Data URI for a QR code that can be scanned by authenticator apps.
 * @param email The user's email, used as the account label in the authenticator app.
 * @param secret The user's TOTP secret key.
 * @returns {Promise<string>} A promise that resolves to the QR code's Data URI.
 */
export async function generateMfaQrCode(email: string, secret: string): Promise<string> {
  // The otpauth:// URL is the standard format for provisioning TOTP credentials.
  const otpauth = authenticator.keyuri(email, 'PixelForge Nexus', secret);
  try {
    const qrCodeDataUrl = await qrcode.toDataURL(otpauth);
    return qrCodeDataUrl;
  } catch (error) {
    logger.error('Failed to generate QR code from otpauth URL.', error);
    throw new Error('Could not generate QR code.');
  }
}

/**
 * Verifies if a given TOTP token is valid for a given secret.
 * @param secret The user's stored TOTP secret key.
 * @param token The 6-digit code provided by the user.
 * @returns {boolean} True if the token is valid, false otherwise.
 */
export async function verifyMfaToken(secret: string, token: string): Promise<boolean> {
  try {
    // The `authenticator.verify` method checks the provided token against the
    // expected token for the current time window (and often adjacent windows
    // to account for clock drift).
    return authenticator.verify({ token, secret });
  } catch (error) {
    logger.error('An error occurred during TOTP verification.', error);
    return false;
  }
}
