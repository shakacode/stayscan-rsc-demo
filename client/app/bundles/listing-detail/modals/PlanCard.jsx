import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Button from '../../../styleguide/components/Button/Button';
import Money from '../format/Money';
import * as style from './modals.module.scss';

// One subscription plan option in the usage-limit modal.
export default function PlanCard({ plan, onChoose }) {
  return (
    <div className={style.plan} data-test-id={`plan-${plan.code}`}>
      <span className={style.planName}>{plan.name}</span>
      <span className={style.planPrice}>
        <Money amount={plan.price} currency="USD" />
        <FormattedMessage id="listingDetail.limit.perMonth" />
      </span>
      <Button variant="primary" size="sm" onClick={() => onChoose(plan.code)}>
        <FormattedMessage id="listingDetail.limit.choose" values={{ plan: plan.name }} />
      </Button>
    </div>
  );
}

PlanCard.propTypes = {
  plan: PropTypes.shape({ code: PropTypes.string, name: PropTypes.string, price: PropTypes.number })
    .isRequired,
  onChoose: PropTypes.func.isRequired,
};
