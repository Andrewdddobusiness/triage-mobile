// Email and password validation utilities

import { supabase } from "../supabase";

/**
 * Validates if the provided string is a valid email format
 * @param email - The email string to validate
 * @returns boolean indicating if the email is valid
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Password validation error messages
 */
export enum PasswordErrorType {
  TOO_SHORT = "Password must be at least 8 characters long",
  NO_UPPERCASE = "Password must contain at least one uppercase letter",
  NO_LOWERCASE = "Password must contain at least one lowercase letter",
  NO_NUMBER = "Password must contain at least one number",
  NO_SPECIAL_CHAR = "Password must contain at least one special character",
}

/**
 * Password requirements for display
 */
export const PASSWORD_REQUIREMENTS = [
  "At least 8 characters",
  "At least one uppercase letter (A-Z)",
  "At least one lowercase letter (a-z)",
  "At least one number (0-9)",
  "At least one special character (!@#$%^&*)",
];

/**
 * Validates a password against security requirements
 * @param password - The password to validate
 * @returns Empty string if valid, or error message if invalid
 */
export const validatePassword = (password: string): string => {
  if (password.length < 8) {
    return PasswordErrorType.TOO_SHORT;
  }

  // Check for at least one uppercase letter
  if (!/[A-Z]/.test(password)) {
    return PasswordErrorType.NO_UPPERCASE;
  }

  // Check for at least one lowercase letter
  if (!/[a-z]/.test(password)) {
    return PasswordErrorType.NO_LOWERCASE;
  }

  // Check for at least one number
  if (!/\d/.test(password)) {
    return PasswordErrorType.NO_NUMBER;
  }

  // Check for at least one special character
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return PasswordErrorType.NO_SPECIAL_CHAR;
  }

  return ""; // Empty string means password is valid
};

/**
 * Error handling for authentication errors
 * @param error - The error object from authentication attempt
 * @returns User-friendly error message
 */
export const getAuthErrorMessage = (error: Error): string => {
  const errorText = error.message.toLowerCase();

  if (errorText.includes("email already in use") || errorText.includes("already registered")) {
    return "This email is already registered. Please use a different email or sign in.";
  } else if (errorText.includes("rate limit") || errorText.includes("too many requests")) {
    return "Too many sign-up attempts. Please try again later.";
  } else if (errorText.includes("network") || errorText.includes("connection")) {
    return "Network error. Please check your internet connection and try again.";
  } else if (errorText.includes("email not confirmed") || errorText.includes("email confirmation")) {
    return "Please confirm your email address before signing in. Check your inbox for a confirmation link.";
  } else if (
    errorText.includes("invalid login") ||
    errorText.includes("incorrect password") ||
    errorText.includes("invalid credentials")
  ) {
    return "Incorrect email or password. Please try again.";
  }

  return error.message;
};
