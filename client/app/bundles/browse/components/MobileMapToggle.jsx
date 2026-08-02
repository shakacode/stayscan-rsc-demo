import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import cx from '../../../styleguide/cx';
import { selectMobileView } from '../selectors/browseSelectors';
import { mobileViewToggled } from '../actions';
import * as style from '../ror_components/Browse.module.scss';

// Mobile-only list/map switch (both panes show side-by-side on desktop).
export default function MobileMapToggle() {
  const dispatch = useDispatch();
  const view = useSelector(selectMobileView);

  return (
    <div className={style.mobileToggle} role="group" data-test-id="mobile-map-toggle">
      <button
        type="button"
        className={cx(style.toggleButton, view === 'list' && style.toggleButtonActive)}
        aria-pressed={view === 'list'}
        onClick={() => dispatch(mobileViewToggled('list'))}
        data-test-id="toggle-list"
      >
        <FormattedMessage id="browse.view.list" />
      </button>
      <button
        type="button"
        className={cx(style.toggleButton, view === 'map' && style.toggleButtonActive)}
        aria-pressed={view === 'map'}
        onClick={() => dispatch(mobileViewToggled('map'))}
        data-test-id="toggle-map"
      >
        <FormattedMessage id="browse.view.map" />
      </button>
    </div>
  );
}
