export function readRemovePasswordError(typedPassword: string): string | null {
  const emptyPasswordMessage = 'Enter the password.';
  const trimmedPassword = typedPassword.trim();
  if (trimmedPassword === '') {
    return emptyPasswordMessage;
  }
  return null;
}
