import React from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithLayout } from '../../testSupport';
import Navbar from './Navbar';

describe('Navbar', () => {
  it('shows auth entry points when signed out and opens the auth modal', async () => {
    const { store } = renderWithLayout(<Navbar />);

    await userEvent.click(screen.getByRole('button', { name: 'Sign in' }));

    expect(store.getState().authenticationModal).toMatchObject({ open: true, mode: 'signIn' });
  });

  it('shows the account menu when signed in', () => {
    renderWithLayout(<Navbar />, {
      preloadedState: { session: { user: { id: 1, name: 'Kai Alana' } } },
    });

    expect(screen.getByRole('button', { name: 'Kai Alana' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Sign in' })).not.toBeInTheDocument();
  });

  it('opens the currency modal from the currency switch', async () => {
    const { store } = renderWithLayout(<Navbar />, {
      preloadedState: { currencyModal: { open: false, current: 'USD', currencies: [] } },
    });

    await userEvent.click(screen.getByRole('button', { name: 'Currency' }));

    expect(store.getState().currencyModal.open).toBe(true);
  });
});
