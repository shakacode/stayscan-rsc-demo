import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useIntl } from 'react-intl';
import Modal from '../../../../styleguide/components/Modal/Modal';
import cx from '../../../../styleguide/cx';
import { selectCurrency } from '../../selectors/layoutSelectors';
import { closeCurrencyModal, setCurrency } from '../../reducers/currencyModalReducer';
import * as style from './CurrencyModal.module.scss';

export default function CurrencyModal() {
  const dispatch = useDispatch();
  const intl = useIntl();
  const { open, current, currencies } = useSelector(selectCurrency);

  return (
    <Modal
      isOpen={open}
      onClose={() => dispatch(closeCurrencyModal())}
      title={intl.formatMessage({ id: 'layout.currency.title' })}
      testId="currency-modal"
      size="sm"
    >
      <ul className={style.list}>
        {currencies.map((currency) => (
          <li key={currency.code}>
            <button
              type="button"
              className={cx(style.item, currency.code === current && style.active)}
              aria-pressed={currency.code === current}
              onClick={() => dispatch(setCurrency(currency.code))}
            >
              <span className={style.code}>{currency.code}</span>
              <span className={style.symbol}>{currency.symbol}</span>
            </button>
          </li>
        ))}
      </ul>
    </Modal>
  );
}
