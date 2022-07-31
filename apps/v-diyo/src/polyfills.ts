/**
 * Polyfill stable language features. These imports will be optimized by `@babel/preset-env`.
 *
 * See: https://github.com/zloirock/core-js#babel
 */
import 'core-js/stable';
import 'regenerator-runtime/runtime';

import * as process from 'process';

(window as any).global = window;
(window as any).process = process;
(window as any).Buffer = [];
