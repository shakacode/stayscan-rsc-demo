import { takeEvery, delay, put } from 'redux-saga/effects';
import { ADD_ALERT, dismissAlert } from '../reducers/alertsReducer';

export const AUTO_DISMISS_MS = 5000;

export function* handleAlert(action) {
  if (!action.alert.autoDismiss) return;
  yield delay(AUTO_DISMISS_MS);
  yield put(dismissAlert(action.alert.id));
}

export default function* alertsSaga() {
  yield takeEvery(ADD_ALERT, handleAlert);
}
