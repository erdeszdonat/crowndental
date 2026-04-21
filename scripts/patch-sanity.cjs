const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..', 'node_modules', 'sanity', 'lib');

function walk(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(p));
    else if (entry.isFile() && p.endsWith('.js')) out.push(p);
  }
  return out;
}

if (!fs.existsSync(root)) {
  console.log('[patch-sanity] no sanity/lib, skipping');
  process.exit(0);
}

let patched = 0;
for (const file of walk(root)) {
  let src = fs.readFileSync(file, 'utf8');
  if (!src.includes('useEffectEvent')) continue;

  const out = src.replace(
    /import\s+([^;]*?)\s+from\s*["']react["'];?/g,
    (match, clause) => {
      if (!clause.includes('useEffectEvent')) return match;
      const braceMatch = clause.match(/\{([^}]*)\}/);
      if (!braceMatch) return match;
      const names = braceMatch[1];
      const filtered = names
        .split(',')
        .map(s => s.trim())
        .filter(s => s && !/^useEffectEvent(\s+as\s+\w+)?$/.test(s))
        .join(', ');
      const aliasMatch = names.match(/useEffectEvent\s+as\s+(\w+)/);
      const localName = aliasMatch ? aliasMatch[1] : 'useEffectEvent';
      const newClause = clause.replace(/\{[^}]*\}/, `{ ${filtered} }`);
      return `import ${newClause} from "react";\nvar ${localName} = function(fn){return fn;};`;
    }
  );

  if (out !== src) {
    fs.writeFileSync(file, out);
    patched++;
  }
}

console.log(`[patch-sanity] patched ${patched} file(s)`);
