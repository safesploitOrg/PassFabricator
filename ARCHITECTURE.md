# 🧱 PassFabricator architecture

Current prepared version: **1.1.1**, based on upstream `64dafd372bc20cb5ebfe73beb4cdcc5f7a641524` (tag `v1.1`). Classification: **B+D**, highest change risk **T2**. SFW policy: **1.1.0**.

## Runtime and boundaries

The website is a static browser application. `public/index.html` imports `assets/js/main.js` as an ES module. The browser fetches local assets and, on demand, the bundled wordlist. There are no production npm dependencies, remote analysis endpoints, cookies, analytics or service workers in the reviewed source.

| Component | Responsibility | Boundary |
| --- | --- | --- |
| `main.js` | Initialise, bind events, select modes, load the wordlist and coordinate results | Browser events and asynchronous work |
| `modules/generate_password.js` | Character pools, rejection-sampled random indexes, shuffling, passphrase formatting and idealised generator-model helpers | Web Crypto and bundled wordlist |
| `modules/analyse_password.js` | Character detection, heuristic bit estimate, penalties, strength and feedback | Untrusted password string; no I/O |
| `modules/storage.js` | Allowlisted generator preferences, sanitisation and 60-day expiry | Untrusted localStorage JSON |
| `modules/ui.js` | Read controls, render metrics/feedback, clipboard and visibility | DOM, clipboard and browser input |

Passwords are kept in live page fields and temporary JavaScript variables. Preferences alone are persisted. Explicit Copy writes the generated password to the system clipboard. Clearing a field is not a guarantee of secure memory erasure or clipboard deletion.

## Entropy flow

Both generation paths now pass the resulting password to `analysePassword`. Generate displays that result's `entropyBits`; Analyse uses exactly the same analyser for pasted text. No generator settings, secret cache, history or provenance lookup participate in the display calculation. Pending generation cannot overwrite metrics or feedback while Analyse is active.

The separate `calculateGeneratedPasswordEntropy` and `calculatePassphraseEntropy` exports remain available for compatibility and theoretical reference tests. Neither is used for the website's displayed estimate. Their assumptions, the heuristic's limitations and the reason for this decision are in [docs/entropy.md](docs/entropy.md).

## Public and development files

Only `public/` contains website source. `npm run build` copies those bytes to `dist/`, adds the existing root `CNAME` and an empty `.nojekyll`, and records SHA-256 asset hashes outside the document root. It does not minify, rewrite HTML/CSS or inject dependencies. `npm run dev` serves this artifact on loopback with a small Node HTTP server. That server is development tooling, not the application backend.

`tests/`, scripts, policy, configuration, development SBOMs, manifests and reports stay outside the published root. npm packages and Python scanners are development/CI tools.

## Validation and deployment

The reusable CI workflow separates quality, unit/controller coverage, browser and security jobs. Its build job depends on all four. A manual Pages workflow checks the exact reviewed main-branch SHA, calls the full reusable workflow and deploys the artifact produced within that run. Only the final deployment job receives Pages/OIDC write permissions. Actions are pinned to full commit SHAs; npm lifecycle scripts are disabled.

Repository rulesets and environment reviewer settings cannot be established by YAML alone. They must be configured by the owner; this package does not claim they are active. Deployment approval, an observed successful hosted run and any unresolved release blockers are recorded separately from local tests.

## Preserved behaviour and technical debt

Website HTML, CSS, images, wordlist, generation algorithm, storage schema and analyser heuristics are unchanged. Only `public/assets/js/main.js` changes runtime behaviour for entropy consistency and pending Generate/Analyse result isolation. Read [the review](docs/review.md) for input bounds, Unicode/model limitations, four skipped hyphenated words, missing observed CSP and licensing uncertainty. Planned remediation is not described as implemented.
