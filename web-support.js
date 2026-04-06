// Web compatibility shims
if (typeof window !== 'undefined') {
  // Polyfill for AsyncStorage on web
  if (!window.localStorage) {
    window.localStorage = {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
      clear: () => {},
    };
  }
}
