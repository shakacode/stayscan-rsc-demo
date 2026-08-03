import React from 'react';
import { FormattedMessage } from 'react-intl';
import * as style from './sections.module.scss';

const STEPS = [1, 2, 3];

export default function Explainer() {
  return (
    <section className={style.section}>
      <h2 className={style.sectionTitle}>
        <FormattedMessage id="welcome.explainer.title" />
      </h2>
      <div className={style.steps}>
        {STEPS.map((n) => (
          <div key={n} className={style.step}>
            <span className={style.stepNum}>{n}</span>
            <h3>
              <FormattedMessage id={`welcome.explainer.step${n}Title`} />
            </h3>
            <p className={style.muted}>
              <FormattedMessage id={`welcome.explainer.step${n}Body`} />
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
