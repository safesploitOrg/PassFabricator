# 📝 Changelog

Dates use Europe/London. Versions follow SemVer from this prepared update onwards. Historical entries are reconstructed from the repository's actual tags and commits; they are not invented releases. See [commit provenance](docs/history.md).

## [1.1.1] — 2026-11-06 — prepared, not tagged or deployed

### Fixed

- Generate and Analyse now display the same `analysePassword(password).entropyBits` estimate for an identical password, including memorable passphrases. Generate labels this **Estimated entropy**, matching Analyse.
- Pending generation no longer overwrites Analyse metrics or feedback after switching modes.
- Corrected package/lock version drift: the upstream package still said `1.0.0`, despite the latest `v1.1` tag.
- Updated vulnerable development tooling and locked exact versions. The full npm audit went from 13 affected package entries (3 critical, 5 high, 4 moderate, 1 low) to zero on the verification date. A documented `minimatch` 11.0.5 override addresses ESLint's transitive advisory.
- Removed the unsupported README claim that an empty `LICENSE` establishes an MIT licence; no licence was chosen or changed.

### Added

- SFW v1.1.0 adoption: project `AGENTS.md`, canonical engineering policy, architecture, threat model, security policy, testing, operations, review findings and verification evidence.
- Regression tests for both entropy paths and pending-mode updates; secure-random failure/rejection tests, malformed inputs, reference values, bundled wordlist integrity and preference privacy/failure cases.
- Playwright browser/viewport projects for Chromium, Firefox and WebKit at mobile, tablet and desktop sizes, including axe, keyboard, privacy, reduced-motion and enlarged-text checks.
- ESLint, per-file core coverage gates, blocking dependency/SAST/secret gates, controlled synthetic scanner-failure checks and Dependabot configuration.
- A static build that preserves public asset bytes, includes the existing custom domain file, and produces external asset hashes and a development SBOM in CI.

### Release operations

- Pages deployment is now a manual owner-reviewed operation for an exact main-branch SHA. It runs the reusable CI workflow and can deploy only its validated artifact, with deployment permissions isolated to the final job.
- Required repository checks and environment reviewer settings still need owner configuration/verification. No live site, repository permissions, branch, tag or release was changed by preparing this ZIP.

### Preserved

- Website HTML, CSS, favicon images, wordlist, random/passphrase generation, analyser rules and storage schema. Only `public/assets/js/main.js` changes runtime behaviour.
- Generator-model entropy helper exports remain available separately from the shared UI estimate. Known heuristic limitations remain documented; consistency is not a new guarantee of true entropy.

## [1.1.0] — 2026-06-23 — historical tag `v1.1`

The repository's literal tag is `v1.1`, pointing to `64dafd3`. This changelog normalises it to `1.1.0`; it does not rename the tag. The earlier commit titled `v1.1` on 2026-05-28 is an implementation milestone within this tagged release.

### Added

- Memorable passphrases from the bundled EFF-style wordlist, configurable word count, delimiter, casing and i/o number substitution, with wordlist loading and error handling (`64dafd3`, 2026-06-23).
- Local password analysis with pattern feedback, modular browser ES modules, preference sanitisation/expiry, Vitest tests and Node 24/26 CI (`7354f23`, 2026-05-28).
- Responsive desktop layout, generator/analyser panels, analysis notes and default markup length change (`8bc4d8`, 2026-05-28).
- URL hash mode selection and aliases, including back/forward navigation handling (`35be76c`, 2026-05-28).
- README demonstration GIF (`f6ada64`, 2026-05-28).

### Changed / fixed

- Moved browser assets under `public/`, added a lockfile, corrected test import paths and adjusted Pages upload scope (`7354f23`, `c8e153c`, `96582b1`, `9d62767`).
- Used `globalThis.crypto` with an explicit availability check (`59318aa`, 2026-05-28).

## [1.0.0-local-standalone] — 2024-12-02 — historical tag

Exact historical tag: `v1.0.0-local-standalone`, pointing to `d4651f2`.

### Added / changed

- Initial client-side random password generator, generator controls, strength/entropy display, clipboard/visibility actions and styling (2024-11-12: `9afb0d2`, `32175fe`, `990a83d`, `44671b4`).
- Custom-domain CNAME setup (2024-11-12: `c329ae2`, `7b2bcf1`, `4aa57f5`). The add/delete/add sequence is infrastructure history, not three separate product releases.
- Ignore rules and the bundled EFF large wordlist (2024-12-02: `5505706`, `d4651f2`). Bundling the wordlist did not establish the later memorable-generator UI.

[1.1.1]: https://github.com/safesploitOrg/PassFabricator/compare/v1.1...main
[1.1.0]: https://github.com/safesploitOrg/PassFabricator/compare/v1.0.0-local-standalone...v1.1
[1.0.0-local-standalone]: https://github.com/safesploitOrg/PassFabricator/tree/v1.0.0-local-standalone
