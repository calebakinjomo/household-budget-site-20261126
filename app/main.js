// Hearth & Ledger — boot: render the page for the current hash route,
// and re-render whenever the hash changes (the nav links are hash routes).

import { route } from './views.js';

window.addEventListener('hashchange', route);
route();
