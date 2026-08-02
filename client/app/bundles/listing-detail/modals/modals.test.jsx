import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { IntlProvider } from 'react-intl';
import BookingInquiryModal from './BookingInquiryModal';
import OtherChannelsModal from './OtherChannelsModal';
import UsageLimitModal from './UsageLimitModal';
import layoutEn from '../../layout/i18n/en.json';
import detailEn from '../i18n/en.json';

const messages = { ...layoutEn, ...detailEn };

function wrap(ui) {
  return render(
    <IntlProvider locale="en" defaultLocale="en" messages={messages}>
      {ui}
    </IntlProvider>,
  );
}

const listing = {
  id: 3,
  title: 'Sunlit Villa',
  channels: [
    { providerType: 'airhive', label: 'Airhive' },
    { providerType: 'vacario', label: 'Vacario' },
  ],
};

describe('BookingInquiryModal', () => {
  it('walks form → review → success and blocks an invalid form', () => {
    wrap(<BookingInquiryModal listing={listing} onClose={jest.fn()} />);

    // invalid: empty form stays on step 1
    fireEvent.click(screen.getByTestId('inquiry-next'));
    expect(screen.queryByTestId('inquiry-summary')).not.toBeInTheDocument();

    fireEvent.change(screen.getByTestId('inquiry-name'), { target: { value: 'Ada' } });
    fireEvent.change(screen.getByTestId('inquiry-email'), { target: { value: 'ada@example.com' } });
    fireEvent.click(screen.getByTestId('inquiry-next'));

    expect(screen.getByTestId('inquiry-summary')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('inquiry-send'));
    expect(screen.getByTestId('inquiry-success')).toBeInTheDocument();
  });
});

describe('OtherChannelsModal', () => {
  it('reports a link and shows success', async () => {
    const reportLink = jest.fn().mockResolvedValue();
    wrap(<OtherChannelsModal listing={listing} reportLink={reportLink} onClose={jest.fn()} />);

    fireEvent.click(screen.getAllByTestId('report-link')[0]);
    fireEvent.change(screen.getByTestId('report-reason'), { target: { value: 'dead link' } });
    fireEvent.click(screen.getByTestId('report-submit'));

    await waitFor(() => expect(screen.getByTestId('report-success')).toBeInTheDocument());
    expect(reportLink).toHaveBeenCalledWith({ provider: 'airhive', reason: 'dead link' });
  });

  it('shows the failure view when the report is rejected', async () => {
    const reportLink = jest.fn().mockRejectedValue(new Error('nope'));
    wrap(<OtherChannelsModal listing={listing} reportLink={reportLink} onClose={jest.fn()} />);

    fireEvent.click(screen.getAllByTestId('report-link')[1]);
    fireEvent.change(screen.getByTestId('report-reason'), { target: { value: 'wrong place' } });
    fireEvent.click(screen.getByTestId('report-submit'));

    await waitFor(() => expect(screen.getByTestId('report-failure')).toBeInTheDocument());
  });
});

describe('UsageLimitModal', () => {
  it('offers sign in for anonymous guests and lists the plans', () => {
    const plans = [
      { code: 'premium', name: 'Premium', price: 9 },
      { code: 'business', name: 'Business', price: 29 },
    ];
    wrap(
      <UsageLimitModal
        plans={plans}
        access={{ limit: 5, used: 5 }}
        isAuthenticated={false}
        onSignIn={jest.fn()}
        onChoosePlan={jest.fn()}
        onClose={jest.fn()}
      />,
    );

    expect(screen.getByTestId('limit-sign-in')).toBeInTheDocument();
    expect(screen.getByTestId('plan-premium')).toBeInTheDocument();
    expect(screen.getByTestId('plan-business')).toBeInTheDocument();
  });
});
