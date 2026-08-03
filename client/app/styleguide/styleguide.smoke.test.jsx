import React from 'react';
import { render } from '@testing-library/react';
import Input from './components/Input/Input';
import RadioRow from './components/RadioRow/RadioRow';
import Tooltip from './components/Tooltip/Tooltip';
import Badge from './components/Badge/Badge';
import Skeleton from './components/Skeleton/Skeleton';
import Spinner from './components/Spinner/Spinner';
import ToastHost from './components/Toast/Toast';
import * as icons from './icons';

// Compile + render smoke for the styleguide pieces that have no dedicated
// behavioural test, so a broken import/JSX in any of them fails fast.
describe('styleguide smoke', () => {
  it('renders the presentational components without crashing', () => {
    render(
      <div>
        <Input label="Email" />
        <RadioRow name="plan" value="premium" label="Premium" />
        <Tooltip label="Info">
          <button type="button">?</button>
        </Tooltip>
        <Badge variant="success">Book direct</Badge>
        <Skeleton width={120} />
        <Spinner />
        <ToastHost />
      </div>,
    );
  });

  it('exports every icon as a renderable component', () => {
    const names = Object.keys(icons);
    expect(names.length).toBeGreaterThanOrEqual(20);

    names.forEach((name) => {
      const Icon = icons[name];
      const { unmount } = render(<Icon title={name} />);
      unmount();
    });
  });
});
