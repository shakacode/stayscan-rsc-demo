import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl, FormattedMessage } from 'react-intl';
import Modal from '../../../styleguide/components/Modal/Modal';
import Button from '../../../styleguide/components/Button/Button';
import StepIndicator from './StepIndicator';
import ModalActions from './ModalActions';
import NegotiationStepBudget from './NegotiationStepBudget';
import NegotiationStepDates from './NegotiationStepDates';
import NegotiationStepReview from './NegotiationStepReview';
import * as style from './modals.module.scss';

const STEPS = 3;

// Price-negotiation wizard: budget → date flexibility → review → sent. A second
// legacy class component (mixed paradigms), owning the multi-step state.
class NegotiationWizardModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = { step: 0, targetPrice: '', flexibility: 'exact', error: null, submitted: false };
  }

  setTarget = (targetPrice) => this.setState({ targetPrice, error: null });

  setFlexibility = (flexibility) => this.setState({ flexibility });

  next = () => {
    const { step, targetPrice } = this.state;
    const { intl } = this.props;
    if (step === 0 && !(Number(targetPrice) > 0)) {
      this.setState({ error: intl.formatMessage({ id: 'listingDetail.negotiate.errorTarget' }) });
      return;
    }
    if (step === STEPS - 1) {
      this.setState({ submitted: true, step: STEPS });
      return;
    }
    this.setState((prev) => ({ step: prev.step + 1 }));
  };

  back = () => this.setState((prev) => ({ step: Math.max(0, prev.step - 1) }));

  render() {
    const { onClose, currency, intl } = this.props;
    const { step, targetPrice, flexibility, error, submitted } = this.state;

    return (
      <Modal
        isOpen
        onClose={onClose}
        title={intl.formatMessage({
          id: submitted ? 'listingDetail.negotiate.sentTitle' : 'listingDetail.negotiate.title',
        })}
        testId="negotiation-modal"
      >
        {!submitted && <StepIndicator total={STEPS} current={step} />}

        {step === 0 && (
          <NegotiationStepBudget value={targetPrice} error={error} onChange={this.setTarget} />
        )}
        {step === 1 && <NegotiationStepDates value={flexibility} onChange={this.setFlexibility} />}
        {step === 2 && (
          <NegotiationStepReview
            targetPrice={targetPrice}
            flexibility={flexibility}
            currency={currency}
          />
        )}
        {submitted && (
          <div className={style.success} data-test-id="negotiate-sent">
            <div className={style.successMark} aria-hidden="true">
              ✓
            </div>
            <p className={style.prose}>
              <FormattedMessage id="listingDetail.negotiate.sentBody" />
            </p>
          </div>
        )}

        <ModalActions>
          {submitted ? (
            <Button variant="primary" onClick={onClose}>
              <FormattedMessage id="listingDetail.modal.done" />
            </Button>
          ) : (
            <>
              {step > 0 && (
                <Button variant="ghost" onClick={this.back}>
                  <FormattedMessage id="listingDetail.modal.back" />
                </Button>
              )}
              <Button variant="primary" onClick={this.next} data-test-id="negotiate-next">
                <FormattedMessage
                  id={
                    step === STEPS - 1
                      ? 'listingDetail.negotiate.submit'
                      : 'listingDetail.negotiate.next'
                  }
                />
              </Button>
            </>
          )}
        </ModalActions>
      </Modal>
    );
  }
}

NegotiationWizardModal.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  intl: PropTypes.object.isRequired,
  currency: PropTypes.string,
  onClose: PropTypes.func.isRequired,
};

export default injectIntl(NegotiationWizardModal);
