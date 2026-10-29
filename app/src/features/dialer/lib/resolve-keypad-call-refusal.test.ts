import { resolveKeypadCallRefusal } from './resolve-keypad-call-refusal';

test('a valid number gets no refusal and the call starts', () => {
  const refusalMessage = resolveKeypadCallRefusal(true);
  expect(refusalMessage).toBeNull();
});

test('a number not valid for the login country refuses with the contract message', () => {
  const refusalMessage = resolveKeypadCallRefusal(false);
  expect(refusalMessage).toBe('Enter a valid phone number.');
});
