import { connect } from 'react-redux';
import { openAuthModal } from '../../layout/reducers/authenticationModalReducer';
import { selectIsAuthenticated } from '../../layout/selectors/layoutSelectors';
import UsageLimitModal from './UsageLimitModal';

// HOC `connect` container (mixed paradigms) for the usage-limit gate: pulls
// auth state + the plans/access payload out of the store and wires the sign-in
// dispatch, leaving UsageLimitModal purely presentational.
const mapStateToProps = (state, ownProps) => ({
  isAuthenticated: selectIsAuthenticated(state),
  plans: ownProps.listing.plans ?? [],
  access: ownProps.listing.quoteAllowance,
});

const mapDispatchToProps = (dispatch, ownProps) => ({
  onSignIn: () => {
    dispatch(openAuthModal('signIn'));
    ownProps.onClose();
  },
  onChoosePlan: () => {
    window.location.href = '/pricing';
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(UsageLimitModal);
