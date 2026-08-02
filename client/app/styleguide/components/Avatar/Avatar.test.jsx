import React from 'react';
import { render, screen } from '@testing-library/react';
import Avatar from './Avatar';

describe('Avatar', () => {
  it('renders up to two initials from the name when there is no image', () => {
    render(<Avatar name="Nina Farrow" />);

    expect(screen.getByLabelText('Nina Farrow')).toHaveTextContent('NF');
  });
});
