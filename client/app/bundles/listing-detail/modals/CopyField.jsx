import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Button from '../../../styleguide/components/Button/Button';
import * as style from './modals.module.scss';

// A read-only URL field with a copy button. Falls back gracefully when the
// clipboard API is unavailable (older/insecure contexts) by selecting the text.
export default function CopyField({ value }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className={style.copyField}>
      <input className={style.copyInput} value={value} readOnly data-test-id="share-url" />
      <Button variant="secondary" size="sm" onClick={copy} data-test-id="copy-url">
        <FormattedMessage id={copied ? 'listingDetail.share.copied' : 'listingDetail.share.copy'} />
      </Button>
    </div>
  );
}

CopyField.propTypes = {
  value: PropTypes.string.isRequired,
};
