import { getExpenses, saveExpenses, getCategories, saveCategories } from './ExpenseService';

// Mock expo-file-system
jest.mock('expo-file-system', () => {
  const mockFileInstance = {
    exists: false,
    text: jest.fn().mockResolvedValue('[]'),
    write: jest.fn(),
  };
  return {
    Paths: { document: { uri: 'file://doc/' } },
    File: jest.fn(() => mockFileInstance),
  };
});

describe('ExpenseService', () => {
  it('should export functions', () => {
    expect(getExpenses).toBeDefined();
    expect(saveExpenses).toBeDefined();
    expect(getCategories).toBeDefined();
    expect(saveCategories).toBeDefined();
  });
});
