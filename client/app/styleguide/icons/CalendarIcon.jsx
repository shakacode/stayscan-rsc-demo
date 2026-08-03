import createIcon from './createIcon';

export default createIcon('CalendarIcon', [
  ['rect', { x: 3, y: 4, width: 18, height: 18, rx: 2 }],
  ['path', { d: 'M16 2v4' }],
  ['path', { d: 'M8 2v4' }],
  ['path', { d: 'M3 10h18' }],
]);
