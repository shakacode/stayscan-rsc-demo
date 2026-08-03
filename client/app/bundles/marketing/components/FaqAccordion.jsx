import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import * as page from './marketing.module.scss';
import * as style from './FaqAccordion.module.scss';

// Accordion of Q&As using native <details> (keyboard + screen-reader friendly).
export default function FaqAccordion({ faqs }) {
  return (
    <section className={page.page}>
      <h1 className={page.title}>
        <FormattedMessage id="marketing.faq.title" />
      </h1>
      {faqs.map((item) => (
        <details key={item.id} className={style.faqItem}>
          <summary className={style.faqSummary}>{item.question}</summary>
          <p className={style.faqAnswer}>{item.answer}</p>
        </details>
      ))}
    </section>
  );
}

FaqAccordion.propTypes = {
  faqs: PropTypes.arrayOf(
    PropTypes.shape({ id: PropTypes.string, question: PropTypes.string, answer: PropTypes.string }),
  ).isRequired,
};
