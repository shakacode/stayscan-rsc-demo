import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Button from '../../../styleguide/components/Button/Button';
import * as style from './content.module.scss';

// The "show all N photos" overlay button on the gallery.
export default function GalleryButton({ count, onOpen }) {
  return (
    <div className={style.galleryButton}>
      <Button
        variant="secondary"
        size="sm"
        onClick={() => onOpen(0)}
        data-test-id="show-all-photos"
      >
        <FormattedMessage id="listingDetail.gallery.showAll" values={{ count }} />
      </Button>
    </div>
  );
}

GalleryButton.propTypes = {
  count: PropTypes.number.isRequired,
  onOpen: PropTypes.func.isRequired,
};
