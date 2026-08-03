import React from 'react';
import { FormattedMessage } from 'react-intl';
import SectionHeading from './SectionHeading';
import * as style from './content.module.scss';

// "Good to know" guidance for comparing + booking safely. Generic product copy.
const POINTS = [
  'compareAll',
  'messageFirst',
  'realTime',
  'directTradeoff',
  'protection',
  'flexible',
];

export default function GoodToKnow() {
  return (
    <section className={style.section} data-test-id="good-to-know">
      <SectionHeading titleId="listingDetail.goodToKnow.title" />
      <ul className={style.tipList}>
        {POINTS.map((key) => (
          <li key={key} className={style.tip}>
            <span aria-hidden="true" className={style.tipMark}>
              •
            </span>
            <FormattedMessage id={`listingDetail.goodToKnow.${key}`} />
          </li>
        ))}
      </ul>
    </section>
  );
}
