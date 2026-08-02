import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useIntl, FormattedMessage } from 'react-intl';
import Button from '../../../../styleguide/components/Button/Button';
import GlobeIcon from '../../../../styleguide/icons/GlobeIcon';
import MenuIcon from '../../../../styleguide/icons/MenuIcon';
import Searchbar from '../Searchbar/Searchbar';
import UserMenu from '../UserMenu/UserMenu';
import { selectCurrentUser, selectCurrency, selectNavbar } from '../../selectors/layoutSelectors';
import { openCurrencyModal } from '../../reducers/currencyModalReducer';
import { openAuthModal } from '../../reducers/authenticationModalReducer';
import { toggleMobileMenu } from '../../reducers/navbarReducer';
import * as style from './Navbar.module.scss';

// Shared top navigation: brand, the search island, currency switch, and
// auth entry points / account menu. Actions collapse into a mobile menu below md.
export default function Navbar() {
  const dispatch = useDispatch();
  const intl = useIntl();
  const user = useSelector(selectCurrentUser);
  const { current } = useSelector(selectCurrency);
  const { mobileMenuOpen } = useSelector(selectNavbar);

  const actions = (
    <>
      <button
        type="button"
        className={style.currency}
        onClick={() => dispatch(openCurrencyModal())}
        aria-label={intl.formatMessage({ id: 'layout.navbar.currency' })}
      >
        <GlobeIcon />
        <span>{current}</span>
      </button>

      {user ? (
        <UserMenu user={user} />
      ) : (
        <>
          <Button variant="ghost" onClick={() => dispatch(openAuthModal('signIn'))}>
            <FormattedMessage id="layout.navbar.signIn" />
          </Button>
          <Button variant="primary" onClick={() => dispatch(openAuthModal('signUp'))}>
            <FormattedMessage id="layout.navbar.signUp" />
          </Button>
        </>
      )}
    </>
  );

  return (
    <header className={style.navbar}>
      <div className={style.top}>
        <a href="/" className={style.brand}>
          <FormattedMessage id="layout.navbar.brand" />
        </a>

        <div className={style.search}>
          <Searchbar />
        </div>

        <div className={style.actions}>{actions}</div>

        <button
          type="button"
          className={style.menuToggle}
          aria-label={intl.formatMessage({ id: 'layout.navbar.menu' })}
          aria-expanded={mobileMenuOpen}
          onClick={() => dispatch(toggleMobileMenu())}
        >
          <MenuIcon />
        </button>
      </div>

      {mobileMenuOpen && <div className={style.mobileMenu}>{actions}</div>}
    </header>
  );
}
