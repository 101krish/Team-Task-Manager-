/**
 * Strength validator rules for credentials checks.
 */

export function isPasswordStrong(password) {
  if (!password || password.length < 8) return false;
  const hasDigit = /\d/.test(password);
  const hasUppercase = /[A-Z]/.test(password);
  return hasDigit && hasUppercase;
}
