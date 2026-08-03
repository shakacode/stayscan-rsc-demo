import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import loadable from '@loadable/component';
import Button from '../../../styleguide/components/Button/Button';
import useBooking from './useBooking';
import { nightsBetween } from './useBookingAvailability';
import NightlyPrice from './NightlyPrice';
import BookingDatePicker from './BookingDatePicker';
import CalendarLegend from './CalendarLegend';
import GuestSelector from './GuestSelector';
import QuoteStatusBanner from './QuoteStatusBanner';
import TopDealBanner from './TopDealBanner';
import PriceComparisonTable from './PriceComparisonTable';
import BookingSummary from './BookingSummary';
import MobileBookingBar from './MobileBookingBar';
import * as style from './booking.module.scss';

const BookDirectRevealModal = loadable(() => import('../modals/BookDirectRevealModal'), {
  ssr: false,
});

const noop = () => {};

// The booking widget: composes the date picker, guest selector and the streamed
// price-comparison table over the useBooking state machine. Auth / limit / inquiry
// handlers are injected by ListingDetail (which owns the modals).
export default function BookingWidget({
  listingId,
  channels,
  maxGuests,
  nightlyFrom,
  currency = 'USD',
  user = null,
  onRequireAuth = noop,
  onLimitReached = noop,
  onInquire = noop,
  onNegotiate = noop,
  onAlternatives = noop,
  deps,
}) {
  const booking = useBooking({ listingId, channels, user, deps });
  const { dates, guests, status, quote, capReached, rows } = booking;
  const [revealTarget, setRevealTarget] = useState(null);

  const nights = nightsBetween(dates.checkIn, dates.checkOut);
  const overCapacity = guests.adults + guests.children > maxGuests;
  const busy = status === 'creating' || status === 'streaming';
  const canQuote = Boolean(dates.checkIn && dates.checkOut) && !overCapacity && !busy;

  const topDeal = status === 'settled' ? quote?.topDeal : null;

  // A signed-in guest revealing a book-direct link confirms first (the modal),
  // then the row flips to revealed.
  const handleReveal = (provider) => {
    const channel = channels.find((entry) => entry.providerType === provider);
    setRevealTarget({ provider, label: channel?.label });
  };
  const confirmReveal = () => booking.reveal(revealTarget.provider);

  return (
    <section className={style.widget} data-test-id="booking-widget">
      <div className={style.widgetHeader}>
        <h2>
          <FormattedMessage id="listingDetail.booking.title" />
        </h2>
        <NightlyPrice amount={nightlyFrom} currency={currency} />
      </div>

      <div className={style.controls}>
        <BookingDatePicker dates={dates} channels={channels} onChange={booking.setDates} />
        <CalendarLegend />
        <GuestSelector guests={guests} maxGuests={maxGuests} onChange={booking.setGuests} />
      </div>

      <Button
        variant="primary"
        fullWidth
        disabled={!canQuote}
        loading={busy}
        onClick={booking.requestQuote}
        data-test-id="compare-prices"
      >
        <FormattedMessage id="listingDetail.booking.compareAction" />
      </Button>

      <QuoteStatusBanner
        status={status}
        capReached={capReached}
        onShowLimit={onLimitReached}
        onRetry={booking.requestQuote}
      />

      {topDeal && (
        <TopDealBanner
          topDeal={topDeal}
          providerLabel={
            channels.find((channel) => channel.providerType === topDeal.provider)?.label
          }
          currency={currency}
        />
      )}

      {quote && (
        <PriceComparisonTable
          rows={rows}
          quote={quote}
          checkIn={dates.checkIn}
          currency={currency}
          onReveal={handleReveal}
          onSignIn={onRequireAuth}
        />
      )}

      <div className={style.secondaryActions}>
        <Button variant="ghost" size="sm" onClick={onNegotiate} data-test-id="open-negotiate">
          <FormattedMessage id="listingDetail.booking.negotiate" />
        </Button>
        <Button variant="ghost" size="sm" onClick={onAlternatives} data-test-id="open-alternatives">
          <FormattedMessage id="listingDetail.booking.allLinks" />
        </Button>
      </div>

      <BookingSummary
        nightlyFrom={nightlyFrom}
        topDeal={topDeal}
        nights={nights}
        currency={currency}
        canQuote={canQuote}
        busy={busy}
        onQuote={booking.requestQuote}
        onInquire={onInquire}
      />

      <MobileBookingBar
        nightlyFrom={nightlyFrom}
        topDeal={topDeal}
        currency={currency}
        canQuote={canQuote}
        busy={busy}
        onQuote={booking.requestQuote}
        onInquire={onInquire}
      />

      {revealTarget && (
        <BookDirectRevealModal
          providerLabel={revealTarget.label}
          directUrl={`https://direct.example/host/${listingId}`}
          onConfirm={confirmReveal}
          onClose={() => setRevealTarget(null)}
        />
      )}
    </section>
  );
}

BookingWidget.propTypes = {
  listingId: PropTypes.number.isRequired,
  channels: PropTypes.arrayOf(PropTypes.object).isRequired,
  maxGuests: PropTypes.number.isRequired,
  nightlyFrom: PropTypes.number,
  currency: PropTypes.string,
  // eslint-disable-next-line react/forbid-prop-types
  user: PropTypes.object,
  onRequireAuth: PropTypes.func,
  onLimitReached: PropTypes.func,
  onInquire: PropTypes.func,
  onNegotiate: PropTypes.func,
  onAlternatives: PropTypes.func,
  // eslint-disable-next-line react/forbid-prop-types
  deps: PropTypes.object,
};
