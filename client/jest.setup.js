import '@testing-library/jest-dom';
import { configure } from '@testing-library/dom';

// The app tags DOM with `data-test-id` (hyphen) — the same attribute the system
// specs query — so align Testing Library's getByTestId with it.
configure({ testIdAttribute: 'data-test-id' });
