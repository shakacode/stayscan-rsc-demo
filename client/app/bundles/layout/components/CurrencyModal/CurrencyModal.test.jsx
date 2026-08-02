import React from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithLayout } from '../../testSupport';
import CurrencyModal from './CurrencyModal';

const open = {
  currencyModal: {
    open: true,
    current: 'USD',
    currencies: [
      { code: 'USD', symbol: '$' },
      { code: 'EUR', symbol: '€' },
    ],
  },
};

describe('CurrencyModal', () => {
  it('lists currencies and selects one', async () => {
    const { store } = renderWithLayout(<CurrencyModal />, { preloadedState: open });

    expect(screen.getByRole('dialog')).toHaveAttribute('data-test-id', 'currency-modal');

    await userEvent.click(screen.getByRole('button', { name: /EUR/ }));

    expect(store.getState().currencyModal.current).toBe('EUR');
    expect(store.getState().currencyModal.open).toBe(false);
  });
});
