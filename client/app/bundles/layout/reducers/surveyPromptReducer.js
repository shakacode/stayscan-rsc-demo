// "How's it going?" feedback popup shown after engagement; dismissible for the session.
export const OPEN_FEEDBACK = 'layout/feedback/OPEN';
export const CLOSE_FEEDBACK = 'layout/feedback/CLOSE';
export const DISMISS_FEEDBACK = 'layout/feedback/DISMISS';

export const openFeedback = () => ({ type: OPEN_FEEDBACK });
export const closeFeedback = () => ({ type: CLOSE_FEEDBACK });
export const dismissFeedback = () => ({ type: DISMISS_FEEDBACK });

const initialState = { open: false, dismissed: false };

export default function surveyPromptReducer(state = initialState, action) {
  switch (action.type) {
    case OPEN_FEEDBACK:
      return state.dismissed ? state : { ...state, open: true };
    case CLOSE_FEEDBACK:
      return { ...state, open: false };
    case DISMISS_FEEDBACK:
      return { ...state, open: false, dismissed: true };
    default:
      return state;
  }
}
