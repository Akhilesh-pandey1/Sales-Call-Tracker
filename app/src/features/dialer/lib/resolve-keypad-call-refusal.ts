export function resolveKeypadCallRefusal(isNumberValid: boolean): string | null {
  if (isNumberValid) {
    return null;
  }
  const invalidNumberMessage = 'Enter a valid phone number.';
  return invalidNumberMessage;
}
