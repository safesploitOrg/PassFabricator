# 🔎 Source review and SFW adoption

Reviewed on **2026-11-06 (Europe/London)**. Source: [`64dafd3`](https://github.com/safesploitOrg/PassFabricator/commit/64dafd372bc20cb5ebfe73beb4cdcc5f7a641524), actual latest tag `v1.1`, all 18 historical commits available locally. Scope: adopt the supplied SFW v1.1.0, prepare commit-based versioning/changelog and correct entropy consistency while preserving the website's design and generation behaviour.

## Baseline evidence

- Original **24 tests passed** on Node 24.22.1. Original core line coverage: analyser 94.29%, generator 93.18%, storage 89.62%; main/UI were not covered by the original suite. The original pipeline enforced only unit-test success, not coverage thresholds.
- Full baseline npm audit reported **13 affected package entries**: 3 critical, 5 high, 4 moderate and 1 low. These were development tooling dependencies, not shipped website packages. The advisories' exploitability depends on development-server exposure and local execution; no production compromise was established.
- Existing hosted [CI](https://github.com/safesploitOrg/PassFabricator/actions/runs/28003378529) and [Pages deployment](https://github.com/safesploitOrg/PassFabricator/actions/runs/28003378530) reported success for the baseline SHA. The separate push-triggered Pages workflow did not depend on CI, so those successes did not establish release gating.
- A live HTTPS HEAD request returned **200** on the review date; no CSP was present in the response examined. The HTML source and asset contents were reviewed from Git; no visual redesign was attempted.
- New controller regressions failed on the unmodified application: a deterministic random fixture showed **129 bits vs 96 bits**, a two-word test wordlist fixture showed **4 bits vs 111 bits**, and pending generation replaced an **11-bit** Analyse result with **129 bits**. The two actual browser round-trip tests also failed against the original public assets. These failures establish pre-existing defects, not new regressions.

## Resolved findings

| ID | Finding | Result |
| --- | --- | --- |
| PF-001 | Three different display calculations disagreed for identical strings | Fixed: both Generate paths display the existing analyser's result; both modes use **Estimated entropy** |
| PF-002 | Pending generation could overwrite the active Analyse result | Fixed: mode checks protect shared metrics and error feedback; regression test |
| PF-003 | Vulnerable development dependency tree | Fixed at audit time: exact-pinned updated tooling and reviewed minimatch override; zero reported npm advisories |
| PF-004 | Independent Pages deployment bypassed checks; broad deploy permissions | Replaced with manual exact-SHA release calling all CI gates; permissions restricted to final job; hosted execution pending |
| PF-013 | `package.json` said 1.0.0 despite the actual v1.1 tag | Fixed: package/lock agree on prepared 1.1.1; historical tag recorded as v1.1 / normalised 1.1.0 |

## Open findings and owner decisions

These are tracked findings, **not approved exceptions or accepted risks**. Owner for every item: **Zepher Ashe**, or a formally delegated human maintainer. Dates are proposed remediation/review targets; no approval or external ticket creation is claimed. Local tracking IDs below serve as the review register.

| ID | Severity / baseline | Impact and current mitigation | Owner action and target |
| --- | --- | --- | --- |
| PF-005 | Medium; inherited heuristic, now shared by Generate | Character/pattern estimate can significantly overstate dictionary passphrase security; no original generation distribution can be inferred from a pasted string. Shared estimate label and documentation are explicit; no security-strength certification claimed | Review a separately scoped word/pattern-aware model and its independent references by **2026-12-06**; assess this limitation in the release decision |
| PF-006 | Medium; inherited | No CSP observed. Existing HTTPS, local modules and safe feedback rendering reduce some exposure; hosting/page compromise is still material | Implement/test an appropriate hosting policy, or explicitly decide a permissible time-bounded exception, **before release**, target **2026-12-06**. No HTML/header change authorised by this patch |
| PF-007 | Low; inherited | LICENSE is empty and previous README claimed MIT. False claim corrected; no new licence granted | Clarify source and EFF wordlist attribution/licensing by **2027-02-04**, before licensing-based redistribution |
| PF-008 | Low; inherited | UI clamps length/word count, but exported generator functions and Analyse input lack hard resource bounds. Negative tests exercise 10,000-character input without claiming a global bound | Review API/input budgets by **2027-02-04**; preserve scope until authorised |
| PF-009 | Informational; inherited | Existing parser skips four hyphenated EFF entries, leaving 7,772 usable words. Raw file preserved and parsed count tested | Review parser/wordlist policy at next model change, by **2027-02-04** |
| PF-010 | Low; inherited | UTF-16 length/non-ASCII symbol approximation is not a Unicode-aware security model | Include in model review by **2027-02-04** |
| PF-011 | Release control unverified | Rulesets API returned []; classic branch-protection read returned 403. Environment reviewer status/private vulnerability reporting not verified | Verify required checks, reviewer restrictions and reporting route **before release**; no settings were changed |
| PF-012 | Low; inherited | Within Generate, a delayed wordlist request can finish after a newer generation request. Cross-mode Analyse overwrite is fixed; within-mode scheduling is not redesigned | Add cancellation/request ordering in a later authorised change by **2027-02-04** |
| PF-014 | Low; introduced maintenance obligation | minimatch 11.0.5 override exceeds ESLint's ordinary declared range to remediate GHSA-g3hv-75wg-m249. Install, lint and audit pass | Review/remove once upstream resolution is fixed, by **2026-12-06**; no scanner suppression |
| PF-015 | Low; toolchain assurance debt | Semgrep scanner version is pinned, but Python transitives are resolved by pip rather than a full hash-locked toolchain | Evaluate a maintained hash-locked scanner environment by **2027-02-04** |

No public release readiness claim is made while mandatory checks, production controls or a required owner decision are outstanding. Local evidence and the exact remaining browser/control limitations are in [verification.md](verification.md).

## Scope and impact

Only `public/assets/js/main.js` changes website runtime behaviour. All other public files are byte-identical to the base SHA: HTML, CSS, favicon images, generator/analyser/storage/UI modules and wordlist. The entropy label and displayed number change as required; the generation algorithms and controls remain intact. New tooling, documentation and policy live outside the published root.

SFW controls are implemented as enforceable workflow configuration, not as a statement that new hosted jobs have already run or that external governance is configured. This task used read-only GitHub access and local implementation/testing/packaging. No push, PR, merge, tag, deployment, repository permission change or production mutation was performed. Human T2 release sign-off remains **pending**; no agent approval or exception was supplied.
