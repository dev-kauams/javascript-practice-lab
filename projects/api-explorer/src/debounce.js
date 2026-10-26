/** Adia `fn` até `wait` ms sem novas chamadas. `.cancel()` descarta a chamada pendente. */
export function debounce(fn, wait = 400) {
  let timer = null;
  const debounced = (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      timer = null;
      fn(...args);
    }, wait);
  };
  debounced.cancel = () => {
    clearTimeout(timer);
    timer = null;
  };
  return debounced;
}
