const MEMO_CACHE_SENTINEL = Symbol.for('react.memo_cache_sentinel');

export function c(size) {
  const arr = new Array(size);
  for (let i = 0; i < size; i++) arr[i] = MEMO_CACHE_SENTINEL;
  return arr;
}

export default { c };
