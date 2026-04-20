// Webpack shim: adds missing useEffectEvent stub so Sanity v5 can build with React 18/19 stable
const r = require('../node_modules/react');
module.exports = Object.assign({}, r, {
  useEffectEvent: r.useEffectEvent || function useEffectEvent(fn) { return fn; },
});
