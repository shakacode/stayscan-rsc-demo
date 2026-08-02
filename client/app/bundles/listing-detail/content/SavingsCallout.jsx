import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import SectionHeading from './SectionHeading';
import Money from '../format/Money';
import * as style from './content.module.scss';

// A pre-quote savings callout: how many channels we compare and the
// headline saving across them for a sample stay. The exact, dated total comes
// from the interactive widget's quote — this is the "why book here" summary.
export default function SavingsCallout({ pricing, channelCount, currency }) {
  if (!pricing || pricing.savings <= 0) return null;

  return (
    <section className={style.section} data-test-id="savings-callout">
      <SectionHeading titleId="listingDetail.savingsCallout.title" />
      <p className={style.prose}>
        <FormattedMessage
          id="listingDetail.savingsCallout.body"
          values={{
            channels: channelCount,
            nights: pricing.sampleNights,
            savings: <Money key="s" amount={pricing.savings} currency={currency} />,
          }}
        />
      </p>
    </section>
  );
}

SavingsCallout.propTypes = {
  pricing: PropTypes.shape({ savings: PropTypes.number, sampleNights: PropTypes.number }),
  channelCount: PropTypes.number.isRequired,
  currency: PropTypes.string,
};
