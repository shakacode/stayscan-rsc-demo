import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Badge from '../../../styleguide/components/Badge/Badge';
import * as style from './tile.module.scss';

// Trust/quality chips overlaid on the tile photo.
const BADGES = [
  { key: 'bookDirect', variant: 'accent', id: 'browse.badge.bookDirect' },
  { key: 'topRated', variant: 'success', id: 'browse.badge.topRated' },
  { key: 'verified', variant: 'neutral', id: 'browse.badge.verified' },
];

export default function TileBadges({ badges }) {
  const active = BADGES.filter((badge) => badges[badge.key]);
  if (active.length === 0) return null;

  return (
    <div className={style.carouselBadges} data-test-id="tile-badges">
      {active.map((badge) => (
        <Badge key={badge.key} variant={badge.variant}>
          <FormattedMessage id={badge.id} />
        </Badge>
      ))}
    </div>
  );
}

TileBadges.propTypes = {
  badges: PropTypes.objectOf(PropTypes.bool).isRequired,
};
