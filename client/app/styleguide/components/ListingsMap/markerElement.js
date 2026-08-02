// Build a price-pill marker DOM node shared by both map engines, so the marker
// look + interactions (hover, click) are identical regardless of engine. Inline
// styles keep it self-contained (no external CSS / tiles needed).
export function createMarkerElement({ id, price, active, onHover, onClick }) {
  const el = document.createElement('button');
  el.type = 'button';
  el.dataset.testId = `map-marker-${id}`;
  el.textContent = price != null ? `$${Math.round(price)}` : '—';
  el.style.cssText = [
    `background:${active ? '#2f7d55' : '#ffffff'}`,
    `color:${active ? '#ffffff' : '#1a1a1a'}`,
    'border:1px solid #2f7d55',
    'border-radius:14px',
    'padding:2px 8px',
    'font-weight:700',
    'font-size:12px',
    'cursor:pointer',
    'box-shadow:0 1px 4px rgba(0,0,0,0.2)',
    active ? 'z-index:400' : 'z-index:300',
  ].join(';');
  el.addEventListener('mouseenter', () => onHover(id));
  el.addEventListener('mouseleave', () => onHover(null));
  el.addEventListener('click', () => onClick && onClick(id));
  return el;
}
