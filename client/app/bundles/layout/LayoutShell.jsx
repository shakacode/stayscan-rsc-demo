import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import Navbar from './components/Navbar/Navbar';
import Footer from './components/Footer/Footer';
import AlertsStrip from './components/AlertsStrip/AlertsStrip';
import CurrencyModal from './components/CurrencyModal/CurrencyModal';
import AuthModal from './components/AuthModal/AuthModal';
import ToastHost from '../../styleguide/components/Toast/Toast';
import { openAuthModal } from './reducers/authenticationModalReducer';

// The shared page chrome every page renders its content inside: navbar + footer +
// the layout-store-driven overlays (alerts, currency modal, toasts). The auth
// modal is added in the auth slice.
export default function LayoutShell({ children }) {
  const rootRef = useRef(null);
  const dispatch = useDispatch();
  // Signal hydration so tests can wait for interactivity before driving JS.
  useEffect(() => {
    if (rootRef.current) rootRef.current.dataset.hydrated = 'true';
  }, []);

  // Devise bounces unauthenticated HTML requests to /users/sign_in, which redirects
  // here with ?signIn — open the modal, then strip the param so a refresh doesn't.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('signIn') == null) return;
    dispatch(openAuthModal('signIn'));
    params.delete('signIn');
    const qs = params.toString();
    window.history.replaceState(
      {},
      '',
      window.location.pathname + (qs ? `?${qs}` : '') + window.location.hash,
    );
  }, [dispatch]);

  return (
    <div ref={rootRef} data-layout-root>
      <Navbar />
      <AlertsStrip />
      {children}
      <Footer />
      <CurrencyModal />
      <AuthModal />
      <ToastHost />
    </div>
  );
}

LayoutShell.propTypes = {
  children: PropTypes.node,
};
