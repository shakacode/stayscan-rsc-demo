import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithLayout } from '../../testSupport';
import AuthModal from './AuthModal';
import { signIn } from '../../api/authRequest';

jest.mock('../../api/authRequest');

const openSignIn = { authenticationModal: { open: true, mode: 'signIn', error: null } };

describe('AuthModal', () => {
  it('signs in, sets the session, and closes', async () => {
    signIn.mockResolvedValue({ id: 1, name: 'Ada', email: 'a@example.test' });
    const { store } = renderWithLayout(<AuthModal />, { preloadedState: openSignIn });

    await userEvent.type(screen.getByLabelText('Email'), 'a@example.test');
    await userEvent.type(screen.getByLabelText('Password'), 'password123');
    await userEvent.click(screen.getByRole('button', { name: 'Sign in' }));

    await waitFor(() =>
      expect(store.getState().session.user).toEqual({
        id: 1,
        name: 'Ada',
        email: 'a@example.test',
      }),
    );
    expect(store.getState().authenticationModal.open).toBe(false);
  });

  it('shows the server error on a failed sign in', async () => {
    signIn.mockRejectedValue(new Error('Invalid Email or password.'));
    renderWithLayout(<AuthModal />, { preloadedState: openSignIn });

    await userEvent.type(screen.getByLabelText('Email'), 'a@example.test');
    await userEvent.type(screen.getByLabelText('Password'), 'wrong');
    await userEvent.click(screen.getByRole('button', { name: 'Sign in' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Invalid Email or password.');
  });

  it('switches to sign up mode', async () => {
    const { store } = renderWithLayout(<AuthModal />, { preloadedState: openSignIn });

    await userEvent.click(screen.getByRole('button', { name: 'New here? Create an account' }));

    expect(store.getState().authenticationModal.mode).toBe('signUp');
  });
});
