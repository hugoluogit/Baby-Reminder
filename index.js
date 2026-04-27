// Polyfill browser globals missing in Hermes (Metro HMR client needs them)
if (typeof window !== 'undefined') {
  if (!window.location) {
    const devUrl = 'http://localhost:8081';
    window.location = {
      protocol: 'http:',
      hostname: 'localhost',
      port: '8081',
      host: 'localhost:8081',
      href: devUrl + '/',
      origin: devUrl,
      pathname: '/',
      search: '',
      hash: '',
      ancestorOrigins: {},
      assign: () => {},
      reload: () => {},
      replace: () => {},
      toString: () => devUrl + '/',
    };
  }
  if (!window.document) {
    window.document = {
      createElement: () => ({
        src: '',
        set onload(fn) { if (fn) setTimeout(fn, 0); },
        get onload() { return null; },
        set onerror(fn) { if (fn) setTimeout(fn, 0); },
        get onerror() { return null; },
      }),
      head: {
        appendChild: () => {},
        removeChild: () => {},
      },
      documentElement: { style: {} },
      location: window.location,
    };
  }
}

import { registerRootComponent } from 'expo';

import App from './App';

registerRootComponent(App);
