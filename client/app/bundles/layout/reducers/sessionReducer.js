// Current user block from LayoutJson.user; auth flows update it after sign in/out.
export const SET_USER = 'layout/session/SET_USER';
export const CLEAR_USER = 'layout/session/CLEAR_USER';

export const setUser = (user) => ({ type: SET_USER, user });
export const clearUser = () => ({ type: CLEAR_USER });

const initialState = { user: null };

export default function sessionReducer(state = initialState, action) {
  switch (action.type) {
    case SET_USER:
      return { ...state, user: action.user };
    case CLEAR_USER:
      return { ...state, user: null };
    default:
      return state;
  }
}
