import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Modal from './Modal';

describe('Modal', () => {
  it('renders nothing when closed', () => {
    render(
      <Modal isOpen={false} onClose={() => {}} testId="m">
        Body
      </Modal>,
    );

    expect(screen.queryByText('Body')).not.toBeInTheDocument();
  });

  it('renders content and exposes testId as data-test-id when open', () => {
    render(
      <Modal isOpen onClose={() => {}} title="Sign in" testId="auth-modal">
        Body
      </Modal>,
    );

    expect(screen.getByText('Body')).toBeInTheDocument();
    expect(screen.getByRole('dialog')).toHaveAttribute('data-test-id', 'auth-modal');
  });

  it('closes on Escape and on overlay click', async () => {
    const onClose = jest.fn();
    render(
      <Modal isOpen onClose={onClose} title="X">
        Body
      </Modal>,
    );

    await userEvent.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalledTimes(1);

    await userEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(onClose).toHaveBeenCalledTimes(2);
  });
});
