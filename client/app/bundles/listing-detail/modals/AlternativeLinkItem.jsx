import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Button from '../../../styleguide/components/Button/Button';
import * as style from './modals.module.scss';

// One alternative booking link: a crawlable "view on channel" link plus a report
// action for a broken/incorrect link.
export default function AlternativeLinkItem({ label, href, onReport }) {
  return (
    <div className={style.linkItem} data-test-id="alternative-link">
      <a href={href} target="_blank" rel="noopener noreferrer">
        <FormattedMessage id="listingDetail.alternatives.viewOn" values={{ channel: label }} />
      </a>
      <Button variant="ghost" size="sm" onClick={onReport} data-test-id="report-link">
        <FormattedMessage id="listingDetail.alternatives.report" />
      </Button>
    </div>
  );
}

AlternativeLinkItem.propTypes = {
  label: PropTypes.string.isRequired,
  href: PropTypes.string.isRequired,
  onReport: PropTypes.func.isRequired,
};
