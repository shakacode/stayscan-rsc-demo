import { createConsumer } from '@rails/actioncable';

// Thin wrapper over the ActionCable consumer so the booking hook can subscribe to
// per-channel quote results and so tests can inject a fake in its place.
// One consumer per tab; subscribeToQuote returns an unsubscribe thunk.
let consumer = null;

function sharedConsumer() {
  if (!consumer) consumer = createConsumer();
  return consumer;
}

export default function subscribeToQuote(quoteId, { onUpdate, onConnected } = {}) {
  const subscription = sharedConsumer().subscriptions.create(
    { channel: 'QuotesChannel', quote_id: quoteId },
    {
      connected() {
        onConnected?.();
      },
      received(data) {
        onUpdate?.(data);
      },
    },
  );

  return () => subscription.unsubscribe();
}
