import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Rating from './Rating';

describe('Rating', () => {
  it('is a labelled image when read-only', () => {
    render(<Rating value={4.5} />);

    expect(screen.getByRole('img')).toHaveAttribute('aria-label', '4.5 out of 5 stars');
  });

  it('reports the chosen star when interactive', async () => {
    const onChange = jest.fn();
    render(<Rating value={0} onChange={onChange} />);

    await userEvent.click(screen.getByRole('button', { name: '4 stars' }));

    expect(onChange).toHaveBeenCalledWith(4);
  });
});
