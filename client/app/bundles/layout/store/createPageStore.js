import { legacy_createStore as createStore, applyMiddleware, combineReducers } from 'redux';
import createSagaMiddleware from 'redux-saga';
import { all, fork } from 'redux-saga/effects';
import layoutReducers from '../reducers';
import rootSaga from '../sagas/rootSaga';

// Every page store = shared layout slices + the page's own reducers,
// preloaded from server props (LayoutJson + page JSON) and running the layout
// sagas plus the page's own saga (e.g. the browse view). Returns a standard redux store
// with the saga task attached.
export default function createPageStore(pageReducers = {}, preloadedState = {}, pageSaga = null) {
  const sagaMiddleware = createSagaMiddleware();
  const rootReducer = combineReducers({ ...layoutReducers, ...pageReducers });
  const store = createStore(rootReducer, preloadedState, applyMiddleware(sagaMiddleware));
  store.sagaTask = sagaMiddleware.run(function* pageSagas() {
    yield all([fork(rootSaga), pageSaga && fork(pageSaga)].filter(Boolean));
  });
  return store;
}
