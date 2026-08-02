import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import cx from '../../../styleguide/cx';
import Button from '../../../styleguide/components/Button/Button';
import * as page from './marketing.module.scss';
import * as style from './PricingTable.module.scss';

export default function PricingTable({ premiumPrice, businessPrice }) {
  const plans = [
    {
      key: 'free',
      price: <FormattedMessage id="marketing.pricing.free" />,
      nameId: 'marketing.pricing.freeName',
      blurbId: 'marketing.pricing.freeBlurb',
    },
    {
      key: 'premium',
      price: (
        <FormattedMessage id="marketing.pricing.perMonth" values={{ price: `$${premiumPrice}` }} />
      ),
      nameId: 'marketing.pricing.premiumName',
      blurbId: 'marketing.pricing.premiumBlurb',
      featured: true,
    },
    {
      key: 'business',
      price: (
        <FormattedMessage id="marketing.pricing.perMonth" values={{ price: `$${businessPrice}` }} />
      ),
      nameId: 'marketing.pricing.businessName',
      blurbId: 'marketing.pricing.businessBlurb',
    },
  ];

  return (
    <section className={page.page}>
      <h1 className={page.title}>
        <FormattedMessage id="marketing.pricing.title" />
      </h1>
      <div className={style.plans}>
        {plans.map((plan) => (
          <div key={plan.key} className={cx(style.plan, plan.featured && style.featured)}>
            <p className={style.name}>
              <FormattedMessage id={plan.nameId} />
            </p>
            <p className={style.price}>{plan.price}</p>
            <p className={style.blurb}>
              <FormattedMessage id={plan.blurbId} />
            </p>
            <Button variant={plan.featured ? 'primary' : 'secondary'} className={style.cta}>
              <FormattedMessage id="marketing.pricing.choose" />
            </Button>
          </div>
        ))}
      </div>
    </section>
  );
}

PricingTable.propTypes = {
  premiumPrice: PropTypes.number,
  businessPrice: PropTypes.number,
};

PricingTable.defaultProps = {
  premiumPrice: 49,
  businessPrice: 99,
};
