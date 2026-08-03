import { delay, put, takeLatest } from 'redux-saga/effects';
import { SUBMIT, submitSuccess } from './accountReducer';

// Simulates the save round-trip so the tab shows a saving → saved transition.
// Real persistence (Devise account update) is a follow-up.
export function* onSubmit(action) {
  yield delay(300);
  yield put(submitSuccess(action.tab));
}

export default function* accountSaga() {
  yield takeLatest(SUBMIT, onSubmit);
}
