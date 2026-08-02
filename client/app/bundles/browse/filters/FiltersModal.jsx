import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { FormattedMessage, useIntl } from 'react-intl';
import Modal from '../../../styleguide/components/Modal/Modal';
import Button from '../../../styleguide/components/Button/Button';
import {
  selectFiltersDraft,
  selectFiltersModalOpen,
  selectMeta,
} from '../selectors/browseSelectors';
import {
  selectAmenityFacets,
  selectPriceBounds,
  selectPreviewCount,
} from '../selectors/filterSelectors';
import {
  filterDraftChanged,
  filtersCommitted,
  filtersCleared,
  filtersModalToggled,
} from '../actions';
import PriceRangeGroup from './PriceRangeGroup';
import StepperGroup from './StepperGroup';
import RatingGroup from './RatingGroup';
import AmenitiesGroup from './AmenitiesGroup';
import ToggleGroup from './ToggleGroup';
import * as style from './filters.module.scss';

// The browse view filters modal: 8 filter groups editing a draft, a live "Show N stays"
// preview count, clear-all, and draft/commit semantics (applying commits the draft
// and refetches). Only mounted while open.
export default function FiltersModal() {
  const intl = useIntl();
  const dispatch = useDispatch();
  const open = useSelector(selectFiltersModalOpen);
  const draft = useSelector(selectFiltersDraft);
  const amenities = useSelector(selectAmenityFacets);
  const bounds = useSelector(selectPriceBounds);
  const previewCount = useSelector(selectPreviewCount);
  const meta = useSelector(selectMeta);

  if (!open) return null;

  const patch = (change) => dispatch(filterDraftChanged(change));
  const shown = previewCount ?? meta.totalCount;

  return (
    <Modal
      isOpen
      onClose={() => dispatch(filtersModalToggled(false))}
      title={intl.formatMessage({ id: 'browse.filters.title' })}
      testId="filters-modal"
      size="lg"
    >
      <div className={style.body}>
        <PriceRangeGroup
          minPrice={draft.minPrice}
          maxPrice={draft.maxPrice}
          bounds={bounds}
          onChange={patch}
        />
        <StepperGroup
          name="bedrooms"
          titleId="browse.filters.bedrooms"
          value={draft.minBedrooms}
          max={8}
          onChange={(value) => patch({ minBedrooms: value })}
        />
        <StepperGroup
          name="bathrooms"
          titleId="browse.filters.bathrooms"
          value={draft.minBathrooms}
          max={8}
          onChange={(value) => patch({ minBathrooms: value })}
        />
        <StepperGroup
          name="guests"
          titleId="browse.filters.guests"
          value={draft.minGuests}
          max={16}
          onChange={(value) => patch({ minGuests: value })}
        />
        <RatingGroup minRating={draft.minRating} onChange={patch} />
        <AmenitiesGroup amenities={amenities} selectedIds={draft.amenityIds} onChange={patch} />
        <ToggleGroup
          name="book-direct"
          titleId="browse.filters.bookDirectTitle"
          labelId="browse.filters.bookDirect"
          checked={draft.bookDirect}
          onChange={(checked) => patch({ bookDirect: checked })}
        />
        <ToggleGroup
          name="top-rated"
          titleId="browse.filters.topRatedTitle"
          labelId="browse.filters.topRated"
          checked={draft.topRated}
          onChange={(checked) => patch({ topRated: checked })}
        />
      </div>

      <div className={style.footer}>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => dispatch(filtersCleared())}
          data-test-id="filters-clear"
        >
          <FormattedMessage id="browse.filters.clear" />
        </Button>
        <Button
          variant="primary"
          onClick={() => dispatch(filtersCommitted(draft))}
          data-test-id="filters-apply"
        >
          <FormattedMessage id="browse.filters.apply" values={{ count: shown }} />
        </Button>
      </div>
    </Modal>
  );
}
