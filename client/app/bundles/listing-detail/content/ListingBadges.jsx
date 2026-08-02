import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Badge from '../../../styleguide/components/Badge/Badge';
import * as style from './content.module.scss';

// Trust/quality chips derived from the listing score (badges block).
const BADGES = [
  { key: 'bookDirect', variant: 'accent', id: 'listingDetail.badge.bookDirect' },
  { key: 'topRated', variant: 'success', id: 'listingDetail.badge.topRated' },
  { key: 'verified', variant: 'neutral', id: 'listingDetail.badge.verified' },
  { key: 'multiChannel', variant: 'outline', id: 'listingDetail.badge.multiChannel' },
];

export default function ListingBadges({ badges }) {
  const active = BADGES.filter((badge) => badges[badge.key]);
  if (active.length === 0) return null;

  return (
    <div className={style.badges} data-test-id="listing-badges">
      {active.map((badge) => (
        <Badge key={badge.key} variant={badge.variant}>
          <FormattedMessage id={badge.id} />
        </Badge>
      ))}
    </div>
  );
}

ListingBadges.propTypes = {
  badges: PropTypes.objectOf(PropTypes.bool).isRequired,
};
