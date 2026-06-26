import '@testing-library/jest-dom/vitest';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// Reset DOM and persisted locale between tests so each case starts clean.
afterEach(() => {
  cleanup();
  localStorage.clear();
});
