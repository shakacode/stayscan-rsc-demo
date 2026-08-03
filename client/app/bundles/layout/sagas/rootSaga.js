import { all, fork } from 'redux-saga/effects';
import autocompleteSaga from './autocompleteSaga';
import alertsSaga from './alertsSaga';

// Layout sagas run on every page; page bundles compose their own into the store's
// saga runner as needed.
export default function* rootSaga() {
  yield all([fork(autocompleteSaga), fork(alertsSaga)]);
}
