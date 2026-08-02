import React from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithLayout } from '../../testSupport';
import DestinationAutocomplete from './DestinationAutocomplete';

jest.mock('../../api/autocompleteRequest', () => jest.fn(() => Promise.resolve([])));

const withResults = {
  autocomplete: {
    query: 'ki',
    results: [
      { id: 1, name: 'Kivora', path: 'sy/marenca/kivora', kind: 'area', listingsCount: 900 },
      { id: 2, name: 'Kirona', path: 'sy/marenca/kirona', kind: 'area', listingsCount: 200 },
    ],
    activeIndex: -1,
    loading: false,
    error: null,
  },
};

describe('DestinationAutocomplete', () => {
  it('lists matview suggestions and reports the chosen destination', async () => {
    const onSelect = jest.fn();
    renderWithLayout(<DestinationAutocomplete onSelect={onSelect} />, {
      preloadedState: withResults,
    });

    expect(screen.getByRole('option', { name: /Kivora/ })).toBeInTheDocument();

    await userEvent.click(screen.getByRole('option', { name: /Kivora/ }));

    expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ name: 'Kivora' }));
  });

  it('selects with the keyboard (ArrowDown then Enter)', async () => {
    const onSelect = jest.fn();
    renderWithLayout(<DestinationAutocomplete onSelect={onSelect} />, {
      preloadedState: withResults,
    });

    const input = screen.getByRole('combobox');
    input.focus();
    await userEvent.keyboard('{ArrowDown}{ArrowDown}{Enter}');

    expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ name: 'Kirona' }));
  });

  it('dispatches setQuery as the user types', async () => {
    const { store } = renderWithLayout(<DestinationAutocomplete onSelect={() => {}} />);

    await userEvent.type(screen.getByRole('combobox'), 'ma');

    expect(store.getState().autocomplete.query).toBe('ma');
  });
});
