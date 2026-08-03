import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Stepper from './Stepper';

describe('Stepper', () => {
  it('increments and decrements within bounds', async () => {
    const onChange = jest.fn();
    render(<Stepper label="Adults" value={2} min={1} max={4} onChange={onChange} />);

    await userEvent.click(screen.getByRole('button', { name: 'Increase' }));
    expect(onChange).toHaveBeenLastCalledWith(3);

    await userEvent.click(screen.getByRole('button', { name: 'Decrease' }));
    expect(onChange).toHaveBeenLastCalledWith(1);
  });

  it('disables the control at each bound', () => {
    const { rerender } = render(<Stepper value={1} min={1} max={4} onChange={() => {}} />);
    expect(screen.getByRole('button', { name: 'Decrease' })).toBeDisabled();

    rerender(<Stepper value={4} min={1} max={4} onChange={() => {}} />);
    expect(screen.getByRole('button', { name: 'Increase' })).toBeDisabled();
  });
});
