import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Popover from './Popover';
import PopoverManager from './PopoverManager';

function trigger(label) {
  return function TriggerButton({ toggle }) {
    return (
      <button type="button" onClick={toggle}>
        {label}
      </button>
    );
  };
}

describe('Popover', () => {
  it('opens on trigger click and closes on outside click', async () => {
    render(
      <div>
        <Popover trigger={trigger('Guests')}>Guest picker</Popover>
        <span>outside</span>
      </div>,
    );

    expect(screen.queryByText('Guest picker')).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Guests' }));
    expect(screen.getByText('Guest picker')).toBeInTheDocument();

    await userEvent.click(screen.getByText('outside'));
    expect(screen.queryByText('Guest picker')).not.toBeInTheDocument();
  });

  it('opening one popover closes another in the same controller (hide A before B)', async () => {
    render(
      <PopoverManager>
        <Popover id="a" trigger={trigger('A')}>
          Panel A
        </Popover>
        <Popover id="b" trigger={trigger('B')}>
          Panel B
        </Popover>
      </PopoverManager>,
    );

    await userEvent.click(screen.getByRole('button', { name: 'A' }));
    expect(screen.getByText('Panel A')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'B' }));
    expect(screen.getByText('Panel B')).toBeInTheDocument();
    expect(screen.queryByText('Panel A')).not.toBeInTheDocument();
  });
});
