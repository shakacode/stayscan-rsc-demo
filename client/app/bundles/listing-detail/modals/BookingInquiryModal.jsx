import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl, FormattedMessage } from 'react-intl';
import Modal from '../../../styleguide/components/Modal/Modal';
import Button from '../../../styleguide/components/Button/Button';
import StepIndicator from './StepIndicator';
import ModalActions from './ModalActions';
import InquiryForm from './InquiryForm';
import InquirySummary from './InquirySummary';
import InquirySuccess from './InquirySuccess';

const STEPS = 3;
const EMAIL = /.+@.+\..+/;

// Booking inquiry: form → review → success. A legacy class component (mixed
// paradigms) since it owns a small multi-step form state machine. injectIntl
// gives it `intl` without hooks, matching the class style.
class BookingInquiryModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = { step: 0, values: { name: '', email: '', message: '' }, errors: {} };
  }

  handleChange = (patch) => {
    this.setState((prev) => ({ values: { ...prev.values, ...patch }, errors: {} }));
  };

  validate() {
    const { values } = this.state;
    const errors = {};
    const { intl } = this.props;
    if (!values.name.trim())
      errors.name = intl.formatMessage({ id: 'listingDetail.inquiry.errorName' });
    if (!EMAIL.test(values.email))
      errors.email = intl.formatMessage({ id: 'listingDetail.inquiry.errorEmail' });
    return errors;
  }

  next = () => {
    const errors = this.validate();
    if (Object.keys(errors).length > 0) {
      this.setState({ errors });
      return;
    }
    this.setState((prev) => ({ step: prev.step + 1 }));
  };

  back = () => this.setState((prev) => ({ step: Math.max(0, prev.step - 1) }));

  render() {
    const { onClose, listing, intl } = this.props;
    const { step, values, errors } = this.state;
    const titleId =
      step === 2 ? 'listingDetail.inquiry.successTitle' : 'listingDetail.inquiry.title';

    return (
      <Modal
        isOpen
        onClose={onClose}
        title={intl.formatMessage({ id: titleId })}
        testId="booking-inquiry-modal"
      >
        {step < 2 && <StepIndicator total={STEPS} current={step} />}

        {step === 0 && <InquiryForm values={values} errors={errors} onChange={this.handleChange} />}
        {step === 1 && <InquirySummary values={values} listingTitle={listing.title} />}
        {step === 2 && <InquirySuccess name={values.name} />}

        <ModalActions>
          {step === 0 && (
            <>
              <Button variant="ghost" onClick={onClose}>
                <FormattedMessage id="listingDetail.modal.cancel" />
              </Button>
              <Button variant="primary" onClick={this.next} data-test-id="inquiry-next">
                <FormattedMessage id="listingDetail.inquiry.next" />
              </Button>
            </>
          )}
          {step === 1 && (
            <>
              <Button variant="ghost" onClick={this.back}>
                <FormattedMessage id="listingDetail.modal.back" />
              </Button>
              <Button variant="primary" onClick={this.next} data-test-id="inquiry-send">
                <FormattedMessage id="listingDetail.inquiry.send" />
              </Button>
            </>
          )}
          {step === 2 && (
            <Button variant="primary" onClick={onClose} data-test-id="inquiry-done">
              <FormattedMessage id="listingDetail.modal.done" />
            </Button>
          )}
        </ModalActions>
      </Modal>
    );
  }
}

BookingInquiryModal.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  intl: PropTypes.object.isRequired,
  listing: PropTypes.shape({ title: PropTypes.string }).isRequired,
  onClose: PropTypes.func.isRequired,
};

export default injectIntl(BookingInquiryModal);
