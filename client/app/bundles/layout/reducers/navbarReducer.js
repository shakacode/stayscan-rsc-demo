// Navbar UI state (mobile menu, expanded search island).
export const TOGGLE_MOBILE_MENU = 'layout/navbar/TOGGLE_MOBILE_MENU';
export const SET_SEARCH_EXPANDED = 'layout/navbar/SET_SEARCH_EXPANDED';

export const toggleMobileMenu = () => ({ type: TOGGLE_MOBILE_MENU });
export const setSearchExpanded = (expanded) => ({ type: SET_SEARCH_EXPANDED, expanded });

const initialState = { mobileMenuOpen: false, searchExpanded: false };

export default function navbarReducer(state = initialState, action) {
  switch (action.type) {
    case TOGGLE_MOBILE_MENU:
      return { ...state, mobileMenuOpen: !state.mobileMenuOpen };
    case SET_SEARCH_EXPANDED:
      return { ...state, searchExpanded: action.expanded };
    default:
      return state;
  }
}
