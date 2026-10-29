import {
  readIsNotesPopupOn,
  saveIsNotesPopupOn,
} from './notes-popup-settings';

jest.mock('@/config/app-config', () => ({
  notesPopupDefaultOn: true,
}));
jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    getItem: jest.fn(async (key: string) => mockSavedValues.get(key) ?? null),
    setItem: jest.fn(async (key: string, value: string) => {
      mockSavedValues.set(key, value);
    }),
  },
}));

const mockSavedValues = new Map<string, string>();

beforeEach(() => {
  mockSavedValues.clear();
});

test('a phone with nothing saved reads the switch as ON', async () => {
  const isNotesPopupOn: boolean = await readIsNotesPopupOn();
  expect(isNotesPopupOn).toBe(true);
});

test('after saving OFF the switch reads OFF on every later read', async () => {
  await saveIsNotesPopupOn(false);
  const isNotesPopupOn: boolean = await readIsNotesPopupOn();
  const isNotesPopupOnAfterReopen: boolean = await readIsNotesPopupOn();
  expect(isNotesPopupOn).toBe(false);
  expect(isNotesPopupOnAfterReopen).toBe(false);
});

test('after saving ON the switch reads ON again', async () => {
  await saveIsNotesPopupOn(false);
  await saveIsNotesPopupOn(true);
  const isNotesPopupOn: boolean = await readIsNotesPopupOn();
  expect(isNotesPopupOn).toBe(true);
});
