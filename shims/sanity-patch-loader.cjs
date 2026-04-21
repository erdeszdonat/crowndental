module.exports = function (source) {
  if (!source.includes('useEffectEvent')) return source;
  return source.replace(
    /import\s*\{([^}]*)\}\s*from\s*["']react["']\s*;?/g,
    (m, names) => {
      if (!names.includes('useEffectEvent')) return m;
      const kept = names.split(',').map(s => s.trim()).filter(s => s && !s.includes('useEffectEvent')).join(', ');
      const aliasMatch = names.match(/useEffectEvent\s+as\s+(\w+)/);
      const localName = aliasMatch ? aliasMatch[1] : 'useEffectEvent';
      return `import {${kept}} from "react";\nvar ${localName} = function(fn){return fn;};`;
    }
  );
};
