import React from 'react';
import SectionHeading from './SectionHeading';
import FaqItem from './FaqItem';
import * as style from './content.module.scss';

// Common questions about comparing + booking, answered inline. Static product
// copy (no listing-specific claims), fully localized.
const ITEMS = [
  'howCompare',
  'livePrices',
  'bookDirect',
  'protected',
  'fees',
  'cancel',
  'contactHost',
  'priceDrop',
];

export default function ListingFaq() {
  return (
    <section className={style.section} data-test-id="listing-faq">
      <SectionHeading titleId="listingDetail.faq.title" />
      {ITEMS.map((key) => (
        <FaqItem
          key={key}
          questionId={`listingDetail.faq.${key}.q`}
          answerId={`listingDetail.faq.${key}.a`}
        />
      ))}
    </section>
  );
}
