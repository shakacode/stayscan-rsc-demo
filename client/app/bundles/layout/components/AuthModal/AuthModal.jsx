import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useIntl, FormattedMessage } from 'react-intl';
import Modal from '../../../../styleguide/components/Modal/Modal';
import Input from '../../../../styleguide/components/Input/Input';
import Button from '../../../../styleguide/components/Button/Button';
import { selectAuthModal } from '../../selectors/layoutSelectors';
import {
  closeAuthModal,
  setAuthMode,
  setAuthError,
} from '../../reducers/authenticationModalReducer';
import { setUser } from '../../reducers/sessionReducer';
import { signIn, signUp, requestReset } from '../../api/authRequest';
import * as style from './AuthModal.module.scss';

const MODES = {
  signIn: {
    titleId: 'layout.auth.signInTitle',
    submitId: 'layout.auth.submitSignIn',
    action: signIn,
  },
  signUp: {
    titleId: 'layout.auth.signUpTitle',
    submitId: 'layout.auth.submitSignUp',
    action: signUp,
  },
  forgot: { titleId: 'layout.auth.forgotTitle', submitId: 'layout.auth.submitForgot' },
};

// Sign in / sign up / forgot flows, driven by the authenticationModal slice.
// On success the session slice is set and the modal closes; the navbar re-renders
// for the signed-in state.
export default function AuthModal() {
  const dispatch = useDispatch();
  const intl = useIntl();
  const { open, mode, error } = useSelector(selectAuthModal);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [sent, setSent] = useState(false);
  const config = MODES[mode];

  const switchMode = (next) => {
    setSent(false);
    dispatch(setAuthMode(next));
  };

  const submit = async (event) => {
    event.preventDefault();
    try {
      if (mode === 'forgot') {
        await requestReset(email);
        setSent(true);
        return;
      }
      const user = await config.action({ email, password });
      dispatch(setUser(user));
      dispatch(closeAuthModal());
    } catch (err) {
      dispatch(setAuthError(err.message || intl.formatMessage({ id: 'layout.auth.genericError' })));
    }
  };

  return (
    <Modal
      isOpen={open}
      onClose={() => dispatch(closeAuthModal())}
      title={config ? intl.formatMessage({ id: config.titleId }) : ''}
      testId="auth-modal"
      size="sm"
    >
      <form className={style.form} onSubmit={submit}>
        <Input
          label={intl.formatMessage({ id: 'layout.auth.email' })}
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
        {mode !== 'forgot' && (
          <Input
            label={intl.formatMessage({ id: 'layout.auth.password' })}
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        )}
        {error && (
          <p className={style.error} role="alert">
            {error}
          </p>
        )}
        {sent && (
          <p className={style.notice}>{intl.formatMessage({ id: 'layout.auth.resetSent' })}</p>
        )}
        <Button type="submit" variant="primary" fullWidth>
          {config && <FormattedMessage id={config.submitId} />}
        </Button>
      </form>

      <div className={style.links}>
        {mode === 'signIn' && (
          <>
            <button type="button" className={style.link} onClick={() => switchMode('signUp')}>
              <FormattedMessage id="layout.auth.toSignUp" />
            </button>
            <button type="button" className={style.link} onClick={() => switchMode('forgot')}>
              <FormattedMessage id="layout.auth.toForgot" />
            </button>
          </>
        )}
        {mode !== 'signIn' && (
          <button type="button" className={style.link} onClick={() => switchMode('signIn')}>
            <FormattedMessage id="layout.auth.toSignIn" />
          </button>
        )}
      </div>
    </Modal>
  );
}
