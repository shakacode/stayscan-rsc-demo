// Destination autocomplete (matview-backed). The query drives a debounced fetch
// in autocompleteSaga; results feed the searchbar island.
export const SET_QUERY = 'layout/autocomplete/SET_QUERY';
export const FETCH_START = 'layout/autocomplete/FETCH_START';
export const FETCH_SUCCESS = 'layout/autocomplete/FETCH_SUCCESS';
export const FETCH_FAILURE = 'layout/autocomplete/FETCH_FAILURE';
export const SET_ACTIVE_INDEX = 'layout/autocomplete/SET_ACTIVE_INDEX';
export const CLEAR = 'layout/autocomplete/CLEAR';

export const setQuery = (query) => ({ type: SET_QUERY, query });
export const fetchStart = () => ({ type: FETCH_START });
export const fetchSuccess = (results) => ({ type: FETCH_SUCCESS, results });
export const fetchFailure = (error) => ({ type: FETCH_FAILURE, error });
export const setActiveIndex = (index) => ({ type: SET_ACTIVE_INDEX, index });
export const clearAutocomplete = () => ({ type: CLEAR });

const initialState = { query: '', results: [], loading: false, activeIndex: -1, error: null };

export default function autocompleteReducer(state = initialState, action) {
  switch (action.type) {
    case SET_QUERY:
      return { ...state, query: action.query, activeIndex: -1 };
    case FETCH_START:
      return { ...state, loading: true, error: null };
    case FETCH_SUCCESS:
      return { ...state, loading: false, results: action.results, activeIndex: -1 };
    case FETCH_FAILURE:
      return { ...state, loading: false, error: action.error, results: [] };
    case SET_ACTIVE_INDEX:
      return { ...state, activeIndex: action.index };
    case CLEAR:
      return initialState;
    default:
      return state;
  }
}
