import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Checkbox from './Checkbox';

describe('Checkbox', () => {
  it('toggles when the whole row (label text) is clicked', async () => {
    const onChange = jest.fn();
    render(<Checkbox label="Pet friendly" checked={false} onChange={onChange} />);

    await userEvent.click(screen.getByText('Pet friendly'));

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('checkbox', { name: 'Pet friendly' })).toBeInTheDocument();
  });
});
