# 🧪 Testing and quality gates

## Prerequisites and commands

Use Node **24 or 26** and npm with the committed lockfile. Runtime website assets need no npm dependencies. Python **3.12** is used for Semgrep and scanner gate tests; the CI Gitleaks installer supports Linux x64.

```bash
npm ci --ignore-scripts
npm run check
npm run audit
npx --no-install playwright install --with-deps chromium firefox webkit
npm run test:browser
```

`npm run check` runs ESLint, unit/controller tests with coverage and the static build. The browser suite serves `dist/`, so build it before running browsers. CI also tests Node 26; only versions recorded in `verification.md` were actually run locally.

For focused runs:

```bash
npm test -- tests/controller.test.js
npm run test:browser -- --project=firefox-desktop
npm run test:browser -- --project='chromium-*'
```

For security tools, install into a virtual environment and activate it, then install Gitleaks for your platform. CI uses:

```bash
python3 -m venv .venv
. .venv/bin/activate
python -m pip install semgrep==1.184.0
bash scripts/install-gitleaks.sh "$PWD/.tools"
export PATH="$PWD/.tools:$PATH"
bash scripts/check-security-gates.sh
npm run security:sast
gitleaks git --redact --exit-code 1 .
npm run security:secrets
```

The scanner gate proof uses temporary synthetic fixtures and requires exit status **1**, distinct from execution/configuration errors. It asserts that all five SAST rule IDs fired and that Gitleaks rejected a constructed fake token. No real credentials are needed. On macOS, install the matching [official Gitleaks release](https://github.com/gitleaks/gitleaks/releases/tag/v8.30.1) and verify its upstream checksum; the bundled installer intentionally refuses a different platform.

## Coverage and meaningful assertions

| Layer | What is asserted |
| --- | --- |
| Original unit tests | Existing generation, analysis, wordlist formatting and storage behaviour |
| Security/reference tests | Web Crypto unavailable/throwing, no weak fallback, biased-tail rejection, every character mask, UI length boundaries, malformed/non-ASCII/large inputs, independent small entropy values and usable wordlist count |
| Storage failures/privacy | Corrupt/expired/unavailable storage, preference defaults, allowlisting, no secret fields |
| Controller integration | Actual `main.js` and `ui.js` through a minimal DOM adapter; random and memorable round-trips and pending-generation isolation |
| Native browser tests | Actual asset loading/DOM, random and memorable settings, min/max lengths, same-input consistency, preference independence, network/privacy, failures/retry and navigation |
| Accessibility/layout | axe WCAG 2 A/AA, 2.1 AA and 2.2 AA tags for all three flows; keyboard focus and activation, mobile/tablet/desktop, reduced-motion preference and 200% text |

Coverage thresholds apply **per file** to `analyse_password.js`, `generate_password.js` and `storage.js`: 90% lines and statements, 95% functions, 85% branches. The controller and UI modules are exercised by integration/browser tests; the core coverage percentage is not a whole-website coverage claim. No baseline test was disabled to obtain a pass.

The browser matrix has nine projects: Chromium/Firefox/WebKit × 390×844, 768×1024 and 1440×900. These are viewport tests, not native iPhone/iPad certification or emulation of touch hardware. The 200% text test enlarges root text, not every browser's full zoom UI. Automated axe and keyboard checks do not establish complete WCAG conformance or full screen-reader usability.

Traces, screenshots and video are disabled in the general suite so unexpected user-entered data cannot be captured during local runs. Fixtures are synthetic. Test reports remain outside the published root.

## Environment diagnostics

`PASSFABRICATOR_TEST_URL` can point tests at a pre-started test server. Otherwise Playwright starts the bundled loopback server itself. `PASSFABRICATOR_WEB_ROOT` changes that development server's source for baseline comparisons; the default is `dist/`. `PASSFABRICATOR_PORT` changes its port. `PASSFABRICATOR_CHROMIUM_EXECUTABLE` optionally selects an installed Chromium for local diagnosis; CI installs the pinned Playwright browser builds.

Unavailable browsers or missing system libraries are **NOT RUN**, not clean results. Keep their CI jobs blocking and obtain the required results before release. See [verification.md](verification.md) for observed execution and [review.md](review.md) for outstanding controls.

## CI contract

`ci.yml` runs on main pushes, pull requests, manual checks and reusable calls. It has separate quality, Node matrix, browser matrix and security jobs; all must pass before building the Pages artifact. Uploading a report does not turn a failed test green. `static.yml` performs a reviewed exact-SHA release by calling the same complete workflow. No scan has `continue-on-error`, and no production job consumes an independently built unchecked site.

Configure required status checks and workflow/environment change protection in GitHub. Workflow YAML does not by itself prevent a maintainer from bypassing account governance. Hosted execution of this new workflow was outside the ZIP task and has not been observed.
