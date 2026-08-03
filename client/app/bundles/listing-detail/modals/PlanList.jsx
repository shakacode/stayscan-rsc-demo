import React from 'react';
import PropTypes from 'prop-types';
import PlanCard from './PlanCard';
import * as style from './modals.module.scss';

// The grid of subscription plans (from the listing-detail view plans payload).
export default function PlanList({ plans, onChoose }) {
  return (
    <div className={style.plans} data-test-id="plan-list">
      {plans.map((plan) => (
        <PlanCard key={plan.code} plan={plan} onChoose={onChoose} />
      ))}
    </div>
  );
}

PlanList.propTypes = {
  plans: PropTypes.arrayOf(PropTypes.object).isRequired,
  onChoose: PropTypes.func.isRequired,
};
