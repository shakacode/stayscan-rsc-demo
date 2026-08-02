import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Badge from '../../../styleguide/components/Badge/Badge';
import Money from '../format/Money';
import * as style from './booking.module.scss';

// "Save $120 (28%)" chip shown against the best deal. Absolute + percentage both
// come from the server (Quote#top_deal_with_savings) — no arithmetic here.
export default function SavingsBadge({ absolute, percentage, currency }) {
  if (!absolute || absolute <= 0) return null;

  return (
    <Badge variant="success" className={style.savingsBadge}>
      <FormattedMessage
        id="listingDetail.booking.savings"
        values={{
          amount: <Money key="amount" amount={absolute} currency={currency} />,
          percent: percentage,
        }}
      />
    </Badge>
  );
}

SavingsBadge.propTypes = {
  absolute: PropTypes.number,
  percentage: PropTypes.number,
  currency: PropTypes.string,
};
