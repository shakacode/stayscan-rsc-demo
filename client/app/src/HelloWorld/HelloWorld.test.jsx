import React from 'react';
import { render, screen } from '@testing-library/react';
import HelloWorld from './ror_components/HelloWorld.client';

describe('HelloWorld', () => {
  it('greets the provided name', () => {
    render(<HelloWorld name="Ada" />);

    expect(screen.getByText('Hello, Ada!')).toBeInTheDocument();
  });
});
