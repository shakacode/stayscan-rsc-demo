import React from 'react';
import { FormattedMessage } from 'react-intl';
import Button from '../../../styleguide/components/Button/Button';
import * as page from './marketing.module.scss';
import * as style from './NotFound.module.scss';

export default function NotFound() {
  return (
    <section className={page.page}>
      <div className={style.notFound}>
        <h1 className={page.title}>
          <FormattedMessage id="marketing.notFound.title" />
        </h1>
        <p className={style.body}>
          <FormattedMessage id="marketing.notFound.body" />
        </p>
        <Button href="/" variant="primary">
          <FormattedMessage id="marketing.notFound.home" />
        </Button>
      </div>
    </section>
  );
}
