import React from 'react';
import PropTypes from 'prop-types';
import { useSelector, useDispatch } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import Button from '../../../styleguide/components/Button/Button';
import { submit } from '../store/accountReducer';
import * as style from '../ror_components/Account.module.scss';

// The save button + saved confirmation shared by every settings tab.
export default function SaveBar({ tab }) {
  const dispatch = useDispatch();
  const saving = useSelector((state) => state.account.saving);
  const saved = useSelector((state) => state.account.savedTab === tab);

  return (
    <div className={style.saveBar}>
      <Button
        variant="primary"
        loading={saving}
        onClick={() => dispatch(submit(tab))}
        data-test-id={`account-save-${tab}`}
      >
        <FormattedMessage id="account.save" />
      </Button>
      {saved && (
        <span className={style.saved} data-test-id="account-saved">
          <FormattedMessage id="account.saved" />
        </span>
      )}
    </div>
  );
}

SaveBar.propTypes = {
  tab: PropTypes.string.isRequired,
};
