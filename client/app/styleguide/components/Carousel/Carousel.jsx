import React, { useState } from 'react';
import PropTypes from 'prop-types';
import cx from '../../cx';
import * as style from './Carousel.module.scss';

// Custom carousel (no library): a translated track with prev/next + dot paging,
// wrap-around. Keys come from the data, never the array index.
export default function Carousel({
  items,
  renderItem,
  getKey = (item, index) => item?.id ?? index,
  ariaLabel,
}) {
  const [index, setIndex] = useState(0);
  const count = items.length;
  const go = (next) => setIndex(((next % count) + count) % count);

  if (count === 0) return null;

  return (
    <section className={style.carousel} aria-roledescription="carousel" aria-label={ariaLabel}>
      <div className={style.viewport}>
        <ul className={style.track} style={{ transform: `translateX(-${index * 100}%)` }}>
          {items.map((item, i) => (
            <li key={getKey(item, i)} className={style.slide} aria-hidden={i !== index}>
              {renderItem(item, i)}
            </li>
          ))}
        </ul>
      </div>
      <button
        type="button"
        className={cx(style.arrow, style.prev)}
        aria-label="Previous"
        onClick={() => go(index - 1)}
      >
        &lsaquo;
      </button>
      <button
        type="button"
        className={cx(style.arrow, style.next)}
        aria-label="Next"
        onClick={() => go(index + 1)}
      >
        &rsaquo;
      </button>
      <div className={style.dots}>
        {items.map((item, i) => (
          <button
            key={getKey(item, i)}
            type="button"
            className={cx(style.dot, i === index && style.active)}
            aria-label={`Go to slide ${i + 1}`}
            aria-current={i === index}
            onClick={() => setIndex(i)}
          />
        ))}
      </div>
    </section>
  );
}

Carousel.propTypes = {
  items: PropTypes.arrayOf(PropTypes.any).isRequired,
  renderItem: PropTypes.func.isRequired,
  getKey: PropTypes.func,
  ariaLabel: PropTypes.string,
};
