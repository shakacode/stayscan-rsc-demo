import { delay, put } from 'redux-saga/effects';
import { handleAlert, AUTO_DISMISS_MS } from './alertsSaga';
import { addAlert, dismissAlert } from '../reducers/alertsReducer';

describe('alertsSaga.handleAlert', () => {
  it('auto-dismisses a transient alert after the delay', () => {
    const gen = handleAlert(addAlert({ id: 'a1', message: 'Saved' }));

    expect(gen.next().value).toEqual(delay(AUTO_DISMISS_MS));
    expect(gen.next().value).toEqual(put(dismissAlert('a1')));
    expect(gen.next().done).toBe(true);
  });

  it('leaves a sticky alert alone', () => {
    const gen = handleAlert(addAlert({ id: 'a2', message: 'Stay', autoDismiss: false }));

    expect(gen.next().done).toBe(true);
  });
});
