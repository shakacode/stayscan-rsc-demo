import React from 'react';
import { render, screen } from '@testing-library/react';
import { IntlProvider } from 'react-intl';
import BookingWidget from './BookingWidget';
import layoutEn from '../../layout/i18n/en.json';
import detailEn from '../i18n/en.json';

const messages = { ...layoutEn, ...detailEn };

const channel = (providerType, overrides = {}) => ({
  providerType,
  label: providerType,
  bookDirect: false,
  calendarWindow: { from: '2026-06-01', to: '2026-06-08' },
  blockedRanges: [],
  rates: [{ from: '2026-06-01', to: '2026-06-08', nightly: 200, minStay: 1 }],
  nightlyFrom: 120,
  available: true,
  ...overrides,
});

function renderWidget(props = {}) {
  return render(
    <IntlProvider locale="en" defaultLocale="en" messages={messages}>
      <BookingWidget
        listingId={1}
        channels={[channel('airhive'), channel('hostflow', { bookDirect: true, nightlyFrom: 110 })]}
        maxGuests={4}
        nightlyFrom={110}
        currency="USD"
        user={null}
        {...props}
      />
    </IntlProvider>,
  );
}

describe('BookingWidget', () => {
  it('renders the date picker, guests and a disabled compare button before dates are picked', () => {
    renderWidget();

    expect(screen.getByTestId('booking-date-picker')).toBeInTheDocument();
    expect(screen.getByTestId('guest-selector')).toBeInTheDocument();
    expect(screen.getByTestId('compare-prices')).toBeDisabled();
  });

  it('renders every i18n string it references (no missing-message errors)', () => {
    const onError = jest.spyOn(console, 'error').mockImplementation(() => {});
    renderWidget();
    const missing = onError.mock.calls.filter((args) =>
      String(args[0]).includes('Missing message'),
    );
    expect(missing).toEqual([]);
    onError.mockRestore();
  });
});
