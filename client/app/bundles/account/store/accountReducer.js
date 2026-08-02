export const SET_TAB = 'account/SET_TAB';
export const FIELD_CHANGED = 'account/FIELD_CHANGED';
export const SUBMIT = 'account/SUBMIT';
export const SUBMIT_SUCCESS = 'account/SUBMIT_SUCCESS';
export const DELETE_MODAL_TOGGLED = 'account/DELETE_MODAL_TOGGLED';

export const setTab = (tab) => ({ type: SET_TAB, tab });
export const fieldChanged = (field, value) => ({ type: FIELD_CHANGED, field, value });
export const submit = (tab) => ({ type: SUBMIT, tab });
export const submitSuccess = (tab) => ({ type: SUBMIT_SUCCESS, tab });
export const deleteModalToggled = (open) => ({ type: DELETE_MODAL_TOGGLED, open });

export const initialAccountState = {
  tab: 'profile',
  name: '',
  about: '',
  email: '',
  emailDeals: true,
  emailDigest: false,
  currentPassword: '',
  newPassword: '',
  savedTab: null,
  saving: false,
  deleteModalOpen: false,
};

// The /account settings state: the active tab, each tab's form fields, and
// the save status — an intentionally action-heavy, tabbed Redux slice.
export default function accountReducer(state = initialAccountState, action) {
  switch (action.type) {
    case SET_TAB:
      return { ...state, tab: action.tab, savedTab: null };
    case FIELD_CHANGED:
      return { ...state, [action.field]: action.value, savedTab: null };
    case SUBMIT:
      return { ...state, saving: true };
    case SUBMIT_SUCCESS:
      return {
        ...state,
        saving: false,
        savedTab: action.tab,
        currentPassword: '',
        newPassword: '',
      };
    case DELETE_MODAL_TOGGLED:
      return { ...state, deleteModalOpen: action.open };
    default:
      return state;
  }
}
