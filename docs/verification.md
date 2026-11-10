# ✅ Verification and delivery record

Date: **2026-11-06, Europe/London**. Prepared source version: **1.1.1**, based on upstream `64dafd372bc20cb5ebfe73beb4cdcc5f7a641524`. Scope: implementation and a downloadable source ZIP. Profiles **B+D**; highest risk **T2**. No public-release approval is claimed.

## Observed checks

| Check | Result | Command / evidence |
| --- | --- | --- |
| Original unit suite | PASS | Baseline `npm test`: 24 tests |
| Baseline defect reproduction | EXPECTED FAIL | Three controller regressions on original runtime: random/memorable disagreement and pending Generate overwrite; both browser round-trips also failed against baseline public assets |
| Locked dependency installation | PASS | `npm ci --ignore-scripts --no-audit --no-fund`, Node 24.22.1 / npm 11.9.0 |
| ESLint | PASS | `npm run lint`, ESLint 10.14.0 with the documented safe minimatch override |
| Unit + controller integration | PASS | `npm run coverage`: **92 tests**, six files; original tests retained |
| Core coverage gates | PASS | Analysis/generation/storage combined: **98.54% lines**, **98.56% statements**, **100% functions**, **97.46% branches**; per-file thresholds all passed |
| Chromium | PASS | 33 tests, three viewports, Playwright 1.65.0 / Chrome Headless Shell 158.0.8127.18 |
| Firefox | PASS | 33 tests, three viewports, Playwright Firefox 159.0 |
| WebKit | PASS with environment workaround documented below | 33 tests, three viewports, Playwright WebKit 27.2 |
| Automated accessibility and keyboard | PASS in browser matrix | Each engine/viewport checks all three flows with axe; keyboard focus/activation, enlarged text and reduced-motion preference checks |
| Dependency audit | PASS | `npm audit --json` and `npm run audit`: **0 advisories** after updates, compared with 13 affected baseline package entries |
| Focused SAST | PASS | Semgrep **1.184.0**, `.semgrep.yml`, `--error --strict --metrics=off --disable-version-check public scripts`: zero findings in seven JavaScript files |
| Secrets | PASS | Gitleaks **8.30.1**, redacted full-history and working-tree scans; no findings |
| Scanner enforcement | PASS | `bash scripts/check-security-gates.sh`: all five rule IDs and a constructed fake token produced required exit status 1; execution errors are not accepted as findings |
| Workflow syntax/type checks | PASS | actionlint **1.7.12** over both workflows; shellcheck/pyflakes integrations unavailable and not claimed |
| Shell syntax | PASS | `bash -n scripts/*.sh` |
| Static build / hashes / SBOM | PASS | `npm run build`: 12 files; external site SHA-256 manifest; `npm sbom --sbom-format=cyclonedx` generated a development-tool inventory |
| Public source scope | PASS | Byte comparison against Git base: **nine public files unchanged**; only `public/assets/js/main.js` differs |
| Supplied policy fidelity | PASS | Canonical standard matches the supplied SFW v1.1.0 file byte-for-byte |
| Whitespace and documentation links | PASS | `git diff --check`; local Markdown path validation |
| Node 26 execution | NOT RUN locally | Kept as an independent blocking CI matrix job |
| New GitHub Actions execution / Pages deployment | NOT RUN | Workflow configuration and commands reviewed locally; no push or workflow dispatch authorised/performed |
| Production CSP / environment reviewers | NOT MET / UNVERIFIED | See review PF-006 and PF-011; no owner exception recorded |
| Full screen-reader / native-device certification | NOT RUN | Automated browser and keyboard checks are bounded evidence, not complete accessibility certification |

## Browser environment details

Default Chromium downloads returned an invalid small HTML payload in this execution environment. The matching Chrome-for-Testing **158.0.8127.18** headless-shell archive was obtained directly from Google's official storage, ZIP-tested and selected with `PASSFABRICATOR_CHROMIUM_EXECUTABLE`. The full 33-test Chromium matrix then passed; no application test was disabled.

Firefox's installer succeeded through its official fallback download host. Its full matrix ran normally. WebKit was initially blocked by missing system libraries, and installing system packages required unavailable root access. Matching Debian 13 packages were instead downloaded from Debian's package index, SHA-256-verified and extracted into user-owned scratch/browser-cache directories. `ldd` on both GTK and WPE MiniBrowser executables then reported no missing dependencies.

Playwright's remaining dynamic-library check consults only the system `ldconfig` cache, which cannot see those local packages. The final WebKit run therefore used `PLAYWRIGHT_SKIP_VALIDATE_HOST_REQUIREMENTS=1` **only for this local environment check**, after resolving actual library dependencies. All 33 native WebKit application tests ran and passed. This diagnostic setting is not in CI or the repository's default test configuration. CI retains `playwright install --with-deps` and ordinary host validation for all engines.

Final successful matrix commands:

```bash
PASSFABRICATOR_CHROMIUM_EXECUTABLE=/path/to/official/chrome-headless-shell npm run test:browser -- --project='chromium-*'
npm run test:browser -- --project='firefox-*'
PLAYWRIGHT_SKIP_VALIDATE_HOST_REQUIREMENTS=1 npm run test:browser -- --project='webkit-*'
```

The last command is a record of the explained local workaround, not a recommended default. Standard CI does not set it. Browser test reports/logs used only synthetic inputs; traces, video and screenshots were disabled.

## Files and security impact

The complete changed-file inventory is [changed-files.md](changed-files.md). `SOURCE_SHA256SUMS.txt` in the ZIP records the delivered source bytes, excluding itself. `docs/source-history.json` records source history without contributor email/signature data. No `.git`, `node_modules`, browser binaries, scanner environment or transient test output is packaged.

Runtime changes are limited to the shared entropy estimate/label and cross-mode pending-generation isolation. Generation/randomness, analyser rules, preference schema, HTML/CSS and other public assets are preserved. Remaining model, CSP, licensing and toolchain risks are detailed in [review.md](review.md), with owners and review targets. No approved exception exists.

## Release and operational status

All locally feasible application checks above passed, with the browser setup limitations explicitly stated. Hosted CI, Node 26, repository required checks, environment reviewers, private reporting and the CSP requirement still require owner verification or remediation. A source ZIP is delivered for review/import; it is **not certification of full production readiness or of complete SFW conformance**.

Only read-only GitHub access, local implementation, safe tool/dependency installation, testing and packaging were used. No push, PR, merge, tag, public release, deployment, DNS/permissions change, production mutation or secret access was performed. Human owner T2 release approval is **pending**. Rollback and post-deployment checks are described in [operations.md](operations.md).
