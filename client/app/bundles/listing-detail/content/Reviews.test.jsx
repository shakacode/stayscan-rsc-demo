import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { IntlProvider } from 'react-intl';
import Reviews from './Reviews';
import ReviewAiTabs from './ReviewAiTabs';
import layoutEn from '../../layout/i18n/en.json';
import detailEn from '../i18n/en.json';

const messages = { ...layoutEn, ...detailEn };

function wrap(ui) {
  return render(
    <IntlProvider locale="en" defaultLocale="en" messages={messages}>
      {ui}
    </IntlProvider>,
  );
}

const page1 = {
  page: 1,
  perPage: 2,
  total: 4,
  items: [
    { id: 1, author: 'Ana', rating: 5, content: 'Great', provider: 'airhive' },
    { id: 2, author: 'Bob', rating: 4, content: 'Good', provider: 'vacario' },
  ],
  ratingBreakdown: { 1: 0, 2: 0, 3: 0, 4: 1, 5: 3 },
  aiSummary: 'Guests love the view.',
};

describe('Reviews', () => {
  it('renders the seeded first page and fetches the next page on demand', async () => {
    const fetchReviews = jest.fn().mockResolvedValue({
      page: 2,
      perPage: 2,
      total: 4,
      items: [{ id: 3, author: 'Cy', rating: 5, content: 'Loved it', provider: 'airhive' }],
    });

    wrap(
      <Reviews listingId={7} reviews={page1} aiContent={{}} rating={4.8} deps={{ fetchReviews }} />,
    );

    expect(screen.getByText('Ana')).toBeInTheDocument();
    expect(screen.getByText('Guests love the view.')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('pagination-next'));

    await waitFor(() => expect(screen.getByText('Cy')).toBeInTheDocument());
    expect(fetchReviews).toHaveBeenCalledWith(7, 2);
    expect(screen.queryByText('Ana')).not.toBeInTheDocument();
  });
});

describe('ReviewAiTabs', () => {
  it('renders the structured host + neighborhood blocks and switches tabs', () => {
    wrap(
      <ReviewAiTabs
        reviewsSummary="Summary text"
        fromTheHost={{ summary: 'Host note', highlights: ['Self check-in'] }}
        nearbyHighlights={{
          near: 'Kivora',
          items: [{ name: 'Reef boardwalk', blurb: 'sunset strolls' }],
        }}
      />,
    );

    expect(screen.getByText('Summary text')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('tab', { name: 'The neighborhood' }));
    expect(screen.getByText('Reef boardwalk')).toBeInTheDocument();
    expect(screen.getByText(/sunset strolls/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('tab', { name: 'About the host' }));
    expect(screen.getByText('Host note')).toBeInTheDocument();
    expect(screen.getByText('Self check-in')).toBeInTheDocument();
  });

  it('drops tabs whose AI content is absent', () => {
    wrap(<ReviewAiTabs reviewsSummary="Only summary" />);

    expect(screen.getByText('Only summary')).toBeInTheDocument();
    expect(screen.queryByRole('tab', { name: 'The neighborhood' })).not.toBeInTheDocument();
    expect(screen.queryByRole('tab', { name: 'About the host' })).not.toBeInTheDocument();
  });
});
