import { readRemovePasswordError } from './remove-number-password';

test('empty password shows the enter-password error', () => {
  const passwordError = readRemovePasswordError('');
  expect(passwordError).toBe('Enter the password.');
});

test('whitespace-only password counts as empty and sends nothing', () => {
  const passwordError = readRemovePasswordError('   ');
  expect(passwordError).toBe('Enter the password.');
});

test('typed password passes the gate so the app sends it', () => {
  const passwordError = readRemovePasswordError('manager-secret');
  expect(passwordError).toBeNull();
});
