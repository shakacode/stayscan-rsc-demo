// Join truthy class names. Local so the styleguide has no runtime dependency on
// a hoisted `clsx`. Usage: cx(style.base, active && style.active, className).
export default function cx(...names) {
  return names.filter(Boolean).join(' ');
}
