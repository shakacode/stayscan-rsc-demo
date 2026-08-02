import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Carousel from './Carousel';

const items = [
  { id: 'a', text: 'Alpha' },
  { id: 'b', text: 'Beta' },
];

describe('Carousel', () => {
  it('advances and wraps around via the next control', async () => {
    render(
      <Carousel items={items} ariaLabel="Reviews" renderItem={(item) => <p>{item.text}</p>} />,
    );

    expect(screen.getByLabelText('Go to slide 1')).toHaveAttribute('aria-current', 'true');

    await userEvent.click(screen.getByLabelText('Next'));
    expect(screen.getByLabelText('Go to slide 2')).toHaveAttribute('aria-current', 'true');

    await userEvent.click(screen.getByLabelText('Next'));
    expect(screen.getByLabelText('Go to slide 1')).toHaveAttribute('aria-current', 'true');
  });

  it('jumps directly to a slide via its dot', async () => {
    render(
      <Carousel items={items} ariaLabel="Reviews" renderItem={(item) => <p>{item.text}</p>} />,
    );

    await userEvent.click(screen.getByLabelText('Go to slide 2'));

    expect(screen.getByLabelText('Go to slide 2')).toHaveAttribute('aria-current', 'true');
  });
});
