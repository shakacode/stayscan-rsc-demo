import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Avatar from '../../styleguide/components/Avatar/Avatar';
import Badge from '../../styleguide/components/Badge/Badge';
import Button from '../../styleguide/components/Button/Button';
import ListingCard from '../../styleguide/components/ListingCard/ListingCard';
import { imageUrl } from '../../libs/imageUrl';
import * as style from './profile.module.scss';

const BADGES = [
  { key: 'superhost', variant: 'success', id: 'profile.badge.superhost' },
  { key: 'verified', variant: 'neutral', id: 'profile.badge.verified' },
  { key: 'multiListing', variant: 'outline', id: 'profile.badge.multiListing' },
];

// The shared user/host profile: hero (avatar, name, since, badges), about, and the
// paginated listings grid. `variant` ('user' | 'host') only tweaks the framing.
export default function ProfileView({ user, variant, basePath }) {
  const activeBadges = BADGES.filter((badge) => user.badges[badge.key]);
  const { page, perPage, total } = user.pagination;
  const totalPages = Math.max(1, Math.ceil(total / perPage));

  return (
    <article className={style.profile} data-test-id="profile-page" data-variant={variant}>
      <header className={style.hero}>
        <Avatar
          name={user.name}
          src={user.avatar ? imageUrl(user.avatar, 'thumb', 1) : undefined}
          size="lg"
        />
        <div>
          <h1 className={style.name} data-test-id="profile-name">
            {user.name}
          </h1>
          <p className={style.since}>
            <FormattedMessage id={`profile.${variant}.since`} values={{ year: user.joinedYear }} />
          </p>
          <div className={style.badges}>
            {activeBadges.map((badge) => (
              <Badge key={badge.key} variant={badge.variant}>
                <FormattedMessage id={badge.id} />
              </Badge>
            ))}
          </div>
        </div>
      </header>

      {user.about && <p className={style.about}>{user.about}</p>}

      <section className={style.listings}>
        <h2 className={style.listingsTitle}>
          <FormattedMessage id="profile.listings" values={{ count: user.listingsCount }} />
        </h2>
        {user.listings.length === 0 ? (
          <p className={style.empty}>
            <FormattedMessage id="profile.noListings" />
          </p>
        ) : (
          <div className={style.grid} data-test-id="profile-listings">
            {user.listings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <nav
            className={style.pagination}
            aria-label="Pagination"
            data-test-id="profile-pagination"
          >
            {page > 1 && (
              <Button variant="secondary" size="sm" href={`${basePath}?page=${page - 1}`}>
                <FormattedMessage id="profile.prev" />
              </Button>
            )}
            <span className={style.pageStatus}>
              <FormattedMessage id="profile.pageOf" values={{ page, pages: totalPages }} />
            </span>
            {page < totalPages && (
              <Button variant="secondary" size="sm" href={`${basePath}?page=${page + 1}`}>
                <FormattedMessage id="profile.next" />
              </Button>
            )}
          </nav>
        )}
      </section>
    </article>
  );
}

ProfileView.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  user: PropTypes.object.isRequired,
  variant: PropTypes.oneOf(['user', 'host']).isRequired,
  basePath: PropTypes.string.isRequired,
};
