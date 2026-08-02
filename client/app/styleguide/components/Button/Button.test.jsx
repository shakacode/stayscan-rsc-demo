import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Button from './Button';

describe('Button', () => {
  it('fires onClick when pressed', async () => {
    const onClick = jest.fn();
    render(<Button onClick={onClick}>Book</Button>);

    await userEvent.click(screen.getByRole('button', { name: 'Book' }));

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('renders an anchor when href is set (crawlable link, not onClick)', () => {
    render(<Button href="/listings">Browse</Button>);

    expect(screen.getByRole('link', { name: 'Browse' })).toHaveAttribute('href', '/listings');
  });

  it('is disabled and busy while loading', () => {
    render(<Button loading>Save</Button>);

    const button = screen.getByRole('button', { name: 'Save' });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-busy', 'true');
  });
});
