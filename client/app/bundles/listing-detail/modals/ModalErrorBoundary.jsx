import React from 'react';
import PropTypes from 'prop-types';
import ModalErrorFallback from './ModalErrorFallback';

// Class error boundary (mixed paradigms) around the lazy modal subtree: a
// chunk-load failure or a render error in one modal is contained here and shown
// as a dismissible fallback rather than crashing the page.
export default class ModalErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidUpdate(prevProps) {
    // Reset when a different modal opens so a prior failure doesn't stick.
    if (prevProps.resetKey !== this.props.resetKey && this.state.hasError) {
      this.setState({ hasError: false });
    }
  }

  render() {
    const { children, onClose } = this.props;
    if (this.state.hasError) return <ModalErrorFallback onClose={onClose} />;
    return children;
  }
}

ModalErrorBoundary.propTypes = {
  children: PropTypes.node,
  onClose: PropTypes.func.isRequired,
  resetKey: PropTypes.string,
};
