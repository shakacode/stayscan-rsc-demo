// Diff two V8 heap snapshots and report the object categories that grew the
// most — the attribution step of a memory experiment. Snapshots come from
// renderer-profile.js (SIGUSR2). No deps; parses the .heapsnapshot JSON directly.
//
//   node analyze-snapshots.js tmp/heapsnapshots/before.heapsnapshot tmp/heapsnapshots/after.heapsnapshot

const fs = require('fs');

// Aggregate self_size by object name (constructor) and by node type.
function aggregate(file) {
  const snap = JSON.parse(fs.readFileSync(file, 'utf8'));
  const { node_fields: fields, node_types: types } = snap.snapshot.meta;
  const stride = fields.length;
  const typeIdx = fields.indexOf('type');
  const nameIdx = fields.indexOf('name');
  const sizeIdx = fields.indexOf('self_size');
  const typeNames = types[typeIdx]; // node_types[typeIdx] is the array of type strings
  const { nodes, strings } = snap;

  const byName = new Map();
  const byType = new Map();
  let total = 0;
  for (let i = 0; i < nodes.length; i += stride) {
    const size = nodes[i + sizeIdx];
    const name = strings[nodes[i + nameIdx]] || '(unknown)';
    const type = typeNames[nodes[i + typeIdx]] || '(type)';
    byName.set(name, (byName.get(name) || 0) + size);
    byType.set(type, (byType.get(type) || 0) + size);
    total += size;
  }
  return { byName, byType, total };
}

function topDeltas(before, after, limit = 25) {
  const keys = new Set([...before.keys(), ...after.keys()]);
  const rows = [];
  for (const key of keys) {
    const delta = (after.get(key) || 0) - (before.get(key) || 0);
    if (delta !== 0) rows.push({ key, delta, before: before.get(key) || 0, after: after.get(key) || 0 });
  }
  return rows.sort((a, b) => b.delta - a.delta).slice(0, limit);
}

const mb = (bytes) => (bytes / 1024 / 1024).toFixed(2).padStart(9);

function report(label, before, after) {
  console.log(`\n== ${label} (top growers, delta MB) ==`);
  for (const { key, delta, before: b, after: a } of topDeltas(before, after)) {
    console.log(`  ${mb(delta)}   ${key}   (${mb(b).trim()} -> ${mb(a).trim()})`);
  }
}

const [, , fileBefore, fileAfter] = process.argv;
if (!fileBefore || !fileAfter) {
  console.error('usage: node analyze-snapshots.js <before.heapsnapshot> <after.heapsnapshot>');
  process.exit(1);
}

const before = aggregate(fileBefore);
const after = aggregate(fileAfter);

console.log(`total self_size:  before=${mb(before.total).trim()}MB  after=${mb(after.total).trim()}MB  delta=${mb(after.total - before.total).trim()}MB`);
report('By node type', before.byType, after.byType);
report('By object name / constructor', before.byName, after.byName);
