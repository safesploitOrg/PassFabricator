# 🔐 Security policy

Maintainer and risk owner: **Zepher Ashe**, repository owner/delegate. Engineering baseline: [SFW v1.1.0](docs/engineering/SFW_AI_ENGINEERING_STANDARD.md). Profile **B+D**; password security and release controls are treated as **T2**. This document is a maintained policy proposal in the delivered source; it is not evidence of production approval.

## Reporting

Use GitHub's **Report a vulnerability** / private vulnerability reporting for this repository if the owner has enabled it. This availability has not been verified. Otherwise request a private contact through the repository without posting exploit details or passwords. Never send real passwords, tokens or production credentials in an issue, test fixture or report. The owner should verify a private reporting route before public release.

## Privacy and trust

- Reviewed application code analyses/generates locally. Only generator preferences enter localStorage; they expire after 60 days. No password history or telemetry is implemented.
- Passphrase mode fetches a same-origin static wordlist. There are no runtime third-party JavaScript/CDN dependencies.
- Copy is an explicit user action that puts a password on the operating-system clipboard. Browser extensions, a compromised device, clipboard managers or compromised hosting can defeat application privacy.
- Estimates are heuristic guidance, with significant word-based and non-ASCII limitations. Read [docs/entropy.md](docs/entropy.md); do not use the number as a security certification.
- HTTPS and trusted source delivery are necessary. The observed baseline response did not contain a CSP; that inherited gap is tracked in [docs/review.md](docs/review.md).

## Required gates

| Control | Blocking policy |
| --- | --- |
| ESLint, unit/controller regressions and coverage | Any failure blocks the validated artifact |
| Core coverage | Each generation/analysis/storage file: 90% lines/statements, 95% functions, 85% branches |
| Browsers and axe | Chromium, Firefox, WebKit; 390×844, 768×1024, 1440×900; any test/axe violation fails |
| Dependency audit | `npm audit --audit-level=moderate`, including development tools; moderate/high/critical findings or scanner errors fail |
| Focused SAST | Local reviewed `.semgrep.yml`; `--error --strict`, no metrics/source upload; findings or execution errors fail |
| Secrets | Gitleaks defaults plus generated-directory exclusions; full Git history and working tree; any finding/error fails |
| Gate effectiveness | Synthetic insecure-random, dynamic-code, HTML-sink, network-body and fake-token findings must trigger the expected nonzero status |
| Artifact/release | Build depends on all jobs; manual approved SHA, complete revalidation, Pages artifact from that same run |

The SAST rules are deliberately focused, not a comprehensive proof against every injection or data-leak technique. Gitleaks exclusions cover installed dependencies and generated reports only; source/tests remain in scope. An audit sends dependency metadata to the configured npm registry, never password inputs.

## Findings and exceptions

Reachable critical vulnerabilities, active exploitation and exposed credentials block release and require immediate containment. New reachable high findings block release. Pre-existing high/critical findings need explicit owner triage; there is no automatic grandfathering. The current automated audit is stricter and also blocks moderate advisories in dev tools.

Owner decision targets are immediate for active compromise, 7 days for high, 30 days for medium and 90 days for low, adjusted by an explicit recorded decision where appropriate. Findings in this package have specific review dates in `docs/review.md`. No ignored CVE list, silent non-blocking scan or owner-approved exception was added.

Changing thresholds or ignoring a scanner requires the standard's explicit, scoped and time-bounded exception process. Tool/network unavailability does not establish a clean result. A build failure stays a failure.

## Supply chain and operations

All npm dependencies are development-only and exact-pinned with a committed lockfile. Lifecycle scripts are disabled. Actions use verified full commit pins. Semgrep's scanner version is pinned; its Python transitive environment is not fully hash-locked and must be reviewed as toolchain debt. Gitleaks is pinned and the Linux CI archive has an embedded SHA-256 check.

`minimatch` is temporarily overridden to 11.0.5 to remediate GHSA-g3hv-75wg-m249 while retaining supported ESLint 10. This uses a newer major than ESLint's declared range; lint and lockfile installation passed, but upstream compatibility remains a maintenance item. Review with every ESLint update and by **2026-12-06**; remove when the ordinary dependency resolution is safe. No audit rule is suppressed.

See [the threat model](docs/threat-model.md), [verification](docs/verification.md) and [operations/rollback](docs/operations.md). The prepared ZIP is for review/import; production release, reviewer settings, monitoring and hosted CI status are separate owner actions.
