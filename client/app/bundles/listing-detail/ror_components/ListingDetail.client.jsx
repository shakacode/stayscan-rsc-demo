import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useSelector, useDispatch } from 'react-redux';
import usePageStore from '../../layout/store/usePageStore';
import LayoutProviders from '../../layout/LayoutProviders';
import LayoutShell from '../../layout/LayoutShell';
import { selectCurrentUser, selectCurrentCurrency } from '../../layout/selectors/layoutSelectors';
import { openAuthModal } from '../../layout/reducers/authenticationModalReducer';
import layoutEn from '../../layout/i18n/en.json';
import detailEn from '../i18n/en.json';
import BookingWidget from '../booking/BookingWidget';
import PhotoGallery from '../content/PhotoGallery';
import ListingHeader from '../content/ListingHeader';
import Description from '../content/Description';
import SavingsCallout from '../content/SavingsCallout';
import AmenitiesGrid from '../content/AmenitiesGrid';
import HostSection from '../content/HostSection';
import Reviews from '../content/Reviews';
import LocationSection from '../content/LocationSection';
import SimilarCarousel from '../content/SimilarCarousel';
import GoodToKnow from '../content/GoodToKnow';
import ListingFaq from '../content/ListingFaq';
import useListingModals from '../modals/useListingModals';
import ListingModals from '../modals/ListingModals';
import * as style from './ListingDetail.module.scss';

const CATALOGS = { en: { ...layoutEn, ...detailEn } };

function cheapestNightly(channels) {
  const values = channels.map((channel) => channel.nightlyFrom).filter((value) => value != null);
  return values.length ? Math.min(...values) : null;
}

// listing-detail view — the deepest page: gallery, header, description, savings calculator,
// amenities, host, reviews, location and similar places, with the streamed booking
// widget in the sticky column and the lazy modal stack.
function ListingDetailContent({ listing }) {
  const user = useSelector(selectCurrentUser);
  const currency = useSelector(selectCurrentCurrency);
  const currencyCode = currency?.code ?? 'USD';
  const dispatch = useDispatch();
  const modals = useListingModals();
  const [saved, setSaved] = useState(false);

  // Saving to a trip list needs an account; anonymous guests sign in first.
  const toggleSave = () => (user ? setSaved((value) => !value) : dispatch(openAuthModal('signIn')));

  return (
    <article className={style.detail}>
      <PhotoGallery photos={listing.photos} title={listing.title} />

      <div className={style.layout}>
        <div className={style.main}>
          <ListingHeader
            listing={listing}
            saved={saved}
            onSave={toggleSave}
            onShare={() => modals.open('share')}
            onPriceAlert={() => modals.open('priceAlert')}
          />
          <Description
            description={listing.description}
            fromTheHost={listing.aiContent?.fromTheHost}
          />
          <SavingsCallout
            pricing={listing.pricing}
            channelCount={listing.channels.length}
            currency={currencyCode}
          />
          <AmenitiesGrid amenities={listing.amenities} onShowAll={() => modals.open('amenities')} />
          <HostSection host={listing.host} onContact={() => modals.open('messageHost')} />
          <Reviews
            listingId={listing.id}
            reviews={listing.reviews}
            aiContent={listing.aiContent}
            rating={listing.rating}
            onReport={(review) => modals.open('reportReview', { author: review.author })}
          />
          <LocationSection coordinates={listing.coordinates} city={listing.city} />
          <GoodToKnow />
          <ListingFaq />
          <SimilarCarousel listings={listing.relatedListings} currency={currencyCode} />
        </div>

        <aside className={style.aside}>
          <BookingWidget
            listingId={listing.id}
            channels={listing.channels}
            maxGuests={listing.capacity.maxGuests}
            nightlyFrom={cheapestNightly(listing.channels)}
            currency={currencyCode}
            user={user}
            onRequireAuth={() => dispatch(openAuthModal('signIn'))}
            onLimitReached={() => modals.open('featureLimit')}
            onInquire={() => modals.open('inquiry')}
            onNegotiate={() => modals.open('negotiate')}
            onAlternatives={() => modals.open('alternatives')}
          />
        </aside>
      </div>

      <ListingModals
        modal={modals.modal}
        listing={listing}
        currency={currencyCode}
        onClose={modals.close}
      />
    </article>
  );
}

ListingDetailContent.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  listing: PropTypes.object.isRequired,
};

export default function ListingDetail({ listing, layout, locale = 'en' }) {
  const store = usePageStore({ layout });

  return (
    <LayoutProviders store={store} locale={locale} messages={CATALOGS[locale] ?? CATALOGS.en}>
      <LayoutShell>
        <ListingDetailContent listing={listing} />
      </LayoutShell>
    </LayoutProviders>
  );
}

ListingDetail.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  listing: PropTypes.object.isRequired,
  // eslint-disable-next-line react/forbid-prop-types
  layout: PropTypes.object,
  locale: PropTypes.string,
};
