import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DateRangePicker from './DateRangePicker';

describe('DateRangePicker', () => {
  it('renders a calendar and reports the picked day as the range start', async () => {
    const onChange = jest.fn();
    render(
      <DateRangePicker value={{ from: null, to: null }} onChange={onChange} numberOfMonths={1} />,
    );

    // day cells are buttons labelled with a full date (react-day-picker 7)
    const day = screen.getAllByText('15')[0];
    await userEvent.click(day);

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange.mock.calls[0][0]).toHaveProperty('from');
  });
});
