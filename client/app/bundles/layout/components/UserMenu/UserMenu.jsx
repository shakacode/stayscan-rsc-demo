import React from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import Popover from '../../../../styleguide/components/Popover/Popover';
import Avatar from '../../../../styleguide/components/Avatar/Avatar';
import { clearUser } from '../../reducers/sessionReducer';
import { signOut } from '../../api/authRequest';
import * as style from './UserMenu.module.scss';

// Signed-in account menu. Sign-out hits the Devise endpoint, then clears the
// session slice so the navbar returns to the signed-out state.
export default function UserMenu({ user }) {
  const dispatch = useDispatch();

  const handleSignOut = async () => {
    await signOut();
    dispatch(clearUser());
  };

  return (
    <Popover
      placement="bottom-end"
      trigger={({ toggle }) => (
        <button type="button" className={style.trigger} onClick={toggle} aria-label={user.name}>
          <Avatar name={user.name} size="sm" />
        </button>
      )}
    >
      <nav className={style.menu}>
        <a href="/account" className={style.link}>
          <FormattedMessage id="layout.navbar.account" />
        </a>
        <a href="/trips" className={style.link}>
          <FormattedMessage id="layout.navbar.trips" />
        </a>
        <button type="button" className={style.link} onClick={handleSignOut}>
          <FormattedMessage id="layout.navbar.signOut" />
        </button>
      </nav>
    </Popover>
  );
}

UserMenu.propTypes = {
  user: PropTypes.shape({ name: PropTypes.string }).isRequired,
};
