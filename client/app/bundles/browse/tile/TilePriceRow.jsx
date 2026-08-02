import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Money from '../../listing-detail/format/Money';
import TileChannelPill from './TileChannelPill';
import * as style from './tile.module.scss';

// The per-channel price row: channel pills + the "from" price. Before dates are set
// it shows the sample price; once a live quote streams in, it shows the best
// price and marks the cheapest channel.
export default function TilePriceRow({ channels, previewPrice, quote, currency }) {
  const best = quote?.topDeal;
  const price = best?.total ?? previewPrice;
  const streaming = quote && quote.state !== 'finished';

  return (
    <div className={style.priceRow} data-test-id="tile-price-row">
      <span className={style.channelPills}>
        {channels.map((providerType) => (
          <TileChannelPill
            key={providerType}
            providerType={providerType}
            best={best?.provider === providerType}
          />
        ))}
      </span>

      <span>
        {price != null ? (
          <>
            <span className={style.price}>
              <Money amount={price} currency={currency} />
            </span>
            <span className={style.priceUnit}>
              {' '}
              <FormattedMessage id="browse.tile.perNight" />
            </span>
          </>
        ) : (
          <span className={style.priceStreaming}>
            <FormattedMessage id="browse.tile.noPrice" />
          </span>
        )}
        {streaming && (
          <span className={style.priceStreaming} data-test-id="tile-price-streaming">
            {' '}
            <FormattedMessage id="browse.tile.updating" />
          </span>
        )}
      </span>
    </div>
  );
}

TilePriceRow.propTypes = {
  channels: PropTypes.arrayOf(PropTypes.string).isRequired,
  previewPrice: PropTypes.number,
  // eslint-disable-next-line react/forbid-prop-types
  quote: PropTypes.object,
  currency: PropTypes.string,
};
