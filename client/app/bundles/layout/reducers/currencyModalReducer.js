// Currency picker modal. Seeded from LayoutJson (available currencies + current).
export const OPEN_CURRENCY_MODAL = 'layout/currency/OPEN';
export const CLOSE_CURRENCY_MODAL = 'layout/currency/CLOSE';
export const SET_CURRENCY = 'layout/currency/SET';

export const openCurrencyModal = () => ({ type: OPEN_CURRENCY_MODAL });
export const closeCurrencyModal = () => ({ type: CLOSE_CURRENCY_MODAL });
export const setCurrency = (code) => ({ type: SET_CURRENCY, code });

const initialState = { open: false, current: 'USD', currencies: [] };

export default function currencyModalReducer(state = initialState, action) {
  switch (action.type) {
    case OPEN_CURRENCY_MODAL:
      return { ...state, open: true };
    case CLOSE_CURRENCY_MODAL:
      return { ...state, open: false };
    case SET_CURRENCY:
      return { ...state, current: action.code, open: false };
    default:
      return state;
  }
}
