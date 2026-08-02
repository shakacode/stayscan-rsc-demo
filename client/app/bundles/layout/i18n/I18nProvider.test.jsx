import React from 'react';
import { render, screen } from '@testing-library/react';
import { FormattedMessage } from 'react-intl';
import I18nProvider from './I18nProvider';
import en from './en.json';

describe('I18nProvider', () => {
  it('supplies catalog messages to react-intl consumers', () => {
    render(
      <I18nProvider messages={en}>
        <FormattedMessage id="layout.navbar.signIn" />
      </I18nProvider>,
    );

    expect(screen.getByText('Sign in')).toBeInTheDocument();
  });
});
