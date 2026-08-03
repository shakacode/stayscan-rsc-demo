import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useIntl } from 'react-intl';
import cx from '../../../../styleguide/cx';
import CloseIcon from '../../../../styleguide/icons/CloseIcon';
import { selectVisibleAlerts } from '../../selectors/layoutSelectors';
import { dismissAlert } from '../../reducers/alertsReducer';
import * as style from './AlertsStrip.module.scss';

// Server flash + client alerts. alertsSaga auto-dismisses transient ones; these
// stay dismissible by hand.
export default function AlertsStrip() {
  const dispatch = useDispatch();
  const intl = useIntl();
  const alerts = useSelector(selectVisibleAlerts);

  if (alerts.length === 0) return null;

  return (
    <div className={style.strip} role="status" aria-live="polite">
      {alerts.map((alert) => (
        <div key={alert.id} className={cx(style.alert, style[alert.kind])}>
          <span>{alert.message}</span>
          <button
            type="button"
            className={style.dismiss}
            aria-label={intl.formatMessage({ id: 'layout.alerts.dismiss' })}
            onClick={() => dispatch(dismissAlert(alert.id))}
          >
            <CloseIcon size={16} />
          </button>
        </div>
      ))}
    </div>
  );
}
