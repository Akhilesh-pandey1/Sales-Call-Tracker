import { resolveRemoveErrorMessage } from './resolve-remove-error-message';

test('a request that never reached the server shows the no-internet message', () => {
  const networkError = { isAxiosError: true, response: undefined };
  const removeMessage = resolveRemoveErrorMessage(networkError);
  expect(removeMessage).toBe(
    'Removing a number needs the internet. Connect and try again.',
  );
});

test('a server refusal shows the exact message the server sent', () => {
  const wrongPasswordError = {
    isAxiosError: true,
    response: {
      status: 403,
      data: { message: 'Wrong password. Ask your manager.' },
    },
  };
  const removeMessage = resolveRemoveErrorMessage(wrongPasswordError);
  expect(removeMessage).toBe('Wrong password. Ask your manager.');
});

test('a server reply without a message falls back to the retry wording', () => {
  const messageLessServerError = { isAxiosError: true, response: { status: 500 } };
  const removeMessage = resolveRemoveErrorMessage(messageLessServerError);
  expect(removeMessage).toBe(
    'Removing a number needs the internet. Connect and try again.',
  );
});

test('an unexpected non-network failure keeps the number and asks to retry', () => {
  const unexpectedError = new Error('something broke');
  const removeMessage = resolveRemoveErrorMessage(unexpectedError);
  expect(removeMessage).toBe(
    'Removing a number needs the internet. Connect and try again.',
  );
});
