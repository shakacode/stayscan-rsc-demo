import React from 'react';
import { render, screen } from '@testing-library/react';
import Welcome from './ror_components/Welcome.client';

describe('Welcome', () => {
  it('renders the localized hero with a CTA over the layout providers', () => {
    render(<Welcome layout={{ user: null, currencies: [], currentCurrency: 'USD', alerts: [] }} />);

    expect(screen.getByRole('heading', { name: 'Find your stay for less' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Start searching' })).toBeInTheDocument();
  });
});
