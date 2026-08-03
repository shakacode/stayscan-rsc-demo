import React, { useId, useState } from 'react';
import { useIntl, FormattedMessage } from 'react-intl';
import Input from '../../../styleguide/components/Input/Input';
import Button from '../../../styleguide/components/Button/Button';
import * as page from './marketing.module.scss';
import * as style from './ContactForm.module.scss';

function csrfToken() {
  return document.querySelector('meta[name="csrf-token"]')?.content ?? '';
}

// Contact form. Submits over fetch (CSRF read at submit time, so no token in the
// SSR markup to mismatch on hydration); the controller mails the message.
export default function ContactForm() {
  const intl = useIntl();
  const messageId = useId();
  const [fields, setFields] = useState({ name: '', email: '', message: '' });
  const [sent, setSent] = useState(false);

  const update = (key) => (event) =>
    setFields((current) => ({ ...current, [key]: event.target.value }));

  const submit = async (event) => {
    event.preventDefault();
    await fetch('/contact', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'X-CSRF-Token': csrfToken(),
      },
      credentials: 'same-origin',
      body: JSON.stringify({ contact: fields }),
    });
    setSent(true);
  };

  return (
    <section className={page.page}>
      <h1 className={page.title}>
        <FormattedMessage id="marketing.contact.title" />
      </h1>
      {sent ? (
        <p className={style.notice} role="status">
          <FormattedMessage id="marketing.contact.title" /> &mdash; thanks, we&rsquo;ll be in touch.
        </p>
      ) : (
        <form className={style.form} onSubmit={submit}>
          <Input
            label={intl.formatMessage({ id: 'marketing.contact.name' })}
            value={fields.name}
            onChange={update('name')}
            required
          />
          <Input
            label={intl.formatMessage({ id: 'marketing.contact.email' })}
            type="email"
            value={fields.email}
            onChange={update('email')}
            required
          />
          <div className={style.field}>
            <label className={style.label} htmlFor={messageId}>
              <FormattedMessage id="marketing.contact.message" />
            </label>
            <textarea
              id={messageId}
              className={style.textarea}
              value={fields.message}
              onChange={update('message')}
              required
            />
          </div>
          <Button type="submit" variant="primary">
            <FormattedMessage id="marketing.contact.submit" />
          </Button>
        </form>
      )}
    </section>
  );
}
