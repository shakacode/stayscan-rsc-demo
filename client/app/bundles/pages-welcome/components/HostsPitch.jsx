import React from 'react';
import { FormattedMessage } from 'react-intl';
import Button from '../../../styleguide/components/Button/Button';
import * as style from './sections.module.scss';

export default function HostsPitch() {
  return (
    <section className={style.hosts}>
      <h2 className={style.sectionTitle}>
        <FormattedMessage id="welcome.hosts.title" />
      </h2>
      <p className={style.muted}>
        <FormattedMessage id="welcome.hosts.body" />
      </p>
      <p>
        <Button href="/host" variant="secondary">
          <FormattedMessage id="welcome.hosts.cta" />
        </Button>
      </p>
    </section>
  );
}
