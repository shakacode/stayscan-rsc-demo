// The shared layout slice map, combined into every page store. Pages add
// their own reducers on top via createPageStore.
import navbar from './navbarReducer';
import session from './sessionReducer';
import authenticationModal from './authenticationModalReducer';
import autocomplete from './autocompleteReducer';
import currencyModal from './currencyModalReducer';
import alerts from './alertsReducer';
import surveyPrompt from './surveyPromptReducer';

const layoutReducers = {
  navbar,
  session,
  authenticationModal,
  autocomplete,
  currencyModal,
  alerts,
  surveyPrompt,
};

export default layoutReducers;
