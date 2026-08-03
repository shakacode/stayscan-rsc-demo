// Auth modal flow (sign in / sign up / forgot password).
export const OPEN_AUTH_MODAL = 'layout/authModal/OPEN';
export const CLOSE_AUTH_MODAL = 'layout/authModal/CLOSE';
export const SET_AUTH_MODE = 'layout/authModal/SET_MODE';
export const SET_AUTH_ERROR = 'layout/authModal/SET_ERROR';

export const openAuthModal = (mode = 'signIn') => ({ type: OPEN_AUTH_MODAL, mode });
export const closeAuthModal = () => ({ type: CLOSE_AUTH_MODAL });
export const setAuthMode = (mode) => ({ type: SET_AUTH_MODE, mode });
export const setAuthError = (error) => ({ type: SET_AUTH_ERROR, error });

const initialState = { open: false, mode: 'signIn', error: null, submitting: false };

export default function authenticationModalReducer(state = initialState, action) {
  switch (action.type) {
    case OPEN_AUTH_MODAL:
      return { ...state, open: true, mode: action.mode, error: null };
    case CLOSE_AUTH_MODAL:
      return { ...state, open: false, error: null };
    case SET_AUTH_MODE:
      return { ...state, mode: action.mode, error: null };
    case SET_AUTH_ERROR:
      return { ...state, error: action.error, submitting: false };
    default:
      return state;
  }
}
