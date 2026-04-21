// ESM shim: re-exports all of React + adds useEffectEvent stub for Sanity v5
export * from '../node_modules/react/index.js';
export { default } from '../node_modules/react/index.js';
export const useEffectEvent = function useEffectEvent(fn) { return fn; };
